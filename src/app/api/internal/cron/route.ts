import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { cleanupExpiredPdfs } from '@/lib/storage-cleanup';
import { processRetryQueue } from '@/lib/webhooks';

export const runtime = 'nodejs';

/**
 * Internal cron endpoint for scheduled maintenance tasks.
 *
 * Protected by INTERNAL_API_SECRET (or NEXTAUTH_SECRET fallback).
 * Designed to be called by Railway cron, external scheduler, or health-check pinger.
 *
 * Tasks executed:
 * 1. cleanupExpiredPdfs — removes S3 objects past tier retention (FREE: 7d, PRO: 30d, BUSINESS: 90d)
 * 2. processRetryQueue — retries failed webhook deliveries from the Redis sorted set
 */
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get('x-internal-auth');
  const expectedSecret = process.env.INTERNAL_API_SECRET || process.env.NEXTAUTH_SECRET;

  if (!expectedSecret || authHeader !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const results: Record<string, unknown> = {};

  // 1. PDF storage cleanup
  try {
    const cleanup = await cleanupExpiredPdfs();
    results.storageCleanup = cleanup;
  } catch (err) {
    results.storageCleanup = { error: err instanceof Error ? err.message : 'Unknown error' };
  }

  // 2. Webhook retry queue processing
  try {
    const retried = await processRetryQueue();
    results.webhookRetries = { processed: retried };
  } catch (err) {
    results.webhookRetries = { error: err instanceof Error ? err.message : 'Unknown error' };
  }

  return NextResponse.json({
    ok: true,
    timestamp: new Date().toISOString(),
    results,
  });
}
