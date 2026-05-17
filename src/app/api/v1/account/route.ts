import { NextResponse } from 'next/server';

import { getAuthenticatedTeamId, getAuthenticatedUserId } from '@/lib/api-key';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { requireApiTeamAccess } from '@/lib/teams';

export const runtime = 'nodejs';

/**
 * DELETE /api/v1/account
 *
 * GDPR Article 17 — Right to erasure ("right to be forgotten").
 * Permanently deletes the user account and all associated data.
 *
 * Due to cascading deletes in the Prisma schema, this removes:
 * - User profile
 * - All API keys
 * - All templates and template versions
 * - All usage records
 * - All webhook endpoints and deliveries
 * - All team memberships (user is removed from teams)
 * - Password reset tokens
 * - Sessions and accounts
 *
 * Note: If the user is the sole OWNER of a team, the team is NOT deleted
 * automatically — they must transfer ownership or delete the team first.
 */
export async function DELETE(request: Request) {
  const userId = getAuthenticatedUserId(request);
  const teamId = getAuthenticatedTeamId(request);

  if (!userId || !teamId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const hasAccess = await requireApiTeamAccess(teamId, userId, ['OWNER', 'ADMIN', 'MEMBER']);
  if (!hasAccess) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Check if user is sole owner of any non-personal teams
  const ownedTeams = await prisma.teamMember.findMany({
    where: {
      userId,
      role: 'OWNER',
      team: { personal: false },
    },
    select: {
      teamId: true,
      team: {
        select: {
          name: true,
          members: {
            where: { role: 'OWNER' },
            select: { userId: true },
          },
        },
      },
    },
  });

  const soleOwnerTeams = ownedTeams.filter((t) => t.team.members.length === 1 && t.team.members[0].userId === userId);

  if (soleOwnerTeams.length > 0) {
    return NextResponse.json(
      {
        error: 'Cannot delete account while sole owner of teams',
        teams: soleOwnerTeams.map((t) => ({ id: t.teamId, name: t.team.name })),
        message: 'Transfer ownership or delete these teams before deleting your account.',
      },
      { status: 409 }
    );
  }

  // Perform deletion
  logger.info({ userId }, 'Account deletion requested (GDPR erasure)');

  await prisma.user.delete({
    where: { id: userId },
  });

  logger.info({ userId }, 'Account deleted successfully');

  return NextResponse.json({
    deleted: true,
    message: 'Your account and all associated data have been permanently deleted.',
  });
}
