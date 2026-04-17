import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { checkApiKeyRateLimit, checkIpRateLimit, type RateLimitResult } from '@/lib/rate-limit';
import type { Tier } from '@/types';

type ValidationPayload = {
  userId?: string;
  teamId?: string;
  tier?: Tier;
  apiKeyId?: string;
  error?: string;
};

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');

  if (forwardedFor) {
    // When the app is behind a trusted reverse proxy (e.g. Nginx, Cloudflare),
    // the proxy appends the real client IP so we take the LAST entry to avoid
    // IP-spoofing via a client-controlled x-forwarded-for header.
    const parts = forwardedFor.split(',');
    const clientIp = parts[parts.length - 1]?.trim();

    if (clientIp) {
      return clientIp;
    }
  }

  return (request as NextRequest & { ip?: string | null }).ip ?? 'unknown';
}

function setRateLimitHeaders(response: NextResponse, result: RateLimitResult, retryAfter?: number) {
  response.headers.set('X-RateLimit-Limit', String(result.limit));
  response.headers.set('X-RateLimit-Remaining', String(result.remaining));
  response.headers.set('X-RateLimit-Reset', String(result.resetAt));

  if (typeof retryAfter === 'number') {
    response.headers.set('Retry-After', String(retryAfter));
  }
}

function createRateLimitResponse(result: RateLimitResult) {
  const retryAfter = Math.max(Math.ceil(result.resetAt - Date.now() / 1000), 1);
  const response = NextResponse.json(
    {
      error: 'Rate limit exceeded',
      retryAfter
    },
    { status: 429 }
  );

  setRateLimitHeaders(response, { ...result, remaining: 0 }, retryAfter);

  return response;
}

export async function middleware(request: NextRequest) {
  const ipRateLimit = await checkIpRateLimit(getClientIp(request));

  if (!ipRateLimit.allowed) {
    return createRateLimitResponse(ipRateLimit);
  }

  const apiKey = request.headers.get('x-api-key');

  if (!apiKey) {
    const response = NextResponse.json({ error: 'API key required' }, { status: 401 });

    setRateLimitHeaders(response, ipRateLimit);

    return response;
  }

  const secret = process.env.NEXTAUTH_SECRET;

  if (!secret) {
    const response = NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });

    setRateLimitHeaders(response, ipRateLimit);

    return response;
  }

  const validationResponse = await fetch(new URL('/api/internal/validate-key', request.url), {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'x-internal-auth': secret
    },
    cache: 'no-store'
  });

  const payload = await validationResponse.json().catch(() => null) as ValidationPayload | null;

  if (!validationResponse.ok || !payload?.userId || !payload.teamId || !payload.tier || !payload.apiKeyId) {
    const response = NextResponse.json(
      { error: payload?.error ?? 'Invalid API key' },
      { status: validationResponse.status || 401 }
    );

    setRateLimitHeaders(response, ipRateLimit);

    return response;
  }

  const apiKeyRateLimit = await checkApiKeyRateLimit(payload.apiKeyId, payload.tier);

  if (!apiKeyRateLimit.allowed) {
    return createRateLimitResponse(apiKeyRateLimit);
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', payload.userId);
  requestHeaders.set('x-team-id', payload.teamId);
  requestHeaders.set('x-api-key-id', payload.apiKeyId);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders
    }
  });

  setRateLimitHeaders(response, apiKeyRateLimit);

  return response;
}

export const config = {
  matcher: ['/api/v1/:path*']
};
