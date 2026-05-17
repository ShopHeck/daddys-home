import { randomBytes, createHmac } from 'crypto';

import type { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import { getRedis } from '@/lib/redis';
import type { Tier } from '@/types';

export const WEBHOOK_EVENTS = [
  'render.completed',
  'render.failed',
  'template.created',
  'template.updated',
  'template.deleted'
] as const;

export type WebhookEvent = typeof WEBHOOK_EVENTS[number];

export const TIER_WEBHOOK_LIMITS: Record<Tier, number> = {
  FREE: 1,
  PRO: 5,
  BUSINESS: 20
};

const MAX_DELIVERY_ATTEMPTS = 3;

/**
 * Retry delays in seconds (exponential backoff).
 * Attempt 1 retry: 10s, Attempt 2 retry: 60s
 */
const RETRY_DELAYS_SECONDS = [10, 60];

/**
 * Redis sorted set key for the delayed webhook retry queue.
 * Score = Unix timestamp (seconds) when the delivery should be retried.
 */
const WEBHOOK_RETRY_QUEUE_KEY = 'docforge:webhook-retry-queue';

export function generateWebhookSecret(): string {
  return `whsec_${randomBytes(32).toString('hex')}`;
}

export function signPayload(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex');
}

export async function dispatchWebhooks(params: {
  teamId: string;
  event: WebhookEvent;
  data: Record<string, unknown>;
}) {
  const endpoints = await prisma.webhookEndpoint.findMany({
    where: {
      teamId: params.teamId,
      active: true,
      events: {
        has: params.event
      }
    },
    select: {
      id: true
    }
  });

  await Promise.all(
    endpoints.map(async (endpoint) => {
      const delivery = await prisma.webhookDelivery.create({
        data: {
          endpointId: endpoint.id,
          event: params.event,
          payload: params.data as Prisma.InputJsonObject,
          status: 'pending'
        },
        select: {
          id: true
        }
      });

      // Attempt first delivery immediately
      void deliverWebhook(delivery.id);
    })
  );
}

/**
 * Attempt to deliver a webhook. On failure, schedules a retry via
 * Redis sorted set (persistent) or falls back to setTimeout (best-effort).
 */
export async function deliverWebhook(deliveryId: string) {
  const delivery = await prisma.webhookDelivery.findUnique({
    where: { id: deliveryId },
    include: {
      endpoint: true
    }
  });

  if (!delivery || delivery.status === 'success' || delivery.status === 'failed') {
    return;
  }

  const data = delivery.payload && typeof delivery.payload === 'object' && !Array.isArray(delivery.payload)
    ? (delivery.payload as Record<string, unknown>)
    : {};
  const payloadString = JSON.stringify({
    event: delivery.event,
    data,
    deliveredAt: new Date().toISOString()
  });
  const signature = signPayload(payloadString, delivery.endpoint.secret);
  const attemptedAt = new Date();

  try {
    const response = await fetch(delivery.endpoint.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-DocForge-Signature': signature,
        'X-DocForge-Event': delivery.event
      },
      body: payloadString,
      signal: AbortSignal.timeout(10000)
    });

    if (response.ok) {
      await prisma.webhookDelivery.update({
        where: { id: delivery.id },
        data: {
          status: 'success',
          attempts: { increment: 1 },
          lastAttemptAt: attemptedAt,
          responseStatus: response.status,
          responseBody: null
        }
      });

      return;
    }

    const responseBody = (await response.text().catch(() => '')) || '';
    await handleDeliveryFailure(delivery.id, delivery.attempts, attemptedAt, response.status, responseBody.slice(0, 1000));
  } catch (error) {
    const responseBody = error instanceof Error ? error.message : 'Webhook delivery failed';
    await handleDeliveryFailure(delivery.id, delivery.attempts, attemptedAt, null, responseBody.slice(0, 1000));
  }
}

/**
 * Handle a failed delivery attempt: update DB, schedule retry if attempts remain.
 */
async function handleDeliveryFailure(
  deliveryId: string,
  currentAttempts: number,
  attemptedAt: Date,
  responseStatus: number | null,
  responseBody: string
) {
  const nextAttempts = currentAttempts + 1;
  const isFinalAttempt = nextAttempts >= MAX_DELIVERY_ATTEMPTS;

  await prisma.webhookDelivery.update({
    where: { id: deliveryId },
    data: {
      status: isFinalAttempt ? 'failed' : 'pending',
      attempts: nextAttempts,
      lastAttemptAt: attemptedAt,
      responseStatus,
      responseBody
    }
  });

  if (!isFinalAttempt) {
    await scheduleRetry(deliveryId, nextAttempts);
  }
}

/**
 * Schedule a webhook delivery retry.
 *
 * With Redis: adds to a sorted set (score = future timestamp).
 *   A cron/worker or the processRetryQueue() function polls this queue.
 *
 * Without Redis: falls back to setTimeout (best-effort, survives only
 *   within the same long-running process — adequate for Docker/VM deploys).
 */
async function scheduleRetry(deliveryId: string, attemptNumber: number): Promise<void> {
  const delaySeconds = RETRY_DELAYS_SECONDS[attemptNumber - 1] ?? 60;
  const retryAt = Math.floor(Date.now() / 1000) + delaySeconds;

  const redis = getRedis();

  if (redis) {
    // Persistent retry: sorted set with score = unix timestamp to execute
    await redis.zadd(WEBHOOK_RETRY_QUEUE_KEY, { score: retryAt, member: deliveryId });
  } else {
    // Best-effort in-process retry (works in Docker/VM, not serverless)
    setTimeout(() => {
      void deliverWebhook(deliveryId);
    }, delaySeconds * 1000);
  }
}

/**
 * Process pending webhook retries from the Redis queue.
 *
 * This should be called periodically (e.g., via a cron job, health check endpoint,
 * or at the start of each API request). It processes all deliveries whose
 * scheduled retry time has passed.
 *
 * Returns the number of retries processed.
 */
export async function processRetryQueue(maxItems = 20): Promise<number> {
  const redis = getRedis();
  if (!redis) return 0;

  const now = Math.floor(Date.now() / 1000);
  const claimed: string[] = [];

  // Atomically pop items from the sorted set one at a time
  // zpopmin returns the member with the lowest score
  for (let i = 0; i < maxItems; i++) {
    const result = await redis.zpopmin(WEBHOOK_RETRY_QUEUE_KEY, 1);
    if (!result || result.length === 0) break;

    const item = result[0];
    if (!item) break;
    // item is { member, score } or [member, score] depending on client
    const member = typeof item === 'object' && 'member' in item ? item.member : (item as unknown as string);
    const score = typeof item === 'object' && 'score' in item ? item.score : 0;

    // Only process if the score (scheduled time) is <= now
    if (Number(score) > now) {
      // Put it back — it's not ready yet
      await redis.zadd(WEBHOOK_RETRY_QUEUE_KEY, { score: Number(score), member: String(member) });
      break;
    }

    claimed.push(String(member));
  }

  if (claimed.length === 0) {
    return 0;
  }

  // Process each retry
  await Promise.allSettled(
    claimed.map((deliveryId) => deliverWebhook(deliveryId))
  );

  return claimed.length;
}

/**
 * Get the count of pending retries in the queue.
 */
export async function getRetryQueueSize(): Promise<number> {
  const redis = getRedis();
  if (!redis) return 0;

  return await redis.zcard(WEBHOOK_RETRY_QUEUE_KEY);
}

export async function assertWebhookLimit(teamId: string, tier: Tier) {
  const count = await prisma.webhookEndpoint.count({ where: { teamId } });
  const limit = TIER_WEBHOOK_LIMITS[tier];

  if (count >= limit) {
    const error = new Error('Webhook endpoint limit reached') as Error & { status: number; payload: unknown };
    error.status = 403;
    error.payload = { error: 'Webhook endpoint limit reached', limit, current: count, tier };
    throw error;
  }
}
