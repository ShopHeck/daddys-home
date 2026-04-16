import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

import { TemplatesClient } from '@/components/dashboard/TemplatesClient';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function TemplatesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.activeTeamId) {
    redirect('/dashboard');
  }

  const rows = await prisma.template.findMany({
    where: { teamId: session.user.activeTeamId },
    select: {
      id: true,
      name: true,
      description: true,
      currentVersion: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: 'desc' },
  });

  // Serialize dates for client component
  const templates = rows.map((t) => ({
    ...t,
    createdAt: t.createdAt.toISOString(),
    updatedAt: t.updatedAt.toISOString(),
  }));

  return <TemplatesClient templates={templates} />;
}
