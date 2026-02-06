"use client";

import { useEffect, useState } from "react";
import EventNavbar from "../../components/EventNavbar";
import { useRequireTeam } from "../../components/useRequireTeam";

type Team = {
  id: string;
  name: string;
  ownerId: string;
  isLeader: boolean;
  inviteToken: string;
  members: { userId: string; username: string }[];
  createdAt?: string;
};

export default function MyTeamPage() {
  const { loading } = useRequireTeam();
  const [team, setTeam] = useState<Team | null>(null);

  const [newName, setNewName] = useState("");
  const [saving, setSaving] = useState(false);

  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  async function loadTeam() {
    setErr(null);
    setMsg(null);

    const res = await fetch("/api/teams/me", { cache: "no-store" });
    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setErr(data?.error || "Failed to load team");
      return;
    }

    setTeam(data.team || null);
    setNewName(data.team?.name || "");
  }

  useEffect(() => {
    if (!loading) loadTeam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  async function renameTeam() {
    if (!team) return;
    setErr(null);
    setMsg(null);

    const name = newName.trim();
    if (name.length < 3 || name.length > 32) {
      setErr("Team name must be 3–32 characters.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/teams/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Rename failed");

      setMsg("Team name updated ✅");
      await loadTeam();
    } catch (e: any) {
      setErr(e?.message || "Rename failed");
    } finally {
      setSaving(false);
    }
  }

  async function copyInvite() {
    if (!team?.inviteToken) return;
    await navigator.clipboard.writeText(team.inviteToken);
    setMsg("Invite token copied ✅");
  }

  if (loading) return null;

  return (
    <main className="min-h-screen bg-black text-white">
      <EventNavbar />

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">
          <h1 className="text-3xl font-bold">
            <span className="text-white">My </span>
            <span className="text-[#077c8a]">Team</span>
          </h1>
          <p className="mt-2 text-white/70">View members and manage your team.</p>

          {(err || msg) && (
            <div
              className={`mt-6 rounded-2xl border p-3 text-sm ${
                err
                  ? "border-red-500/30 bg-red-500/10 text-red-200"
                  : "border-[#077c8a]/30 bg-[#077c8a]/10 text-white/90"
              }`}
            >
              {err ?? msg}
            </div>
          )}

          {!team ? (
            <div className="mt-8 text-white/70">No team found.</div>
          ) : (
            <>
              {/* Team Name */}
              <div className="mt-8 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="text-sm font-semibold text-white/75">Team Name</div>

                  {team.isLeader ? (
                    <>
                      <input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        className="mt-3 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-[#1493a0]/70"
                      />
                      <button
                        onClick={renameTeam}
                        disabled={saving}
                        className="mt-3 w-full rounded-xl bg-[#077c8a] px-4 py-3 text-sm font-semibold text-white hover:opacity-90 transition disabled:opacity-60"
                      >
                        {saving ? "Saving..." : "Save Team Name"}
                      </button>
                      <p className="mt-2 text-xs text-white/50">
                        You are the team leader. Only you can rename.
                      </p>
                    </>
                  ) : (
                    <div className="mt-3 rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white/90">
                      {team.name}
                    </div>
                  )}
                </div>

                {/* Invite Token */}
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="text-sm font-semibold text-white/75">Invitation Token</div>
                  <div className="mt-3 rounded-xl border border-white/10 bg-black/40 px-4 py-3 font-mono text-sm text-white/90">
                    {team.inviteToken}
                  </div>
                  <button
                    onClick={copyInvite}
                    className="mt-3 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/85 hover:bg-white/10 transition"
                  >
                    Copy Token
                  </button>
                </div>
              </div>

              {/* Members */}
              <div className="mt-8">
                <div className="text-lg font-semibold text-white/90">
                  Members <span className="text-white/50">({team.members.length})</span>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {team.members.map((m) => (
                    <div
                      key={m.userId}
                      className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10">
                          👤
                        </div>
                        <div>
                          <div className="font-semibold text-white/90">{m.username}</div>
                          <div className="text-xs text-white/50">
                            {m.userId === team.ownerId ? "Team Leader" : "Member"}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </section>
    </main>
  );
}
