import Stripe from 'stripe';

import type { Tier } from '@/types';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia' as Stripe.LatestApiVersion,
  typescript: true
});

export const PLANS = {
  PRO: {
    name: 'Pro',
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    price: 29,
    docsPerMonth: 5000
  },
  BUSINESS: {
    name: 'Business',
    priceId: process.env.STRIPE_BUSINESS_PRICE_ID!,
    price: 99,
    docsPerMonth: 50000
  }
} as const;

export function getPlanByPriceId(priceId: string) {
  return Object.values(PLANS).find((plan) => plan.priceId === priceId) ?? null;
}

export function priceIdToTier(priceId: string | null | undefined): Tier {
  if (priceId === process.env.STRIPE_PRO_PRICE_ID) {
    return 'PRO';
  }

  if (priceId === process.env.STRIPE_BUSINESS_PRICE_ID) {
    return 'BUSINESS';
  }

  return 'FREE';
}
