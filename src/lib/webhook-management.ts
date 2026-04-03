import type { Prisma } from '@prisma/client';

import { prisma } from '@/lib/prisma';
import {
  WEBHOOK_EVENTS,
  assertWebhookLimit,
  generateWebhookSecret,
  type WebhookEvent
} from '@/lib/webhooks';
import type { Tier } from '@/types';

const endpointSelect = {
  id: true,
  url: true,
  secret: true,
  events: true,
  active: true,
  createdAt: true,
  updatedAt: true
} satisfies Prisma.WebhookEndpointSelect;

const deliverySelect = {
  id: true,
  event: true,
  status: true,
  attempts: true,
  responseStatus: true,
  createdAt: true,
  lastAttemptAt: true
} satisfies Prisma.WebhookDeliverySelect;

type WebhookEndpointRecord = Prisma.WebhookEndpointGetPayload<{ select: typeof endpointSelect }>;
type WebhookDeliveryRecord = Prisma.WebhookDeliveryGetPayload<{ select: typeof deliverySelect }>;

export function maskWebhookSecret(secret: string): string {
  return `wh_...${secret.slice(-8)}`;
}

export function isValidWebhookUrl(value: string): boolean {
  try {
    const url = new URL(value);

    if (url.protocol === 'https:') {
      return true;
    }

    return url.protocol === 'http:' && (url.hostname === 'localhost' || url.hostname === '127.0.0.1');
  } catch {
    return false;
  }
}

export function parseWebhookEvents(value: unknown): WebhookEvent[] | null {
  if (!Array.isArray(value) || value.length === 0) {
    return null;
  }

  const events = [...new Set(value)];

  if (events.some((event) => typeof event !== 'string' || !WEBHOOK_EVENTS.includes(event as WebhookEvent))) {
    return null;
  }

  return events as WebhookEvent[];
}

export function serializeWebhookEndpoint(endpoint: WebhookEndpointRecord, revealSecret = false) {
  return {
    ...endpoint,
    secret: revealSecret ? endpoint.secret : maskWebhookSecret(endpoint.secret)
  };
}

export function serializeWebhookDeliveries(deliveries: WebhookDeliveryRecord[]) {
  return deliveries;
}

export async function listWebhookEndpoints(userId: string) {
  const endpoints = await prisma.webhookEndpoint.findMany({
    where: { userId },
    select: endpointSelect,
    orderBy: { createdAt: 'desc' }
  });

  return endpoints.map((endpoint) => serializeWebhookEndpoint(endpoint));
}

export async function getWebhookEndpoint(id: string, userId: string, revealSecret = false) {
  const endpoint = await prisma.webhookEndpoint.findFirst({
    where: {
      id,
      userId
    },
    select: endpointSelect
  });

  if (!endpoint) {
    return null;
  }

  return serializeWebhookEndpoint(endpoint, revealSecret);
}

export async function createWebhookEndpoint(params: {
  userId: string;
  tier: Tier;
  url: string;
  events: WebhookEvent[];
}) {
  await assertWebhookLimit(params.userId, params.tier);

  const endpoint = await prisma.webhookEndpoint.create({
    data: {
      userId: params.userId,
      url: params.url,
      secret: generateWebhookSecret(),
      events: params.events
    },
    select: endpointSelect
  });

  return serializeWebhookEndpoint(endpoint, true);
}

export async function updateWebhookEndpoint(params: {
  id: string;
  userId: string;
  data: {
    url?: string;
    events?: WebhookEvent[];
    active?: boolean;
  };
}) {
  const existing = await prisma.webhookEndpoint.findFirst({
    where: {
      id: params.id,
      userId: params.userId
    },
    select: { id: true }
  });

  if (!existing) {
    return null;
  }

  const endpoint = await prisma.webhookEndpoint.update({
    where: { id: existing.id },
    data: params.data,
    select: endpointSelect
  });

  return serializeWebhookEndpoint(endpoint);
}

export async function deleteWebhookEndpoint(id: string, userId: string) {
  const existing = await prisma.webhookEndpoint.findFirst({
    where: {
      id,
      userId
    },
    select: { id: true }
  });

  if (!existing) {
    return false;
  }

  await prisma.webhookEndpoint.delete({
    where: { id: existing.id }
  });

  return true;
}

export async function listWebhookDeliveries(params: {
  endpointId: string;
  userId: string;
  page: number;
  pageSize: number;
  status?: 'pending' | 'success' | 'failed';
}) {
  const endpoint = await prisma.webhookEndpoint.findFirst({
    where: {
      id: params.endpointId,
      userId: params.userId
    },
    select: { id: true }
  });

  if (!endpoint) {
    return null;
  }

  const where: Prisma.WebhookDeliveryWhereInput = {
    endpointId: endpoint.id
  };

  if (params.status) {
    where.status = params.status;
  }

  const [deliveries, total] = await Promise.all([
    prisma.webhookDelivery.findMany({
      where,
      select: deliverySelect,
      orderBy: [
        { createdAt: 'desc' },
        { id: 'desc' }
      ],
      skip: (params.page - 1) * params.pageSize,
      take: params.pageSize
    }),
    prisma.webhookDelivery.count({ where })
  ]);

  return {
    deliveries: serializeWebhookDeliveries(deliveries),
    pagination: {
      page: params.page,
      pageSize: params.pageSize,
      total,
      totalPages: Math.ceil(total / params.pageSize)
    }
  };
}
