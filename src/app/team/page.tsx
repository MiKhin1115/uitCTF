"use client";

import { useEffect, useState } from "react";

type Me = {
  user: null | {
    id: string;
    username: string;
    email: string;
    teamId?: string;
    teamName?: string;
  };
};

export default function TeamSetupPage() {
  const [tab, setTab] = useState<"create" | "join">("create");

  const [me, setMe] = useState<Me["user"]>(null);
  const [loading, setLoading] = useState(true);

  // create
  const [teamName, setTeamName] = useState("");
  const [teamPassword, setTeamPassword] = useState("");

  // join
  const [inviteToken, setInviteToken] = useState("");

  const [err, setErr] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [inviteOut, setInviteOut] = useState<string>("");

  async function loadMe() {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const data: Me = await res.json().catch(() => ({ user: null }));

      if (!data.user) {
        window.location.href = "/login";
        return;
      }

      // already in team → go event
      if (data.user.teamId) {
        window.location.href = "/event";
        return;
      }

      setMe(data.user);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMe();
  }, []);

  async function createTeam() {
    setErr(null);
    setMsg(null);
    setInviteOut("");

    const name = teamName.trim();
    const pw = teamPassword.trim();

    if (name.length < 3) return setErr("Team name must be at least 3 characters.");
    if (pw.length < 6) return setErr("Team password must be at least 6 characters.");

    const res = await fetch("/api/teams/create", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, password: pw }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) return setErr(data?.error || "Create team failed");

    setMsg("Team created ✅");
    setInviteOut(data.inviteToken || "");
    // refresh → should redirect to /event because user now has team
    setTimeout(() => loadMe(), 600);
  }

  async function joinTeam() {
    setErr(null);
    setMsg(null);

    const tok = inviteToken.trim();
    if (tok.length < 10) return setErr("Invitation token looks invalid.");

    const res = await fetch("/api/teams/join", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inviteToken: tok }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) return setErr(data?.error || "Join failed");

    setMsg("Joined team ✅");
    setTimeout(() => (window.location.href = "/event"), 600);
  }

  if (loading) return null;

  return (
    <main className="min-h-screen bg-black text-white">
      <section className="mx-auto max-w-2xl px-6 py-14">
        <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-8">
          <h1 className="text-3xl font-bold">
            <span className="text-white">Team </span>
            <span className="text-[#077c8a]">Setup</span>
          </h1>
          <p className="mt-2 text-white/70">
            You must create or join a team before entering the event.
          </p>

          <div className="mt-6 flex gap-2">
            <button
              onClick={() => setTab("create")}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                tab === "create"
                  ? "bg-[#077c8a] text-white"
                  : "border border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
              }`}
            >
              Create Team
            </button>
            <button
              onClick={() => setTab("join")}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                tab === "join"
                  ? "bg-[#077c8a] text-white"
                  : "border border-white/10 bg-white/5 text-white/80 hover:bg-white/10"
              }`}
            >
              Join Team
            </button>
          </div>

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

          {tab === "create" ? (
            <div className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-semibold text-white/80">Team Name</label>
                <input
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g. RedDragons"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-[#1493a0]/70"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-white/80">Team Password</label>
                <input
                  value={teamPassword}
                  onChange={(e) => setTeamPassword(e.target.value)}
                  type="password"
                  placeholder="Create a team password"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-[#1493a0]/70"
                />
                <p className="mt-2 text-xs text-white/50">
                  Password is stored hashed. (Used only when creating)
                </p>
              </div>

              <button
                onClick={createTeam}
                className="w-full rounded-xl bg-[#077c8a] px-5 py-3 text-sm font-semibold text-white hover:opacity-90 transition"
              >
                Create Team
              </button>

              {inviteOut && (
                <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="text-sm font-semibold text-white/80">Invitation Token</div>
                  <div className="mt-2 rounded-xl border border-white/10 bg-black/40 px-4 py-3 font-mono text-sm text-white/90">
                    {inviteOut}
                  </div>
                  <button
                    onClick={async () => {
                      await navigator.clipboard.writeText(inviteOut);
                      setMsg("Token copied ✅");
                    }}
                    className="mt-3 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10 transition"
                  >
                    Copy Token
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              <div>
                <label className="text-sm font-semibold text-white/80">Invitation Token</label>
                <input
                  value={inviteToken}
                  onChange={(e) => setInviteToken(e.target.value)}
                  placeholder="Paste token from team owner"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white outline-none focus:border-[#1493a0]/70"
                />
              </div>

              <button
                onClick={joinTeam}
                className="w-full rounded-xl bg-[#077c8a] px-5 py-3 text-sm font-semibold text-white hover:opacity-90 transition"
              >
                Join Team
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
