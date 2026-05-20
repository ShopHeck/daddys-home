import { NextResponse } from 'next/server';

import { prisma } from '@/lib/prisma';
import { getRedis } from '@/lib/redis';
import { processRetryQueue } from '@/lib/webhooks';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type ServiceStatus = 'ok' | 'degraded' | 'down';

type HealthCheck = {
  status: ServiceStatus;
  timestamp: string;
  version: string;
  services: {
    database: { status: ServiceStatus; latencyMs: number | null };
    redis: { status: ServiceStatus; latencyMs: number | null; configured: boolean };
    storage: { configured: boolean };
  };
  uptime: number;
};

const startTime = Date.now();

export async function GET() {
  const health: HealthCheck = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '0.1.0',
    services: {
      database: { status: 'down', latencyMs: null },
      redis: { status: 'down', latencyMs: null, configured: false },
      storage: { configured: Boolean(process.env.STORAGE_BUCKET) },
    },
    uptime: Math.round((Date.now() - startTime) / 1000),
  };

  // Check database connectivity
  try {
    const dbStart = performance.now();
    await prisma.$queryRaw`SELECT 1`;
    health.services.database = {
      status: 'ok',
      latencyMs: Math.round(performance.now() - dbStart),
    };
  } catch {
    health.services.database = { status: 'down', latencyMs: null };
    health.status = 'degraded';
  }

  // Check Redis connectivity
  const redis = getRedis();
  if (redis) {
    health.services.redis.configured = true;
    try {
      const redisStart = performance.now();
      await redis.ping();
      health.services.redis = {
        status: 'ok',
        latencyMs: Math.round(performance.now() - redisStart),
        configured: true,
      };
    } catch {
      health.services.redis = { status: 'down', latencyMs: null, configured: true };
      // Redis being down is degraded, not fatal (rate limiting has in-memory fallback)
      if (health.status === 'ok') health.status = 'degraded';
    }
  } else {
    // Redis not configured — not an error, just informational
    health.services.redis = { status: 'ok', latencyMs: null, configured: false };
  }

  // If database is down, overall status is down
  if (health.services.database.status === 'down') {
    health.status = 'down';
  }

  // Piggyback webhook retry processing on health check polling.
  // Non-blocking: errors here don't affect health status.
  void processRetryQueue(10).catch(() => {});

  const httpStatus = health.status === 'down' ? 503 : 200;
  return NextResponse.json(health, { status: httpStatus });
}
