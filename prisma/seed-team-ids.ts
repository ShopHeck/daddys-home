import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Build a map: userId -> teamId (activeTeamId or personal team fallback)
  const users = await prisma.user.findMany({
    select: {
      id: true,
      activeTeamId: true,
    }
  });

  const userTeamMap = new Map<string, string>();

  for (const user of users) {
    if (user.activeTeamId) {
      userTeamMap.set(user.id, user.activeTeamId);
    } else {
      // Fallback: find personal team
      const personalMembership = await prisma.teamMember.findFirst({
        where: { userId: user.id, team: { personal: true } },
        select: { teamId: true }
      });
      if (personalMembership) {
        userTeamMap.set(user.id, personalMembership.teamId);
      }
    }
  }

  // Backfill each table
  const tables = ['template', 'apiKey', 'webhookEndpoint', 'usageRecord', 'usageAlert'] as const;

  for (const table of tables) {
    const records = await (prisma[table] as any).findMany({
      where: { teamId: null },
      select: { id: true, userId: true }
    });

    let updated = 0;
    for (const record of records) {
      const teamId = userTeamMap.get(record.userId);
      if (teamId) {
        await (prisma[table] as any).update({
          where: { id: record.id },
          data: { teamId }
        });
        updated++;
      }
    }
    console.log(`${table}: backfilled ${updated}/${records.length} records`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
