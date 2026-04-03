import type { DefaultSession } from 'next-auth';

export type Tier = 'FREE' | 'PRO' | 'BUSINESS';
export type RenderStatus = 'SUCCESS' | 'FAILED';
export type WebhookEvent =
  | 'render.completed'
  | 'render.failed'
  | 'template.created'
  | 'template.updated'
  | 'template.deleted';

export type RenderOptions = {
  format?: 'A4' | 'Letter';
  landscape?: boolean;
  margin?: {
    top?: string;
    bottom?: string;
    left?: string;
    right?: string;
  };
};

export type RenderRequestBody = {
  templateId: string;
  data: Record<string, unknown>;
  options?: RenderOptions;
  validateSchema?: boolean;
};

export type BatchRenderItem = {
  data: Record<string, unknown>;
  options?: RenderOptions;
};

export type BatchRenderRequestBody = {
  templateId: string;
  items: BatchRenderItem[];
  validateSchema?: boolean;
};

export type BatchRenderResultItem = {
  index: number;
  status: 'SUCCESS' | 'FAILED';
  pdf?: string;
  error?: string;
  durationMs: number;
  fileSizeBytes?: number;
  schemaWarnings?: Array<{ path: string; message: string; severity: 'warning' }>;
};

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      tier: Tier;
      activeTeamId?: string;
    } & DefaultSession['user'];
  }

  interface User {
    tier: Tier;
    password?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string;
    tier?: Tier;
    activeTeamId?: string;
  }
}
