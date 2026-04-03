import { NextResponse } from 'next/server';

import { getAuthenticatedTeamId, getAuthenticatedUserId } from '@/lib/api-key';
import {
  createWebhookEndpoint,
  isValidWebhookUrl,
  listWebhookEndpoints,
  parseWebhookEvents
} from '@/lib/webhook-management';
import { getTeamTier, requireApiTeamAccess } from '@/lib/teams';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const userId = getAuthenticatedUserId(request);
  const teamId = getAuthenticatedTeamId(request);

  if (!userId || !teamId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const hasAccess = await requireApiTeamAccess(teamId, userId, ['OWNER', 'ADMIN', 'MEMBER']);
  if (!hasAccess) {
    return NextResponse.json({ error: 'Forbidden: insufficient team role' }, { status: 403 });
  }

  const endpoints = await listWebhookEndpoints(teamId);

  return NextResponse.json(endpoints);
}

export async function POST(request: Request) {
  const userId = getAuthenticatedUserId(request);
  const teamId = getAuthenticatedTeamId(request);

  if (!userId || !teamId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const hasAccess = await requireApiTeamAccess(teamId, userId, ['OWNER', 'ADMIN']);
  if (!hasAccess) {
    return NextResponse.json({ error: 'Forbidden: insufficient team role' }, { status: 403 });
  }

  const body = (await request.json().catch(() => null)) as {
    url?: string;
    events?: unknown;
  } | null;
  const url = body?.url?.trim() ?? '';
  const events = parseWebhookEvents(body?.events);

  if (!url || !isValidWebhookUrl(url)) {
    return NextResponse.json({ error: 'A valid HTTPS URL is required.' }, { status: 400 });
  }

  if (!events) {
    return NextResponse.json({ error: 'At least one valid webhook event is required.' }, { status: 400 });
  }

  const tier = await getTeamTier(teamId);

  try {
    const endpoint = await createWebhookEndpoint({
      teamId,
      userId,
      tier,
      url,
      events
    });

    return NextResponse.json(endpoint, { status: 201 });
  } catch (error) {
    const webhookError = error as Error & { status?: number; payload?: unknown };

    if (webhookError.status && webhookError.payload) {
      return NextResponse.json(webhookError.payload, { status: webhookError.status });
    }

    throw error;
  }
}
