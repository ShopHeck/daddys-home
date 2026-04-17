import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';

import { WebhooksClient } from '@/components/dashboard/WebhooksClient';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function WebhooksPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { tier: true },
  });

  return <WebhooksClient tier={user?.tier ?? 'FREE'} />;
}
