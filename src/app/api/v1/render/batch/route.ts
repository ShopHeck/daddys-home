import { NextResponse } from 'next/server';

import { getAuthenticatedApiKeyId, getAuthenticatedTeamId, getAuthenticatedUserId } from '@/lib/api-key';
import { createBatchJob, getJob } from '@/lib/batch-queue';
import { BODY_LIMITS, parseJsonBodyWithLimit } from '@/lib/body-limit';
import { requireApiTeamAccess, getTeamTier } from '@/lib/teams';
import type { BatchRenderRequestBody } from '@/types';

export const runtime = 'nodejs';

/**
 * POST /api/v1/render/batch
 *
 * Submit a batch of render jobs for the same template with different data.
 * Returns immediately with a job ID for status polling.
 *
 * Request body:
 * {
 *   "templateId": "tmpl_123",
 *   "items": [
 *     { "data": { ... }, "options": { ... } },
 *     { "data": { ... } }
 *   ]
 * }
 *
 * Response:
 * {
 *   "jobId": "batch_abc123...",
 *   "status": "pending",
 *   "total": 10,
 *   "statusUrl": "/api/v1/render/batch/batch_abc123..."
 * }
 */
export async function POST(request: Request) {
  const userId = getAuthenticatedUserId(request);
  const teamId = getAuthenticatedTeamId(request);
  const apiKeyId = getAuthenticatedApiKeyId(request);

  if (!userId || !teamId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const hasAccess = await requireApiTeamAccess(teamId, userId, ['OWNER', 'ADMIN', 'MEMBER']);
  if (!hasAccess) {
    return NextResponse.json({ error: 'Forbidden: insufficient team role' }, { status: 403 });
  }

  const parsed = await parseJsonBodyWithLimit<BatchRenderRequestBody>(
    request,
    BODY_LIMITS.BATCH_RENDER_REQUEST
  );

  if ('error' in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 413 });
  }

  const body = parsed.data;

  if (!body?.templateId || !Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json(
      { error: 'templateId and a non-empty items array are required' },
      { status: 400 }
    );
  }

  // Validate each item has a data object
  for (let i = 0; i < body.items.length; i++) {
    const item = body.items[i];
    if (!item.data || typeof item.data !== 'object' || Array.isArray(item.data)) {
      return NextResponse.json(
        { error: `items[${i}].data must be a non-null object` },
        { status: 400 }
      );
    }
  }

  const tier = await getTeamTier(teamId);

  try {
    const job = await createBatchJob({
      teamId,
      userId,
      apiKeyId: apiKeyId ?? undefined,
      templateId: body.templateId,
      items: body.items,
      tier,
    });

    return NextResponse.json(
      {
        jobId: job.id,
        status: job.status,
        total: job.total,
        statusUrl: `/api/v1/render/batch/${job.id}`,
      },
      { status: 202 }
    );
  } catch (error) {
    const batchError = error as Error & { status?: number; payload?: unknown };
    if (batchError.status && batchError.payload) {
      return NextResponse.json(batchError.payload, { status: batchError.status });
    }
    throw error;
  }
}

/**
 * GET /api/v1/render/batch?jobId=batch_abc123
 *
 * Alternative: poll batch job status via query param.
 */
export async function GET(request: Request) {
  const userId = getAuthenticatedUserId(request);
  const teamId = getAuthenticatedTeamId(request);

  if (!userId || !teamId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(request.url);
  const jobId = url.searchParams.get('jobId');

  if (!jobId) {
    return NextResponse.json({ error: 'jobId query parameter is required' }, { status: 400 });
  }

  const job = await getJob(jobId);

  if (!job || job.teamId !== teamId) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  return NextResponse.json({
    jobId: job.id,
    status: job.status,
    progress: job.progress,
    total: job.total,
    results: job.results,
    createdAt: job.createdAt,
    completedAt: job.completedAt,
    error: job.error,
  });
}
