import { NextResponse } from 'next/server';

import { getAuthenticatedTeamId, getAuthenticatedUserId } from '@/lib/api-key';
import { listWebhookDeliveries } from '@/lib/webhook-management';
import { requireApiTeamAccess } from '@/lib/teams';

export const runtime = 'nodejs';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const userId = getAuthenticatedUserId(request);
  const teamId = getAuthenticatedTeamId(request);

  if (!userId || !teamId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const hasAccess = await requireApiTeamAccess(teamId, userId, ['OWNER', 'ADMIN', 'MEMBER']);
  if (!hasAccess) {
    return NextResponse.json({ error: 'Forbidden: insufficient team role' }, { status: 403 });
  }

  const url = new URL(request.url);
  const page = Math.max(parseInt(url.searchParams.get('page') ?? '1', 10), 1);
  const pageSize = Math.min(Math.max(parseInt(url.searchParams.get('pageSize') ?? '20', 10), 1), 100);
  const status = url.searchParams.get('status');
  const normalizedStatus = status === 'pending' || status === 'success' || status === 'failed' ? status : undefined;

  if (status && !normalizedStatus) {
    return NextResponse.json({ error: 'Invalid delivery status filter.' }, { status: 400 });
  }

  const payload = await listWebhookDeliveries({
    endpointId: params.id,
    teamId,
    page,
    pageSize,
    status: normalizedStatus
  });

  if (!payload) {
    return NextResponse.json({ error: 'Webhook endpoint not found.' }, { status: 404 });
  }

  return NextResponse.json(payload);
}
