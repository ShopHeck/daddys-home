import { NextResponse } from 'next/server';

import { getAuthenticatedTeamId, getAuthenticatedUserId } from '@/lib/api-key';
import { getJob } from '@/lib/batch-queue';
import { getDownloadUrl } from '@/lib/storage';

export const runtime = 'nodejs';

/**
 * GET /api/v1/render/batch/:jobId
 *
 * Poll the status of a batch render job.
 * When completed, each successful result includes a download URL.
 */
export async function GET(
  request: Request,
  { params }: { params: { jobId: string } }
) {
  const userId = getAuthenticatedUserId(request);
  const teamId = getAuthenticatedTeamId(request);

  if (!userId || !teamId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const job = await getJob(params.jobId);

  if (!job || job.teamId !== teamId) {
    return NextResponse.json({ error: 'Job not found' }, { status: 404 });
  }

  // If job is completed, resolve download URLs for successful results
  let results = job.results;
  if (job.status === 'completed' || job.status === 'failed') {
    results = await Promise.all(
      job.results.map(async (result) => {
        if (result.status === 'SUCCESS' && result.storageKey) {
          const downloadUrl = await getDownloadUrl(result.storageKey);
          return { ...result, downloadUrl };
        }
        return result;
      })
    );
  }

  return NextResponse.json({
    jobId: job.id,
    status: job.status,
    progress: job.progress,
    total: job.total,
    results,
    createdAt: job.createdAt,
    completedAt: job.completedAt,
    error: job.error,
  });
}
