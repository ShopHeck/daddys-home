import { cache } from 'react';

import { prisma } from '@/lib/prisma';

export const getUserTeams = cache(async (userId: string) => {
  return prisma.teamMember.findMany({
    where: { userId },
    include: { team: { select: { id: true, name: true, personal: true } } },
    orderBy: { createdAt: 'asc' },
  });
});

export const getTeamTemplates = cache(async (teamId: string) => {
  return prisma.template.findMany({
    where: { teamId },
    select: {
      id: true,
      name: true,
      description: true,
      currentVersion: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { updatedAt: 'desc' },
  });
});
