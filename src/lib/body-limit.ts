/**
 * Request body size validation utilities.
 *
 * Next.js App Router does not enforce body size limits by default.
 * These helpers protect against OOM/DoS attacks by rejecting oversized payloads
 * before they are parsed.
 */

/** Default limits in bytes */
export const BODY_LIMITS = {
  /** Max template content size (1 MB) */
  TEMPLATE_CONTENT: 1 * 1024 * 1024,
  /** Max render request body (5 MB — includes large JSON data payloads) */
  RENDER_REQUEST: 5 * 1024 * 1024,
  /** Max generic JSON body for non-render endpoints (256 KB) */
  DEFAULT_JSON: 256 * 1024,
  /** Max batch render request body (10 MB) */
  BATCH_RENDER_REQUEST: 10 * 1024 * 1024,
} as const;

/**
 * Reads the request body with a size limit. Returns the raw text if within
 * limits, or null if the body exceeds the maximum allowed size.
 */
export async function readBodyWithLimit(
  request: Request,
  maxBytes: number
): Promise<{ text: string } | { error: string }> {
  // Check Content-Length header first for an early reject
  const contentLength = request.headers.get('content-length');
  if (contentLength && parseInt(contentLength, 10) > maxBytes) {
    return { error: `Request body too large. Maximum size is ${formatBytes(maxBytes)}.` };
  }

  // Stream the body and enforce the limit
  const reader = request.body?.getReader();
  if (!reader) {
    return { text: '' };
  }

  const chunks: Uint8Array[] = [];
  let totalSize = 0;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      totalSize += value.byteLength;
      if (totalSize > maxBytes) {
        reader.cancel();
        return { error: `Request body too large. Maximum size is ${formatBytes(maxBytes)}.` };
      }

      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }

  const decoder = new TextDecoder();
  return { text: chunks.map((c) => decoder.decode(c, { stream: true })).join('') + decoder.decode() };
}

/**
 * Convenience: reads and parses JSON body with size limit.
 */
export async function parseJsonBodyWithLimit<T = unknown>(
  request: Request,
  maxBytes: number
): Promise<{ data: T } | { error: string }> {
  const result = await readBodyWithLimit(request, maxBytes);

  if ('error' in result) {
    return result;
  }

  try {
    const data = JSON.parse(result.text) as T;
    return { data };
  } catch {
    return { error: 'Invalid JSON in request body.' };
  }
}

function formatBytes(bytes: number): string {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(0)} MB`;
  }
  return `${(bytes / 1024).toFixed(0)} KB`;
}
