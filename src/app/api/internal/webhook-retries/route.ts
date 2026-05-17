import { NextResponse } from 'next/server';

import { getRetryQueueSize, processRetryQueue } from '@/lib/webhooks';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/internal/webhook-retries
 *
 * Process pending webhook delivery retries from the Redis queue.
 * Designed to be called by:
 * - A cron job (e.g., Railway cron, Vercel cron, or external like Upstash QStash)
 * - The health check endpoint (piggyback on periodic polling)
 *
 * Protected by INTERNAL_API_SECRET (same as validate-key endpoint).
 */
export async function POST(request: Request) {
  const internalAuth = request.headers.get('x-internal-auth');
  const expectedSecret = process.env.INTERNAL_API_SECRET || process.env.NEXTAUTH_SECRET;

  if (!expectedSecret || internalAuth !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const processed = await processRetryQueue(50);
  const queueSize = await getRetryQueueSize();

  return NextResponse.json({
    processed,
    remainingInQueue: queueSize,
    timestamp: new Date().toISOString(),
  });
}

/**
 * GET /api/internal/webhook-retries
 *
 * Check the retry queue status without processing.
 */
export async function GET(request: Request) {
  const internalAuth = request.headers.get('x-internal-auth');
  const expectedSecret = process.env.INTERNAL_API_SECRET || process.env.NEXTAUTH_SECRET;

  if (!expectedSecret || internalAuth !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const queueSize = await getRetryQueueSize();

  return NextResponse.json({
    queueSize,
    timestamp: new Date().toISOString(),
  });
}
