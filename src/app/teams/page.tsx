"use client";

import { useEffect, useState } from "react";
import EventNavbar from "../components/EventNavbar";
import { useRequireTeam } from "../components/useRequireTeam";

type Team = {
  _id: string;
  name: string;
  ownerId: string;
  members: { userId: string; username: string }[];
  createdAt?: string;
};

export default function TeamsPage() {
  const { loading } = useRequireTeam();
  const [teams, setTeams] = useState<Team[]>([]);
  const [err, setErr] = useState<string | null>(null);

  async function loadTeams() {
    setErr(null);
    const res = await fetch("/api/teams", { cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErr(data?.error || "Failed to load teams");
      return;
    }
    setTeams(data.teams || []);
  }

  useEffect(() => {
    if (!loading) loadTeams();
  }, [loading]);

  if (loading) return null;

  return (
    <main className="min-h-screen bg-black text-white">
      <EventNavbar />

      <section className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="text-3xl font-bold">
          <span className="text-white">Event </span>
          <span className="text-[#077c8a]">Teams</span>
        </h1>
        <p className="mt-2 text-white/70">Teams participating in this event.</p>

        {err && (
          <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
            {err}
          </div>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((t) => (
            <div
              key={t._id}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 hover:border-[#1493a0]/60 transition"
            >
              <div className="text-lg font-semibold text-white/90">{t.name}</div>
              <div className="mt-2 text-sm text-white/60">
                Members: <span className="text-white/80">{t.members?.length || 0}</span>
              </div>

              {t.members?.length > 0 && (
                <div className="mt-3 text-xs text-white/55">
                  {t.members.slice(0, 5).map((m) => m.username).join(", ")}
                  {t.members.length > 5 ? " ..." : ""}
                </div>
              )}
            </div>
          ))}

          {teams.length === 0 && !err && (
            <div className="text-white/60">No teams yet.</div>
          )}
        </div>
      </section>
    </main>
  );
}
