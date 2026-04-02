import { createHash, randomBytes } from 'crypto';
import type { NextRequest } from 'next/server';

import { prisma } from '@/lib/prisma';

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

export async function validateApiKey(key: string) {
  const keyHash = hashApiKey(key);

  const apiKey = await prisma.apiKey.findUnique({
    where: { keyHash },
    select: { id: true, userId: true }
  });

  if (!apiKey) {
    return null;
  }

  await prisma.apiKey.update({
    where: { id: apiKey.id },
    data: { lastUsedAt: new Date() }
  });

  return apiKey;
}

export function getAuthenticatedUserId(request: Request | NextRequest): string | null {
  return request.headers.get('x-user-id');
}
