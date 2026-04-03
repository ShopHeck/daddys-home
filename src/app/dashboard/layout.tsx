import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/login");
  }

  // Load user's teams
  const memberships = await prisma.teamMember.findMany({
    where: { userId: session.user.id },
    include: {
      team: { select: { id: true, name: true, personal: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const teams = memberships.map((m) => ({
    id: m.team.id,
    name: m.team.name,
    personal: m.team.personal,
    role: m.role,
  }));

  // Find active team
  const activeTeam =
    teams.find((t) => t.id === session.user.activeTeamId) || teams[0];

  return (
    <DashboardShell
      user={{
        name: session.user.name ?? null,
        email: session.user.email ?? null,
      }}
      activeTeam={
        activeTeam
          ? {
              id: activeTeam.id,
              name: activeTeam.name,
              personal: activeTeam.personal,
            }
          : undefined
      }
      teams={teams}
    >
      {children}
    </DashboardShell>
  );
}
