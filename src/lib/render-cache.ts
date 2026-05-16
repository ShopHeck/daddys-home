import { createHash } from 'crypto';

import { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';

import { getRedis } from '@/lib/redis';
import type { RenderOptions, Tier } from '@/types';

/**
 * Content-addressable render cache.
 *
 * When a render request arrives with an identical template version + data + options
 * combination, we can serve a previously generated PDF from cache instead of
 * re-running Puppeteer (which takes 500ms–3s per render).
 *
 * Cache layers:
 * 1. Redis: stores cache key → S3 storage key mapping (fast lookup)
 * 2. S3/R2: stores the actual PDF blob under a deterministic cache key
 *
 * TTLs per tier:
 * - FREE: 1 hour
 * - PRO: 24 hours
 * - BUSINESS: 7 days
 */

const CACHE_TTL_SECONDS: Record<Tier, number> = {
  FREE: 3600,        // 1 hour
  PRO: 86400,        // 24 hours
  BUSINESS: 604800,  // 7 days
};

const BUCKET = process.env.STORAGE_BUCKET;
const REGION = process.env.STORAGE_REGION || 'auto';
const ENDPOINT = process.env.STORAGE_ENDPOINT;

function getS3Client(): S3Client | null {
  if (!BUCKET || !process.env.STORAGE_ACCESS_KEY_ID || !process.env.STORAGE_SECRET_ACCESS_KEY) {
    return null;
  }

  return new S3Client({
    region: REGION,
    endpoint: ENDPOINT || undefined,
    credentials: {
      accessKeyId: process.env.STORAGE_ACCESS_KEY_ID!,
      secretAccessKey: process.env.STORAGE_SECRET_ACCESS_KEY!,
    },
    forcePathStyle: !!ENDPOINT,
  });
}

/**
 * Generate a deterministic cache key from the render parameters.
 * Uses SHA-256 of the canonical representation.
 */
export function computeCacheKey(params: {
  templateId: string;
  templateVersion: number;
  data: Record<string, unknown>;
  options?: RenderOptions;
  css?: string;
}): string {
  const canonical = JSON.stringify({
    t: params.templateId,
    v: params.templateVersion,
    d: params.data,
    o: params.options ?? null,
    c: params.css ?? null,
  });

  return createHash('sha256').update(canonical).digest('hex');
}

/**
 * Build the S3 key for a cached PDF.
 */
function cacheStorageKey(teamId: string, cacheHash: string): string {
  return `cache/${teamId}/${cacheHash}.pdf`;
}

/**
 * Redis key for the cache lookup.
 */
function redisCacheKey(cacheHash: string): string {
  return `docforge:render-cache:${cacheHash}`;
}

export type CacheHitResult = {
  hit: true;
  pdf: Buffer;
};

export type CacheMissResult = {
  hit: false;
};

export type CacheLookupResult = CacheHitResult | CacheMissResult;

/**
 * Look up a cached render result.
 *
 * Returns the PDF buffer if found, or a miss indicator.
 */
export async function getCachedRender(params: {
  teamId: string;
  cacheHash: string;
}): Promise<CacheLookupResult> {
  const { teamId, cacheHash } = params;
  const client = getS3Client();

  if (!client || !BUCKET) {
    return { hit: false };
  }

  const redis = getRedis();
  const storageKey = cacheStorageKey(teamId, cacheHash);

  // Fast path: check Redis to see if this cache key exists
  if (redis) {
    const cached = await redis.get<string>(redisCacheKey(cacheHash));
    if (!cached) {
      return { hit: false };
    }
  } else {
    // Without Redis, check S3 directly with HEAD
    try {
      await client.send(new HeadObjectCommand({
        Bucket: BUCKET,
        Key: storageKey,
      }));
    } catch {
      return { hit: false };
    }
  }

  // Fetch the PDF from S3
  try {
    const response = await client.send(new GetObjectCommand({
      Bucket: BUCKET,
      Key: storageKey,
    }));

    if (!response.Body) {
      return { hit: false };
    }

    const chunks: Uint8Array[] = [];
    // @ts-expect-error - Body is a readable stream in Node.js
    for await (const chunk of response.Body) {
      chunks.push(chunk);
    }

    return { hit: true, pdf: Buffer.concat(chunks) };
  } catch {
    // Cache miss (object deleted, expired, etc.)
    return { hit: false };
  }
}

/**
 * Store a rendered PDF in the cache.
 */
export async function setCachedRender(params: {
  teamId: string;
  cacheHash: string;
  pdf: Buffer;
  tier: Tier;
}): Promise<void> {
  const { teamId, cacheHash, pdf, tier } = params;
  const client = getS3Client();

  if (!client || !BUCKET) {
    return;
  }

  const storageKey = cacheStorageKey(teamId, cacheHash);
  const ttl = CACHE_TTL_SECONDS[tier];

  // Store the PDF in S3
  await client.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: storageKey,
    Body: pdf,
    ContentType: 'application/pdf',
    // Set cache expiry metadata (lifecycle rules can clean up expired objects)
    Metadata: {
      'cache-ttl': String(ttl),
      'cached-at': new Date().toISOString(),
    },
  }));

  // Store the lookup entry in Redis with TTL
  const redis = getRedis();
  if (redis) {
    await redis.set(redisCacheKey(cacheHash), storageKey, { ex: ttl });
  }
}

/**
 * Invalidate cache entries for a template (called on template update/delete).
 *
 * Since cache keys are content-addressed (include template version), updating
 * a template to a new version automatically means old cache keys won't match.
 * This function is provided for explicit invalidation if needed.
 */
export async function invalidateTemplateCaches(_templateId: string): Promise<void> {
  // Content-addressed caching means new versions automatically miss.
  // Old cached entries will expire via TTL.
  // Explicit invalidation would require maintaining an index of cache keys per template,
  // which we can add later if needed.
}

/**
 * Check if render caching is available (requires S3 storage to be configured).
 */
export function isCacheEnabled(): boolean {
  return !!(BUCKET && process.env.STORAGE_ACCESS_KEY_ID && process.env.STORAGE_SECRET_ACCESS_KEY);
}
