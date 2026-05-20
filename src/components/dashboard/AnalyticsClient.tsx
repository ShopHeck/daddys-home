'use client';

import { useEffect, useState } from 'react';

type AnalyticsData = {
  period: { start: string; end: string };
  tier: string;
  usage: {
    used: number;
    limit: number;
    remaining: number;
    percentUsed: number;
  };
  renders: {
    total: number;
    succeeded: number;
    failed: number;
    errorRate: number;
  };
  latency: {
    p50: number | null;
    p75: number | null;
    p95: number | null;
    p99: number | null;
    avg: number | null;
  };
  dailyBreakdown: Array<{ date: string; renders: number; errors: number }>;
  topTemplates: Array<{
    templateId: string;
    templateName: string;
    renders: number;
    avgDurationMs: number;
    errorRate: number;
  }>;
  projection: {
    estimatedEndOfMonth: number;
    projectedOverage: boolean;
    daysRemaining: number;
    dailyAverage: number;
  };
};

function StatCard({
  label,
  value,
  subtext,
  color,
}: {
  label: string;
  value: string;
  subtext?: string;
  color?: string;
}) {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-800 p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`mt-2 text-2xl font-semibold ${color ?? 'text-white'}`}>{value}</p>
      {subtext && <p className="mt-1 text-xs text-slate-500">{subtext}</p>}
    </div>
  );
}

function BarChart({
  data,
  maxValue,
}: {
  data: Array<{ date: string; renders: number; errors: number }>;
  maxValue: number;
}) {
  if (data.length === 0) {
    return <p className="text-sm text-slate-500">No data for this period.</p>;
  }

  return (
    <div className="flex items-end gap-[2px] h-32">
      {data.map((day) => {
        const height = maxValue > 0 ? (day.renders / maxValue) * 100 : 0;
        const errorHeight = maxValue > 0 ? (day.errors / maxValue) * 100 : 0;
        const dateLabel = day.date.slice(5); // MM-DD
        return (
          <div key={day.date} className="flex-1 flex flex-col items-center gap-0.5 group relative">
            <div className="w-full flex flex-col justify-end h-32">
              {day.errors > 0 && (
                <div className="w-full bg-rose-500/70 rounded-t-sm" style={{ height: `${errorHeight}%` }} />
              )}
              <div
                className="w-full bg-blue-500 rounded-t-sm"
                style={{ height: `${Math.max(height - errorHeight, 0)}%` }}
              />
            </div>
            {/* Tooltip on hover */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 hidden group-hover:block bg-slate-700 text-xs text-white px-2 py-1 rounded whitespace-nowrap z-10">
              {dateLabel}: {day.renders} renders{day.errors > 0 ? `, ${day.errors} errors` : ''}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function LatencyBar({ label, value, maxValue }: { label: string; value: number | null; maxValue: number }) {
  if (value === null) return null;
  const width = maxValue > 0 ? Math.min((value / maxValue) * 100, 100) : 0;

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-400 w-8 text-right">{label}</span>
      <div className="flex-1 bg-slate-700 rounded-full h-2.5">
        <div className="bg-emerald-500 h-2.5 rounded-full transition-all" style={{ width: `${width}%` }} />
      </div>
      <span className="text-xs text-slate-300 w-16 text-right">{value}ms</span>
    </div>
  );
}

export function AnalyticsClient() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadAnalytics = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/dashboard/analytics', { cache: 'no-store' });
        const payload = await response.json();

        if (!response.ok) {
          setError(payload?.error ?? 'Failed to load analytics');
          setLoading(false);
          return;
        }

        setData(payload);
      } catch {
        setError('Network error loading analytics');
      }
      setLoading(false);
    };

    void loadAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-blue-300">Analytics</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">Loading...</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-lg border border-slate-700 bg-slate-800 p-5 animate-pulse h-24" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-blue-300">Analytics</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">Analytics</h1>
        </div>
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-6">
          <p className="text-sm text-rose-200">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const maxDaily = Math.max(...data.dailyBreakdown.map((d) => d.renders), 1);
  const maxLatency = data.latency.p99 ?? data.latency.p95 ?? 1000;

  const periodStart = new Date(data.period.start).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
  const periodEnd = new Date(data.period.end).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-blue-300">Analytics</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">Performance & Usage</h1>
        <p className="mt-2 text-sm text-slate-400">
          Billing period: {periodStart} – {periodEnd}
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Renders"
          value={data.renders.total.toLocaleString()}
          subtext={`${data.renders.succeeded.toLocaleString()} succeeded`}
        />
        <StatCard
          label="Error Rate"
          value={`${data.renders.errorRate}%`}
          subtext={`${data.renders.failed} failed`}
          color={data.renders.errorRate > 5 ? 'text-rose-400' : 'text-emerald-400'}
        />
        <StatCard
          label="Avg Latency"
          value={data.latency.avg !== null ? `${data.latency.avg}ms` : 'N/A'}
          subtext={data.latency.p95 !== null ? `p95: ${data.latency.p95}ms` : undefined}
        />
        <StatCard
          label="Projected Usage"
          value={data.projection.estimatedEndOfMonth.toLocaleString()}
          subtext={`${data.projection.daysRemaining} days left`}
          color={data.projection.projectedOverage ? 'text-amber-400' : 'text-white'}
        />
      </div>

      {/* Projected Overage Alert */}
      {data.projection.projectedOverage && (
        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-5 py-4">
          <p className="text-sm text-amber-200">
            <strong>Projected overage:</strong> At your current rate of {data.projection.dailyAverage} renders/day,
            you&apos;ll exceed your {data.usage.limit.toLocaleString()} document limit before the period ends.
          </p>
        </div>
      )}

      {/* Daily Breakdown Chart */}
      <div className="rounded-lg border border-slate-700 bg-slate-800 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Daily Renders</h2>
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 bg-blue-500 rounded-sm" /> Renders
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block w-2.5 h-2.5 bg-rose-500/70 rounded-sm" /> Errors
            </span>
          </div>
        </div>
        <BarChart data={data.dailyBreakdown} maxValue={maxDaily} />
        <div className="flex justify-between mt-2 text-xs text-slate-500">
          <span>{data.dailyBreakdown[0]?.date.slice(5) ?? ''}</span>
          <span>{data.dailyBreakdown[data.dailyBreakdown.length - 1]?.date.slice(5) ?? ''}</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Latency Percentiles */}
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Render Latency</h2>
          {data.latency.avg === null ? (
            <p className="text-sm text-slate-500">No render data available yet.</p>
          ) : (
            <div className="space-y-3">
              <LatencyBar label="p50" value={data.latency.p50} maxValue={maxLatency} />
              <LatencyBar label="p75" value={data.latency.p75} maxValue={maxLatency} />
              <LatencyBar label="p95" value={data.latency.p95} maxValue={maxLatency} />
              <LatencyBar label="p99" value={data.latency.p99} maxValue={maxLatency} />
            </div>
          )}
        </div>

        {/* Usage Quota */}
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Quota</h2>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Used</span>
              <span className="text-white font-medium">{data.usage.used.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Limit ({data.tier})</span>
              <span className="text-white font-medium">{data.usage.limit.toLocaleString()}</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-3 mt-2">
              <div
                className={`h-3 rounded-full transition-all ${
                  data.usage.percentUsed >= 80
                    ? 'bg-rose-500'
                    : data.usage.percentUsed >= 50
                      ? 'bg-amber-400'
                      : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(data.usage.percentUsed, 100)}%` }}
              />
            </div>
            <p className="text-xs text-slate-500 text-right">{data.usage.percentUsed}% used</p>
          </div>
        </div>
      </div>

      {/* Top Templates */}
      {data.topTemplates.length > 0 && (
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Top Templates</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="pb-3 text-xs font-medium uppercase tracking-wide text-slate-400">Template</th>
                  <th className="pb-3 text-xs font-medium uppercase tracking-wide text-slate-400 text-right">
                    Renders
                  </th>
                  <th className="pb-3 text-xs font-medium uppercase tracking-wide text-slate-400 text-right">
                    Avg Latency
                  </th>
                  <th className="pb-3 text-xs font-medium uppercase tracking-wide text-slate-400 text-right">
                    Error Rate
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {data.topTemplates.map((t) => (
                  <tr key={t.templateId}>
                    <td className="py-3 text-sm text-white">{t.templateName}</td>
                    <td className="py-3 text-sm text-slate-300 text-right">{t.renders.toLocaleString()}</td>
                    <td className="py-3 text-sm text-slate-300 text-right">{t.avgDurationMs}ms</td>
                    <td className="py-3 text-sm text-right">
                      <span className={t.errorRate > 5 ? 'text-rose-400' : 'text-slate-300'}>{t.errorRate}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
