"use client";

import { useEffect, useMemo, useState } from "react";
import EventNavbar from "../components/EventNavbar";
import { useRequireTeam } from "../components/useRequireTeam";

type IndividualRow = {
  rank: number;
  userId: string;
  username: string;
  team: string;
  points: number;
  solves: number;
};

type TeamRow = {
  rank: number;
  teamId: string;
  team: string;
  points: number;
  solves: number;
  members: number;
};

function rankIcon(rank: number) {
  if (rank === 1) return "🏆";
  if (rank === 2) return "🥈";
  if (rank === 3) return "🥉";
  return String(rank);
}

export default function ScoreboardPage() {
  const { loading } = useRequireTeam();
  const [tab, setTab] = useState<"individual" | "team">("individual");

  const [individual, setIndividual] = useState<IndividualRow[]>([]);
  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setErr(null);
    try {
      const res = await fetch("/api/scoreboard", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to load scoreboard");

      setIndividual(data.individual || []);
      setTeams(data.teams || []);
    } catch (e: any) {
      setErr(e?.message || "Failed to load scoreboard");
    }
  }

  useEffect(() => {
    if (!loading) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const rows = useMemo(() => (tab === "individual" ? individual : teams), [tab, individual, teams]);

  if (loading) return null;

  return (
    <main className="min-h-screen bg-black text-white">
      <EventNavbar />

      <section className="mx-auto max-w-6xl px-6 py-12">
        
        {err && (
          <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
            {err}
          </div>
        )}

        {/* Tabs */}
        <div className="mt-8 w-full max-w-xl rounded-3xl border border-white/10 bg-white/[0.04] p-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setTab("individual")}
              className={[
                "flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition",
                tab === "individual" ? "bg-[#077c8a] text-white" : "text-white/70 hover:bg-white/5",
              ].join(" ")}
            >
              <span className="text-base">👤</span> Individual
            </button>

            <button
              onClick={() => setTab("team")}
              className={[
                "flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition",
                tab === "team" ? "bg-[#077c8a] text-white" : "text-white/70 hover:bg-white/5",
              ].join(" ")}
            >
              <span className="text-base">👥</span> Team
            </button>
          </div>
        </div>

        {/* Table card */}
        <div className="mt-10 overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04]">
          <div className="border-b border-white/10 px-8 py-6">
            <h2 className="text-2xl font-bold text-white">
              {tab === "individual" ? "Individual Rankings" : "Team Rankings"}
            </h2>
          </div>

          {/* headers */}
          {tab === "individual" ? (
            <div className="grid grid-cols-12 gap-4 border-b border-white/10 px-8 py-4 text-xs font-semibold tracking-widest text-white/45">
              <div className="col-span-2">RANK</div>
              <div className="col-span-4">USERNAME</div>
              <div className="col-span-3">TEAM</div>
              <div className="col-span-2 text-right">POINTS</div>
              <div className="col-span-1 text-right">SOLVES</div>
            </div>
          ) : (
            <div className="grid grid-cols-12 gap-4 border-b border-white/10 px-8 py-4 text-xs font-semibold tracking-widest text-white/45">
              <div className="col-span-2">RANK</div>
              <div className="col-span-5">TEAM</div>
              <div className="col-span-2 text-right">MEMBERS</div>
              <div className="col-span-2 text-right">POINTS</div>
              <div className="col-span-1 text-right">SOLVES</div>
            </div>
          )}

          {/* rows */}
          <div>
            {tab === "individual" &&
              (rows as IndividualRow[]).map((r) => (
                <div
                  key={r.userId}
                  className="grid grid-cols-12 items-center gap-4 border-b border-white/5 px-8 py-6 hover:bg-white/[0.03] transition"
                >
                  <div className="col-span-2 flex items-center gap-3">
                    <span className="text-xl">{rankIcon(r.rank)}</span>
                    <span className="text-lg font-bold">{r.rank}</span>
                  </div>

                  <div className="col-span-4 text-lg font-semibold text-white">{r.username}</div>

                  <div className="col-span-3">
                    <span className="inline-flex items-center rounded-2xl border border-[#077c8a]/25 bg-[#077c8a]/10 px-4 py-2 text-sm font-semibold text-[#b8f4ff]">
                      {r.team}
                    </span>
                  </div>

                  <div className="col-span-2 text-right text-lg font-bold text-[#077c8a]">
                    {r.points}
                  </div>

                  <div className="col-span-1 text-right text-lg font-semibold text-white/75">
                    {r.solves}
                  </div>
                </div>
              ))}

            {tab === "team" &&
              (rows as TeamRow[]).map((r) => (
                <div
                  key={r.teamId}
                  className="grid grid-cols-12 items-center gap-4 border-b border-white/5 px-8 py-6 hover:bg-white/[0.03] transition"
                >
                  <div className="col-span-2 flex items-center gap-3">
                    <span className="text-xl">{rankIcon(r.rank)}</span>
                    <span className="text-lg font-bold">{r.rank}</span>
                  </div>

                  <div className="col-span-5 text-lg font-semibold text-white">{r.team}</div>

                  <div className="col-span-2 text-right text-lg font-semibold text-white/75">
                    {r.members}
                  </div>

                  <div className="col-span-2 text-right text-lg font-bold text-[#077c8a]">
                    {r.points}
                  </div>

                  <div className="col-span-1 text-right text-lg font-semibold text-white/75">
                    {r.solves}
                  </div>
                </div>
              ))}

            {rows.length === 0 && (
              <div className="px-8 py-10 text-center text-white/60">No solves yet.</div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
