import { prisma } from '../src/lib/prisma';

async function seedTeams() {
  // Find all users without any TeamMember record
  const usersWithoutTeams = await prisma.user.findMany({
    where: {
      teamMembers: {
        none: {}
      }
    },
    select: {
      id: true,
      name: true
    }
  });

  console.log(`Found ${usersWithoutTeams.length} users without teams`);

  for (const user of usersWithoutTeams) {
    // Create personal team
    const team = await prisma.team.create({
      data: {
        name: `${user.name || 'My'}'s Workspace`,
        personal: true,
        members: {
          create: {
            userId: user.id,
            role: 'OWNER'
          }
        }
      }
    });

    // Update user's activeTeamId
    await prisma.user.update({
      where: { id: user.id },
      data: { activeTeamId: team.id }
    });

    console.log(`Created personal team for user ${user.id}: ${team.name}`);
  }

  console.log('Team seeding complete');
}

seedTeams()
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
