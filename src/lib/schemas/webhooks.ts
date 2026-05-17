import { z } from 'zod';

const WEBHOOK_EVENTS = [
  'render.completed',
  'render.failed',
  'template.created',
  'template.updated',
  'template.deleted',
] as const;

export const createWebhookSchema = z.object({
  url: z.string().url('A valid URL is required').max(2048),
  events: z.array(z.enum(WEBHOOK_EVENTS)).min(1, 'At least one event is required'),
});

export const updateWebhookSchema = z.object({
  url: z.string().url('A valid URL is required').max(2048).optional(),
  events: z.array(z.enum(WEBHOOK_EVENTS)).min(1).optional(),
  active: z.boolean().optional(),
});

export type CreateWebhookInput = z.infer<typeof createWebhookSchema>;
export type UpdateWebhookInput = z.infer<typeof updateWebhookSchema>;
