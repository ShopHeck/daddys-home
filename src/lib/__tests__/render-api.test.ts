import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Integration-style tests for the render API route logic.
 *
 * These test the request validation, auth extraction, and error paths
 * that don't require a running database or Puppeteer instance.
 */

// Mock external dependencies
vi.mock('@/lib/prisma', () => ({
  prisma: {
    template: {
      findFirst: vi.fn(),
    },
    templateVersion: {
      findUnique: vi.fn(),
    },
    usageRecord: {
      update: vi.fn(),
    },
  },
}));

vi.mock('@/lib/teams', () => ({
  requireApiTeamAccess: vi.fn(),
}));

vi.mock('@/lib/usage', () => ({
  assertUsageWithinLimit: vi.fn(),
  recordUsage: vi.fn().mockResolvedValue({ id: 'record-1' }),
  getUsageSummary: vi.fn().mockResolvedValue({
    tier: 'FREE',
    used: 1,
    limit: 50,
    remaining: 49,
    periodStart: new Date('2026-05-01T00:00:00.000Z'),
    periodEnd: new Date('2026-05-31T23:59:59.999Z'),
  }),
}));

vi.mock('@/lib/renderer', () => ({
  renderPdfFromTemplate: vi.fn(),
}));

vi.mock('@/lib/render-cache', () => ({
  computeCacheKey: vi.fn().mockReturnValue('mock-cache-key'),
  getCachedRender: vi.fn().mockResolvedValue({ hit: false, pdf: null }),
  isCacheEnabled: vi.fn().mockReturnValue(false),
  setCachedRender: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/storage', () => ({
  uploadPdf: vi.fn().mockResolvedValue(null),
}));

vi.mock('@/lib/webhooks', () => ({
  dispatchWebhooks: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/usage-alerts', () => ({
  checkAndSendUsageAlerts: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('@/lib/logger', () => ({
  renderLogger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
}));

vi.mock('@sentry/nextjs', () => ({
  captureException: vi.fn(),
}));

import { POST } from '@/app/api/v1/render/route';
import { prisma } from '@/lib/prisma';
import { requireApiTeamAccess } from '@/lib/teams';
import { assertUsageWithinLimit, recordUsage } from '@/lib/usage';
import { renderPdfFromTemplate } from '@/lib/renderer';

function createRequest(body: unknown, headers?: Record<string, string>): Request {
  return new Request('http://localhost:3000/api/v1/render', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-user-id': 'user-1',
      'x-team-id': 'team-1',
      'x-api-key-id': 'key-1',
      ...headers,
    },
    body: JSON.stringify(body),
  });
}

describe('POST /api/v1/render', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(requireApiTeamAccess).mockResolvedValue({ id: 'member-1', role: 'OWNER' } as never);
    vi.mocked(assertUsageWithinLimit).mockResolvedValue({
      tier: 'FREE',
      limit: 50,
      used: 1,
      remaining: 49,
      periodStart: new Date('2026-05-01T00:00:00.000Z'),
      periodEnd: new Date('2026-05-31T23:59:59.999Z'),
    } as never);
  });

  describe('authentication', () => {
    it('returns 401 when x-user-id is missing', async () => {
      const req = new Request('http://localhost:3000/api/v1/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-team-id': 'team-1' },
        body: JSON.stringify({ templateId: 'tpl-1', data: {} }),
      });

      const response = await POST(req);
      expect(response.status).toBe(401);

      const json = await response.json();
      expect(json.error).toBe('Unauthorized');
    });

    it('returns 401 when x-team-id is missing', async () => {
      const req = new Request('http://localhost:3000/api/v1/render', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-user-id': 'user-1' },
        body: JSON.stringify({ templateId: 'tpl-1', data: {} }),
      });

      const response = await POST(req);
      expect(response.status).toBe(401);
    });

    it('returns 403 when user lacks team access', async () => {
      vi.mocked(requireApiTeamAccess).mockResolvedValue(null as never);

      const request = createRequest({ templateId: 'tpl-1', data: {} });
      const response = await POST(request);
      expect(response.status).toBe(403);

      const json = await response.json();
      expect(json.error).toContain('Forbidden');
    });
  });

  describe('request validation', () => {
    it('rejects missing templateId', async () => {
      const request = createRequest({ data: {} });
      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('rejects missing data field', async () => {
      const request = createRequest({ templateId: 'tpl-1' });
      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('rejects invalid options.format', async () => {
      const request = createRequest({
        templateId: 'tpl-1',
        data: {},
        options: { format: 'Tabloid' },
      });
      const response = await POST(request);
      expect(response.status).toBe(400);
    });
  });

  describe('usage limits', () => {
    it('returns 402 when usage limit exceeded', async () => {
      const limitError = new Error('Usage limit exceeded') as Error & { status: number; payload: unknown };
      limitError.status = 402;
      limitError.payload = { error: 'Monthly document limit reached', used: 50, limit: 50 };
      vi.mocked(assertUsageWithinLimit).mockRejectedValue(limitError);

      const request = createRequest({ templateId: 'tpl-1', data: {} });
      const response = await POST(request);
      expect(response.status).toBe(402);

      const json = await response.json();
      expect(json.error).toContain('limit');
    });
  });

  describe('template lookup', () => {
    it('returns 404 when template not found', async () => {
      vi.mocked(prisma.template.findFirst).mockResolvedValue(null);

      const request = createRequest({ templateId: 'nonexistent', data: {} });
      const response = await POST(request);
      expect(response.status).toBe(404);

      const json = await response.json();
      expect(json.error).toBe('Template not found');
    });
  });

  describe('successful render', () => {
    const mockTemplate = {
      id: 'tpl-1',
      content: '<h1>Hello {{name}}</h1>',
      css: null,
      currentVersion: 1,
      variableSchema: null,
    };

    beforeEach(() => {
      vi.mocked(prisma.template.findFirst).mockResolvedValue(mockTemplate as never);
      vi.mocked(prisma.templateVersion.findUnique).mockResolvedValue({ id: 'ver-1' } as never);
    });

    it('returns PDF buffer with correct headers', async () => {
      const mockPdf = Buffer.from('%PDF-1.4 fake content');
      vi.mocked(renderPdfFromTemplate).mockResolvedValue(mockPdf);

      const request = createRequest({ templateId: 'tpl-1', data: { name: 'World' } });
      const response = await POST(request);

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('application/pdf');
      expect(response.headers.get('Content-Disposition')).toContain('document.pdf');
      expect(response.headers.get('X-Cache')).toBe('MISS');
    });

    it('records usage on successful render', async () => {
      const mockPdf = Buffer.from('%PDF-1.4 fake content');
      vi.mocked(renderPdfFromTemplate).mockResolvedValue(mockPdf);

      const request = createRequest({ templateId: 'tpl-1', data: { name: 'World' } });
      await POST(request);

      expect(recordUsage).toHaveBeenCalledWith(
        expect.objectContaining({
          teamId: 'team-1',
          userId: 'user-1',
          templateId: 'tpl-1',
          status: 'SUCCESS',
          apiKeyId: 'key-1',
        })
      );
    });

    it('returns 500 when renderer throws', async () => {
      vi.mocked(renderPdfFromTemplate).mockRejectedValue(new Error('Chromium crashed'));

      const request = createRequest({ templateId: 'tpl-1', data: {} });
      const response = await POST(request);

      expect(response.status).toBe(500);
      const json = await response.json();
      expect(json.error).toBe('Render failed');
    });

    it('records FAILED usage when renderer throws', async () => {
      vi.mocked(renderPdfFromTemplate).mockRejectedValue(new Error('Chromium crashed'));

      const request = createRequest({ templateId: 'tpl-1', data: {} });
      await POST(request);

      expect(recordUsage).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'FAILED',
          errorMessage: 'Chromium crashed',
        })
      );
    });

    it('returns 400 for template parse errors', async () => {
      vi.mocked(renderPdfFromTemplate).mockRejectedValue(new Error('Parse error: Expecting expression'));

      const request = createRequest({ templateId: 'tpl-1', data: {} });
      const response = await POST(request);

      expect(response.status).toBe(400);
      const json = await response.json();
      expect(json.error).toBe('Invalid template data');
    });
  });
});
