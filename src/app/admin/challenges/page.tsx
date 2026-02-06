"use client";

import { useEffect, useState } from "react";
import { FiUploadCloud, FiFileText, FiX } from "react-icons/fi";

type FileItem = { fileId: string; filename: string; size: number; contentType: string };
type Challenge = {
  _id: string;
  title: string;
  description?: string;
  points: number;
  category: string;
  files: FileItem[];
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

export default function AdminChallengesPage() {
  const [token, setToken] = useState("");
  const [items, setItems] = useState<Challenge[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  // create form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [points, setPoints] = useState(100);
  const [category, setCategory] = useState(categories[0]);

  // flag
  const [flag, setFlag] = useState("");
  const [showFlag, setShowFlag] = useState(false);

  // ✅ multiple files in create form
  const [createFiles, setCreateFiles] = useState<File[]>([]);

  async function api(path: string, init?: RequestInit) {
    const res = await fetch(path, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        "x-admin-token": token,
        ...(init?.headers || {}),
      },
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
    setLoading(true);
    try {
      const data = await api("/api/admin/challenges");
      setItems(data.challenges || []);
    } catch (e: any) {
      setErr(e?.message || "Failed to load challenges");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (token.trim()) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // ✅ upload one OR many files for an existing challenge (uses FormData key "files")
  async function uploadMany(challengeId: string, files: FileList | null) {
    if (!files || files.length === 0) return;

    const fd = new FormData();
    Array.from(files).forEach((f) => fd.append("files", f));

    const res = await fetch(`/api/admin/challenges/${challengeId}/files`, {
      method: "POST",
      headers: { "x-admin-token": token },
      body: fd,
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || "Upload failed");
  }

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setMsg(null);
    setLoading(true);

    try {
      const t = title.trim();
      const d = description.trim();
      const f = flag.trim();

      if (!t || t.length < 3) throw new Error("Title must be at least 3 characters.");
      if (!d || d.length < 5) throw new Error("Description is required.");
      if (!Number.isFinite(points) || points < 0) throw new Error("Points must be valid.");
      if (!f || f.length < 4) throw new Error("Flag is required.");

      // 1) Create challenge
      const created = await api("/api/admin/challenges", {
        method: "POST",
        body: JSON.stringify({ title: t, description: d, points, category, flag: f }),
      });

      const newId: string | undefined = created?.challenge?._id;
      if (!newId) throw new Error("Challenge created but id not returned.");

      // 2) Upload selected files (many)
      if (createFiles.length > 0) {
        const fd = new FormData();
        createFiles.forEach((file) => fd.append("files", file));

        const res = await fetch(`/api/admin/challenges/${newId}/files`, {
          method: "POST",
          headers: { "x-admin-token": token },
          body: fd,
        });

        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || "File upload failed");
      }

      setMsg(createFiles.length > 0 ? "Challenge + files created ✅" : "Challenge created ✅");

      // reset form
      setTitle("");
      setDescription("");
      setPoints(100);
      setCategory(categories[0]);
      setFlag("");
      setShowFlag(false);
      setCreateFiles([]);

      await load();
    } catch (e: any) {
      setErr(e?.message || "Create failed");
    } finally {
      setLoading(false);
    }
  }

  async function del(id: string) {
    if (!confirm("Delete this challenge?")) return;
    setErr(null);
    setMsg(null);
    setLoading(true);
    try {
      await api(`/api/admin/challenges/${id}`, { method: "DELETE" });
      setMsg("Deleted ✅");
      await load();
    } catch (e: any) {
      setErr(e?.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  }

  const removeSelectedCreateFile = (key: string) => {
    setCreateFiles((prev) => prev.filter((f) => `${f.name}:${f.size}` !== key));
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="text-3xl font-bold">
          <span className="text-white">Admin </span>
          <span className="text-[#077c8a]">Challenges</span>
        </h1>

        {/* Admin Token */}
        <div className="mt-6 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <label className="block text-sm font-medium text-white/80">Admin Token</label>
          <input
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-[#1493a0]/70"
            placeholder="Paste ADMIN_TOKEN here"
          />

          <div className="mt-4 flex items-center gap-3">
            <button
              onClick={load}
              className="rounded-xl bg-[#077c8a] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition"
            >
              Load
            </button>
            <span className="ml-auto text-sm text-white/60">
              {loading ? "Working..." : `${items.length} challenges`}
            </span>
          </div>

          {(err || msg) && (
            <div
              className={`mt-4 rounded-2xl border p-3 text-sm ${
                err
                  ? "border-red-500/30 bg-red-500/10 text-red-200"
                  : "border-[#077c8a]/30 bg-[#077c8a]/10 text-white/90"
              }`}
            >
              {err ?? msg}
            </div>
          )}
        </div>

        {/* Create Challenge */}
        <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-6">
          <h2 className="text-lg font-semibold">Create Challenge</h2>

          <form onSubmit={create} className="mt-4 grid gap-4 sm:grid-cols-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Challenge title"
              className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-[#1493a0]/70"
            />

            <input
              value={points}
              onChange={(e) => setPoints(Number(e.target.value))}
              placeholder="Points"
              type="number"
              className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-[#1493a0]/70"
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-[#1493a0]/70 sm:col-span-2"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Description"
              className="min-h-[120px] rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-[#1493a0]/70 sm:col-span-2"
            />

            {/* Flag */}
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium text-white/80">Flag</label>
              <div className="flex gap-2">
                <input
                  value={flag}
                  onChange={(e) => setFlag(e.target.value)}
                  type={showFlag ? "text" : "password"}
                  placeholder="UITCTF{...}"
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-[#1493a0]/70"
                />
                <button
                  type="button"
                  onClick={() => setShowFlag((v) => !v)}
                  className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/80 hover:bg-white/10 transition"
                >
                  {showFlag ? "Hide" : "Show"}
                </button>
              </div>
              <p className="mt-2 text-xs text-white/50">Flag is stored securely (hashed).</p>
            </div>

            {/* Multi-file upload (CREATE) with additive selection */}
            <div className="sm:col-span-2">
              <label className="mb-2 block text-sm font-medium text-white/80">
                Challenge Files (optional)
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
                    const map = new Map(prev.map((f) => [`${f.name}:${f.size}`, f]));
                    for (const f of picked) map.set(`${f.name}:${f.size}`, f); // avoid duplicates
                    return Array.from(map.values());
                  });

                  // allow selecting again later
                  e.currentTarget.value = "";
                }}
              />

              <label
                htmlFor="challenge-files"
                className="group flex cursor-pointer items-center justify-between gap-3 rounded-xl border border-white/12 bg-white/[0.05] px-4 py-3 text-white/85 transition hover:border-[#1493a0]/60 hover:bg-white/[0.07]"
              >
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10">
                    <FiUploadCloud className="h-5 w-5 text-[#077c8a]" />
                  </span>

                  <div className="leading-tight">
                    <div className="text-sm font-semibold">
                      {createFiles.length > 0
                        ? `${createFiles.length} file(s) selected`
                        : "Add files"}
                    </div>
                    <div className="text-xs text-white/55">Binary/zip/pdf (max 10MB each)</div>
                  </div>
                </div>

                <div className="text-xs font-semibold text-white/55 group-hover:text-white/70">
                  Browse
                </div>
              </label>

              {/* Selected files list */}
              {createFiles.length > 0 && (
                <div className="mt-3 space-y-2">
                  {createFiles.map((f) => {
                    const key = `${f.name}:${f.size}`;
                    return (
                      <div
                        key={key}
                        className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2"
                      >
                        <div className="flex min-w-0 items-center gap-2 text-sm text-white/80">
                          <FiFileText className="shrink-0 text-[#077c8a]" />
                          <span className="truncate">{f.name}</span>
                          <span className="shrink-0 text-xs text-white/45">
                            ({Math.ceil(f.size / 1024)} KB)
                          </span>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeSelectedCreateFile(key)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition"
                          title="Remove"
                        >
                          <FiX />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <button
              disabled={loading}
              className="rounded-xl bg-[#077c8a] px-5 py-3 text-sm font-semibold text-white hover:opacity-90 transition disabled:opacity-60 sm:col-span-2"
            >
              {loading ? "Creating..." : "Create"}
            </button>
          </form>
        </div>

        {/* List of Challenges + Upload more files after creation */}
        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          {items.map((ch) => (
            <div key={ch._id} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="text-lg font-semibold">{ch.title}</div>
                  <div className="mt-1 text-sm text-white/60">{ch.category}</div>
                </div>
                <div className="rounded-xl bg-white/5 px-3 py-1 text-sm text-white/80">
                  {ch.points} pts
                </div>
              </div>

              {/* Upload more files for this challenge */}
              <div className="mt-4">
                <label className="text-sm font-semibold text-white/80">Upload more files</label>
                <input
                  type="file"
                  multiple
                  className="mt-2 block w-full text-sm text-white/70"
                  onChange={async (e) => {
                    try {
                      await uploadMany(ch._id, e.target.files);
                      setMsg("Files uploaded ✅");
                      await load();
                    } catch (er: any) {
                      setErr(er?.message || "Upload failed");
                    } finally {
                      e.currentTarget.value = "";
                    }
                  }}
                />
              </div>

              {ch.files?.length > 0 && (
                <div className="mt-4 text-sm text-white/70">
                  <div className="font-semibold text-white/80">Files</div>
                  <ul className="mt-2 list-disc pl-5">
                    {ch.files.map((f) => (
                      <li key={f.fileId}>{f.filename}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="mt-5">
                <button
                  onClick={() => del(ch._id)}
                  className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-200 hover:bg-red-500/15 transition"
                >
                  Delete Challenge
                </button>
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <div className="text-white/60">No challenges yet. Create one above.</div>
          )}
        </div>
      </div>
    </main>
  );
}
