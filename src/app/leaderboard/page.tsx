"use client";

import { useEffect, useMemo, useState } from "react";
import Navbar from "../components/Navbar";
import { FaTrophy, FaMedal, FaUser, FaUsers } from "react-icons/fa";

type IndividualRow = {
  rank: number;
  userId: string;
  username: string;
  points: number;
  solves: number;
};

type TeamRow = {
  rank: number;
  teamId: string;
  teamName: string;
  points: number;
  solves: number;
};

type ApiResponse = {
  individuals: IndividualRow[];
  teams: TeamRow[];
};

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<"individual" | "team">("individual");

  const [individuals, setIndividuals] = useState<IndividualRow[]>([]);
  const [teams, setTeams] = useState<TeamRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setErr(null);

    try {
      const res = await fetch("/api/leaderboard", { cache: "no-store" });

      const text = await res.text();
      let data: any = {};
      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = { error: text || "Non-JSON response" };
      }

      if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);

      setIndividuals(Array.isArray(data.individuals) ? data.individuals : []);
      setTeams(Array.isArray(data.teams) ? data.teams : []);
    } catch (e: any) {
      setErr(e?.message || "Failed to load leaderboard");
      setIndividuals([]);
      setTeams([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const rows = useMemo(() => {
    return activeTab === "individual" ? individuals : teams;
  }, [activeTab, individuals, teams]);

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold tracking-tight text-[#077c8a]">
            Leaderboard
          </h1>
          <p className="text-white/60">Competition rankings and statistics</p>
        </div>

        {/* Loading / Error */}
        {loading && (
          <div className="mb-8 rounded-2xl border border-white/10 bg-white/[0.04] px-6 py-4 text-sm text-white/70">
            Loading leaderboard...
          </div>
        )}

        {err && (
          <div className="mb-8 rounded-2xl border border-red-500/30 bg-red-500/10 px-6 py-4 text-sm text-red-200">
            {err}
          </div>
        )}

        {/* Toggle Switch */}
        <div className="mb-8 flex">
          <div className="relative flex rounded-full bg-white/5 p-1 ring-1 ring-white/10">
            <button
              onClick={() => setActiveTab("individual")}
              className={`relative z-10 flex w-40 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-all duration-300 ${
                activeTab === "individual"
                  ? "bg-[#077c8a] text-white shadow-lg"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <FaUser className={activeTab === "individual" ? "text-white" : "text-white/40"} />
              Individual
            </button>

            <button
              onClick={() => setActiveTab("team")}
              className={`relative z-10 flex w-40 items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-bold transition-all duration-300 ${
                activeTab === "team"
                  ? "bg-[#077c8a] text-white shadow-lg"
                  : "text-white/60 hover:text-white"
              }`}
            >
              <FaUsers className={activeTab === "team" ? "text-white" : "text-white/40"} />
              Team
            </button>
          </div>
        </div>

        {/* Rankings Card */}
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0a]">
          {/* Card Header */}
          <div className="border-b border-white/5 bg-white/5 px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-medium text-white">
                {activeTab === "individual" ? "Individual Rankings" : "Team Rankings"}
              </h2>

              <button
                onClick={load}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/70 hover:bg-white/10 hover:text-white transition"
              >
                Refresh
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-white/5 text-xs uppercase tracking-wider text-white/40">
                  <th className="px-6 py-4 font-medium">Rank</th>
                  <th className="px-6 py-4 font-medium">
                    {activeTab === "individual" ? "Username" : "Team Name"}
                  </th>
                  <th className="px-6 py-4 font-medium text-right">Points</th>
                  <th className="px-6 py-4 font-medium text-right">Solves</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/5 text-sm">
                {rows.map((item: any) => (
                  <tr key={item.rank + (item.userId || item.teamId)} className="group transition-colors hover:bg-white/[0.02]">
                    {/* Rank */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {item.rank === 1 && <FaTrophy className="text-yellow-500 text-lg" />}
                        {item.rank === 2 && <FaMedal className="text-gray-300 text-lg" />}
                        {item.rank === 3 && <FaMedal className="text-amber-600 text-lg" />}
                        <span
                          className={`font-mono font-bold ${
                            item.rank <= 3 ? "text-white" : "text-white/60"
                          }`}
                        >
                          {item.rank}
                        </span>
                      </div>
                    </td>

                    {/* Username / Team Name */}
                    <td className="px-6 py-4 font-medium text-white">
                      {activeTab === "individual" ? item.username : item.teamName}
                    </td>

                    {/* Points */}
                    <td className="px-6 py-4 text-right font-mono font-bold text-[#077c8a]">
                      {item.points}
                    </td>

                    {/* Solves */}
                    <td className="px-6 py-4 text-right font-mono text-white/60">
                      {item.solves}
                    </td>
                  </tr>
                ))}

                {!loading && rows.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-12 text-center text-white/60">
                      No leaderboard data yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 text-sm text-white/50">
          * Leaderboard totals are calculated from <span className="text-white/70">event solves only</span>. Practice solves do not count.
        </div>
      </div>
    </main>
  );
}
