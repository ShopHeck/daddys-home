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

// Patterns matching private/internal hostnames and IP ranges that must not receive webhooks.
// Covers loopback, link-local, RFC-1918 private ranges, and IPv6 equivalents.
// IPv6 addresses in URL hostnames are bracket-stripped before matching (see isBlockedHostname).
const BLOCKED_HOSTNAME_PATTERNS: RegExp[] = [
  // IPv4 loopback (127.x.x.x) and 0.0.0.0
  /^127\.\d+\.\d+\.\d+$/,
  /^0\.0\.0\.0$/,
  // RFC-1918 private ranges
  /^10\.\d+\.\d+\.\d+$/,
  /^172\.(1[6-9]|2\d|3[01])\.\d+\.\d+$/,
  /^192\.168\.\d+\.\d+$/,
  // Link-local / APIPA / AWS IMDS
  /^169\.254\.\d+\.\d+$/,
  // IPv6 loopback
  /^::1$/,
  // IPv6 ULA (fc00::/7) — first byte is fc or fd, then any hex and colons
  /^f[cd][0-9a-f]{0,2}:[0-9a-f:]*$/i,
  // IPv6 link-local (fe80::/10) — first byte fe, second nibble 8–b
  /^fe[89ab][0-9a-f]?:[0-9a-f:]*$/i,
];

function isBlockedHostname(hostname: string): boolean {
  const h = hostname.toLowerCase();
  // Strip enclosing brackets for IPv6 literals
  const stripped = h.startsWith('[') && h.endsWith(']') ? h.slice(1, -1) : h;
  return BLOCKED_HOSTNAME_PATTERNS.some((re) => re.test(stripped));
}

export function isValidWebhookUrl(value: string): boolean {
  try {
    const url = new URL(value);

    if (url.protocol === 'https:') {
      // Block requests to private/internal addresses even over HTTPS
      return !isBlockedHostname(url.hostname);
    }

    // Allow plain HTTP only to localhost for local development/testing
    return (
      url.protocol === 'http:' &&
      (url.hostname === 'localhost' || url.hostname === '127.0.0.1')
    );
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

export async function listWebhookEndpoints(teamId: string) {
  const endpoints = await prisma.webhookEndpoint.findMany({
    where: { teamId },
    select: endpointSelect,
    orderBy: { createdAt: 'desc' }
  });

  return endpoints.map((endpoint) => serializeWebhookEndpoint(endpoint));
}

export async function getWebhookEndpoint(id: string, teamId: string, revealSecret = false) {
  const endpoint = await prisma.webhookEndpoint.findFirst({
    where: {
      id,
      teamId
    },
    select: endpointSelect
  });

  if (!endpoint) {
    return null;
  }

  return serializeWebhookEndpoint(endpoint, revealSecret);
}

export async function createWebhookEndpoint(params: {
  teamId: string;
  userId: string;
  tier: Tier;
  url: string;
  events: WebhookEvent[];
}) {
  await assertWebhookLimit(params.teamId, params.tier);

  const endpoint = await prisma.webhookEndpoint.create({
    data: {
      teamId: params.teamId,
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
  teamId: string;
  data: {
    url?: string;
    events?: WebhookEvent[];
    active?: boolean;
  };
}) {
  const existing = await prisma.webhookEndpoint.findFirst({
    where: {
      id: params.id,
      teamId: params.teamId
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

export async function deleteWebhookEndpoint(id: string, teamId: string) {
  const existing = await prisma.webhookEndpoint.findFirst({
    where: {
      id,
      teamId
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
  teamId: string;
  page: number;
  pageSize: number;
  status?: 'pending' | 'success' | 'failed';
}) {
  const endpoint = await prisma.webhookEndpoint.findFirst({
    where: {
      id: params.endpointId,
      teamId: params.teamId
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
