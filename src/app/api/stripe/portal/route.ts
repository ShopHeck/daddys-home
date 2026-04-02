import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

export const runtime = 'nodejs';

export async function POST() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const baseUrl = process.env.NEXTAUTH_URL;

  if (!baseUrl) {
    return NextResponse.json({ error: 'Server misconfiguration.' }, { status: 500 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { stripeCustomerId: true }
  });

  if (!user?.stripeCustomerId) {
    return NextResponse.json({ error: 'No billing account found.' }, { status: 400 });
  }

  const portalSession = await stripe.billingPortal.sessions.create({
    customer: user.stripeCustomerId,
    return_url: `${baseUrl}/dashboard/billing`
  });

  return NextResponse.json({ url: portalSession.url });
}
