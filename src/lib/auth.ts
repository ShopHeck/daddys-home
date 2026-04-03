import { PrismaAdapter } from '@next-auth/prisma-adapter';
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GitHubProvider from 'next-auth/providers/github';

import { prisma } from '@/lib/prisma';
import type { Tier } from '@/types';

const providers: NextAuthOptions['providers'] = [
  CredentialsProvider({
    name: 'Credentials',
    credentials: {
      email: { label: 'Email', type: 'email' },
      password: { label: 'Password', type: 'password' }
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials.password) {
        return null;
      }

      const user = await prisma.user.findUnique({
        where: { email: credentials.email }
      });

      if (!user?.password) {
        return null;
      }

      const { compare } = await import('bcryptjs');
      const isValid = await compare(credentials.password, user.password);

      if (!isValid) {
        return null;
      }

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        tier: user.tier
      };
    }
  })
];

if (process.env.GITHUB_ID && process.env.GITHUB_SECRET) {
  providers.unshift(
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET
    })
  );
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt'
  },
  providers,
  pages: {
    signIn: '/auth/login'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.tier = user.tier;

        // Load activeTeamId for new sign-ins
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { activeTeamId: true }
        });
        token.activeTeamId = dbUser?.activeTeamId ?? undefined;

        return token;
      }

      const userId = (token.id as string | undefined) ?? token.sub;

      if (!userId) {
        return token;
      }

      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { tier: true, activeTeamId: true }
      });

      if (existingUser) {
        token.tier = existingUser.tier;
        token.activeTeamId = existingUser.activeTeamId ?? undefined;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.id as string | undefined) ?? token.sub ?? '';
        session.user.tier = (token.tier as Tier | undefined) ?? 'FREE';
        session.user.activeTeamId = token.activeTeamId as string | undefined;
      }

      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET
};
