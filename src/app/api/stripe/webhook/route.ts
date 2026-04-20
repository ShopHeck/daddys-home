import type Stripe from 'stripe';
import { NextResponse } from 'next/server';

import { sendEmail } from '@/lib/email';
import {
  dunningFinalAttemptEmail,
  dunningFirstAttemptEmail,
  dunningSecondAttemptEmail,
  paymentConfirmationEmail
} from '@/lib/email-templates';
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

  void (async () => {
    try {
      const updatedUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, name: true, tier: true }
      });

      if (!updatedUser || updatedUser.tier === 'FREE') {
        return;
      }

      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
      const planName = updatedUser.tier === 'BUSINESS' ? 'Business ($99/mo)' : 'Pro ($29/mo)';
      const amount = updatedUser.tier === 'BUSINESS' ? '$99' : '$29';

      await sendEmail({
        to: updatedUser.email,
        subject: 'Your DocForge subscription is active!',
        html: paymentConfirmationEmail({
          name: updatedUser.name || 'there',
          planName,
          amount,
          dashboardUrl: `${baseUrl}/dashboard`
        })
      });
    } catch (error) {
      console.error('Payment confirmation email failed:', error);
    }
  })();
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
  if (!customerId) return;

  const user = await prisma.user.findUnique({
    where: { stripeCustomerId: customerId },
    select: { id: true, email: true, name: true, tier: true, stripePriceId: true },
  });

  if (!user || user.tier === 'FREE') return;

  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
  const updatePaymentUrl = `${baseUrl}/dashboard/billing`;

  const planName = user.tier === 'BUSINESS' ? 'Business' : 'Pro';
  const amount = user.tier === 'BUSINESS' ? '$99' : '$29';
  const name = user.name || 'there';
  const attemptCount = invoice.attempt_count ?? 1;

  let subject: string;
  let html: string;

  if (attemptCount <= 1) {
    subject = 'Your DocForge payment failed — action required';
    html = dunningFirstAttemptEmail({
      name,
      planName,
      amount,
      updatePaymentUrl
    });
  } else if (attemptCount === 2) {
    subject = 'Second notice: your DocForge payment is still failing';
    html = dunningSecondAttemptEmail({
      name,
      planName,
      amount,
      updatePaymentUrl
    });
  } else {
    subject = 'Final notice: your DocForge subscription is at risk';
    html = dunningFinalAttemptEmail({
      name,
      planName,
      amount,
      updatePaymentUrl
    });
  }

  sendEmail({
    to: user.email,
    subject,
    html,
  }).catch((err) => {
    console.error(`Dunning email (attempt ${attemptCount}) error:`, err);
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
