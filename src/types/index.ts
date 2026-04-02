import type { DefaultSession } from 'next-auth';

export type Tier = 'FREE' | 'PRO' | 'BUSINESS';
export type RenderStatus = 'SUCCESS' | 'FAILED';

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

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      tier: Tier;
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
  }
}
