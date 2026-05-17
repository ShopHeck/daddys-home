/**
 * Centralized Zod schemas for API request validation.
 *
 * Usage:
 *   import { renderRequestSchema } from '@/lib/schemas';
 *   const result = renderRequestSchema.safeParse(body);
 *   if (!result.success) return NextResponse.json({ error: result.error.issues }, { status: 400 });
 */

export * from './render';
export * from './templates';
export * from './webhooks';
export * from './marketplace';
export * from './auth';

import { z } from 'zod';
import { NextResponse } from 'next/server';

/**
 * Helper: validate a request body against a Zod schema.
 * Returns a typed result or a 400 NextResponse with structured errors.
 */
export function validateBody<T extends z.ZodType>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; response: NextResponse } {
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    }));

    return {
      success: false,
      response: NextResponse.json({ error: 'Validation failed', details: errors }, { status: 400 }),
    };
  }

  return { success: true, data: result.data };
}
