import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const apiKey = request.headers.get('x-api-key');

  if (!apiKey) {
    return NextResponse.json({ error: 'API key required' }, { status: 401 });
  }

  const secret = process.env.NEXTAUTH_SECRET;

  if (!secret) {
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
  }

  const validationResponse = await fetch(new URL('/api/internal/validate-key', request.url), {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'x-internal-auth': secret
    },
    cache: 'no-store'
  });

  const payload = await validationResponse.json().catch(() => null) as { userId?: string; error?: string } | null;

  if (!validationResponse.ok || !payload?.userId) {
    return NextResponse.json({ error: payload?.error ?? 'Invalid API key' }, { status: validationResponse.status || 401 });
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', payload.userId);

  return NextResponse.next({
    request: {
      headers: requestHeaders
    }
  });
}

export const config = {
  matcher: ['/api/v1/:path*']
};
