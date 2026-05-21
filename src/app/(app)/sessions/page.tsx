"use client";

import Link from "next/link";
import { useMockStore, selectCurrentUser } from "@/lib/mock/store";
import { StatusBadge } from "@/components/count/status-badge";
import { Card } from "@/components/ui/card";
import { relativeFromNow } from "@/lib/format";

export default function MySessionsPage() {
  const user = useMockStore(selectCurrentUser);
  const sessions = useMockStore((s) =>
    s.sessions
      .filter((sess) => sess.user_id === user?.id)
      .sort(
        (a, b) =>
          new Date(b.submitted_at ?? b.started_at).getTime() -
          new Date(a.submitted_at ?? a.started_at).getTime(),
      ),
  );
  const stations = useMockStore((s) => s.stations);
  const entriesByCount = useMockStore((s) => {
    const map = new Map<string, number>();
    s.entries.forEach((e) => {
      map.set(e.session_id, (map.get(e.session_id) ?? 0) + 1);
    });
    return map;
  });

  return (
    <div className="mx-auto max-w-2xl px-4 py-6 lg:px-8 lg:py-10">
      <header className="mb-6">
        <h1 className="font-display text-display-lg text-foreground">
          My counts
        </h1>
        <p className="mt-2 text-body text-muted-foreground">
          Sessions you&apos;ve started, newest first.
        </p>
      </header>

      {sessions.length === 0 ? (
        <Card className="bg-card p-6 text-center">
          <p className="text-body text-muted-foreground">
            No counts yet. Start one from the station picker.
          </p>
        </Card>
      ) : (
        <ul className="flex flex-col gap-3">
          {sessions.map((sess) => {
            const station = stations.find((st) => st.id === sess.station_id);
            const count = entriesByCount.get(sess.id) ?? 0;
            return (
              <li key={sess.id}>
                <Link
                  href={`/sessions/${sess.id}`}
                  className="block rounded-xl border border-border bg-card p-4 transition-colors hover:border-accent/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-body font-medium text-foreground">
                        {station?.name ?? "Unknown station"}
                      </p>
                      <p className="caption mt-1 text-muted-foreground">
                        {sess.submitted_at
                          ? `Submitted ${relativeFromNow(sess.submitted_at)}`
                          : `Started ${relativeFromNow(sess.started_at)}`}
                        {" · "}
                        {count} items
                      </p>
                    </div>
                    <StatusBadge status={sess.status} />
                  </div>
                  {sess.status === "rejected" && sess.rejection_reason && (
                    <p className="mt-3 rounded-md border border-destructive/20 bg-destructive/10 p-2 text-body-sm text-destructive">
                      {sess.rejection_reason}
                    </p>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
