"use client";

import Link from 'next/link';
import { useSession } from 'next-auth/react';

type PricingPlanButtonProps = {
  tierName: 'Free' | 'Pro' | 'Business';
};

function ButtonLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link className="mt-4 inline-flex text-sm font-medium text-white border-b border-white pb-0.5 hover:border-slate-400 transition-colors" href={href}>
      {children}
    </Link>
  );
}

function DisabledButton({ children }: { children: React.ReactNode }) {
  return (
    <span className="mt-4 inline-flex text-sm font-medium text-slate-500">
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
