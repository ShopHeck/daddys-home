"use client";

import { useEffect, useMemo, useState } from "react";

import { ConfirmModal } from "@/components/ConfirmModal";
import type { TeamRole } from "@prisma/client";

type Member = {
  id: string;
  userId: string;
  role: TeamRole;
  name: string | null;
  email: string | null;
  image: string | null;
  joinedAt: string;
};

type Invite = {
  id: string;
  email: string;
  role: TeamRole;
  expiresAt: string;
  createdAt: string;
};

type Team = {
  id: string;
  name: string;
  personal: boolean;
  createdAt: string;
  updatedAt: string;
  memberCount: number;
  members: Member[];
  invites: Invite[];
  myRole: TeamRole;
};

type TeamListItem = {
  id: string;
  name: string;
  personal: boolean;
  memberCount: number;
  myRole: TeamRole;
};

const roleLabels: Record<TeamRole, string> = {
  OWNER: "Owner",
  ADMIN: "Admin",
  MEMBER: "Member",
};

const roleBadgeStyles: Record<TeamRole, string> = {
  OWNER: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  ADMIN: "border-blue-500/30 bg-blue-500/10 text-blue-300",
  MEMBER: "border-slate-500/30 bg-slate-500/10 text-slate-300",
};

function getInitials(name: string | null, email: string | null) {
  if (name) {
    return name
      .split(" ")
      .slice(0, 2)
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  }
  return email?.slice(0, 2).toUpperCase() || "?";
}

export function TeamsClient() {
  const [teams, setTeams] = useState<TeamListItem[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Create team state
  const [newTeamName, setNewTeamName] = useState("");
  const [creatingTeam, setCreatingTeam] = useState(false);

  // Invite state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<TeamRole>("MEMBER");
  const [sendingInvite, setSendingInvite] = useState(false);

  // UI state
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [deletingTeam, setDeletingTeam] = useState(false);
  const [removingMemberId, setRemovingMemberId] = useState<string | null>(null);
  const [confirmingLeave, setConfirmingLeave] = useState(false);
  const [leavingTeam, setLeavingTeam] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [editNameValue, setEditNameValue] = useState("");
  const [updatingName, setUpdatingName] = useState(false);

  const loadTeams = async () => {
    setLoading(true);
    setError("");

    const response = await fetch("/api/dashboard/teams", { cache: "no-store" });
    const payload = (await response.json().catch(() => null)) as
      | TeamListItem[]
      | { error?: string }
      | null;

    if (!response.ok || !payload || !Array.isArray(payload)) {
      setError((payload as { error?: string } | null)?.error ?? "Unable to load teams.");
      setLoading(false);
      return;
    }

    setTeams(payload);
    setLoading(false);

    // Select first team if none selected
    if (payload.length > 0 && !selectedTeam) {
      loadTeamDetails(payload[0].id);
    }
  };

  const loadTeamDetails = async (teamId: string) => {
    setSelectedTeam(null);

    const response = await fetch(`/api/dashboard/teams/${teamId}`, {
      cache: "no-store",
    });
    const payload = (await response.json().catch(() => null)) as
      | Team
      | { error?: string }
      | null;

    if (!response.ok || !payload || "error" in payload) {
      setError((payload as { error?: string } | null)?.error ?? "Unable to load team details.");
      return;
    }

    const teamData = payload as Team;
    setSelectedTeam(teamData);
    setEditNameValue(teamData.name);
  };

  const createTeam = async () => {
    if (!newTeamName.trim()) return;

    setCreatingTeam(true);
    setError("");

    const response = await fetch("/api/dashboard/teams", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newTeamName.trim() }),
    });

    const payload = (await response.json().catch(() => null)) as
      | { id: string; error?: string }
      | null;

    if (!response.ok || !payload || payload.error) {
      setError(payload?.error ?? "Failed to create team.");
      setCreatingTeam(false);
      return;
    }

    setNewTeamName("");
    await loadTeams();
    setCreatingTeam(false);
  };

  const sendInvite = async () => {
    if (!inviteEmail.trim() || !selectedTeam) return;

    setSendingInvite(true);
    setError("");

    const response = await fetch(`/api/dashboard/teams/${selectedTeam.id}/invites`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: inviteEmail.trim(), role: inviteRole }),
    });

    const payload = (await response.json().catch(() => null)) as { error?: string } | null;

    if (!response.ok) {
      setError(payload?.error ?? "Failed to send invite.");
      setSendingInvite(false);
      return;
    }

    setInviteEmail("");
    setInviteRole("MEMBER");
    await loadTeamDetails(selectedTeam.id);
    setSendingInvite(false);
  };

  const cancelInvite = async (inviteId: string) => {
    if (!selectedTeam) return;

    const response = await fetch(
      `/api/dashboard/teams/${selectedTeam.id}/invites/${inviteId}`,
      { method: "DELETE" }
    );

    if (!response.ok) {
      setError("Failed to cancel invite.");
      return;
    }

    await loadTeamDetails(selectedTeam.id);
  };

  const removeMember = async (memberId: string) => {
    if (!selectedTeam) return;

    const member = selectedTeam.members.find((m) => m.id === memberId);
    if (!member) return;

    const response = await fetch(`/api/dashboard/teams/${selectedTeam.id}/members`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: member.userId }),
    });

    const payload = (await response.json().catch(() => null)) as { error?: string } | null;

    if (!response.ok) {
      setError(payload?.error ?? "Failed to remove member.");
      setRemovingMemberId(null);
      return;
    }

    setRemovingMemberId(null);
    await loadTeamDetails(selectedTeam.id);
  };

  const updateMemberRole = async (memberId: string, newRole: TeamRole) => {
    if (!selectedTeam) return;

    const response = await fetch(
      `/api/dashboard/teams/${selectedTeam.id}/members/${memberId}`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      }
    );

    const payload = (await response.json().catch(() => null)) as { error?: string } | null;

    if (!response.ok) {
      setError(payload?.error ?? "Failed to update role.");
      return;
    }

    await loadTeamDetails(selectedTeam.id);
  };

  const updateTeamName = async () => {
    if (!selectedTeam || !editNameValue.trim()) return;

    setUpdatingName(true);
    setError("");

    const response = await fetch(`/api/dashboard/teams/${selectedTeam.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editNameValue.trim() }),
    });

    const payload = (await response.json().catch(() => null)) as { error?: string } | null;

    if (!response.ok) {
      setError(payload?.error ?? "Failed to update name.");
      setUpdatingName(false);
      return;
    }

    setEditingName(false);
    setUpdatingName(false);
    await loadTeams();
    await loadTeamDetails(selectedTeam.id);
  };

  const deleteTeam = async () => {
    if (!selectedTeam) return;

    setDeletingTeam(true);
    setError("");

    const response = await fetch(`/api/dashboard/teams/${selectedTeam.id}`, {
      method: "DELETE",
    });

    const payload = (await response.json().catch(() => null)) as { error?: string } | null;

    if (!response.ok) {
      setError(payload?.error ?? "Failed to delete team.");
      setDeletingTeam(false);
      setConfirmingDelete(false);
      return;
    }

    setConfirmingDelete(false);
    setDeletingTeam(false);
    setSelectedTeam(null);
    await loadTeams();
  };

  const leaveTeam = async () => {
    if (!selectedTeam) return;

    setLeavingTeam(true);
    setError("");

    const response = await fetch(`/api/dashboard/teams/${selectedTeam.id}/leave`, {
      method: "POST",
    });

    const payload = (await response.json().catch(() => null)) as { error?: string } | null;

    if (!response.ok) {
      setError(payload?.error ?? "Failed to leave team.");
      setLeavingTeam(false);
      setConfirmingLeave(false);
      return;
    }

    setConfirmingLeave(false);
    setLeavingTeam(false);
    setSelectedTeam(null);
    await loadTeams();
  };

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

  useEffect(() => {
    void loadTeams();
  }, []);

  const canManageTeam = useMemo(() => {
    return selectedTeam?.myRole === "OWNER" || selectedTeam?.myRole === "ADMIN";
  }, [selectedTeam]);

  const canDeleteTeam = selectedTeam?.myRole === "OWNER" && !selectedTeam?.personal;
  const canLeaveTeam =
    selectedTeam?.myRole !== "OWNER" && !selectedTeam?.personal;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.2em] text-blue-300">Team Settings</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">Team Management</h1>
        <p className="mt-2 text-sm text-slate-400">
          Create teams, manage members, and collaborate on documents.
        </p>
      </div>

      {error ? <p className="text-sm text-rose-400">{error}</p> : null}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Team List */}
        <div className="rounded-lg border border-slate-700 bg-slate-800 p-6">
          <h2 className="text-lg font-semibold text-white">Your Teams</h2>

          {loading ? (
            <div className="mt-4 text-sm text-slate-400">Loading...</div>
          ) : teams.length === 0 ? (
            <div className="mt-4 text-sm text-slate-400">No teams yet.</div>
          ) : (
            <div className="mt-4 space-y-2">
              {teams.map((team) => (
                <button
                  key={team.id}
                  onClick={() => loadTeamDetails(team.id)}
                  className={[
                    "w-full rounded-lg border p-4 text-left transition",
                    selectedTeam?.id === team.id
                      ? "border-blue-500/50 bg-blue-500/10"
                      : "border-slate-700 bg-slate-900/60 hover:border-slate-600",
                  ].join(" ")}
                  type="button"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-white">{team.name}</span>
                    {team.personal ? (
                      <span className="text-xs text-slate-500">Personal</span>
                    ) : null}
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-sm text-slate-400">
                    <span
                      className={[
                        "inline-flex rounded border px-2 py-0.5 text-xs",
                        roleBadgeStyles[team.myRole],
                      ].join(" ")}
                    >
                      {roleLabels[team.myRole]}
                    </span>
                    <span>{team.memberCount} members</span>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Create Team */}
          <div className="mt-6 border-t border-slate-700 pt-6">
            <h3 className="text-sm font-medium text-white">Create a New Team</h3>
            <div className="mt-3 flex gap-2">
              <input
                type="text"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="Team name"
                className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => void createTeam()}
                disabled={creatingTeam || !newTeamName.trim()}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                type="button"
              >
                {creatingTeam ? "..." : "Create"}
              </button>
            </div>
          </div>
        </div>

        {/* Team Details */}
        <div className="lg:col-span-2 space-y-6">
          {selectedTeam ? (
            <>
              {/* Team Header */}
              <div className="rounded-lg border border-slate-700 bg-slate-800 p-6">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="flex-1">
                    {editingName && canManageTeam && !selectedTeam.personal ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editNameValue}
                          onChange={(e) => setEditNameValue(e.target.value)}
                          className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-lg font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={() => void updateTeamName()}
                          disabled={updatingName || !editNameValue.trim()}
                          className="rounded-lg bg-blue-600 px-3 py-2 text-sm text-white transition hover:bg-blue-500 disabled:opacity-60"
                          type="button"
                        >
                          Save
                        </button>
                        <button
                          onClick={() => {
                            setEditingName(false);
                            setEditNameValue(selectedTeam.name);
                          }}
                          className="rounded-lg border border-slate-600 px-3 py-2 text-sm text-slate-300 transition hover:bg-slate-700"
                          type="button"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <h2 className="text-xl font-semibold text-white">{selectedTeam.name}</h2>
                        {canManageTeam && !selectedTeam.personal ? (
                          <button
                            onClick={() => setEditingName(true)}
                            className="text-sm text-slate-400 hover:text-white"
                            type="button"
                          >
                            Edit
                          </button>
                        ) : null}
                      </div>
                    )}
                    <div className="mt-2 flex items-center gap-3">
                      <span
                        className={[
                          "inline-flex rounded border px-2 py-0.5 text-xs",
                          roleBadgeStyles[selectedTeam.myRole],
                        ].join(" ")}
                      >
                        {roleLabels[selectedTeam.myRole]}
                      </span>
                      <span className="text-sm text-slate-400">
                        {selectedTeam.memberCount} members
                      </span>
                      {selectedTeam.personal ? (
                        <span className="text-sm text-slate-500">Personal workspace</span>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {canDeleteTeam ? (
                      <button
                        onClick={() => setConfirmingDelete(true)}
                        className="rounded-lg border border-rose-500/40 px-4 py-2 text-sm font-medium text-rose-300 transition hover:bg-rose-500/10"
                        type="button"
                      >
                        Delete Team
                      </button>
                    ) : null}
                    {canLeaveTeam ? (
                      <button
                        onClick={() => setConfirmingLeave(true)}
                        className="rounded-lg border border-slate-600 px-4 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-700"
                        type="button"
                      >
                        Leave Team
                      </button>
                    ) : null}
                    {selectedTeam.id !== teams[0]?.id ? (
                      <button
                        onClick={() => void switchTeam(selectedTeam.id)}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
                        type="button"
                      >
                        Switch to Team
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Members */}
              <div className="rounded-lg border border-slate-700 bg-slate-800 p-6">
                <h3 className="text-lg font-semibold text-white">Members</h3>
                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-700 text-left text-sm">
                    <thead className="bg-slate-900/60 text-slate-300">
                      <tr>
                        <th className="px-4 py-3 font-medium">Member</th>
                        <th className="px-4 py-3 font-medium">Role</th>
                        <th className="px-4 py-3 font-medium">Joined</th>
                        {selectedTeam.myRole === "OWNER" ? <th className="px-4 py-3 font-medium">Actions</th> : null}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-700">
                      {selectedTeam.members.map((member) => (
                        <tr key={member.id}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-700 text-xs font-medium text-slate-300">
                                {getInitials(member.name, member.email)}
                              </div>
                              <div>
                                <p className="font-medium text-white">
                                  {member.name || "Unnamed"}
                                </p>
                                <p className="text-xs text-slate-400">{member.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {selectedTeam.myRole === "OWNER" && member.userId !== member.userId ? (
                              <select
                                value={member.role}
                                onChange={(e) =>
                                  void updateMemberRole(member.id, e.target.value as TeamRole)
                                }
                                className="rounded border border-slate-600 bg-slate-950 px-2 py-1 text-sm text-slate-100"
                              >
                                <option value="OWNER">Owner</option>
                                <option value="ADMIN">Admin</option>
                                <option value="MEMBER">Member</option>
                              </select>
                            ) : (
                              <span
                                className={[
                                  "inline-flex rounded border px-2 py-0.5 text-xs",
                                  roleBadgeStyles[member.role],
                                ].join(" ")}
                              >
                                {roleLabels[member.role]}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-slate-400">
                            {new Date(member.joinedAt).toLocaleDateString()}
                          </td>
                          {selectedTeam.myRole === "OWNER" ? (
                            <td className="px-4 py-3">
                              {member.role !== "OWNER" ? (
                                <button
                                  onClick={() => setRemovingMemberId(member.id)}
                                  className="text-sm text-rose-400 hover:text-rose-300"
                                  type="button"
                                >
                                  Remove
                                </button>
                              ) : null}
                            </td>
                          ) : null}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Invites */}
              {canManageTeam ? (
                <div className="rounded-lg border border-slate-700 bg-slate-800 p-6">
                  <h3 className="text-lg font-semibold text-white">Invite Members</h3>
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="email@example.com"
                      className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as TeamRole)}
                      className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100"
                    >
                      <option value="MEMBER">Member</option>
                      <option value="ADMIN">Admin</option>
                      {selectedTeam.myRole === "OWNER" ? (
                        <option value="OWNER">Owner</option>
                      ) : null}
                    </select>
                    <button
                      onClick={() => void sendInvite()}
                      disabled={sendingInvite || !inviteEmail.trim()}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                      type="button"
                    >
                      {sendingInvite ? "Sending..." : "Send Invite"}
                    </button>
                  </div>

                  {selectedTeam.invites.length > 0 ? (
                    <div className="mt-6">
                      <h4 className="text-sm font-medium text-slate-300">Pending Invites</h4>
                      <div className="mt-3 space-y-2">
                        {selectedTeam.invites.map((invite) => (
                          <div
                            key={invite.id}
                            className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900/60 px-4 py-3"
                          >
                            <div>
                              <p className="text-sm text-white">{invite.email}</p>
                              <p className="text-xs text-slate-400">
                                {roleLabels[invite.role]} • Expires{" "}
                                {new Date(invite.expiresAt).toLocaleDateString()}
                              </p>
                            </div>
                            <button
                              onClick={() => void cancelInvite(invite.id)}
                              className="text-sm text-rose-400 hover:text-rose-300"
                              type="button"
                            >
                              Revoke
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </>
          ) : null}
        </div>
      </div>

      <ConfirmModal
        confirmLabel="Delete"
        description="This will permanently delete the team and all its data. This action cannot be undone."
        loading={deletingTeam}
        onCancel={() => setConfirmingDelete(false)}
        onConfirm={() => void deleteTeam()}
        open={confirmingDelete}
        title={`Delete ${selectedTeam?.name}?`}
        tone="danger"
      />

      <ConfirmModal
        confirmLabel="Leave"
        description="You will lose access to this team and its resources."
        loading={leavingTeam}
        onCancel={() => setConfirmingLeave(false)}
        onConfirm={() => void leaveTeam()}
        open={confirmingLeave}
        title={`Leave ${selectedTeam?.name}?`}
      />

      <ConfirmModal
        confirmLabel="Remove"
        description="This member will lose access to the team."
        loading={false}
        onCancel={() => setRemovingMemberId(null)}
        onConfirm={() => removingMemberId && void removeMember(removingMemberId)}
        open={Boolean(removingMemberId)}
        title="Remove member?"
        tone="danger"
      />
    </div>
  );
}
