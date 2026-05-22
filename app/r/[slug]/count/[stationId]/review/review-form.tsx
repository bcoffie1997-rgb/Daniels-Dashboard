"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ShieldCheck, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import type { Station } from "@/lib/seed";
import { Badge } from "@/components/ui/badge";

const storageKey = (slug: string, station: string) =>
  `mise:count:${slug}:${station}`;

export function ReviewForm({
  restaurantSlug,
  restaurantShortName,
  station,
}: {
  restaurantSlug: string;
  restaurantShortName: string;
  station: Station;
}) {
  const router = useRouter();
  const [counts, setCounts] = useState<Record<string, number | "">>({});
  const [hydrated, setHydrated] = useState(false);
  const [witness, setWitness] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey(restaurantSlug, station.name));
      if (raw) setCounts(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, [restaurantSlug, station.name]);

  const rows = useMemo(() => {
    return station.items
      .filter((it) => counts[it.name] !== undefined && counts[it.name] !== "")
      .map((it) => {
        const q = counts[it.name] as number;
        const variancePct =
          it.lastCounted && it.lastCounted > 0
            ? ((q - it.lastCounted) / it.lastCounted) * 100
            : null;
        return { item: it, qty: q, variancePct };
      });
  }, [station.items, counts]);

  const totalCounted = rows.length;
  const totalItems = station.items.length;
  const skipped = totalItems - totalCounted;
  const bigVariances = rows.filter((r) => r.variancePct != null && Math.abs(r.variancePct!) >= 15);
  const dualCountItems = rows.filter((r) => r.item.requiresDualCount);
  const witnessRequired = dualCountItems.length > 0;
  const canSubmit = !witnessRequired || witness.trim().length >= 2;

  function submit() {
    if (!canSubmit) return;
    setSubmitting(true);
    // Mock submit — in production this is a server action that writes a count_session
    setTimeout(() => {
      try {
        localStorage.removeItem(storageKey(restaurantSlug, station.name));
      } catch {}
      setSubmitting(false);
      setDone(true);
    }, 600);
  }

  if (done) {
    return (
      <main className="mx-auto max-w-[700px] px-4 md:px-8 py-16 text-center">
        <div className="h-16 w-16 rounded-full bg-success/20 border border-success/40 flex items-center justify-center mx-auto">
          <CheckCircle2 className="h-8 w-8 text-success" />
        </div>
        <h1 className="font-display text-display-xl mt-6">Count submitted</h1>
        <p className="text-muted-foreground mt-2">
          Sent for manager approval. You'll see it in {restaurantShortName}'s pending queue.
        </p>
        <div className="mt-3 text-sm text-muted-foreground">
          <span className="tabular">{totalCounted}</span> items
          {bigVariances.length > 0 && (
            <>
              {" · "}
              <span className="text-warning tabular">{bigVariances.length}</span> variance
              {bigVariances.length === 1 ? "" : "s"} &gt; 15%
            </>
          )}
          {witness && (
            <>
              {" · "}
              co-counted with <span className="text-foreground">{witness}</span>
            </>
          )}
        </div>
        <div className="mt-8 flex items-center justify-center gap-3 flex-wrap">
          <Link
            href={`/r/${restaurantSlug}`}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2.5 text-sm hover:border-accent/60 transition-colors"
          >
            Back to dashboard
          </Link>
          <Link
            href={`/r/${restaurantSlug}/count`}
            className="inline-flex items-center gap-2 rounded-md bg-accent text-accent-foreground px-4 py-2.5 text-sm font-medium hover:bg-accent/90 transition-colors"
          >
            Count another station
          </Link>
        </div>
      </main>
    );
  }

  if (!hydrated) {
    return (
      <main className="mx-auto max-w-[1400px] px-4 md:px-8 py-12 text-center text-muted-foreground">
        <Loader2 className="h-5 w-5 animate-spin mx-auto" />
      </main>
    );
  }

  if (totalCounted === 0) {
    return (
      <main className="mx-auto max-w-[700px] px-4 md:px-8 py-16 text-center">
        <h1 className="font-display text-display-xl">Nothing to review yet.</h1>
        <p className="text-muted-foreground mt-2">
          Enter at least one count on the station first.
        </p>
        <div className="mt-6">
          <Link
            href={`/r/${restaurantSlug}/count/${encodeURIComponent(station.name)}`}
            className="inline-flex items-center gap-2 rounded-md bg-accent text-accent-foreground px-4 py-2.5 text-sm font-medium hover:bg-accent/90 transition-colors"
          >
            Back to counting
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1100px] px-4 md:px-8 py-6 md:py-10 pb-32">
      <Link
        href={`/r/${restaurantSlug}/count/${encodeURIComponent(station.name)}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ChevronLeft className="h-4 w-4" /> Back to counting
      </Link>

      <div className="mb-6">
        <div className="micro text-accent">Step 3 of 3 · Review &amp; submit</div>
        <h1 className="font-display text-display-2xl tracking-tight mt-1.5">{station.name}</h1>
        <p className="text-muted-foreground mt-2 text-sm">
          One last look before this goes to the manager.
        </p>
      </div>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <Stat label="Counted" value={totalCounted} sub={`of ${totalItems}`} />
        <Stat label="Skipped" value={skipped} sub="not entered" tone={skipped > 0 ? "warning" : undefined} />
        <Stat label="Variances >15%" value={bigVariances.length} tone={bigVariances.length > 0 ? "warning" : undefined} />
        <Stat label="2-person items" value={dualCountItems.length} tone={dualCountItems.length > 0 ? "accent" : undefined} />
      </section>

      <div className="rounded-lg border border-border bg-card overflow-hidden mb-6">
        <table className="w-full text-sm">
          <thead className="bg-muted/30">
            <tr className="text-left">
              <th className="micro text-muted-foreground px-4 py-3 font-medium">Item</th>
              <th className="micro text-muted-foreground px-4 py-3 font-medium w-16">Unit</th>
              <th className="micro text-muted-foreground px-4 py-3 font-medium w-24 text-right">Last</th>
              <th className="micro text-muted-foreground px-4 py-3 font-medium w-24 text-right">Counted</th>
              <th className="micro text-muted-foreground px-4 py-3 font-medium w-24 text-right">Δ %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((r, i) => {
              const big = r.variancePct != null && Math.abs(r.variancePct) >= 15;
              return (
                <tr key={i} className={big ? "bg-warning-bg/40" : ""}>
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span>{r.item.name}</span>
                      {r.item.requiresDualCount && (
                        <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border border-accent/40 bg-accent/10 text-accent font-medium">
                          <ShieldCheck className="h-3 w-3" />
                          2-person
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">{r.item.unit}</td>
                  <td className="px-4 py-2.5 text-right tabular text-muted-foreground">
                    {r.item.lastCounted ?? "—"}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular font-medium">{r.qty}</td>
                  <td className="px-4 py-2.5 text-right tabular">
                    {r.variancePct == null ? (
                      <span className="text-muted-foreground">—</span>
                    ) : big ? (
                      <Badge variant="warning">
                        {r.variancePct > 0 ? "+" : ""}
                        {r.variancePct.toFixed(1)}%
                      </Badge>
                    ) : (
                      <span className={r.variancePct < 0 ? "text-foreground" : "text-foreground"}>
                        {r.variancePct > 0 ? "+" : ""}
                        {r.variancePct.toFixed(1)}%
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 2-person attestation */}
      {witnessRequired && (
        <div className="rounded-lg border border-accent/40 bg-accent/5 p-4 mb-6">
          <div className="flex items-start gap-3 mb-3">
            <ShieldCheck className="h-5 w-5 text-accent shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-sm">Two-person verification required</div>
              <div className="text-xs text-muted-foreground mt-1">
                {dualCountItems.length} high-value item
                {dualCountItems.length === 1 ? "" : "s"} (
                {dualCountItems.slice(0, 2).map((r) => r.item.name).join(", ")}
                {dualCountItems.length > 2 && `, +${dualCountItems.length - 2} more`}). A
                second counter must attest the count.
              </div>
            </div>
          </div>
          <label className="block">
            <div className="micro text-muted-foreground mb-1.5">Co-counter name</div>
            <input
              type="text"
              value={witness}
              onChange={(e) => setWitness(e.target.value)}
              placeholder="e.g. Danny Ganem"
              className="w-full h-10 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
            />
          </label>
        </div>
      )}

      {/* Optional notes */}
      <div className="rounded-lg border border-border bg-card p-4 mb-6">
        <label className="block">
          <div className="micro text-muted-foreground mb-1.5">Notes for manager (optional)</div>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anything the manager should know — receiving delays, special prep, etc."
            rows={3}
            className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent resize-none"
          />
        </label>
      </div>

      {bigVariances.length > 0 && (
        <div className="rounded-lg border border-warning/40 bg-warning-bg p-4 mb-6 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
          <div className="text-sm">
            <div className="font-medium">
              {bigVariances.length} variance{bigVariances.length === 1 ? "" : "s"} over 15%
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              The manager will see these flagged. Add a note above if there's a known reason.
            </div>
          </div>
        </div>
      )}

      <div className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/95 backdrop-blur">
        <div className="mx-auto max-w-[1100px] px-4 md:px-8 py-3 flex items-center justify-between gap-3">
          <Link
            href={`/r/${restaurantSlug}/count/${encodeURIComponent(station.name)}`}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Edit counts
          </Link>
          <button
            onClick={submit}
            disabled={!canSubmit || submitting}
            className="inline-flex items-center gap-2 rounded-md bg-accent text-accent-foreground px-5 py-2.5 text-sm font-medium hover:bg-accent/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Submitting…
              </>
            ) : (
              <>Submit for approval</>
            )}
          </button>
        </div>
      </div>
    </main>
  );
}

function Stat({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: number;
  sub?: string;
  tone?: "warning" | "accent" | "destructive";
}) {
  const color =
    tone === "warning"
      ? "text-warning"
      : tone === "accent"
      ? "text-accent"
      : tone === "destructive"
      ? "text-destructive"
      : "text-foreground";
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="micro text-muted-foreground">{label}</div>
      <div className={`font-display text-display-md tabular mt-1.5 ${color}`}>{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}
