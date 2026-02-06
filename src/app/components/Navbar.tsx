"use client";

import { useEffect, useState } from "react";
import { FaFlag, FaBookOpen, FaTrophy, FaArrowRight, FaUserCircle } from "react-icons/fa";

const FlagIcon = FaFlag;

type MeUser = {
  id: string;
  username: string;
  email: string;
  avatar?: string;
};

export default function Navbar() {
  const [me, setMe] = useState<MeUser | null>(null);

  async function loadMe() {
    const res = await fetch("/api/auth/me", { cache: "no-store" });
    const data = await res.json();
    setMe(data.user || null);
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setMe(null);
    window.location.href = "/";
  }

  useEffect(() => {
    loadMe();
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 ring-1 ring-white/10">
            <FlagIcon className="h-6 w-6 text-[#077c8a]" />
          </span>

          <div className="text-xl font-semibold tracking-tight">
            <span className="text-[#077c8a]">UIT</span>
            <span className="text-white/90">ctf</span>
          </div>
        </div>

        {/* Middle nav */}
        <nav className="hidden items-center md:flex">
          <div className="flex items-center gap-12 text-sm font-medium">
            <a href="/practice" className="flex items-center gap-2 text-white/80 hover:text-white transition">
              <FaBookOpen className="text-white/60" />
              Practice
            </a>

            <a href="/leaderboard" className="flex items-center gap-2 text-white/80 hover:text-white transition">
              <FaTrophy className="text-white/60" />
              Leaderboard
            </a>

            <a
              href="/event"
              className="group flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white/90 hover:bg-white/10 transition"
            >
              Go to Event
              <FaArrowRight className="transition group-hover:translate-x-0.5" style={{ color: "#1493a0" }} />
            </a>
          </div>
        </nav>

        {/* Right auth */}
        <div className="flex items-center gap-3">
          {!me ? (
            <>
              <a
                href="/login"
                className="rounded-xl px-4 py-2 text-sm font-semibold text-white/80 hover:text-white hover:bg-white/5 transition"
              >
                Login
              </a>

              <a
                href="/signup"
                className="rounded-xl bg-[#077c8a] px-5 py-2 text-sm font-semibold text-white hover:opacity-90 transition"
              >
                Sign Up
              </a>
            </>
          ) : (
            <>
              <a
                href="/profile"
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/90 hover:bg-white/10 transition"
              >
                {me.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={me.avatar}
                    alt="avatar"
                    className="h-7 w-7 rounded-full object-cover ring-1 ring-white/10"
                  />
                ) : (
                  <FaUserCircle className="text-lg text-[#077c8a]" />
                )}
                {me.username}
              </a>

              <button
                onClick={logout}
                className="rounded-xl px-4 py-2 text-sm font-semibold text-white/70 hover:text-white hover:bg-white/5 transition"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
