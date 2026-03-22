import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const origin = req.headers.get("origin") || process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  // Look up Stripe customer ID from our DB
  const { data: profile } = await supabaseAdmin
    .from("users")
    .select("stripe_customer_id")
    .eq("clerk_user_id", userId)
    .single();

  if (!profile?.stripe_customer_id) {
    return NextResponse.json(
      { error: "No active subscription found" },
      { status: 404 }
    );
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${origin}/dashboard/settings`,
  });

  return NextResponse.json({ url: portalSession.url });
}
