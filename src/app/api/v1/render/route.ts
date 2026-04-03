import { NextResponse } from 'next/server';

import { getAuthenticatedApiKeyId, getAuthenticatedTeamId, getAuthenticatedUserId } from '@/lib/api-key';
import { prisma } from '@/lib/prisma';
import { renderPdfFromTemplate } from '@/lib/renderer';
import { validateDataAgainstSchema, type VariableSchema } from '@/lib/template-variables';
import { checkAndSendUsageAlerts } from '@/lib/usage-alerts';
import { assertUsageWithinLimit, getUsageSummary, recordUsage } from '@/lib/usage';
import { dispatchWebhooks } from '@/lib/webhooks';
import type { RenderRequestBody } from '@/types';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const userId = getAuthenticatedUserId(request);
  const teamId = getAuthenticatedTeamId(request);
  const apiKeyId = getAuthenticatedApiKeyId(request);

  if (!userId || !teamId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as RenderRequestBody | null;

  if (!body?.templateId || !body.data || typeof body.data !== 'object' || Array.isArray(body.data)) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  try {
    await assertUsageWithinLimit(userId);
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

  const startTime = performance.now();

  try {
    const pdf = await renderPdfFromTemplate({
      template: template.content,
      data: body.data,
      options: body.options
    });
    const durationMs = Math.round(performance.now() - startTime);

    await recordUsage({
      userId,
      templateId: template.id,
      templateVersionId: currentVersion?.id,
      status: 'SUCCESS',
      durationMs,
      fileSizeBytes: pdf.length,
      apiKeyId: apiKeyId ?? undefined
    });

    void dispatchWebhooks({
      userId,
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
        const [summary, user] = await Promise.all([
          getUsageSummary(userId),
          prisma.user.findUnique({
            where: { id: userId },
            select: { email: true, name: true }
          })
        ]);

        if (!user) {
          return;
        }

        await checkAndSendUsageAlerts({
          userId,
          used: summary.used,
          limit: summary.limit,
          tier: summary.tier,
          userEmail: user.email,
          userName: user.name
        });
      } catch (error) {
        console.error('Usage alert check failed:', error);
      }
    })();

    const headers: HeadersInit = {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="document.pdf"'
    };

    if (validationWarnings.length > 0) {
      headers['X-Schema-Warnings'] = JSON.stringify(validationWarnings);
    }

    return new NextResponse(pdf, {
      status: 200,
      headers
    });
  } catch (error) {
    const durationMs = Math.round(performance.now() - startTime);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    await recordUsage({
      userId,
      templateId: template.id,
      templateVersionId: currentVersion?.id,
      status: 'FAILED',
      durationMs,
      errorMessage,
      apiKeyId: apiKeyId ?? undefined
    });

    void dispatchWebhooks({
      userId,
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
