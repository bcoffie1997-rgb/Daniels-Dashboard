"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  useMockStore,
  computeEntriesForSession,
} from "@/lib/mock/store";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/count/status-badge";
import { VarianceBadge } from "@/components/count/variance-badge";
import { formatQuantity, relativeFromNow } from "@/lib/format";

export default function SessionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const session = useMockStore((s) =>
    s.sessions.find((sess) => sess.id === id),
  );
  const station = useMockStore((s) =>
    session ? s.stations.find((st) => st.id === session.station_id) : null,
  );
  const counter = useMockStore((s) =>
    session ? s.users.find((u) => u.id === session.user_id) : null,
  );
  const items = useMockStore((s) => s.items);
  const allEntries = useMockStore((s) => s.entries);
  const entries = useMemo(
    () => computeEntriesForSession(allEntries, id ?? "__none__"),
    [allEntries, id],
  );

  if (!session || !station) {
    return (
      <div className="px-4 py-8 lg:px-8">
        <p className="text-body text-muted-foreground">Session not found.</p>
        <Link
          href="/sessions"
          className="mt-3 inline-block text-body text-accent underline"
        >
          Back to my counts
        </Link>
      </div>
    );
  }

  const sorted = [...entries].sort(
    (a, b) => Math.abs(b.variance_pct ?? 0) - Math.abs(a.variance_pct ?? 0),
  );

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 lg:px-8 lg:py-10">
      <header className="mb-6">
        <p className="caption text-muted-foreground">{station.name}</p>
        <div className="mt-1 flex flex-wrap items-baseline justify-between gap-3">
          <h1 className="font-display text-display-lg text-foreground">
            Count session
          </h1>
          <StatusBadge status={session.status} />
        </div>
        <p className="mt-2 text-body-sm text-muted-foreground">
          {counter?.full_name ?? "Unknown counter"} ·{" "}
          {session.submitted_at
            ? `Submitted ${relativeFromNow(session.submitted_at)}`
            : `Started ${relativeFromNow(session.started_at)}`}
        </p>
      </header>

      {session.rejection_reason && (
        <Card className="mb-6 border-destructive/30 bg-destructive/10 p-4">
          <p className="caption text-destructive">Rejection reason</p>
          <p className="mt-1 text-body text-foreground">
            {session.rejection_reason}
          </p>
        </Card>
      )}

      {session.notes && (
        <Card className="mb-6 bg-card p-4">
          <p className="caption text-muted-foreground">Counter notes</p>
          <p className="mt-1 text-body text-foreground">{session.notes}</p>
        </Card>
      )}

      {session.manager_notes && (
        <Card className="mb-6 bg-card p-4">
          <p className="caption text-muted-foreground">Manager notes</p>
          <p className="mt-1 text-body text-foreground">
            {session.manager_notes}
          </p>
        </Card>
      )}

      <h2 className="caption mb-3 text-muted-foreground">
        Entries · {sorted.length}
      </h2>
      <Card className="overflow-hidden bg-card p-0">
        <ul className="divide-y divide-border">
          {sorted.map((e) => {
            const item = items.find((i) => i.id === e.item_id);
            if (!item) return null;
            return (
              <li
                key={e.id}
                className="grid grid-cols-[1fr_auto_auto] items-center gap-4 px-4 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-body text-foreground">
                    {item.name}
                  </p>
                  <p className="caption text-muted-foreground">
                    Last {formatQuantity(e.previous_quantity, item.unit)}
                  </p>
                </div>
                <p className="tabular text-right font-mono text-body text-foreground">
                  {formatQuantity(e.quantity, item.unit)}
                </p>
                <VarianceBadge variance_pct={e.variance_pct} />
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}
