import Link from 'next/link';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getUsageSummary } from '@/lib/usage';

function getUsageColor(percent: number) {
  if (percent >= 80) {
    return 'bg-rose-500';
  }

  if (percent >= 50) {
    return 'bg-amber-400';
  }

  return 'bg-emerald-500';
}

export default async function DashboardOverviewPage() {
  const session = await getServerSession(authOptions);
  const userId = session!.user.id;

  const [usage, templateCount, apiKeyCount] = await Promise.all([
    getUsageSummary(userId),
    prisma.template.count({ where: { userId } }),
    prisma.apiKey.count({ where: { userId } })
  ]);

  const usagePercent = usage.limit === 0 ? 0 : Math.min((usage.used / usage.limit) * 100, 100);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-blue-300">Overview</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">Welcome back, {session?.user.name || 'builder'}</h1>
        <p className="mt-2 text-sm text-slate-400">Track usage, manage templates, and keep your document pipeline healthy.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-6">
          <p className="text-sm text-slate-400">Current tier</p>
          <p className="mt-3 text-2xl font-semibold text-white">{usage.tier}</p>
        </div>
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-6">
          <p className="text-sm text-slate-400">Documents generated this month</p>
          <p className="mt-3 text-2xl font-semibold text-white">
            {usage.used.toLocaleString()} / {usage.limit.toLocaleString()}
          </p>
        </div>
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-6">
          <p className="text-sm text-slate-400">Templates</p>
          <p className="mt-3 text-2xl font-semibold text-white">{templateCount}</p>
        </div>
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-6">
          <p className="text-sm text-slate-400">API keys</p>
          <p className="mt-3 text-2xl font-semibold text-white">{apiKeyCount}</p>
        </div>
      </div>

      <div className="rounded-lg border border-slate-700 bg-slate-800 p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">Monthly quota usage</h2>
            <p className="mt-2 text-sm text-slate-400">{usage.remaining.toLocaleString()} documents remaining in the current period.</p>
          </div>
          <p className="text-sm font-medium text-slate-300">{usagePercent.toFixed(1)}% used</p>
        </div>
        <div className="mt-6 h-4 w-full overflow-hidden rounded-full bg-slate-900">
          <div className={`h-full rounded-full ${getUsageColor(usagePercent)}`} style={{ width: `${usagePercent}%` }} />
        </div>
      </div>

      <div className="flex flex-col gap-4 sm:flex-row">
        <Link className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500" href="/dashboard/templates/new">
          Create Template
        </Link>
        <Link className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-600" href="/dashboard/api-keys">
          Generate API Key
        </Link>
        <Link className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-600" href="/dashboard/render-history">
          View Render History
        </Link>
      </div>
    </div>
  );
}
