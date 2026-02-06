"use client";

import { useEffect, useState } from "react";

type MeResponse = {
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

export function useRequireTeam() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/auth/me", { cache: "no-store" });
        const data: MeResponse = await res.json();

        // not logged in -> login
        if (!data.user) {
          window.location.href = "/login";
          return;
        }

        // logged in but no team -> go team setup (NOT profile)
        if (!data.user.teamId) {
          window.location.href = "/team";
          return;
        }

        setLoading(false);
      } catch {
        window.location.href = "/login";
      }
    })();
  }, []);

  return { loading };
}
