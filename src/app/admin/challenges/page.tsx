"use client";

import { useEffect, useMemo, useState } from "react";

type ChallengeRow = {
  _id: string;
  title: string;
  category: string;
  points: number;
  startsAt: string;
  endsAt: string;
  files?: { filename: string; size: number; fileId: string }[];
};

function fmtLocal(dt: string | Date) {
  const d = typeof dt === "string" ? new Date(dt) : dt;
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString();
}

export default function AdminChallengesPage() {
  const [token, setToken] = useState("");
  const [loadedToken, setLoadedToken] = useState("");

  const [list, setList] = useState<ChallengeRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // create form
  const [title, setTitle] = useState("");
  const [points, setPoints] = useState(100);
  const [category, setCategory] = useState("Web Exploitation");
  const [description, setDescription] = useState("");
  const [flag, setFlag] = useState("");
  const [showFlag, setShowFlag] = useState(false);

  // ✅ schedule
  const [startsAt, setStartsAt] = useState("");
  const [endsAt, setEndsAt] = useState("");

  // files
  const [createFiles, setCreateFiles] = useState<File[]>([]);

  useEffect(() => {
    const t = localStorage.getItem("ADMIN_TOKEN") || "";
    if (t) {
      setToken(t);
      setLoadedToken(t);
    }
  }, []);

  async function api(path: string, init?: RequestInit) {
    const res = await fetch(path, {
      ...init,
      headers: {
        ...(init?.headers || {}),
        "x-admin-token": loadedToken,
      },
      cache: "no-store",
    });

    const text = await res.text();
    let data: any = {};
    try {
      data = text ? JSON.parse(text) : {};
    } catch {
      data = { error: text || "Non-JSON response" };
    }
    if (!res.ok) throw new Error(data?.error || `Request failed (${res.status})`);
    return data;
  }

  async function load() {
    setErr(null);
    setMsg(null);
    if (!loadedToken) return;

    setLoading(true);
    try {
      const data = await api("/api/admin/challenges");
      setList(data.challenges || []);
    } catch (e: any) {
      setErr(e?.message || "Failed to load challenges");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadedToken]);

  function saveToken() {
    localStorage.setItem("ADMIN_TOKEN", token.trim());
    setLoadedToken(token.trim());
    setMsg("Admin token loaded ✅");
    setErr(null);
  }

  async function createChallenge() {
    setErr(null);
    setMsg(null);

    if (!loadedToken) {
      setErr("Please load ADMIN_TOKEN first.");
      return;
    }

    try {
      const body = {
        title,
        points,
        category,
        description,
        flag,
        startsAt,
        endsAt,
      };

      const created = await api("/api/admin/challenges", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const newId = created?.challenge?._id as string | undefined;

      // upload files (optional)
      if (newId && createFiles.length > 0) {
        const fd = new FormData();
        createFiles.forEach((f) => fd.append("files", f));

        await fetch(`/api/admin/challenges/${newId}/files`, {
          method: "POST",
          headers: { "x-admin-token": loadedToken },
          body: fd,
        });
      }

      setMsg("Challenge created ✅");
      setTitle("");
      setPoints(100);
      setCategory("Web Exploitation");
      setDescription("");
      setFlag("");
      setStartsAt("");
      setEndsAt("");
      setCreateFiles([]);
      await load();
    } catch (e: any) {
      setErr(e?.message || "Create failed");
    }
  }

  const categories = useMemo(
    () => [
      "Web Exploitation",
      "Cryptography",
      "Forensics",
      "Pwn",
      "Reverse Engineering",
      "OSINT",
      "Misc",
      "Steganography",
    ],
    []
  );

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="text-3xl font-bold">
          <span className="text-white">Admin </span>
          <span className="text-[#077c8a]">Challenges</span>
        </h1>
        <p className="mt-2 text-white/60">Create challenges with schedule windows.</p>

        {/* Token */}
        <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <div className="text-sm font-semibold text-white/80">Admin Token</div>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <input
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Paste ADMIN_TOKEN here"
              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#077c8a]/60"
            />
            <button
              onClick={saveToken}
              className="rounded-2xl bg-[#077c8a] px-6 py-3 text-sm font-semibold text-white hover:opacity-90"
            >
              Load
            </button>
          </div>
          <div className="mt-3 text-sm text-white/60">
            {loading ? "Loading..." : `${list.length} challenge(s)`}
          </div>
        </div>

        {msg && (
          <div className="mt-6 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
            {msg}
          </div>
        )}
        {err && (
          <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
            {err}
          </div>
        )}

        {/* Create */}
        <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-xl font-bold">Create Challenge</h2>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Challenge title"
              className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#077c8a]/60"
            />
            <input
              value={points}
              onChange={(e) => setPoints(Number(e.target.value))}
              type="number"
              placeholder="Points"
              className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#077c8a]/60"
            />
          </div>

          <div className="mt-4">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#077c8a]/60"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* ✅ schedule inputs */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="text-sm text-white/70">Starts at</label>
              <input
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#077c8a]/60"
              />
            </div>

            <div>
              <label className="text-sm text-white/70">Ends at</label>
              <input
                type="datetime-local"
                value={endsAt}
                onChange={(e) => setEndsAt(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#077c8a]/60"
              />
            </div>
          </div>

          <div className="mt-4">
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              className="h-36 w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#077c8a]/60"
            />
          </div>

          {/* Flag */}
          <div className="mt-4">
            <label className="text-sm font-semibold text-white/80">Flag</label>
            <div className="mt-2 flex gap-3">
              <input
                value={flag}
                onChange={(e) => setFlag(e.target.value)}
                type={showFlag ? "text" : "password"}
                placeholder="Flag (stored hashed)"
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-white outline-none focus:border-[#077c8a]/60"
              />
              <button
                onClick={() => setShowFlag((p) => !p)}
                className="rounded-2xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/80 hover:bg-white/10"
              >
                {showFlag ? "Hide" : "Show"}
              </button>
            </div>
            <div className="mt-2 text-xs text-white/50">Flag is stored securely (hashed).</div>
          </div>

          {/* Files UI (optional) */}
          <div className="mt-6">
            <div className="text-sm font-semibold text-white/80">Challenge Files (optional)</div>

            <label
              htmlFor="challenge-files"
              className="mt-3 flex cursor-pointer items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4 hover:bg-white/[0.05] transition"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10">
                  ⬆️
                </div>
                <div>
                  <div className="text-sm font-semibold">
                    {createFiles.length ? `${createFiles.length} file(s) selected` : "Upload files"}
                  </div>
                  <div className="text-xs text-white/55">Binary/zip/pdf (max 10MB each)</div>
                </div>
              </div>
              <div className="text-sm text-white/60">Browse</div>
            </label>

            <input
              id="challenge-files"
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                const picked = Array.from(e.target.files || []);
                if (picked.length === 0) return;

                setCreateFiles((prev) => {
                  const map = new Map(prev.map((f) => [f.name + ":" + f.size, f]));
                  for (const f of picked) map.set(f.name + ":" + f.size, f);
                  return Array.from(map.values());
                });

                e.currentTarget.value = "";
              }}
            />

            {createFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                {createFiles.map((f) => (
                  <div
                    key={f.name + f.size}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-3"
                  >
                    <div className="text-sm text-white/85">
                      📄 {f.name}{" "}
                      <span className="text-white/50">
                        ({Math.round(f.size / 1024)} KB)
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        setCreateFiles((prev) => prev.filter((x) => x !== f))
                      }
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/70 hover:bg-white/10"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={createChallenge}
            className="mt-6 w-full rounded-2xl bg-[#077c8a] py-4 text-sm font-bold text-white hover:opacity-90"
          >
            Create
          </button>
        </div>

        {/* List */}
        <div className="mt-10 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-xl font-bold">All Challenges</h2>

          <div className="mt-6 space-y-3">
            {list.map((ch) => (
              <div
                key={ch._id}
                className="rounded-2xl border border-white/10 bg-black/30 p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-lg font-bold">{ch.title}</div>
                    <div className="mt-1 text-sm text-white/60">
                      {ch.category} • {ch.points} pts
                    </div>
                    <div className="mt-2 text-xs text-white/50">
                      ⏱ {fmtLocal(ch.startsAt)} → {fmtLocal(ch.endsAt)}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {list.length === 0 && (
              <div className="py-8 text-center text-white/60">No challenges yet.</div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
