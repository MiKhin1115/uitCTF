"use client";

import EventNavbar from "../components/EventNavbar";
import { useRequireTeam } from "../components/useRequireTeam";
import Link from "next/link";

export default function EventPage() {
  const { loading } = useRequireTeam();
  if (loading) return null;

  return (
    <main className="min-h-screen bg-black text-white">
      <EventNavbar />

      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-10 text-center shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
          <div className="mx-auto mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10 text-2xl">
            🛡️
          </div>

          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
            <span className="text-white">Learn.</span>{" "}
            <span className="text-[#077c8a]">Hack.</span>{" "}
            <span className="text-white">Compete.</span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-white/70">
            Practice challenges, compete with teams, climb the scoreboard, and learn security hands-on.
          </p>

          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link
              href="/challenges"
              className="rounded-xl bg-[#077c8a] px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition"
            >
              Go to Challenges →
            </Link>
            <Link
              href="/scoreboard"
              className="rounded-xl border border-white/12 bg-white/5 px-6 py-3 text-sm font-semibold text-white/85 hover:bg-white/10 transition"
            >
              View Scoreboard
            </Link>
            <Link
              href="/teams"
              className="rounded-xl border border-white/12 bg-white/5 px-6 py-3 text-sm font-semibold text-white/85 hover:bg-white/10 transition"
            >
              View Teams
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
