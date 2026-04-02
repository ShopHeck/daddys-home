import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const existing = await prisma.apiKey.findFirst({
    where: {
      id: params.id,
      userId: session.user.id
    },
    select: { id: true }
  });

  if (!existing) {
    return NextResponse.json({ error: 'API key not found.' }, { status: 404 });
  }

  await prisma.apiKey.delete({ where: { id: existing.id } });

  return NextResponse.json({ success: true });
}
