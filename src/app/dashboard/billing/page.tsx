import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

import { BillingClient } from '@/components/dashboard/BillingClient';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { PLANS } from '@/lib/stripe';
import { TIER_LIMITS } from '@/lib/usage';
import type { Tier } from '@/types';

const tierDisplay: Record<Tier, { name: string; price: number; docsPerMonth: number }> = {
  FREE: {
    name: 'Free',
    price: 0,
    docsPerMonth: TIER_LIMITS.FREE
  },
  PRO: {
    name: 'Pro',
    price: PLANS.PRO.price,
    docsPerMonth: PLANS.PRO.docsPerMonth
  },
  BUSINESS: {
    name: 'Business',
    price: PLANS.BUSINESS.price,
    docsPerMonth: PLANS.BUSINESS.docsPerMonth
  }
};

type BillingPageProps = {
  searchParams?: {
    success?: string;
    canceled?: string;
  };
};

export default async function DashboardBillingPage({ searchParams }: BillingPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/auth/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      tier: true,
      stripeCustomerId: true,
      stripeCurrentPeriodEnd: true
    }
  });

  if (!user) {
    redirect('/auth/login');
  }

  return (
    <BillingClient
      canManageBilling={Boolean(user.stripeCustomerId)}
      currentPeriodEnd={user.stripeCurrentPeriodEnd?.toISOString() ?? null}
      currentPlan={tierDisplay[user.tier]}
      currentTier={user.tier}
      plans={[
        {
          tier: 'PRO',
          name: PLANS.PRO.name,
          priceId: PLANS.PRO.priceId,
          price: PLANS.PRO.price,
          docsPerMonth: PLANS.PRO.docsPerMonth
        },
        {
          tier: 'BUSINESS',
          name: PLANS.BUSINESS.name,
          priceId: PLANS.BUSINESS.priceId,
          price: PLANS.BUSINESS.price,
          docsPerMonth: PLANS.BUSINESS.docsPerMonth
        }
      ]}
      showCanceled={searchParams?.canceled === 'true'}
      showSuccess={searchParams?.success === 'true'}
    />
  );
}
