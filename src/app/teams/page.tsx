"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import EventNavbar from "../components/EventNavbar";
import { useRequireTeam } from "../components/useRequireTeam";

type TeamRow = {
  _id: string;
  name: string;
  memberCount: number;
};

export default function TeamsPage() {
  const { loading } = useRequireTeam();
  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setErr(null);
    try {
      const res = await fetch("/api/teams", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to load teams");

      // Expect API to return { teams: [...] }
      // If your API returns a different shape, adjust here.
      const list = (data.teams || []).map((t: any) => ({
        _id: String(t._id),
        name: String(t.name),
        memberCount: Number(t.memberCount ?? t.members?.length ?? 0),
      }));

      setTeams(list);
    } catch (e: any) {
      setErr(e?.message || "Failed to load teams");
    }
  }

  useEffect(() => {
    if (!loading) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  if (loading) return null;

  return (
    <main className="min-h-screen bg-black text-white">
      <EventNavbar />

      <section className="mx-auto max-w-5xl px-6 py-12">
        {/* ✅ Center heading */}
        <div className="text-center">
          <h1 className="text-3xl font-bold">
            <span className="text-white">Event </span>
            <span className="text-[#077c8a]">Teams</span>
          </h1>
          <p className="mt-2 text-white/70">Teams participating in this event.</p>
        </div>

        {err && (
          <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
            {err}
          </div>
        )}

        {/* ✅ Table-style list (like screenshot) */}
        <div className="mx-auto mt-10 max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]">
          {/* header */}
          <div className="grid grid-cols-2 border-b border-white/10 px-6 py-4 text-sm font-semibold tracking-wide text-white/55">
            <div>TEAM NAME</div>
            <div className="text-right">MEMBERS</div>
          </div>

          {/* rows */}
          {teams.map((t) => (
            <div
              key={t._id}
              className="grid grid-cols-2 items-center px-6 py-6 transition hover:bg-white/[0.04]"
            >
              <Link
                href={`/teams/${t._id}`}
                className="text-lg font-semibold text-white hover:text-[#077c8a] transition"
              >
                {t.name}
              </Link>

              <div className="flex items-center justify-end gap-2 text-white/70">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                  👤
                </span>
                <span className="text-lg font-semibold">{t.memberCount}</span>
              </div>
            </div>
          ))}

          {teams.length === 0 && !err && (
            <div className="px-6 py-8 text-center text-white/60">No teams yet.</div>
          )}
        </div>
      </section>
    </main>
  );
}
