import { NextResponse } from 'next/server';

import { getAuthenticatedTeamId, getAuthenticatedUserId } from '@/lib/api-key';
import { prisma } from '@/lib/prisma';
import { requireApiTeamAccess } from '@/lib/teams';
import { getDownloadUrl } from '@/lib/storage';

export const runtime = 'nodejs';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const userId = getAuthenticatedUserId(request);
  const teamId = getAuthenticatedTeamId(request);

  if (!userId || !teamId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const hasAccess = await requireApiTeamAccess(teamId, userId, ['OWNER', 'ADMIN', 'MEMBER']);
  if (!hasAccess) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const record = await prisma.usageRecord.findFirst({
    where: { id: params.id, teamId },
    select: { storageKey: true }
  });

  if (!record?.storageKey) {
    return NextResponse.json({ error: 'PDF not available' }, { status: 404 });
  }

  const url = await getDownloadUrl(record.storageKey);
  if (!url) {
    return NextResponse.json({ error: 'Storage not configured' }, { status: 503 });
  }

  return NextResponse.json({ downloadUrl: url });
}
