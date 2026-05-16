import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { processRetryQueue } from '@/lib/webhooks';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;

    // Piggyback webhook retry processing on health check polling.
    // This ensures retries are processed even without a dedicated cron job.
    // Non-blocking: errors here don't affect health status.
    void processRetryQueue(10).catch(() => {});

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '0.1.0'
    });
  } catch {
    return NextResponse.json(
      { status: 'unhealthy', timestamp: new Date().toISOString() },
      { status: 503 }
    );
  }
}
