import { PrismaAdapter } from '@next-auth/prisma-adapter';
import { compare } from 'bcryptjs';
import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GitHubProvider from 'next-auth/providers/github';

import { prisma } from '@/lib/prisma';

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
    strategy: 'database'
  },
  providers,
  pages: {
    signIn: '/'
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        session.user.tier = user.tier;
      }

      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET
};
