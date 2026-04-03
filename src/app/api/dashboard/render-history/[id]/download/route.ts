import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { requireTeamAccess } from '@/lib/teams';
import { getDownloadUrl } from '@/lib/storage';

export const runtime = 'nodejs';

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const teamId = session.user.activeTeamId;
  if (!teamId) {
    return NextResponse.json({ error: 'No active team' }, { status: 400 });
  }

  const member = await requireTeamAccess(teamId, session.user.id, ['OWNER', 'ADMIN', 'MEMBER']);
  if (!member) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const record = await prisma.usageRecord.findFirst({
    where: { id: params.id, teamId },
    select: { storageKey: true, status: true }
  });

  if (!record || !record.storageKey) {
    return NextResponse.json({ error: 'PDF not available' }, { status: 404 });
  }

  const url = await getDownloadUrl(record.storageKey);
  if (!url) {
    return NextResponse.json({ error: 'Storage not configured' }, { status: 503 });
  }

  return NextResponse.redirect(url);
}
