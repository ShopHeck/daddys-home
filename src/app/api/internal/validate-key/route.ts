import { NextResponse } from 'next/server';

import { validateApiKey } from '@/lib/api-key';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const internalAuth = request.headers.get('x-internal-auth');

  // Accept either the dedicated INTERNAL_API_SECRET or fall back to NEXTAUTH_SECRET
  const expectedSecret = process.env.INTERNAL_API_SECRET || process.env.NEXTAUTH_SECRET;

  if (!expectedSecret || internalAuth !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const apiKey = request.headers.get('x-api-key');

  if (!apiKey) {
    return NextResponse.json({ error: 'API key required' }, { status: 401 });
  }

  const record = await validateApiKey(apiKey);

  if (!record) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
  }

  return NextResponse.json({
    userId: record.userId,
    teamId: record.teamId,
    tier: record.tier,
    apiKeyId: record.apiKeyId
  });
}
