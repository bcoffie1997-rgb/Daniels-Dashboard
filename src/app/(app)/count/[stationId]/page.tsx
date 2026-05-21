"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  useMockStore,
  computeItemsByStation,
  computeEntriesForSession,
} from "@/lib/mock/store";
import { formatQuantity } from "@/lib/format";
import { NumericInputDrawer } from "@/components/count/numeric-input-drawer";
import { Button } from "@/components/ui/button";

export default function CountPage() {
  const { stationId } = useParams<{ stationId: string }>();
  const router = useRouter();

  const station = useMockStore((s) =>
    s.stations.find((st) => st.id === stationId),
  );
  const allItems = useMockStore((s) => s.items);
  const items = useMemo(
    () => computeItemsByStation(allItems, stationId),
    [allItems, stationId],
  );

  const startOrResume = useMockStore((s) => s.startOrResumeSession);
  const saveEntry = useMockStore((s) => s.saveEntry);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [skipped, setSkipped] = useState<Set<string>>(new Set());
  const [drawerItemId, setDrawerItemId] = useState<string | null>(null);

  useEffect(() => {
    if (stationId) {
      const sess = startOrResume(stationId);
      setSessionId(sess.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stationId]);

  const allEntries = useMockStore((s) => s.entries);
  const entries = useMemo(
    () => computeEntriesForSession(allEntries, sessionId ?? "__none__"),
    [allEntries, sessionId],
  );
  const counted = useMemo(
    () => new Set(entries.map((e) => e.item_id)),
    [entries],
  );

  if (!station) {
    return (
      <div className="px-4 py-8 lg:px-8">
        <p className="text-body text-muted-foreground">Station not found.</p>
        <Link
          href="/"
          className="mt-3 inline-block text-body text-accent underline"
        >
          Back to stations
        </Link>
      </div>
    );
  }

  const total = items.length;
  const countedCount = items.filter((i) => counted.has(i.id)).length;
  const drawerItem = items.find((i) => i.id === drawerItemId) ?? null;
  const nextUncounted = (afterId?: string) => {
    const startIdx = afterId
      ? items.findIndex((i) => i.id === afterId) + 1
      : 0;
    for (let idx = startIdx; idx < items.length; idx++) {
      const it = items[idx];
      if (!counted.has(it.id) && !skipped.has(it.id)) return it;
    }
    return null;
  };

  const currentEntryFor = (itemId: string) =>
    entries.find((e) => e.item_id === itemId) ?? null;

  const handleSave = (qty: number) => {
    if (!sessionId || !drawerItemId) return;
    saveEntry(sessionId, drawerItemId, qty);
    setSkipped((s) => {
      const n = new Set(s);
      n.delete(drawerItemId);
      return n;
    });
    setDrawerItemId(null);
  };

  const handleSaveAndNext = (qty: number) => {
    if (!sessionId || !drawerItemId) return;
    saveEntry(sessionId, drawerItemId, qty);
    setSkipped((s) => {
      const n = new Set(s);
      n.delete(drawerItemId);
      return n;
    });
    const next = nextUncounted(drawerItemId);
    setDrawerItemId(next?.id ?? null);
  };

  const handleSkip = () => {
    if (!drawerItemId) return;
    setSkipped((s) => new Set(s).add(drawerItemId));
    const next = nextUncounted(drawerItemId);
    setDrawerItemId(next?.id ?? null);
  };

  const reviewEnabled = countedCount > 0 && sessionId !== null;

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col">
      <div className="sticky top-14 z-20 border-b border-border bg-background/95 px-4 py-3 backdrop-blur lg:top-0 lg:px-8">
        <div className="mx-auto flex max-w-2xl items-center justify-between gap-3">
          <div>
            <p className="caption text-muted-foreground">{station.name}</p>
            <p className="tabular mt-0.5 font-mono text-body text-foreground">
              {countedCount} / {total} counted
            </p>
          </div>
        </div>
      </div>

      <ul className="mx-auto w-full max-w-2xl flex-1 px-4 py-4 lg:px-8">
        {items.map((item) => {
          const entry = currentEntryFor(item.id);
          const isSkipped = skipped.has(item.id);
          const state: "counted" | "skipped" | "uncounted" = entry
            ? "counted"
            : isSkipped
              ? "skipped"
              : "uncounted";
          return (
            <li key={item.id}>
              <button
                onClick={() => setDrawerItemId(item.id)}
                className={cn(
                  "flex min-h-[72px] w-full items-center gap-3 border-b border-border bg-transparent px-3 py-3 text-left transition-colors hover:bg-card",
                  "border-l-[3px]",
                  state === "counted" && "border-l-accent",
                  state === "skipped" && "border-l-warning",
                  state === "uncounted" && "border-l-transparent",
                )}
              >
                <div className="flex-1 min-w-0">
                  <p className="truncate text-body font-medium text-foreground">
                    {item.name}
                  </p>
                  <p className="caption mt-0.5 text-muted-foreground">
                    Unit: {item.unit}
                    {entry?.previous_quantity !== null &&
                    entry?.previous_quantity !== undefined
                      ? ` · Last: ${formatQuantity(entry.previous_quantity, item.unit)}`
                      : ""}
                  </p>
                </div>
                <div className="tabular text-right font-mono text-body-lg text-foreground">
                  {entry
                    ? formatQuantity(entry.quantity, item.unit)
                    : isSkipped
                      ? "Skipped"
                      : "—"}
                </div>
              </button>
            </li>
          );
        })}
      </ul>

      <div className="sticky bottom-0 z-20 border-t border-border bg-card/95 px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+12px)] backdrop-blur lg:px-8">
        <div className="mx-auto flex max-w-2xl gap-3">
          <Link href="/" className="flex-1">
            <Button variant="outline" className="h-12 w-full border-border">
              Save & continue later
            </Button>
          </Link>
          <Button
            disabled={!reviewEnabled}
            onClick={() =>
              sessionId && router.push(`/count/${stationId}/review`)
            }
            className="h-12 flex-1 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            Review & submit
          </Button>
        </div>
      </div>

      <NumericInputDrawer
        open={!!drawerItemId}
        onOpenChange={(o) => {
          if (!o) setDrawerItemId(null);
        }}
        item={drawerItem}
        previousQuantity={
          drawerItem
            ? (currentEntryFor(drawerItem.id)?.previous_quantity ?? null)
            : null
        }
        currentQuantity={
          drawerItem ? (currentEntryFor(drawerItem.id)?.quantity ?? null) : null
        }
        onSave={handleSave}
        onSaveAndNext={handleSaveAndNext}
        onSkip={handleSkip}
        hasNext={!!nextUncounted(drawerItemId ?? undefined)}
      />
    </div>
  );
}
