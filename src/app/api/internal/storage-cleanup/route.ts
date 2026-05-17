import { NextResponse } from 'next/server';

import { cleanupExpiredPdfs } from '@/lib/storage-cleanup';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * POST /api/internal/storage-cleanup
 *
 * Trigger PDF retention cleanup. Deletes PDFs past their tier's retention window.
 * Designed to be called by a daily cron job.
 *
 * Protected by INTERNAL_API_SECRET.
 */
export async function POST(request: Request) {
  const internalAuth = request.headers.get('x-internal-auth');
  const expectedSecret = process.env.INTERNAL_API_SECRET || process.env.NEXTAUTH_SECRET;

  if (!expectedSecret || internalAuth !== expectedSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const result = await cleanupExpiredPdfs(200);

  return NextResponse.json({
    ...result,
    timestamp: new Date().toISOString(),
  });
}
