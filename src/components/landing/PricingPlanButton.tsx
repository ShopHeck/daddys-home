"use client";

import Link from 'next/link';
import { useSession } from 'next-auth/react';

type PricingPlanButtonProps = {
  tierName: 'Free' | 'Pro' | 'Business';
};

function ButtonLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link className="mt-8 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500" href={href}>
      {children}
    </Link>
  );
}

function DisabledButton({ children }: { children: React.ReactNode }) {
  return (
    <span className="mt-8 inline-flex cursor-not-allowed rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-slate-300">
      {children}
    </span>
  );
}

export function PricingPlanButton({ tierName }: PricingPlanButtonProps) {
  const { data: session, status } = useSession();
  const currentTier = session?.user?.tier ?? 'FREE';
  const isAuthenticated = status === 'authenticated';

  if (status === 'loading') {
    return <DisabledButton>Loading...</DisabledButton>;
  }

  if (tierName === 'Free') {
    if (!isAuthenticated) {
      return <ButtonLink href="/auth/signup">Get Started</ButtonLink>;
    }

    if (currentTier === 'FREE') {
      return <DisabledButton>Current Plan</DisabledButton>;
    }

    return <ButtonLink href="/dashboard">Dashboard</ButtonLink>;
  }

  const targetTier = tierName.toUpperCase() as 'PRO' | 'BUSINESS';

  if (!isAuthenticated) {
    return <ButtonLink href="/auth/signup">Get Started</ButtonLink>;
  }

  if (currentTier === targetTier) {
    return <DisabledButton>Current Plan</DisabledButton>;
  }

  return <ButtonLink href="/dashboard/billing">{currentTier === 'FREE' ? 'Upgrade' : 'Manage Plan'}</ButtonLink>;
}
