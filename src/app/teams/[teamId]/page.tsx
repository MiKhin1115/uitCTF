"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import EventNavbar from "../../components/EventNavbar";
import { useRequireTeam } from "../../components/useRequireTeam";

type TeamDetail = {
  id: string;
  name: string;
  members: { userId: string; username: string }[];
  ownerId?: string;
};

export default function TeamDetailPage() {
  const { loading } = useRequireTeam();
  const params = useParams<{ teamId: string }>();
  const teamId = params?.teamId;

  const [team, setTeam] = useState<TeamDetail | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setErr(null);
    try {
      const res = await fetch(`/api/teams/${teamId}`, { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to load team");

      setTeam(data.team);
    } catch (e: any) {
      setErr(e?.message || "Failed to load team");
    }
  }

  useEffect(() => {
    if (!loading && teamId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, teamId]);

  if (loading) return null;

  return (
    <main className="min-h-screen bg-black text-white">
      <EventNavbar />

      <section className="mx-auto max-w-5xl px-6 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold">
            <span className="text-white">Team </span>
            <span className="text-[#077c8a]">Members</span>
          </h1>
          <p className="mt-2 text-white/70">
            {team ? team.name : "Loading team..."}
          </p>
        </div>

        {err && (
          <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
            {err}
          </div>
        )}

        {team && (
          <div className="mx-auto mt-10 max-w-3xl overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]">
            <div className="border-b border-white/10 px-6 py-4 text-sm font-semibold tracking-wide text-white/55">
              MEMBERS ({team.members.length})
            </div>

            {team.members.map((m) => (
              <div
                key={m.userId}
                className="flex items-center justify-between px-6 py-5 transition hover:bg-white/[0.04]"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5">
                    👤
                  </span>
                  <div className="text-lg font-semibold text-white">{m.username}</div>
                </div>

                {team.ownerId && m.userId === team.ownerId && (
                  <span className="rounded-xl border border-[#077c8a]/30 bg-[#077c8a]/10 px-3 py-1 text-xs font-semibold text-white/90">
                    Leader
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
