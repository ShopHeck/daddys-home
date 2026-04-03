import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth';
import {
  createWebhookEndpoint,
  isValidWebhookUrl,
  listWebhookEndpoints,
  parseWebhookEvents
} from '@/lib/webhook-management';
import { getTeamTier } from '@/lib/teams';

export const runtime = 'nodejs';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const teamId = session.user.activeTeamId;
  if (!teamId) {
    return NextResponse.json({ error: 'No active team. Please select a team.' }, { status: 400 });
  }

  const endpoints = await listWebhookEndpoints(teamId);

  return NextResponse.json(endpoints);
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const teamId = session.user.activeTeamId;
  if (!teamId) {
    return NextResponse.json({ error: 'No active team. Please select a team.' }, { status: 400 });
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
      userId: session.user.id,
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
