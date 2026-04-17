import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getUsageSummary } from '@/lib/usage';
import { UsageBar } from '@/components/dashboard/UsageBar';
import { OnboardingChecklist } from '@/components/dashboard/OnboardingChecklist';

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
  const teamId = session!.user.activeTeamId;

  if (!teamId) {
    return (
      <div className="space-y-8">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-blue-300">Overview</p>
          <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">Welcome back, {session?.user.name || 'builder'}</h1>
          <p className="mt-2 text-sm text-slate-400">Track usage, manage templates, and keep your document pipeline healthy.</p>
        </div>

        <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-6">
          <h2 className="text-lg font-semibold text-amber-200">No active team selected</h2>
          <p className="mt-2 text-sm text-amber-100/80">Please select a team from the sidebar to view your dashboard.</p>
          <Link
            className="mt-4 inline-block rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-amber-500"
            href="/dashboard/teams"
          >
            Go to Team Settings
          </Link>
        </div>
      </div>
    );
  }

  // Parallel fetch: membership check + data queries all in one Promise.all
  const [member, usage, templateCount, apiKeyCount, firstRender] = await Promise.all([
    prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId: session!.user.id } }
    }),
    getUsageSummary(teamId),
    prisma.template.count({ where: { teamId } }),
    prisma.apiKey.count({ where: { teamId } }),
    prisma.usageRecord.findFirst({
      where: { teamId, status: 'SUCCESS' },
      select: { id: true },
    }),
  ]);

  if (!member) {
    // User's activeTeamId points to a team they're not a member of
    // This can happen if they were removed — show fallback
    redirect('/dashboard/teams');
  }

  const usagePercent = usage.limit === 0 ? 0 : Math.min((usage.used / usage.limit) * 100, 100);

  const onboardingSteps = [
    {
      id: 'api-key',
      label: 'Create an API key',
      description: 'Generate a key to authenticate your render requests.',
      href: '/dashboard/api-keys',
      ctaLabel: 'Generate API key',
      completed: apiKeyCount > 0,
    },
    {
      id: 'template',
      label: 'Create a template',
      description: 'Upload an HTML or Handlebars template to render from.',
      href: '/dashboard/templates/gallery',
      ctaLabel: 'Create template',
      completed: templateCount > 0,
    },
    {
      id: 'render',
      label: 'Generate your first PDF',
      description: 'Make your first render via the API or the template editor.',
      href: '/docs',
      ctaLabel: 'View documentation',
      completed: Boolean(firstRender),
    },
  ];

  const allComplete = onboardingSteps.every((s) => s.completed);

  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-blue-300">Overview</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">Welcome back, {session?.user.name || 'builder'}</h1>
        <p className="mt-2 text-sm text-slate-400">Track usage, manage templates, and keep your document pipeline healthy.</p>
      </div>

      {!allComplete && <OnboardingChecklist steps={onboardingSteps} />}

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
        <UsageBar usagePercent={usagePercent} colorClass={getUsageColor(usagePercent)} />
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
