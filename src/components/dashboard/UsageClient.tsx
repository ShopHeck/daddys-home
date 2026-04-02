"use client";

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

type UsageResponse = {
  tier: 'FREE' | 'PRO' | 'BUSINESS';
  limit: number;
  used: number;
  remaining: number;
  periodStart: string;
  periodEnd: string;
  daily: Array<{
    date: string;
    count: number;
  }>;
};

function getUsageColor(percent: number) {
  if (percent >= 80) {
    return 'bg-rose-500';
  }

  if (percent >= 50) {
    return 'bg-amber-400';
  }

  return 'bg-emerald-500';
}

export function UsageClient() {
  const [usage, setUsage] = useState<UsageResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadUsage = async () => {
      setLoading(true);
      const response = await fetch('/api/dashboard/usage', { cache: 'no-store' });
      const payload = (await response.json().catch(() => null)) as UsageResponse | { error?: string } | null;

      if (!response.ok || !payload || !('daily' in payload)) {
        setError((payload as { error?: string } | null)?.error ?? 'Unable to load usage.');
        setLoading(false);
        return;
      }

      setUsage(payload);
      setLoading(false);
    };

    void loadUsage();
  }, []);

  const usagePercent = useMemo(() => {
    if (!usage || usage.limit === 0) {
      return 0;
    }

    return Math.min((usage.used / usage.limit) * 100, 100);
  }, [usage]);

  const maxCount = useMemo(() => {
    if (!usage?.daily.length) {
      return 1;
    }

    return Math.max(...usage.daily.map((entry) => entry.count), 1);
  }, [usage]);

  const getDayNumber = (date: string) => parseInt(date.split('-')[2] ?? '0', 10);
  const formatLocalDate = (date: string) => new Date(`${date}T00:00:00`).toLocaleDateString();

  if (loading) {
    return <div className="text-sm text-slate-400">Loading usage...</div>;
  }

  if (error || !usage) {
    return <div className="text-sm text-rose-400">{error || 'Unable to load usage.'}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-white">Usage</h1>
        <p className="mt-2 text-sm text-slate-400">
          Billing period {new Date(usage.periodStart).toLocaleDateString()} – {new Date(usage.periodEnd).toLocaleDateString()}
        </p>
      </div>

      <div className="rounded-lg border border-slate-700 bg-slate-800 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-blue-300">Current tier</p>
            <p className="mt-2 text-2xl font-semibold text-white">{usage.tier}</p>
          </div>
          <div className="text-sm text-slate-300">
            <p>
              {usage.used.toLocaleString()} / {usage.limit.toLocaleString()} documents used
            </p>
            <p className="mt-1 text-slate-400">{usage.remaining.toLocaleString()} remaining this month</p>
          </div>
        </div>
        <div className="mt-6 h-4 w-full overflow-hidden rounded-full bg-slate-900">
          <div className={`h-full rounded-full ${getUsageColor(usagePercent)}`} style={{ width: `${usagePercent}%` }} />
        </div>
      </div>

      {usage.tier === 'FREE' ? (
        <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-white">Need more throughput?</h2>
              <p className="mt-2 text-sm text-slate-300">Upgrade to Pro for 5,000 documents per month and priority rendering.</p>
            </div>
            <Link className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500" href="/dashboard/billing">
              Upgrade plan
            </Link>
          </div>
        </div>
      ) : null}

      <div className="rounded-lg border border-slate-700 bg-slate-800 p-6">
        <h2 className="text-lg font-semibold text-white">Daily usage</h2>
        <div className="mt-6 grid grid-cols-7 gap-3 sm:grid-cols-10 lg:grid-cols-12 xl:grid-cols-16">
          {usage.daily.map((day) => (
            <div key={day.date} className="rounded-lg border border-slate-700 bg-slate-900/60 p-3 text-center">
              <div className="flex h-28 items-end justify-center">
                <div className="w-6 rounded-t bg-blue-500" style={{ height: `${Math.max((day.count / maxCount) * 100, day.count > 0 ? 6 : 2)}%` }} />
              </div>
              <p className="mt-3 text-sm font-medium text-white">{day.count}</p>
              <p className="mt-1 text-xs text-slate-400">{getDayNumber(day.date)}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-700 text-left text-sm">
            <thead className="text-slate-300">
              <tr>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Documents</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700 text-slate-300">
              {usage.daily.map((day) => (
                <tr key={day.date}>
                  <td className="px-4 py-3">{formatLocalDate(day.date)}</td>
                  <td className="px-4 py-3">{day.count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
