import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getPlanByPriceId, stripe } from '@/lib/stripe';

export const runtime = 'nodejs';

type CheckoutRequestBody = {
  priceId?: string;
};

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as CheckoutRequestBody | null;
  const priceId = body?.priceId?.trim() ?? '';
  const plan = getPlanByPriceId(priceId);

  if (!plan) {
    return NextResponse.json({ error: 'Invalid price ID.' }, { status: 400 });
  }

  const baseUrl = process.env.NEXTAUTH_URL;

  if (!baseUrl) {
    return NextResponse.json({ error: 'Server misconfiguration.' }, { status: 500 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      tier: true,
      stripeCustomerId: true,
      stripeSubscriptionId: true
    }
  });

  if (!user) {
    return NextResponse.json({ error: 'User not found.' }, { status: 404 });
  }

  if (user.tier !== 'FREE' && user.stripeSubscriptionId) {
    return NextResponse.json({ error: 'You already have an active subscription. Use billing management instead.' }, { status: 400 });
  }

  let customerId = user.stripeCustomerId;

  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user.email,
      name: user.name ?? undefined,
      metadata: { userId: user.id }
    });

    customerId = customer.id;

    await prisma.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customerId }
    });
  }

  const checkoutSession = await stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [{ price: plan.priceId, quantity: 1 }],
    mode: 'subscription',
    success_url: `${baseUrl}/dashboard/billing?success=true`,
    cancel_url: `${baseUrl}/dashboard/billing?canceled=true`,
    metadata: { userId: user.id },
    subscription_data: {
      metadata: { userId: user.id }
    }
  });

  if (!checkoutSession.url) {
    return NextResponse.json({ error: 'Unable to create checkout session.' }, { status: 500 });
  }

  return NextResponse.json({ url: checkoutSession.url });
}
