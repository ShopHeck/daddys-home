import { describe, it, expect } from 'vitest';
import { BODY_LIMITS, parseJsonBodyWithLimit, readBodyWithLimit } from '@/lib/body-limit';

function createRequest(body: string, contentLength?: number): Request {
  const headers = new Headers({ 'content-type': 'application/json' });
  if (contentLength !== undefined) {
    headers.set('content-length', String(contentLength));
  }
  return new Request('http://localhost/test', {
    method: 'POST',
    headers,
    body,
  });
}

describe('BODY_LIMITS', () => {
  it('defines expected limits', () => {
    expect(BODY_LIMITS.TEMPLATE_CONTENT).toBe(1 * 1024 * 1024);
    expect(BODY_LIMITS.RENDER_REQUEST).toBe(5 * 1024 * 1024);
    expect(BODY_LIMITS.DEFAULT_JSON).toBe(256 * 1024);
    expect(BODY_LIMITS.BATCH_RENDER_REQUEST).toBe(10 * 1024 * 1024);
  });
});

describe('readBodyWithLimit', () => {
  it('reads body within limit', async () => {
    const request = createRequest('hello world');
    const result = await readBodyWithLimit(request, 100);
    expect(result).toEqual({ text: 'hello world' });
  });

  it('rejects body exceeding limit via Content-Length header', async () => {
    const request = createRequest('x', 1000);
    const result = await readBodyWithLimit(request, 100);
    expect('error' in result).toBe(true);
    if ('error' in result) {
      expect(result.error).toContain('too large');
    }
  });

  it('rejects body exceeding limit via streaming', async () => {
    const largeBody = 'x'.repeat(200);
    const request = createRequest(largeBody);
    const result = await readBodyWithLimit(request, 100);
    expect('error' in result).toBe(true);
  });
});

describe('parseJsonBodyWithLimit', () => {
  it('parses valid JSON within limit', async () => {
    const body = JSON.stringify({ name: 'test', value: 42 });
    const request = createRequest(body);
    const result = await parseJsonBodyWithLimit(request, 1024);
    expect(result).toEqual({ data: { name: 'test', value: 42 } });
  });

  it('returns error for invalid JSON', async () => {
    const request = createRequest('not json');
    const result = await parseJsonBodyWithLimit(request, 1024);
    expect('error' in result).toBe(true);
    if ('error' in result) {
      expect(result.error).toContain('Invalid JSON');
    }
  });

  it('returns error when body exceeds limit', async () => {
    const body = JSON.stringify({ data: 'x'.repeat(200) });
    const request = createRequest(body);
    const result = await parseJsonBodyWithLimit(request, 50);
    expect('error' in result).toBe(true);
    if ('error' in result) {
      expect(result.error).toContain('too large');
    }
  });
});
