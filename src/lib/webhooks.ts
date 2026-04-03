import { randomBytes, createHmac } from 'crypto';

import type { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';
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
const RETRY_DELAYS_MS = [1000, 5000, 25000];

export function generateWebhookSecret(): string {
  return `whsec_${randomBytes(32).toString('hex')}`;
}

export function signPayload(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('hex');
}

export async function dispatchWebhooks(params: {
  userId: string;
  event: WebhookEvent;
  data: Record<string, unknown>;
}) {
  const endpoints = await prisma.webhookEndpoint.findMany({
    where: {
      userId: params.userId,
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

      void deliverWebhook(delivery.id);
    })
  );
}

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
          attempts: {
            increment: 1
          },
          lastAttemptAt: attemptedAt,
          responseStatus: response.status,
          responseBody: null
        }
      });

      return;
    }

    const responseBody = (await response.text().catch(() => '')) || '';
    const nextAttempts = delivery.attempts + 1;

    await prisma.webhookDelivery.update({
      where: { id: delivery.id },
      data: {
        status: nextAttempts >= MAX_DELIVERY_ATTEMPTS ? 'failed' : 'pending',
        attempts: nextAttempts,
        lastAttemptAt: attemptedAt,
        responseStatus: response.status,
        responseBody: responseBody.slice(0, 1000)
      }
    });

    if (nextAttempts < MAX_DELIVERY_ATTEMPTS) {
      setTimeout(() => {
        void deliverWebhook(deliveryId);
      }, RETRY_DELAYS_MS[nextAttempts - 1]);
    }
  } catch (error) {
    const nextAttempts = delivery.attempts + 1;
    const responseBody = error instanceof Error ? error.message : 'Webhook delivery failed';

    await prisma.webhookDelivery.update({
      where: { id: delivery.id },
      data: {
        status: nextAttempts >= MAX_DELIVERY_ATTEMPTS ? 'failed' : 'pending',
        attempts: nextAttempts,
        lastAttemptAt: attemptedAt,
        responseStatus: null,
        responseBody: responseBody.slice(0, 1000)
      }
    });

    if (nextAttempts < MAX_DELIVERY_ATTEMPTS) {
      setTimeout(() => {
        void deliverWebhook(deliveryId);
      }, RETRY_DELAYS_MS[nextAttempts - 1]);
    }
  }
}

export async function assertWebhookLimit(userId: string, tier: Tier) {
  const count = await prisma.webhookEndpoint.count({ where: { userId } });
  const limit = TIER_WEBHOOK_LIMITS[tier];

  if (count >= limit) {
    const error = new Error('Webhook endpoint limit reached') as Error & { status: number; payload: unknown };
    error.status = 403;
    error.payload = { error: 'Webhook endpoint limit reached', limit, current: count, tier };
    throw error;
  }
}
