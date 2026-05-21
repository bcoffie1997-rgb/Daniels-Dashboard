"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

// Demo-only: cycles online → syncing → online so a stakeholder can see the
// three states without unplugging Wi-Fi. Real implementation arrives in
// Sprint 4 (offline sync).

type State = "online" | "syncing";

export function SyncIndicator({ className }: { className?: string }) {
  const [state, setState] = useState<State>("online");

  useEffect(() => {
    const id = setInterval(() => {
      setState((prev) => (prev === "online" ? "syncing" : "online"));
    }, 6000);
    return () => clearInterval(id);
  }, []);

  const label = state === "online" ? "Online" : "Syncing";
  return (
    <span
      className={cn(
        "caption inline-flex items-center gap-1.5 text-muted-foreground",
        className,
      )}
      aria-live="polite"
    >
      <span
        className={cn(
          "inline-block h-2 w-2 rounded-full",
          state === "online" ? "bg-accent" : "bg-warning animate-pulse",
        )}
      />
      {label}
    </span>
  );
}
