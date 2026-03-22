import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

// Price IDs — set these in your Stripe dashboard and put in env
export const STRIPE_PRICES = {
  pro: process.env.STRIPE_PRO_PRICE_ID!,
  api: process.env.STRIPE_API_PRICE_ID!,
} as const;

export type StripePlan = keyof typeof STRIPE_PRICES;
