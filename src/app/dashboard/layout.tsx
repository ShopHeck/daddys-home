import type { Metadata } from "next";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/DashboardShell";
import { authOptions } from "@/lib/auth";
import { getUserTeams } from "@/lib/queries";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: 'Dashboard',
  robots: { index: false },
};

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/login");
  }

  // Load user's teams (cached via React.cache for request deduplication)
  const memberships = await getUserTeams(session.user.id);

  const teams = memberships.map((m) => ({
    id: m.team.id,
    name: m.team.name,
    personal: m.team.personal,
    role: m.role,
  }));

  // Find active team
  const activeTeam =
    teams.find((t) => t.id === session.user.activeTeamId) || teams[0];

  // Load user tier for upgrade prompts
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { tier: true },
  });

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
      tier={user?.tier ?? 'FREE'}
    >
      {children}
    </DashboardShell>
  );
}
