import { NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

import { getAuthenticatedApiKeyId, getAuthenticatedTeamId, getAuthenticatedUserId } from '@/lib/api-key';
import { BODY_LIMITS, parseJsonBodyWithLimit } from '@/lib/body-limit';
import { prisma } from '@/lib/prisma';
import { computeCacheKey, getCachedRender, isCacheEnabled, setCachedRender } from '@/lib/render-cache';
import { renderPdfFromTemplate } from '@/lib/renderer';
import { validateDataAgainstSchema, type VariableSchema } from '@/lib/template-variables';
import { checkAndSendUsageAlerts } from '@/lib/usage-alerts';
import { requireApiTeamAccess } from '@/lib/teams';
import { assertUsageWithinLimit, getUsageSummary, recordUsage } from '@/lib/usage';
import { dispatchWebhooks } from '@/lib/webhooks';
import { uploadPdf } from '@/lib/storage';
import type { RenderRequestBody } from '@/types';

export const runtime = 'nodejs';

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

  const parsed = await parseJsonBodyWithLimit<RenderRequestBody>(request, BODY_LIMITS.RENDER_REQUEST);

  if ('error' in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 413 });
  }

  const body = parsed.data;

  if (!body?.templateId || !body.data || typeof body.data !== 'object' || Array.isArray(body.data)) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  try {
    await assertUsageWithinLimit(teamId);
  } catch (error) {
    const usageError = error as Error & { status?: number; payload?: unknown };

    if (usageError.status === 402 && usageError.payload) {
      return NextResponse.json(usageError.payload, { status: 402 });
    }

    throw error;
  }

  const template = await prisma.template.findFirst({
    where: {
      id: body.templateId,
      teamId
    },
    select: {
      id: true,
      content: true,
      css: true,
      currentVersion: true,
      variableSchema: true
    }
  });

  if (!template) {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 });
  }

  let validationWarnings: Array<{ path: string; message: string; severity: 'warning' }> = [];

  if (body.validateSchema && template.variableSchema) {
    validationWarnings = validateDataAgainstSchema(body.data, template.variableSchema as VariableSchema);
  }

  const currentVersion = await prisma.templateVersion.findUnique({
    where: {
      templateId_version: {
        templateId: template.id,
        version: template.currentVersion
      }
    },
    select: { id: true }
  });

  // --- Render Cache: check for a cached PDF ---
  const cacheHash = computeCacheKey({
    templateId: template.id,
    templateVersion: template.currentVersion,
    data: body.data,
    options: body.options,
    css: template.css ?? undefined,
  });

  if (isCacheEnabled() && !body.validateSchema) {
    try {
      const cached = await getCachedRender({ teamId, cacheHash });

      if (cached.hit) {
        // Still record usage (for billing) even on cache hit
        await recordUsage({
          teamId,
          userId,
          templateId: template.id,
          templateVersionId: currentVersion?.id,
          status: 'SUCCESS',
          durationMs: 0,
          fileSizeBytes: cached.pdf.length,
          apiKeyId: apiKeyId ?? undefined
        });

        const headers: HeadersInit = {
          'Content-Type': 'application/pdf',
          'Content-Disposition': 'attachment; filename="document.pdf"',
          'X-Cache': 'HIT',
        };

        return new NextResponse(new Uint8Array(cached.pdf), { status: 200, headers });
      }
    } catch (err) {
      // Cache lookup failure is non-fatal — fall through to render
      console.error('Render cache lookup failed:', err);
    }
  }

  const startTime = performance.now();

  try {
    const pdf = await renderPdfFromTemplate({
      template: template.content,
      data: body.data,
      options: body.options,
      css: template.css ?? undefined
    });
    const durationMs = Math.round(performance.now() - startTime);

    const record = await recordUsage({
      teamId,
      userId,
      templateId: template.id,
      templateVersionId: currentVersion?.id,
      status: 'SUCCESS',
      durationMs,
      fileSizeBytes: pdf.length,
      apiKeyId: apiKeyId ?? undefined
    });

    // Upload PDF to storage and populate render cache in the background
    void (async () => {
      try {
        const storageKey = await uploadPdf({
          teamId,
          recordId: record.id,
          buffer: pdf,
        });
        if (storageKey) {
          await prisma.usageRecord.update({
            where: { id: record.id },
            data: { storageKey },
          });
        }
      } catch (err) {
        console.error('PDF storage upload failed:', err);
      }

      // Store in render cache
      try {
        const usageSummary = await getUsageSummary(teamId);
        await setCachedRender({
          teamId,
          cacheHash,
          pdf,
          tier: usageSummary.tier,
        });
      } catch (err) {
        console.error('Render cache write failed:', err);
      }
    })();

    void dispatchWebhooks({
      teamId,
      event: 'render.completed',
      data: {
        templateId: template.id,
        durationMs,
        fileSizeBytes: pdf.length,
        templateVersion: template.currentVersion
      }
    });

    void (async () => {
      try {
        const summary = await getUsageSummary(teamId);

        await checkAndSendUsageAlerts({
          teamId,
          used: summary.used,
          limit: summary.limit,
          tier: summary.tier
        });
      } catch (error) {
        console.error('Usage alert check failed:', error);
      }
    })();

    const headers: HeadersInit = {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="document.pdf"',
      'X-Cache': 'MISS',
    };

    if (validationWarnings.length > 0) {
      headers['X-Schema-Warnings'] = JSON.stringify(validationWarnings);
    }

    return new NextResponse(new Uint8Array(pdf), {
      status: 200,
      headers
    });
  } catch (error) {
    const durationMs = Math.round(performance.now() - startTime);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    Sentry.captureException(
      new Error(`Render failed: ${error instanceof Error ? error.constructor.name : 'UnknownError'}`),
      { extra: { templateId: template.id, teamId, userId } }
    );

    await recordUsage({
      teamId,
      userId,
      templateId: template.id,
      templateVersionId: currentVersion?.id,
      status: 'FAILED',
      durationMs,
      errorMessage,
      apiKeyId: apiKeyId ?? undefined
    });

    void dispatchWebhooks({
      teamId,
      event: 'render.failed',
      data: {
        templateId: template.id,
        durationMs,
        errorMessage
      }
    });

    if (error instanceof Error && /(Parse error|Expecting|got)/i.test(error.message)) {
      return NextResponse.json({ error: 'Invalid template data' }, { status: 400 });
    }

    return NextResponse.json({ error: 'Render failed' }, { status: 500 });
  }
}
