"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useState } from "react";

type Team = {
  id: string;
  name: string;
  personal: boolean;
  role: string;
};

type DashboardShellProps = {
  children: React.ReactNode;
  user: {
    name: string | null | undefined;
    email: string | null | undefined;
  };
  activeTeam?: { id: string; name: string; personal: boolean };
  teams?: Team[];
};

const navigation = [
  { href: "/dashboard", label: "Overview" },
  { href: "/dashboard/templates", label: "Templates" },
  { href: "/dashboard/api-keys", label: "API Keys" },
  { href: "/dashboard/usage", label: "Usage" },
  { href: "/dashboard/render-history", label: "Render History" },
  { href: "/dashboard/webhooks", label: "Webhooks" },
  {
    href: "/dashboard/billing",
    label: "Billing",
    icon: (
      <svg aria-hidden="true" className="h-4 w-4" fill="none" viewBox="0 0 24 24">
        <rect height="14" rx="2" stroke="currentColor" strokeWidth="1.75" width="20" x="2" y="5" />
        <path d="M2 10.5h20" stroke="currentColor" strokeWidth="1.75" />
        <path d="M6 15.5h4" stroke="currentColor" strokeLinecap="round" strokeWidth="1.75" />
      </svg>
    ),
  },
  { href: "/dashboard/teams", label: "Team Settings" },
  { href: "/docs", label: "Documentation" },
];

const roleLabels: Record<string, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  MEMBER: "Member",
};

export function DashboardShell({ children, user, activeTeam, teams = [] }: DashboardShellProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [teamDropdownOpen, setTeamDropdownOpen] = useState(false);
  const displayName = user.name || user.email || "DocForge user";

  const switchTeam = async (teamId: string) => {
    const response = await fetch("/api/dashboard/teams/switch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ teamId }),
    });

    if (response.ok) {
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="flex min-h-screen">
        <aside
          className={[
            "fixed inset-y-0 left-0 z-50 w-72 border-r border-slate-800 bg-slate-950/95 p-6 transition-transform duration-200 md:static md:translate-x-0",
            isOpen ? "translate-x-0" : "-translate-x-full",
          ].join(" ")}
        >
          <div className="flex items-center justify-between md:block">
            <Link
              className="flex items-center gap-3 text-sm font-semibold text-white"
              href="/dashboard"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-blue-500/40 bg-blue-500/10 text-blue-300">
                DF
              </span>
              <span>DocForge</span>
            </Link>
            <button
              className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 md:hidden"
              onClick={() => setIsOpen(false)}
              type="button"
            >
              Close
            </button>
          </div>

          {/* Team Switcher */}
          {activeTeam ? (
            <div className="relative mt-6">
              <button
                onClick={() => setTeamDropdownOpen(!teamDropdownOpen)}
                className="w-full rounded-lg border border-slate-700 bg-slate-900/60 px-4 py-3 text-left transition hover:border-slate-600"
                type="button"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-400">Current team</p>
                    <p className="text-sm font-medium text-white">{activeTeam.name}</p>
                  </div>
                  <svg
                    className={["h-4 w-4 text-slate-400 transition", teamDropdownOpen ? "rotate-180" : ""].join(" ")}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>

              {teamDropdownOpen ? (
                <>
                  <div
                    className="fixed inset-0 z-40 hidden md:block"
                    onClick={() => setTeamDropdownOpen(false)}
                  />
                  <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-lg border border-slate-700 bg-slate-800 shadow-xl">
                    <div className="max-h-60 overflow-y-auto py-1">
                      {teams.map((team) => (
                        <button
                          key={team.id}
                          onClick={() => {
                            if (team.id !== activeTeam.id) {
                              void switchTeam(team.id);
                            }
                            setTeamDropdownOpen(false);
                          }}
                          className={[
                            "w-full px-4 py-2 text-left transition",
                            team.id === activeTeam.id ? "bg-blue-600/20" : "hover:bg-slate-700",
                          ].join(" ")}
                          type="button"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-white">{team.name}</span>
                            {team.id === activeTeam.id ? (
                              <span className="text-xs text-blue-400">Active</span>
                            ) : null}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <span>{roleLabels[team.role]}</span>
                            {team.personal ? <span>• Personal</span> : null}
                          </div>
                        </button>
                      ))}
                    </div>
                    <div className="border-t border-slate-700 py-1">
                      <Link
                        href="/dashboard/teams"
                        onClick={() => setTeamDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-slate-300 transition hover:bg-slate-700 hover:text-white"
                      >
                        + Create Team
                      </Link>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          ) : null}

          <nav className="mt-6 space-y-2">
            {navigation.map((item) => {
              const isActive =
                item.href === "/dashboard"
                  ? pathname === "/dashboard"
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  className={[
                    "flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition",
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-slate-300 hover:bg-slate-800 hover:text-white",
                  ].join(" ")}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                >
                  {item.icon ? <span className="text-current">{item.icon}</span> : null}
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </aside>

        {isOpen ? (
          <button
            aria-label="Close sidebar overlay"
            className="fixed inset-0 z-40 bg-slate-950/70 md:hidden"
            onClick={() => setIsOpen(false)}
            type="button"
          />
        ) : null}

        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-800 bg-slate-950/80 px-4 py-4 backdrop-blur sm:px-6 lg:px-10">
            <div className="flex items-center gap-3">
              <button
                className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-300 md:hidden"
                onClick={() => setIsOpen(true)}
                type="button"
              >
                Menu
              </button>
              <div>
                <p className="text-sm font-medium text-white">{displayName}</p>
                <p className="text-xs text-slate-400">{user.email}</p>
              </div>
            </div>
            <button
              className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-slate-600"
              onClick={() => signOut({ callbackUrl: "/auth/login" })}
              type="button"
            >
              Sign out
            </button>
          </header>
          <main className="flex-1 px-4 py-8 sm:px-6 lg:px-10">{children}</main>
        </div>
      </div>
    </div>
  );
}
