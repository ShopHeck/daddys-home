"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

function InviteContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [teamName, setTeamName] = useState("");

  useEffect(() => {
    if (!token) {
      setError("Invalid invitation link.");
      setLoading(false);
      return;
    }

    const acceptInvite = async () => {
      const response = await fetch("/api/dashboard/teams/invites/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { success?: boolean; team?: { name: string }; error?: string }
        | null;

      if (!response.ok || !payload?.success) {
        setError(payload?.error ?? "Invalid or expired invite.");
        setLoading(false);
        return;
      }

      setTeamName(payload.team?.name ?? "");
      setSuccess(true);
      setLoading(false);
    };

    void acceptInvite();
  }, [token]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-800 p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl border border-blue-500/40 bg-blue-500/10 text-blue-300">
            {loading ? "⏳" : success ? "✓" : "✕"}
          </div>

          <h1 className="mt-6 text-2xl font-semibold text-white">
            {loading
              ? "Processing..."
              : success
                ? "You've joined the team!"
                : "Invitation Error"}
          </h1>

          <p className="mt-3 text-sm text-slate-400">
            {loading
              ? "Accepting your invitation..."
              : success
                ? `Welcome to ${teamName}. You can now access this team in your dashboard.`
                : error}
          </p>

          {success ? (
            <Link
              href="/dashboard"
              className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white transition hover:bg-blue-500"
            >
              Go to Dashboard
            </Link>
          ) : error ? (
            <Link
              href="/dashboard/teams"
              className="mt-6 inline-block rounded-lg border border-slate-600 px-6 py-3 text-sm font-medium text-slate-300 transition hover:bg-slate-700"
            >
              Back to Teams
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function InviteAcceptancePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 text-slate-100">
          <div className="flex min-h-screen items-center justify-center px-4">
            <div className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-800 p-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-xl border border-blue-500/40 bg-blue-500/10 text-blue-300">
                ⏳
              </div>
              <h1 className="mt-6 text-2xl font-semibold text-white">Loading...</h1>
            </div>
          </div>
        </div>
      }
    >
      <InviteContent />
    </Suspense>
  );
}
