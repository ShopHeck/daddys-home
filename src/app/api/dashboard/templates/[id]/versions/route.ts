import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const teamId = session.user.activeTeamId;
  if (!teamId) {
    return NextResponse.json({ error: 'No active team. Please select a team.' }, { status: 400 });
  }

  const template = await prisma.template.findFirst({
    where: { id: params.id, teamId },
    select: { id: true, currentVersion: true }
  });

  if (!template) {
    return NextResponse.json({ error: 'Template not found.' }, { status: 404 });
  }

  const versions = await prisma.templateVersion.findMany({
    where: { templateId: params.id },
    select: {
      id: true,
      version: true,
      name: true,
      createdAt: true
    },
    orderBy: { version: 'desc' }
  });

  return NextResponse.json({
    currentVersion: template.currentVersion,
    versions: versions.map((version) => ({
      id: version.id,
      version: version.version,
      name: version.name,
      createdAt: version.createdAt.toISOString()
    }))
  });
}
