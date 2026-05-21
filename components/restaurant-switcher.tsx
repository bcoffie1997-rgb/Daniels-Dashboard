"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Building2, Check } from "lucide-react";
import { RESTAURANTS, type Restaurant } from "@/lib/restaurants";
import { cn } from "@/lib/cn";

export function RestaurantSwitcher({ current }: { current?: Restaurant }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const fallback = RESTAURANTS[1];
  const active = current ?? fallback;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2.5 rounded-md border border-border bg-card px-3 py-2 text-left hover:border-accent/60 transition-colors"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: active.accentHex }}
          aria-hidden
        />
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-medium">{active.shortName}</span>
          <span className="text-xs text-muted-foreground">{active.city}</span>
        </div>
        <ChevronDown className={cn("h-4 w-4 text-muted-foreground transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute left-0 top-full z-50 mt-2 w-72 rounded-lg border border-border bg-popover p-1.5 shadow-xl">
          {RESTAURANTS.map((r) => {
            const isActive = active.slug === r.slug;
            return (
              <Link
                key={r.slug}
                href={`/r/${r.slug}`}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-md px-3 py-2.5 hover:bg-muted",
                  isActive && "bg-muted",
                )}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: r.accentHex }}
                  />
                  <div>
                    <div className="text-sm font-medium">{r.name}</div>
                    <div className="text-xs text-muted-foreground">{r.city}</div>
                  </div>
                </div>
                {isActive && <Check className="h-4 w-4 text-accent" />}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
