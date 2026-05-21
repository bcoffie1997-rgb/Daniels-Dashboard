"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useMockStore, selectCurrentUser } from "@/lib/mock/store";
import { StatCard } from "@/components/manager/stat-card";
import { StatusBadge } from "@/components/count/status-badge";
import { Card } from "@/components/ui/card";
import { absoluteTime, relativeFromNow } from "@/lib/format";
import { classifyVariance } from "@/lib/variance";

export default function ManagerDashboardPage() {
  const user = useMockStore(selectCurrentUser);
  const sessions = useMockStore((s) => s.sessions);
  const users = useMockStore((s) => s.users);
  const stations = useMockStore((s) => s.stations);
  const entries = useMockStore((s) => s.entries);

  const sorted = useMemo(
    () =>
      [...sessions].sort(
        (a, b) =>
          new Date(b.submitted_at ?? b.started_at).getTime() -
          new Date(a.submitted_at ?? a.started_at).getTime(),
      ),
    [sessions],
  );

  const flaggedByCount = useMemo(() => {
    const map = new Map<string, number>();
    entries.forEach((e) => {
      const cls = classifyVariance(e.variance_pct);
      if (cls === "warn" || cls === "danger") {
        map.set(e.session_id, (map.get(e.session_id) ?? 0) + 1);
      }
    });
    return map;
  }, [entries]);

  const entryCountBySession = useMemo(() => {
    const map = new Map<string, number>();
    entries.forEach((e) => {
      map.set(e.session_id, (map.get(e.session_id) ?? 0) + 1);
    });
    return map;
  }, [entries]);

  if (!user || (user.role !== "manager" && user.role !== "admin")) {
    return (
      <div className="px-4 py-8 lg:px-8">
        <p className="text-body text-muted-foreground">
          Manager access required.
        </p>
        <Link
          href="/403"
          className="mt-3 inline-block text-body text-accent underline"
        >
          More info
        </Link>
      </div>
    );
  }

  const sessionsToday = sorted.filter((s) => {
    const t = new Date(s.submitted_at ?? s.started_at).getTime();
    return Date.now() - t < 24 * 60 * 60 * 1000;
  });
  const itemsCountedToday = sessionsToday.reduce(
    (sum, s) => sum + (entryCountBySession.get(s.id) ?? 0),
    0,
  );
  const flaggedToday = sessionsToday.reduce(
    (sum, s) => sum + (flaggedByCount.get(s.id) ?? 0),
    0,
  );
  const submittedAwaiting = sorted.filter(
    (s) => s.status === "submitted",
  ).length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 lg:px-8 lg:py-10">
      <header className="mb-6">
        <p className="caption text-muted-foreground">Today</p>
        <h1 className="mt-1 font-display text-display-lg text-foreground lg:text-display-xl">
          Manager dashboard
        </h1>
      </header>

      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Sessions today" value={sessionsToday.length} />
        <StatCard label="Items counted" value={itemsCountedToday} />
        <StatCard
          label="Flagged items"
          value={flaggedToday}
          hint=">20% variance"
        />
        <StatCard
          label="Awaiting review"
          value={submittedAwaiting}
          hint="Submitted, not yet approved"
        />
      </div>

      <h2 className="caption mb-3 text-muted-foreground">Recent sessions</h2>
      <Card className="overflow-hidden bg-card p-0">
        <div className="hidden lg:block">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border text-left">
                <Th>Submitted</Th>
                <Th>Station</Th>
                <Th>Counter</Th>
                <Th className="text-right">Items</Th>
                <Th className="text-right">Flagged</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((s) => {
                const station = stations.find((st) => st.id === s.station_id);
                const counter = users.find((u) => u.id === s.user_id);
                const flagged = flaggedByCount.get(s.id) ?? 0;
                return (
                  <tr
                    key={s.id}
                    className="border-b border-border last:border-b-0 transition-colors hover:bg-popover"
                  >
                    <Td>
                      <Link
                        href={`/dashboard/${s.id}`}
                        className="block py-3"
                      >
                        <span className="text-body text-foreground">
                          {relativeFromNow(s.submitted_at ?? s.started_at)}
                        </span>
                        <span className="caption mt-0.5 block text-muted-foreground">
                          {absoluteTime(s.submitted_at ?? s.started_at)}
                        </span>
                      </Link>
                    </Td>
                    <Td>
                      <Link
                        href={`/dashboard/${s.id}`}
                        className="block py-3 text-body text-foreground"
                      >
                        {station?.name}
                      </Link>
                    </Td>
                    <Td>
                      <Link
                        href={`/dashboard/${s.id}`}
                        className="block py-3 text-body text-foreground"
                      >
                        {counter?.full_name}
                      </Link>
                    </Td>
                    <Td className="text-right">
                      <Link
                        href={`/dashboard/${s.id}`}
                        className="tabular block py-3 font-mono text-body text-foreground"
                      >
                        {entryCountBySession.get(s.id) ?? 0}
                      </Link>
                    </Td>
                    <Td className="text-right">
                      <Link
                        href={`/dashboard/${s.id}`}
                        className="tabular block py-3 font-mono text-body"
                      >
                        <span
                          className={
                            flagged > 0
                              ? "text-warning"
                              : "text-muted-foreground"
                          }
                        >
                          {flagged}
                        </span>
                      </Link>
                    </Td>
                    <Td>
                      <Link href={`/dashboard/${s.id}`} className="block py-3">
                        <StatusBadge status={s.status} />
                      </Link>
                    </Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <ul className="divide-y divide-border lg:hidden">
          {sorted.map((s) => {
            const station = stations.find((st) => st.id === s.station_id);
            const counter = users.find((u) => u.id === s.user_id);
            const flagged = flaggedByCount.get(s.id) ?? 0;
            const itemCount = entryCountBySession.get(s.id) ?? 0;
            return (
              <li key={s.id}>
                <Link href={`/dashboard/${s.id}`} className="block px-4 py-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-body font-medium text-foreground">
                        {station?.name}
                      </p>
                      <p className="caption mt-1 text-muted-foreground">
                        {counter?.full_name} ·{" "}
                        {relativeFromNow(s.submitted_at ?? s.started_at)}
                      </p>
                      <p className="caption mt-1 text-muted-foreground">
                        {itemCount} items
                        {flagged > 0 && (
                          <>
                            {" · "}
                            <span className="text-warning">
                              {flagged} flagged
                            </span>
                          </>
                        )}
                      </p>
                    </div>
                    <StatusBadge status={s.status} />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}

function Th({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`caption px-4 py-3 font-medium text-muted-foreground ${className ?? ""}`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-4 align-middle ${className ?? ""}`}>{children}</td>;
}
