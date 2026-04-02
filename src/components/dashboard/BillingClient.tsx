"use client";

import { useState } from 'react';

import type { Tier } from '@/types';

type BillingPlan = {
  tier: 'PRO' | 'BUSINESS';
  name: string;
  priceId: string;
  price: number;
  docsPerMonth: number;
};

type CurrentPlan = {
  name: string;
  price: number;
  docsPerMonth: number;
};

type BillingClientProps = {
  currentTier: Tier;
  currentPlan: CurrentPlan;
  currentPeriodEnd: string | null;
  showSuccess: boolean;
  showCanceled: boolean;
  canManageBilling: boolean;
  plans: BillingPlan[];
};

export function BillingClient({
  currentTier,
  currentPlan,
  currentPeriodEnd,
  showSuccess,
  showCanceled,
  canManageBilling,
  plans
}: BillingClientProps) {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [managingBilling, setManagingBilling] = useState(false);
  const [error, setError] = useState('');

  const isProcessingActivation = showSuccess && currentTier === 'FREE';

  const subscribe = async (priceId: string) => {
    setError('');
    setLoadingPlan(priceId);

    const response = await fetch('/api/stripe/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priceId })
    });

    const payload = (await response.json().catch(() => null)) as { error?: string; url?: string } | null;

    if (!response.ok || !payload?.url) {
      setError(payload?.error ?? 'Unable to start checkout.');
      setLoadingPlan(null);
      return;
    }

    window.location.href = payload.url;
  };

  const manageBilling = async () => {
    setError('');
    setManagingBilling(true);

    const response = await fetch('/api/stripe/portal', {
      method: 'POST'
    });

    const payload = (await response.json().catch(() => null)) as { error?: string; url?: string } | null;

    if (!response.ok || !payload?.url) {
      setError(payload?.error ?? 'Unable to open billing portal.');
      setManagingBilling(false);
      return;
    }

    window.location.href = payload.url;
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-blue-300">Billing</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">Manage your plan</h1>
        <p className="mt-2 text-sm text-slate-400">Upgrade for higher monthly document limits and manage subscription changes through Stripe.</p>
      </div>

      {showSuccess ? (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-200">
          Subscription activated! Your plan will update shortly.
        </div>
      ) : null}

      {showCanceled ? (
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-4 text-sm text-slate-300">Checkout canceled.</div>
      ) : null}

      {isProcessingActivation ? (
        <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4 text-sm text-blue-100">
          We&apos;re waiting for Stripe to confirm your subscription. Refresh in a few seconds if your new plan does not appear yet.
        </div>
      ) : null}

      {error ? <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-sm text-rose-200">{error}</div> : null}

      <section className="rounded-lg border border-slate-700 bg-slate-800 p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-blue-300">Current plan</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">{currentPlan.name}</h2>
            <p className="mt-2 text-sm text-slate-400">${currentPlan.price}/month</p>
          </div>
          <div className="rounded-lg border border-slate-700 bg-slate-900/70 p-4 text-sm text-slate-300">
            <p>{currentPlan.docsPerMonth.toLocaleString()} documents per month included</p>
            {currentPeriodEnd ? (
              <p className="mt-2 text-slate-400">Current period ends {new Date(currentPeriodEnd).toLocaleDateString()}</p>
            ) : (
              <p className="mt-2 text-slate-400">No active renewal date on file.</p>
            )}
          </div>
        </div>

        {currentTier !== 'FREE' ? (
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-600/50"
              disabled={managingBilling || !canManageBilling}
              onClick={() => void manageBilling()}
              type="button"
            >
              {managingBilling ? 'Opening portal...' : 'Manage Billing'}
            </button>
            <p className="text-sm text-slate-400">Use the billing portal to change plans, update payment methods, or cancel.</p>
          </div>
        ) : null}
      </section>

      {currentTier === 'FREE' ? (
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold text-white">Upgrade your workspace</h2>
            <p className="mt-2 text-sm text-slate-400">Choose the plan that matches your monthly document volume.</p>
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            {plans.map((plan) => (
              <div key={plan.tier} className="rounded-lg border border-slate-700 bg-slate-800 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold text-white">{plan.name}</h3>
                    <p className="mt-2 text-sm text-slate-400">{plan.docsPerMonth.toLocaleString()} docs/month</p>
                  </div>
                  <p className="text-3xl font-semibold text-white">${plan.price}</p>
                </div>
                <ul className="mt-6 space-y-3 text-sm text-slate-300">
                  <li className="flex gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-blue-400" />
                    <span>{plan.docsPerMonth.toLocaleString()} monthly document quota</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-blue-400" />
                    <span>Priority rendering and faster support</span>
                  </li>
                  <li className="flex gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-blue-400" />
                    <span>Managed billing through Stripe Checkout</span>
                  </li>
                </ul>
                <button
                  className="mt-8 inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-600/50"
                  disabled={loadingPlan !== null}
                  onClick={() => void subscribe(plan.priceId)}
                  type="button"
                >
                  {loadingPlan === plan.priceId ? 'Redirecting...' : `Subscribe to ${plan.name}`}
                </button>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
