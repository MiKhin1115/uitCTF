import EventNavbar from "../components/EventNavbar";

export default function ScoreboardPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      <EventNavbar />

      <section className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="text-3xl font-bold">
          <span className="text-white">CTF </span>
          <span className="text-[#077c8a]">Scoreboard</span>
        </h1>
        <p className="mt-3 text-white/70">Coming soon…</p>
      </section>
    </main>
  );
}
