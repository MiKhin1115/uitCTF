"use client";

import { useEffect, useMemo, useState } from "react";
import EventNavbar from "../components/EventNavbar";
import { useRequireTeam } from "../components/useRequireTeam";

type FileItem = { fileId: string; filename: string; size: number; contentType: string };
type Challenge = {
  _id: string;
  title: string;
  description: string;
  points: number;
  category: string;
  files: FileItem[];
  solved: boolean;
};

const categories = [
  "Web Exploitation",
  "Cryptography",
  "Forensics",
  "Pwn",
  "Reverse Engineering",
  "OSINT",
  "Misc",
  "Steganography",
];

function shortLabel(c: string) {
  if (c === "Web Exploitation") return "Web";
  if (c === "Reverse Engineering") return "Reverse";
  return c;
}

function difficultyFromPoints(points: number) {
  if (points <= 120) return "EASY";
  if (points <= 220) return "MEDIUM";
  return "HARD";
}

function diffBadgeClass(diff: "EASY" | "MEDIUM" | "HARD") {
  if (diff === "EASY") return "bg-emerald-500/15 text-emerald-300 border-emerald-500/20";
  if (diff === "MEDIUM") return "bg-yellow-500/15 text-yellow-300 border-yellow-500/20";
  return "bg-red-500/15 text-red-300 border-red-500/20";
}

export default function ChallengesPage() {
  const { loading } = useRequireTeam();

  const [all, setAll] = useState<Challenge[]>([]);
  const [active, setActive] = useState<string>("Web Exploitation");
  const [err, setErr] = useState<string | null>(null);

  // modal
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<Challenge | null>(null);
  const [flag, setFlag] = useState("");
  const [submitMsg, setSubmitMsg] = useState<string | null>(null);
  const [submitOk, setSubmitOk] = useState<boolean | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function loadChallenges() {
    setErr(null);
    const res = await fetch("/api/challenges", { cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setErr(data?.error || "Failed to load challenges");
      return;
    }
    setAll(data.challenges || []);
  }

  useEffect(() => {
    if (!loading) loadChallenges();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const filtered = useMemo(
    () => all.filter((c) => c.category === active),
    [all, active]
  );

  function openSolve(ch: Challenge) {
    setSelected(ch);
    setOpen(true);
    setFlag("");
    setSubmitMsg(null);
    setSubmitOk(null);
  }

  function closeSolve() {
    setOpen(false);
    setSelected(null);
    setFlag("");
    setSubmitMsg(null);
    setSubmitOk(null);
  }

  async function submitFlag() {
    if (!selected) return;
    const f = flag.trim();
    if (!f) {
      setSubmitOk(false);
      setSubmitMsg("Flag is required");
      return;
    }

    setSubmitting(true);
    setSubmitMsg(null);
    setSubmitOk(null);

    try {
      const res = await fetch(`/api/challenges/${selected._id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flag: f }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setSubmitOk(false);
        setSubmitMsg(data?.error || "Submit failed");
        return;
      }

      if (data.correct) {
        setSubmitOk(true);
        setSubmitMsg("Correct ✅");

        setAll((prev) =>
          prev.map((x) => (x._id === selected._id ? { ...x, solved: true } : x))
        );
        setSelected((prev) => (prev ? { ...prev, solved: true } : prev));
      } else {
        setSubmitOk(false);
        setSubmitMsg("Incorrect flag");
      }
    } catch {
      setSubmitOk(false);
      setSubmitMsg("Network error");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return null;

  return (
    <main className="min-h-screen bg-black text-white">
      <EventNavbar />

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="text-center">
          <h1 className="text-3xl font-bold">
            <span className="text-white">CTF </span>
            <span className="text-[#077c8a]">Challenges</span>
          </h1>
          <p className="mt-2 text-white/70">Click a challenge to solve it.</p>
        </div>

        {err && (
          <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
            {err}
          </div>
        )}

        {/* Category Tabs */}
        <div className="mt-8 flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                active === c
                  ? "bg-[#077c8a] text-white"
                  : "border border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
              }`}
            >
              {shortLabel(c)}
            </button>
          ))}
        </div>

        {/* ✅ Card UI like screenshot */}
        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((ch) => {
            const diff = difficultyFromPoints(ch.points) as "EASY" | "MEDIUM" | "HARD";

            return (
              <button
                key={ch._id}
                onClick={() => openSolve(ch)}
                className={[
                  "group relative w-full overflow-hidden rounded-3xl border text-left transition",
                  "bg-white/[0.04] border-white/10 hover:bg-white/[0.06]",
                  "shadow-[0_0_0_1px_rgba(255,255,255,0.04)]",
                  "hover:border-[#1493a0]/45 hover:shadow-[0_0_0_1px_rgba(20,147,160,0.20)]",
                  ch.solved
                    ? "border-[#077c8a]/50 bg-[#077c8a]/10 shadow-[0_0_0_1px_rgba(7,124,138,0.20)]"
                    : "",
                ].join(" ")}
              >
                <div className="p-7">
                  {/* Top row: difficulty + points */}
                  <div className="flex items-start justify-between">
                    <span
                      className={[
                        "inline-flex items-center rounded-xl border px-3 py-1 text-xs font-bold tracking-wide",
                        diffBadgeClass(diff),
                      ].join(" ")}
                    >
                      {diff}
                    </span>

                    <span className="text-sm font-semibold text-[#077c8a]">
                      {ch.points} pts
                    </span>
                  </div>

                  {/* Title */}
                  <div className="mt-6 text-2xl font-bold text-white">
                    {ch.title}
                  </div>

                  {/* Category */}
                  <div className="mt-2 text-base text-white/65">{ch.category}</div>

                  {/* Solved (bottom right like screenshot vibe) */}
                  <div className="mt-10 flex justify-end">
                    {ch.solved ? (
                      <span className="text-sm font-bold tracking-widest text-emerald-400">
                        SOLVED
                      </span>
                    ) : (
                      <span className="text-sm font-bold tracking-widest text-white/20">
                        {/* keep spacing consistent */}
                        &nbsp;
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}

          {filtered.length === 0 && !err && (
            <div className="text-white/60">No challenges in this category yet.</div>
          )}
        </div>
      </section>

      {/* Solve Modal */}
      {open && selected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          onClick={closeSolve}
        >
          <div
            className="w-full max-w-xl rounded-3xl border border-white/10 bg-black/90 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.06)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xl font-bold">
                  {selected.title}
                  {selected.solved && (
                    <span className="ml-2 rounded-lg border border-[#077c8a]/40 bg-[#077c8a]/15 px-2 py-0.5 text-xs font-semibold text-white/90">
                      Solved
                    </span>
                  )}
                </div>
                <div className="mt-1 text-sm text-white/60">
                  {selected.category} • {selected.points} pts
                </div>
              </div>

              <button
                onClick={closeSolve}
                className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/80 hover:bg-white/10 transition"
              >
                Close
              </button>
            </div>

            <p className="mt-4 whitespace-pre-line text-sm leading-7 text-white/70">
              {selected.description}
            </p>

            {selected.files?.length > 0 && (
              <div className="mt-5">
                <div className="text-sm font-semibold text-white/80">Files</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {selected.files.map((f) => (
                    <a
                      key={f.fileId}
                      href={`/api/challenges/files/${f.fileId}`}
                      className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:bg-white/10 transition"
                    >
                      {f.filename}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Flag submit */}
            <div className="mt-6">
              <label className="mb-2 block text-sm font-semibold text-white/80">
                Submit Flag
              </label>

              <div className="flex gap-2">
                <input
                  value={flag}
                  onChange={(e) => setFlag(e.target.value)}
                  placeholder="UITCTF{...}"
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-[#1493a0]/70"
                />
                <button
                  disabled={submitting || selected.solved}
                  onClick={submitFlag}
                  className="shrink-0 rounded-xl bg-[#077c8a] px-4 py-3 text-sm font-semibold text-white hover:opacity-90 transition disabled:opacity-60"
                >
                  {selected.solved ? "Solved" : submitting ? "Checking..." : "Submit"}
                </button>
              </div>

              {submitMsg && (
                <div
                  className={`mt-3 rounded-2xl border p-3 text-sm ${
                    submitOk
                      ? "border-[#077c8a]/30 bg-[#077c8a]/10 text-white/90"
                      : "border-red-500/30 bg-red-500/10 text-red-200"
                  }`}
                >
                  {submitMsg}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
