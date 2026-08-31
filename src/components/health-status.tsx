"use client";

import { useEffect, useState } from "react";

import { getHealth, type HealthResponse } from "@/lib/api";

type HealthState =
  | { status: "loading" }
  | { status: "online"; response: HealthResponse }
  | { status: "offline" };

export function HealthStatus() {
  const [health, setHealth] = useState<HealthState>({ status: "loading" });

  useEffect(() => {
    let active = true;

    getHealth()
      .then((response) => {
        if (active) setHealth({ status: "online", response });
      })
      .catch(() => {
        if (active) setHealth({ status: "offline" });
      });

    return () => {
      active = false;
    };
  }, []);

  if (health.status === "loading") {
    return <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs text-ink shadow-sm"><span className="size-2 animate-pulse rounded-full bg-amber-500" />Checking API…</div>;
  }

  if (health.status === "offline") {
    return <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs text-rose-600 shadow-sm"><span className="size-2 rounded-full bg-rose-500" />API unavailable</div>;
  }

  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-xs text-emerald-700 shadow-sm">
      <span className="size-2 rounded-full bg-emerald-500" />
      API {health.response.status} <span className="text-muted">{health.response.service}</span>
    </div>
  );
}
