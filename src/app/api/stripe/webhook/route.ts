import type Stripe from 'stripe';
import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { priceIdToTier, stripe } from '@/lib/stripe';
import type { Tier } from '@/types';

export const runtime = 'nodejs';

function getCustomerId(customer: string | Stripe.Customer | Stripe.DeletedCustomer | null): string | null {
  if (!customer) {
    return null;
  }

  return typeof customer === 'string' ? customer : customer.id;
}

function getPriceId(subscription: Stripe.Subscription): string | null {
  return subscription.items.data[0]?.price.id ?? null;
}

function getCurrentPeriodEnd(subscription: Stripe.Subscription): Date | null {
  const periodEnd = subscription.items.data[0]?.current_period_end;

  return typeof periodEnd === 'number' ? new Date(periodEnd * 1000) : null;
}

function getTierForSubscription(subscription: Stripe.Subscription): Tier {
  const priceId = getPriceId(subscription);

  if (!priceId) {
    return 'FREE';
  }

  if (subscription.status !== 'active' && subscription.status !== 'trialing') {
    return 'FREE';
  }

  return priceIdToTier(priceId);
}

async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id;
  const customerId = getCustomerId(session.customer);

  if (!userId || !subscriptionId) {
    return;
  }

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const priceId = getPriceId(subscription);

  await prisma.user.update({
    where: { id: userId },
    data: {
      stripeCustomerId: customerId ?? undefined,
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
      stripeCurrentPeriodEnd: getCurrentPeriodEnd(subscription),
      tier: getTierForSubscription(subscription)
    }
  });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  const customerId = getCustomerId(subscription.customer);
  const priceId = getPriceId(subscription);
  const user = await prisma.user.findFirst({
    where: customerId
      ? {
          OR: [{ stripeSubscriptionId: subscription.id }, { stripeCustomerId: customerId }]
        }
      : {
          stripeSubscriptionId: subscription.id
        },
    select: { id: true }
  });

  if (!user) {
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      stripeCustomerId: customerId ?? undefined,
      stripeSubscriptionId: subscription.id,
      stripePriceId: priceId,
      stripeCurrentPeriodEnd: getCurrentPeriodEnd(subscription),
      tier: getTierForSubscription(subscription)
    }
  });
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  const user = await prisma.user.findFirst({
    where: { stripeSubscriptionId: subscription.id },
    select: { id: true }
  });

  if (!user) {
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      tier: 'FREE',
      stripeSubscriptionId: null,
      stripePriceId: null,
      stripeCurrentPeriodEnd: null
    }
  });
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = getCustomerId(invoice.customer);

  if (!customerId) {
    return;
  }

  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: customerId },
    select: { id: true }
  });

  if (!user) {
    return;
  }

  console.error('Stripe invoice payment failed', {
    invoiceId: invoice.id,
    customerId,
    userId: user.id
  });
}

export async function POST(request: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get('stripe-signature');

  if (!webhookSecret || !signature) {
    return NextResponse.json({ error: 'Invalid webhook configuration.' }, { status: 400 });
  }

  const body = await request.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: 'Invalid signature.' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
      default:
        break;
    }
  } catch (error) {
    console.error('Stripe webhook handling failed', error);
    return NextResponse.json({ error: 'Webhook handler failed.' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
