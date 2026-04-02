import Stripe from 'stripe';

import type { Tier } from '@/types';

let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set');
    }
    stripeInstance = new Stripe(apiKey, {
      apiVersion: '2024-12-18.acacia' as Stripe.LatestApiVersion,
      typescript: true
    });
  }
  return stripeInstance;
}

// Lazy-loaded Stripe instance for backward compatibility.
// Uses a Proxy that lazily initializes on first access.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handler: ProxyHandler<any> = {
  get(_, prop) {
    const s = getStripe();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const value = (s as any)[prop];
    if (typeof value === 'function') {
      return value.bind(s);
    }
    return value;
  }
};

// Create a stub target for the proxy - the actual Stripe instance is lazily loaded
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const stubTarget = {} as any;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const stripe: Stripe = new Proxy(stubTarget, handler) as any;

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
