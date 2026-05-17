import { z } from 'zod';

const MARKETPLACE_CATEGORIES = [
  'invoice',
  'contract',
  'report',
  'certificate',
  'letter',
  'proposal',
  'receipt',
  'statement',
  'other',
] as const;

export const publishTemplateSchema = z.object({
  templateId: z.string().min(1, 'templateId is required').max(100),
  category: z.enum(MARKETPLACE_CATEGORIES),
  tags: z.array(z.string().max(50)).max(10).default([]),
});

export const forkTemplateSchema = z.object({
  name: z.string().min(1).max(200).trim().optional(),
});

export type PublishTemplateInput = z.infer<typeof publishTemplateSchema>;
export type ForkTemplateInput = z.infer<typeof forkTemplateSchema>;
