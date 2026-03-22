import { NextRequest, NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import { stripe, STRIPE_PRICES, StripePlan } from "@/lib/stripe";

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

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    customer_email: user?.emailAddresses?.[0]?.emailAddress,
    metadata: {
      userId,
      plan,
    },
    subscription_data: {
      metadata: { userId, plan },
    },
    success_url: `${origin}/dashboard?upgrade=success&plan=${plan}`,
    cancel_url: `${origin}/pricing?upgrade=cancelled`,
    allow_promotion_codes: true,
  });

  return NextResponse.json({ url: session.url });
}
