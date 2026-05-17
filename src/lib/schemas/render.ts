import { z } from 'zod';

export const renderOptionsSchema = z
  .object({
    format: z.enum(['A4', 'Letter']).optional(),
    landscape: z.boolean().optional(),
    margin: z
      .object({
        top: z.string().max(20).optional(),
        bottom: z.string().max(20).optional(),
        left: z.string().max(20).optional(),
        right: z.string().max(20).optional(),
      })
      .optional(),
  })
  .optional();

export const renderRequestSchema = z.object({
  templateId: z.string().min(1, 'templateId is required').max(100),
  data: z.record(z.string(), z.unknown()),
  options: renderOptionsSchema,
  validateSchema: z.boolean().optional(),
});

export const batchRenderItemSchema = z.object({
  data: z.record(z.string(), z.unknown()),
  options: renderOptionsSchema,
});

export const batchRenderRequestSchema = z.object({
  templateId: z.string().min(1, 'templateId is required').max(100),
  items: z.array(batchRenderItemSchema).min(1, 'At least one item is required').max(500),
  validateSchema: z.boolean().optional(),
});

export type RenderRequest = z.infer<typeof renderRequestSchema>;
export type BatchRenderRequest = z.infer<typeof batchRenderRequestSchema>;
