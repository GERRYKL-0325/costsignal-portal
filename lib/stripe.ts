import Stripe from "stripe";

// Lazy init — don't crash at module load if env vars aren't set
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-02-25.clover",
    });
  }
  return _stripe;
}

// Keep backward compat export — but make it a getter so it doesn't crash on import
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as any)[prop];
  }
});

// Price IDs — set these in your Stripe dashboard and put in env
export const STRIPE_PRICES = {
  pro: process.env.STRIPE_PRO_PRICE_ID ?? "",
  api: process.env.STRIPE_API_PRICE_ID ?? "",
} as const;

export type StripePlan = keyof typeof STRIPE_PRICES;
