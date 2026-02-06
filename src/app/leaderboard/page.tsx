"use client";

import { useState } from "react";
import Navbar from "../components/Navbar";
import { FaTrophy, FaMedal, FaUser, FaUsers } from "react-icons/fa";

// Mock Data
const INDIVIDUAL_RANKINGS = [
  { rank: 1, username: "h4x0r_elite", team: "CyberNinjas", points: 5420, solves: 89 },
  { rank: 2, username: "crypto_queen", team: "CodeBreakers", points: 4980, solves: 76 },
  { rank: 3, username: "pwn_master", team: "CyberNinjas", points: 4750, solves: 71 },
  { rank: 4, username: "web_wizard", team: "HackSquad", points: 4320, solves: 68 },
  { rank: 5, username: "forensic_pro", team: "ByteBusters", points: 4100, solves: 64 },
  { rank: 6, username: "rev_engineer", team: "CodeBreakers", points: 3890, solves: 59 },
  { rank: 7, username: "net_ninja", team: "HackSquad", points: 3650, solves: 55 },
  { rank: 8, username: "linux_lover", team: "ByteBusters", points: 3400, solves: 51 },
  { rank: 9, username: "script_kiddie", team: "SoloPlayer", points: 3100, solves: 48 },
  { rank: 10, username: "binary_boss", team: "CyberNinjas", points: 2950, solves: 45 },
];

const TEAM_RANKINGS = [
  { rank: 1, name: "CyberNinjas", members: 4, points: 15320, solves: 245 },
  { rank: 2, name: "CodeBreakers", members: 3, points: 12450, solves: 198 },
  { rank: 3, name: "HackSquad", members: 5, points: 10890, solves: 176 },
  { rank: 4, name: "ByteBusters", members: 4, points: 9650, solves: 154 },
  { rank: 5, name: "SoloPlayer", members: 1, points: 3100, solves: 48 },
];

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<"individual" | "team">("individual");

  return (
    <main className="min-h-screen bg-black text-white">
      <Navbar />

      <div className="mx-auto max-w-6xl px-6 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-[#077c8a] mb-2">
            Leaderboard
          </h1>
          <p className="text-white/60">
            Competition rankings and statistics
          </p>
        </div>

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
            <h2 className="text-lg font-medium text-white">
              {activeTab === "individual" ? "Individual Rankings" : "Team Rankings"}
            </h2>
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
                  {activeTab === "individual" && (
                    <th className="px-6 py-4 font-medium">Team</th>
                  )}
                  {activeTab === "team" && (
                    <th className="px-6 py-4 font-medium">Members</th>
                  )}
                  <th className="px-6 py-4 font-medium text-right">Points</th>
                  <th className="px-6 py-4 font-medium text-right">Solves</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {(activeTab === "individual" ? INDIVIDUAL_RANKINGS : TEAM_RANKINGS).map((item) => (
                  <tr
                    key={item.rank}
                    className="group transition-colors hover:bg-white/[0.02]"
                  >
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
                      {"username" in item ? item.username : item.name}
                    </td>

                    {/* Team Badge (Individual View) */}
                    {"username" in item && (
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-full border border-blue-500/20 bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-400">
                          {item.team}
                        </span>
                      </td>
                    )}

                    {/* Members Count (Team View) */}
                    {"members" in item && (
                      <td className="px-6 py-4">
                         <div className="flex items-center gap-2 text-white/60">
                            <FaUser className="text-xs" />
                            {item.members}
                         </div>
                      </td>
                    )}

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
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
