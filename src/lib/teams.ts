import { prisma } from '@/lib/prisma';
import type { Tier } from '@/types';
import type { TeamMember, TeamRole } from '@prisma/client';

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

export type TeamMemberWithRole = Pick<TeamMember, 'id' | 'role' | 'userId' | 'teamId'>;

/**
 * Verify user is a member of the team with one of the required roles.
 * Returns the membership if authorized, null otherwise.
 *
 * Usage in dashboard routes:
 *   const member = await requireTeamAccess(teamId, session.user.id, ['ADMIN', 'OWNER']);
 *   if (!member) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
 */
export async function requireTeamAccess(
  teamId: string,
  userId: string,
  roles: TeamRole[]
): Promise<TeamMemberWithRole | null> {
  const member = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId } },
    select: { id: true, role: true, userId: true, teamId: true }
  });
  if (!member || !roles.includes(member.role)) {
    return null;
  }
  return member;
}

/**
 * For v1 API routes: verify the API key user is a member of the API key's team
 * with the required role. The userId comes from x-user-id, teamId from x-team-id.
 */
export async function requireApiTeamAccess(
  teamId: string,
  userId: string,
  roles: TeamRole[]
): Promise<boolean> {
  const member = await prisma.teamMember.findUnique({
    where: { teamId_userId: { teamId, userId } },
    select: { role: true }
  });
  return !!member && roles.includes(member.role);
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

export async function getTeamTier(teamId: string): Promise<Tier> {
  const owner = await prisma.teamMember.findFirst({
    where: { teamId, role: 'OWNER' },
    include: { user: { select: { tier: true } } }
  });
  return (owner?.user.tier as Tier) ?? 'FREE';
}
