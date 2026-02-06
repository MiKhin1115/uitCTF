"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Me = {
  user:
    | null
    | { id: string; username: string; email: string; avatar?: string; teamId?: string; teamName?: string };
};

type TeamMe = {
  team:
    | null
    | {
        id: string;
        name: string;
        ownerId: string;
        isLeader: boolean;
        inviteToken: string;
        members: { userId: string; username: string }[];
      };
};

export default function ProfilePage() {
  const [me, setMe] = useState<Me["user"]>(null);

  const [username, setUsername] = useState("");
  const [avatar, setAvatar] = useState<string>("");

  const [team, setTeam] = useState<TeamMe["team"]>(null);

  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function loadMe() {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const data: Me = await res.json().catch(() => ({ user: null }));
      if (!data.user) {
        window.location.href = "/login";
        return;
      }
      setMe(data.user);
      setUsername(data.user.username);
      setAvatar(data.user.avatar || "");
    } catch {
      window.location.href = "/login";
    }
  }

  async function loadTeam() {
    const res = await fetch("/api/teams/me", { cache: "no-store" });
    const data: TeamMe = await res.json().catch(() => ({ team: null }));
    if (res.ok) setTeam(data.team || null);
  }

  useEffect(() => {
    loadMe();
    loadTeam();
  }, []);

  async function onPickAvatar(file: File | null) {
    if (!file) return;
    if (file.size > 200_000) {
      setErr("Image too large. Please use under 200KB.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setAvatar(String(reader.result || ""));
    reader.readAsDataURL(file);
  }

  async function saveProfile() {
    setErr(null);
    setMsg(null);
    setSaving(true);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, avatar }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Update failed");

      setMsg("Profile updated ✅");
      await loadMe();
      await loadTeam();
    } catch (e: any) {
      setErr(e?.message || "Update failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-3xl px-6 py-14">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
          <h1 className="text-center text-4xl font-bold">
            <span className="text-[#077c8a]">User</span> Profile
          </h1>
          <p className="mt-2 text-center text-white/70">
            Update your username and profile photo
          </p>

          {(err || msg) && (
            <div
              className={`mt-6 rounded-2xl border p-3 text-sm ${
                err
                  ? "border-red-500/30 bg-red-500/10 text-red-200"
                  : "border-[#077c8a]/30 bg-[#077c8a]/10 text-white/90"
              }`}
            >
              {err ?? msg}
            </div>
          )}

          {/* Avatar */}
          <div className="mt-10 flex flex-col items-center">
            <div className="relative h-28 w-28 overflow-hidden rounded-full border border-white/10 bg-white/5">
              {avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatar} alt="avatar" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-white/50">
                  No Photo
                </div>
              )}
            </div>

            <label className="mt-4 cursor-pointer rounded-xl border border-white/10 bg-white/5 px-5 py-2 text-sm font-semibold text-white/85 hover:bg-white/10 transition">
              Change Photo
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => onPickAvatar(e.target.files?.[0] || null)}
              />
            </label>

            <div className="mt-2 text-xs text-white/50">
              Tip: use a small image (under 200KB).
            </div>
          </div>

          {/* Team Name */}
          <div className="mt-10">
            <div className="text-sm font-semibold text-white/80">Team</div>

            {team ? (
              <div className="mt-2 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                <div>
                  <div className="text-white/90 font-semibold">{team.name}</div>
                  <div className="text-xs text-white/55">
                    {team.isLeader ? "Team Leader" : "Member"} • {team.members.length} member(s)
                  </div>
                </div>

                <Link
                  href="/team/my"
                  className="rounded-xl bg-[#077c8a] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition"
                >
                  View Team →
                </Link>
              </div>
            ) : (
              <div className="mt-2 rounded-2xl border border-white/10 bg-white/[0.03] p-4 text-sm text-white/60">
                You are not in a team yet. Go to <Link className="text-[#077c8a] underline" href="/team">Team Setup</Link>.
              </div>
            )}
          </div>

          {/* Username & Email */}
          <div className="mt-10 space-y-6">
            <div>
              <label className="text-sm font-semibold text-white/80">Username</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-[#1493a0]/70"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-white/80">Email</label>
              <input
                value={me?.email || ""}
                disabled
                className="mt-2 w-full cursor-not-allowed rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white/60"
              />
            </div>

            <button
              onClick={saveProfile}
              disabled={saving}
              className="w-full rounded-xl bg-[#077c8a] px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}
