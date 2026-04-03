import { prisma } from '@/lib/prisma';
import type { TeamRole } from '@prisma/client';

export async function getTeamMembership(teamId: string, userId: string) {
  return prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId } }
  });
}

export async function requireTeamRole(teamId: string, userId: string, roles: TeamRole[]) {
  const member = await getTeamMembership(teamId, userId);
  if (!member || !roles.includes(member.role)) {
    return null;
  }
  return member;
}

export async function getUserTeams(userId: string) {
  const memberships = await prisma.teamMember.findMany({
    where: { userId },
    include: { team: { select: { id: true, name: true, personal: true } } }
  });
  return memberships.map((m) => ({
    id: m.team.id,
    name: m.team.name,
    personal: m.team.personal,
    role: m.role
  }));
}

export async function ensurePersonalTeam(userId: string, userName: string) {
  const existing = await prisma.teamMember.findFirst({
    where: { userId, team: { personal: true } }
  });
  if (existing) return existing.teamId;

  const team = await prisma.team.create({
    data: {
      name: `${userName}'s Workspace`,
      personal: true,
      members: { create: { userId, role: 'OWNER' } }
    }
  });
  await prisma.user.update({
    where: { id: userId },
    data: { activeTeamId: team.id }
  });
  return team.id;
}
