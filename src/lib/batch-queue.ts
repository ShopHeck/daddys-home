import { randomBytes } from 'crypto';

import { prisma } from '@/lib/prisma';
import { renderLogger } from '@/lib/logger';
import { getRedis } from '@/lib/redis';
import { renderPdfFromTemplate } from '@/lib/renderer';
import { computeCacheKey, getCachedRender, isCacheEnabled, setCachedRender } from '@/lib/render-cache';
import { uploadPdf } from '@/lib/storage';
import { assertUsageWithinLimit, recordUsage, releaseUsageSlot, TIER_BATCH_LIMITS } from '@/lib/usage';
import { dispatchWebhooks } from '@/lib/webhooks';
import type { BatchRenderItem, Tier } from '@/types';

export type BatchJob = {
  id: string;
  teamId: string;
  userId: string;
  apiKeyId?: string;
  templateId: string;
  items: BatchRenderItem[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  total: number;
  results: BatchResultItem[];
  createdAt: string;
  completedAt?: string;
  error?: string;
};

export type BatchResultItem = {
  index: number;
  status: 'SUCCESS' | 'FAILED';
  storageKey?: string;
  durationMs: number;
  fileSizeBytes?: number;
  error?: string;
};

// In-memory job store for environments without Redis.
// In production, Redis is used for cross-instance job state.
const memoryJobs = new Map<string, BatchJob>();

/**
 * Generate a unique batch job ID.
 */
function generateJobId(): string {
  return `batch_${randomBytes(16).toString('hex')}`;
}

/**
 * Redis key for a batch job.
 */
function jobRedisKey(jobId: string): string {
  return `docforge:batch:${jobId}`;
}

/**
 * Store job state (Redis or in-memory fallback).
 */
async function saveJob(job: BatchJob): Promise<void> {
  const redis = getRedis();
  if (redis) {
    // Jobs expire after 24 hours
    await redis.set(jobRedisKey(job.id), JSON.stringify(job), { ex: 86400 });
  } else {
    memoryJobs.set(job.id, { ...job });
  }
}

/**
 * Retrieve job state.
 */
export async function getJob(jobId: string): Promise<BatchJob | null> {
  const redis = getRedis();
  if (redis) {
    const data = await redis.get<string>(jobRedisKey(jobId));
    if (!data) return null;
    return typeof data === 'string' ? JSON.parse(data) : (data as unknown as BatchJob);
  }
  return memoryJobs.get(jobId) ?? null;
}

/**
 * Create and enqueue a batch render job.
 * Returns immediately with the job ID for polling.
 */
export async function createBatchJob(params: {
  teamId: string;
  userId: string;
  apiKeyId?: string;
  templateId: string;
  items: BatchRenderItem[];
  tier: Tier;
}): Promise<BatchJob> {
  const { teamId, userId, apiKeyId, templateId, items, tier } = params;

  // Validate batch size against tier limits
  const maxItems = TIER_BATCH_LIMITS[tier];
  if (items.length > maxItems) {
    const error = new Error('Batch size exceeds plan limit') as Error & {
      status: number;
      payload: unknown;
    };
    error.status = 400;
    error.payload = {
      error: 'Batch size exceeds plan limit',
      maxItems,
      requested: items.length,
      tier,
    };
    throw error;
  }

  const job: BatchJob = {
    id: generateJobId(),
    teamId,
    userId,
    apiKeyId,
    templateId,
    items,
    status: 'pending',
    progress: 0,
    total: items.length,
    results: [],
    createdAt: new Date().toISOString(),
  };

  await saveJob(job);

  // Start processing in the background
  void processBatchJob(job);

  return job;
}

/**
 * Process a batch render job item by item.
 * Updates progress as each item completes.
 */
async function processBatchJob(job: BatchJob): Promise<void> {
  job.status = 'processing';
  await saveJob(job);

  // Fetch the template once
  const template = await prisma.template.findFirst({
    where: { id: job.templateId, teamId: job.teamId },
    select: { id: true, content: true, css: true, currentVersion: true },
  });

  if (!template) {
    job.status = 'failed';
    job.error = 'Template not found';
    job.completedAt = new Date().toISOString();
    await saveJob(job);
    return;
  }

  const currentVersion = await prisma.templateVersion.findUnique({
    where: {
      templateId_version: {
        templateId: template.id,
        version: template.currentVersion,
      },
    },
    select: { id: true },
  });

  for (let i = 0; i < job.items.length; i++) {
    const item = job.items[i];
    const startTime = performance.now();

    try {
      // Check usage limit for each render
      await assertUsageWithinLimit(job.teamId);
    } catch (error) {
      const durationMs = Math.round(performance.now() - startTime);
      job.results.push({
        index: i,
        status: 'FAILED',
        durationMs,
        error: 'Usage limit exceeded',
      });
      job.progress = i + 1;
      await saveJob(job);
      continue;
    }

    try {
      // Check render cache first
      const cacheHash = computeCacheKey({
        templateId: template.id,
        templateVersion: template.currentVersion,
        data: item.data,
        options: item.options,
        css: template.css ?? undefined,
      });

      let pdf: Buffer | null = null;
      let fromCache = false;

      if (isCacheEnabled()) {
        const cached = await getCachedRender({ teamId: job.teamId, cacheHash });
        if (cached.hit) {
          pdf = cached.pdf;
          fromCache = true;
        }
      }

      if (!pdf) {
        pdf = await renderPdfFromTemplate({
          template: template.content,
          data: item.data,
          options: item.options,
          css: template.css ?? undefined,
        });
      }

      const durationMs = Math.round(performance.now() - startTime);

      // Upload to storage first (non-critical - if it fails, render still succeeded)
      let storageKey: string | null = null;
      try {
        storageKey = await uploadPdf({
          teamId: job.teamId,
          recordId: `batch-${job.id}-${i}`,
          buffer: pdf,
        });
      } catch (uploadErr) {
        renderLogger.error({ err: uploadErr, jobId: job.id, index: i }, 'Batch PDF storage upload failed');
      }

      // Record success ONCE after render (and optional upload) complete
      const record = await recordUsage({
        teamId: job.teamId,
        userId: job.userId,
        templateId: template.id,
        templateVersionId: currentVersion?.id,
        status: 'SUCCESS',
        durationMs,
        fileSizeBytes: pdf.length,
        apiKeyId: job.apiKeyId,
      });

      if (storageKey) {
        await prisma.usageRecord.update({
          where: { id: record.id },
          data: { storageKey },
        });
      }

      // Write to render cache if not already cached
      if (!fromCache && isCacheEnabled()) {
        void setCachedRender({
          teamId: job.teamId,
          cacheHash,
          pdf,
          tier: 'PRO',
        }).catch(() => {});
      }

      job.results.push({
        index: i,
        status: 'SUCCESS',
        storageKey: storageKey ?? undefined,
        durationMs,
        fileSizeBytes: pdf.length,
      });
    } catch (error) {
      const durationMs = Math.round(performance.now() - startTime);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Release the usage slot since the render failed
      await releaseUsageSlot(job.teamId);

      // Record failure (only one record per attempt)
      await recordUsage({
        teamId: job.teamId,
        userId: job.userId,
        templateId: template.id,
        templateVersionId: currentVersion?.id,
        status: 'FAILED',
        durationMs,
        errorMessage,
        apiKeyId: job.apiKeyId,
      });

      job.results.push({
        index: i,
        status: 'FAILED',
        durationMs,
        error: errorMessage,
      });
    }

    job.progress = i + 1;
    await saveJob(job);
  }

  // Job complete
  const successCount = job.results.filter((r) => r.status === 'SUCCESS').length;
  const failCount = job.results.filter((r) => r.status === 'FAILED').length;

  job.status = failCount === job.total ? 'failed' : 'completed';
  job.completedAt = new Date().toISOString();
  await saveJob(job);

  // Dispatch webhook
  void dispatchWebhooks({
    teamId: job.teamId,
    event: 'render.completed',
    data: {
      batchId: job.id,
      templateId: job.templateId,
      total: job.total,
      succeeded: successCount,
      failed: failCount,
    },
  });
}
