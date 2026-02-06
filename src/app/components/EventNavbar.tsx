"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { FaFlag} from "react-icons/fa";
const FlagIcon = FaFlag;
type Me = {
  user:
    | null
    | {
        id: string;
        username: string;
        email: string;
        avatar?: string;
        teamId?: string;
        teamName?: string;
      };
};

export default function EventNavbar() {
  const [me, setMe] = useState<Me["user"]>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        const data: Me = await res.json().catch(() => ({ user: null }));
        setMe(data.user || null);
      } catch {
        setMe(null);
      }
    })();
  }, []);

  // close menu when route changes (simple)
  useEffect(() => {
    const close = () => setOpen(false);
    window.addEventListener("resize", close);
    return () => window.removeEventListener("resize", close);
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/event" className="flex items-center gap-3" onClick={() => setOpen(false)}>
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10">
            <FlagIcon className="h-6 w-6 text-[#077c8a]" />
          </span>
          <span className="text-xl font-semibold tracking-tight">
            <span className="text-[#077c8a]">UIT</span>
            <span className="text-white/90">ctf</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/" className="text-white/75 hover:text-white transition">
            Home
          </Link>
          <Link href="/teams" className="text-white/75 hover:text-white transition">
            Teams
          </Link>
          <Link href="/challenges" className="text-white/75 hover:text-white transition">
            Challenges
          </Link>
          <Link href="/scoreboard" className="text-white/75 hover:text-white transition">
            Scoreboard
          </Link>
          <Link href="/notifications" className="text-white/75 hover:text-white transition">
            Notification
          </Link>
        </nav>

        {/* Right */}
        <div className="flex items-center gap-3">
          {me ? (
            <>
              <Link
                href="/profile"
                onClick={() => setOpen(false)}
                className="hidden md:inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm font-semibold text-white/85 hover:bg-white/10 transition"
              >
                <span className="text-[#077c8a]">👤</span>
                <span className="max-w-[120px] truncate">{me.username}</span>
              </Link>

              <button
                onClick={logout}
                className="hidden md:inline-flex text-sm font-semibold text-white/70 hover:text-white transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setOpen(false)}
                className="hidden md:inline-flex text-sm font-semibold text-white/70 hover:text-white"
              >
                Login
              </Link>
              <Link
                href="/signup"
                onClick={() => setOpen(false)}
                className="hidden md:inline-flex rounded-xl bg-[#077c8a] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 transition"
              >
                Sign Up
              </Link>
            </>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="md:hidden inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white/80 hover:bg-white/10 transition"
            aria-label="Open menu"
          >
            {open ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden border-t border-white/10 bg-black/80 backdrop-blur">
          <div className="mx-auto max-w-6xl px-6 py-4">
            <div className="grid gap-2">
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/85 hover:bg-white/10 transition"
              >
                Home
              </Link>

              <Link
                href="/teams"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/85 hover:bg-white/10 transition"
              >
                Teams
              </Link>

              <Link
                href="/challenges"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/85 hover:bg-white/10 transition"
              >
                Challenges
              </Link>

              <Link
                href="/scoreboard"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/85 hover:bg-white/10 transition"
              >
                Scoreboard
              </Link>

              <Link
                href="/notifications"
                onClick={() => setOpen(false)}
                className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/85 hover:bg-white/10 transition"
              >
                Notification
              </Link>

              <div className="mt-2 h-px bg-white/10" />

              {me ? (
                <>
                  <Link
                    href="/profile"
                    onClick={() => setOpen(false)}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/85 hover:bg-white/10 transition"
                  >
                    Profile ({me.username})
                  </Link>

                  <button
                    onClick={logout}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm font-semibold text-white/85 hover:bg-white/10 transition"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setOpen(false)}
                    className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/85 hover:bg-white/10 transition"
                  >
                    Login
                  </Link>

                  <Link
                    href="/signup"
                    onClick={() => setOpen(false)}
                    className="rounded-xl bg-[#077c8a] px-4 py-3 text-sm font-semibold text-white hover:opacity-90 transition"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
