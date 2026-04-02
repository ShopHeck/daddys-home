import { createHash, randomBytes } from 'crypto';
import type { NextRequest } from 'next/server';

import { prisma } from '@/lib/prisma';
import type { Tier } from '@/types';

export type ValidatedApiKey = {
  apiKeyId: string;
  userId: string;
  tier: Tier;
};

export function generateApiKey(): { key: string; hash: string; prefix: string } {
  const raw = randomBytes(32).toString('hex');
  const key = `df_live_${raw}`;
  const hash = createHash('sha256').update(key).digest('hex');
  const prefix = key.substring(0, 16);

  return { key, hash, prefix };
}

export function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

export async function validateApiKey(key: string): Promise<ValidatedApiKey | null> {
  const keyHash = hashApiKey(key);

  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash },
    select: {
      id: true,
      userId: true,
      user: {
        select: {
          tier: true
        }
      }
    }
  });

  if (!apiKey) {
    return null;
  }

  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() }
  });

  return {
    apiKeyId: apiKey.id,
    userId: apiKey.userId,
    tier: apiKey.user.tier
  };
}

export function getAuthenticatedUserId(request: Request | NextRequest): string | null {
  return request.headers.get('x-user-id');
}

export function getAuthenticatedApiKeyId(request: Request | NextRequest): string | null {
  return request.headers.get('x-api-key-id');
}
