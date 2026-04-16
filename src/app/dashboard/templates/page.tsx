import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

import { TemplatesClient } from '@/components/dashboard/TemplatesClient';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getUserTeams } from '@/lib/queries';

export default async function TemplatesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.activeTeamId) {
    redirect('/dashboard');
  }

  const teamId = session.user.activeTeamId;
  const userId = session.user.id;

  // Parallel fetch: membership check + templates query
  const [memberships, rows] = await Promise.all([
    getUserTeams(userId),
    prisma.template.findMany({
      where: { teamId },
      select: {
        id: true,
        name: true,
        description: true,
        currentVersion: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { updatedAt: 'desc' },
    }),
  ]);

  // Verify user is a member of the active team
  const isMember = memberships.some((m) => m.teamId === teamId);
  if (!isMember) {
    redirect('/dashboard');
  }

  // Serialize dates for client component
  const templates = rows.map((t) => ({
    ...t,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  }));

  return <TemplatesClient templates={templates} />;
}
