import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { stripe, STRIPE_PRICES, StripePlan } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase";
import type Stripe from "stripe";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await currentUser();
  const { plan } = await req.json() as { plan: StripePlan };

  if (!plan || !(plan in STRIPE_PRICES)) {
    return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
  }

  const priceId = STRIPE_PRICES[plan];
  if (!priceId) {
    return NextResponse.json(
      { error: "Price not configured — set STRIPE_PRO_PRICE_ID / STRIPE_API_PRICE_ID in env" },
      { status: 500 }
    );
  }

  const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Reuse existing Stripe customer to avoid duplicates
  const { data: dbUser } = await supabaseAdmin
    .from("users")
    .select("stripe_customer_id, stripe_subscription_id, stripe_subscription_status")
    .eq("clerk_user_id", userId)
    .single();

  const existingCustomerId = dbUser?.stripe_customer_id as string | null | undefined;

  // If they already have an active subscription, send them to the portal to change plans
  if (
    dbUser?.stripe_subscription_id &&
    dbUser?.stripe_subscription_status === "active"
  ) {
    try {
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: existingCustomerId!,
        return_url: `${origin}/dashboard/settings`,
        flow_data: {
          type: "subscription_update",
          subscription_update: {
            subscription: dbUser.stripe_subscription_id as string,
          },
        },
      });
      return NextResponse.json({ url: portalSession.url });
    } catch {
      // Billing portal flow_data not configured — fall through to new checkout
    }
  }

  const baseParams = {
    mode: "subscription" as const,
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: { userId, plan },
    subscription_data: { metadata: { userId, plan } },
    success_url: `${origin}/dashboard?upgrade=success&plan=${plan}`,
    cancel_url: `${origin}/pricing?upgrade=cancelled`,
    allow_promotion_codes: true,
  };

  // Attach existing customer or set email for new customer creation
  const sessionParams: Stripe.Checkout.SessionCreateParams = existingCustomerId
    ? { ...baseParams, customer: existingCustomerId }
    : { ...baseParams, customer_email: user?.emailAddresses?.[0]?.emailAddress };

  const session = await stripe.checkout.sessions.create(sessionParams);

  return NextResponse.json({ url: session.url });
}
