import { z } from 'zod';

export const createTemplateSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200).trim(),
  description: z.string().max(2000).trim().optional(),
  content: z.string().min(1, 'Content is required').max(1_000_000, 'Template content too large (max 1MB)'),
  css: z.string().max(500_000, 'CSS too large (max 500KB)').trim().optional(),
});

export const updateTemplateSchema = z.object({
  name: z.string().min(1).max(200).trim().optional(),
  description: z.string().max(2000).trim().nullable().optional(),
  content: z.string().min(1).max(1_000_000).optional(),
  css: z.string().max(500_000).trim().nullable().optional(),
  variableSchema: z.unknown().optional(),
});

export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
export type UpdateTemplateInput = z.infer<typeof updateTemplateSchema>;
