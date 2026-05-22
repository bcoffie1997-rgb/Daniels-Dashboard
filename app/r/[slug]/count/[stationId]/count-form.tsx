"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ShieldCheck, AlertTriangle, CheckCircle2 } from "lucide-react";
import type { Station } from "@/lib/seed";
import { cn } from "@/lib/cn";

type CountState = Record<string, number | "">; // itemName → quantity entered

const storageKey = (slug: string, station: string) =>
  `mise:count:${slug}:${station}`;

export function CountForm({
  restaurantSlug,
  restaurantAccent,
  station,
}: {
  restaurantSlug: string;
  restaurantAccent: string;
  station: Station;
}) {
  const router = useRouter();
  const [counts, setCounts] = useState<CountState>({});
  const [hydrated, setHydrated] = useState(false);

  // Load any in-progress count
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey(restaurantSlug, station.name));
      if (raw) setCounts(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, [restaurantSlug, station.name]);

  // Persist on change
  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(storageKey(restaurantSlug, station.name), JSON.stringify(counts));
    } catch {}
  }, [counts, hydrated, restaurantSlug, station.name]);

  const totalItems = station.items.length;
  const countedItems = useMemo(
    () => station.items.filter((it) => counts[it.name] !== undefined && counts[it.name] !== "").length,
    [station.items, counts],
  );
  const progressPct = totalItems > 0 ? Math.round((countedItems / totalItems) * 100) : 0;

  function setQty(itemName: string, val: string) {
    if (val === "") {
      setCounts((c) => ({ ...c, [itemName]: "" }));
      return;
    }
    const n = parseFloat(val);
    if (!Number.isNaN(n) && n >= 0) {
      setCounts((c) => ({ ...c, [itemName]: n }));
    }
  }

  function clearAll() {
    if (confirm("Clear all entered counts for this station?")) {
      setCounts({});
      localStorage.removeItem(storageKey(restaurantSlug, station.name));
    }
  }

  function reviewAndSubmit() {
    if (countedItems === 0) {
      alert("Enter at least one count before continuing.");
      return;
    }
    router.push(`/r/${restaurantSlug}/count/${encodeURIComponent(station.name)}/review`);
  }

  return (
    <>
      {/* Sticky progress header */}
      <div className="sticky top-16 z-30 bg-background/95 backdrop-blur border-b border-border">
        <div className="mx-auto max-w-[1400px] px-4 md:px-8 py-3">
          <div className="flex items-center justify-between gap-3">
            <Link
              href={`/r/${restaurantSlug}/count`}
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="h-4 w-4" /> Stations
            </Link>
            <div className="text-xs text-muted-foreground tabular shrink-0">
              {countedItems} / {totalItems}
            </div>
          </div>
          <div className="mt-2 h-1 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full transition-all duration-200"
              style={{ width: `${progressPct}%`, backgroundColor: restaurantAccent }}
            />
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[1400px] px-4 md:px-8 py-6 md:py-8 pb-32">
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="micro text-accent">Step 2 of 3 · Counting</span>
          </div>
          <h1 className="font-display text-display-xl tracking-tight">{station.name}</h1>
          <p className="text-muted-foreground mt-2 text-sm">
            Items are in physical walk order. Tap the field, type the count, hit Next.
          </p>
        </div>

        <ul className="space-y-2">
          {station.items.map((it, i) => {
            const value = counts[it.name];
            const filled = value !== undefined && value !== "";
            const numericValue = typeof value === "number" ? value : null;
            const variancePct =
              numericValue != null && it.lastCounted && it.lastCounted > 0
                ? ((numericValue - it.lastCounted) / it.lastCounted) * 100
                : null;
            const bigVariance =
              variancePct != null && Math.abs(variancePct) >= 15;

            return (
              <li
                key={it.name}
                className={cn(
                  "rounded-lg border bg-card overflow-hidden",
                  filled ? "border-accent/40" : "border-border",
                  bigVariance && "border-warning/60",
                )}
              >
                <div className="px-4 py-3 flex items-center gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-muted-foreground tabular">{(i + 1).toString().padStart(2, "0")}</span>
                      <span className="font-medium">{it.name}</span>
                      {it.requiresDualCount && (
                        <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border border-accent/40 bg-accent/10 text-accent font-medium">
                          <ShieldCheck className="h-3 w-3" />
                          2-person
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-x-3">
                      <span>
                        Unit: <span className="text-foreground">{it.unit}</span>
                      </span>
                      {it.par != null && (
                        <span>
                          Par: <span className="text-foreground tabular">{it.par}</span>
                        </span>
                      )}
                      {it.lastCounted != null && (
                        <span>
                          Last: <span className="text-foreground tabular">{it.lastCounted}</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.1"
                      min="0"
                      value={value ?? ""}
                      onChange={(e) => setQty(it.name, e.target.value)}
                      placeholder="—"
                      className="w-24 sm:w-28 h-12 rounded-md border border-border bg-background text-right pr-3 pl-2 text-lg tabular focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
                      aria-label={`Quantity for ${it.name} in ${it.unit}`}
                    />
                    {filled ? (
                      <CheckCircle2 className="h-5 w-5 text-accent" />
                    ) : (
                      <div className="h-5 w-5" />
                    )}
                  </div>
                </div>
                {bigVariance && (
                  <div className="bg-warning-bg border-t border-warning/30 px-4 py-2 text-xs text-warning flex items-center gap-2">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>
                      Variance {variancePct! > 0 ? "+" : ""}{variancePct!.toFixed(1)}% vs last
                      count. Double-check before submit.
                    </span>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </main>

      {/* Sticky bottom action bar */}
      <div className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-[1400px] px-4 md:px-8 py-3 flex items-center justify-between gap-3">
          <button
            onClick={clearAll}
            className="text-sm text-muted-foreground hover:text-destructive"
          >
            Clear all
          </button>
          <div className="text-xs text-muted-foreground tabular hidden sm:block">
            {countedItems === totalItems
              ? "All items counted"
              : `${totalItems - countedItems} item${totalItems - countedItems === 1 ? "" : "s"} left`}
          </div>
          <button
            onClick={reviewAndSubmit}
            disabled={countedItems === 0}
            className="inline-flex items-center gap-2 rounded-md bg-accent text-accent-foreground px-4 py-2.5 text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Review &amp; submit <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </>
  );
}
