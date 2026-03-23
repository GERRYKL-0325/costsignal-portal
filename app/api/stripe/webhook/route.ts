import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { supabaseAdmin } from "@/lib/supabase";
import Stripe from "stripe";

// App Router doesn't need config export — body is read via req.text() directly

export async function POST(req: NextRequest) {
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Webhook signature verification failed";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const { userId, plan } = session.metadata ?? {};
      const customerId = session.customer as string;
      const subscriptionId = session.subscription as string;

      if (userId && plan) {
        await supabaseAdmin
          .from("users")
          .update({
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            stripe_subscription_status: "active",
            plan,
            plan_updated_at: new Date().toISOString(),
          })
          .eq("clerk_user_id", userId);
      }
      break;
    }

    case "customer.subscription.updated": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.userId;
      const plan = sub.metadata?.plan;
      if (userId) {
        const status = sub.status;
        await supabaseAdmin
          .from("users")
          .update({
            plan: status === "active" ? plan ?? "free" : "free",
            stripe_subscription_status: status,
            plan_updated_at: new Date().toISOString(),
          })
          .eq("clerk_user_id", userId);
      }
      break;
    }

    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const userId = sub.metadata?.userId;
      if (userId) {
        await supabaseAdmin
          .from("users")
          .update({
            plan: "free",
            stripe_subscription_status: "canceled",
            stripe_subscription_id: null,
            plan_updated_at: new Date().toISOString(),
          })
          .eq("clerk_user_id", userId);
      }
      break;
    }

    case "invoice.payment_failed": {
      const invoice = event.data.object as Stripe.Invoice;
      const customerId = invoice.customer as string;
      if (customerId) {
        await supabaseAdmin
          .from("users")
          .update({ stripe_subscription_status: "past_due" })
          .eq("stripe_customer_id", customerId);
      }
      break;
    }

    default:
      // Unhandled event type — ignore
      break;
  }

  return NextResponse.json({ received: true });
}
