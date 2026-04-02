import { NextResponse } from 'next/server';

import { validateApiKey } from '@/lib/api-key';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const internalAuth = request.headers.get('x-internal-auth');

  if (!process.env.NEXTAUTH_SECRET || internalAuth !== process.env.NEXTAUTH_SECRET) {
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
    tier: record.tier,
    apiKeyId: record.apiKeyId
  });
}
