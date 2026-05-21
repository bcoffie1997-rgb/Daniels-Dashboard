"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { HorizontalBars } from "@/components/charts/bar-chart";
import { MetricTile } from "@/components/charts/metric-tile";
import { useMockStore } from "@/lib/mock/store";
import { classifyVariance } from "@/lib/variance";

export default function InventoryInsightsPage() {
  const sessions = useMockStore((s) => s.sessions);
  const entries = useMockStore((s) => s.entries);
  const items = useMockStore((s) => s.items);
  const stations = useMockStore((s) => s.stations);

  const submittedOrApproved = useMemo(
    () =>
      sessions.filter(
        (s) => s.status === "submitted" || s.status === "approved",
      ),
    [sessions],
  );

  const allRecentEntries = useMemo(
    () =>
      entries.filter((e) =>
        submittedOrApproved.some((s) => s.id === e.session_id),
      ),
    [entries, submittedOrApproved],
  );

  const flagged = useMemo(
    () =>
      allRecentEntries.filter((e) => {
        const cls = classifyVariance(e.variance_pct);
        return cls === "warn" || cls === "danger";
      }),
    [allRecentEntries],
  );

  // Top variance items: sum |variance| by item across recent entries
  const topVariance = useMemo(() => {
    const map = new Map<string, { abs: number; count: number }>();
    for (const e of allRecentEntries) {
      if (e.variance_pct === null) continue;
      const prev = map.get(e.item_id) ?? { abs: 0, count: 0 };
      map.set(e.item_id, {
        abs: prev.abs + Math.abs(e.variance_pct),
        count: prev.count + 1,
      });
    }
    return Array.from(map.entries())
      .map(([item_id, v]) => {
        const item = items.find((i) => i.id === item_id);
        return item
          ? { item, avgAbs: v.abs / v.count, count: v.count }
          : null;
      })
      .filter((x): x is NonNullable<typeof x> => x !== null)
      .sort((a, b) => b.avgAbs - a.avgAbs)
      .slice(0, 8);
  }, [allRecentEntries, items]);

  const stationCoverage = useMemo(() => {
    return stations
      .filter((s) => s.active)
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((st) => {
        const recent = submittedOrApproved.filter(
          (sess) => sess.station_id === st.id,
        );
        const itemCount = items.filter(
          (i) => i.station_id === st.id && i.active,
        ).length;
        return {
          station: st,
          sessions: recent.length,
          items: itemCount,
        };
      });
  }, [stations, submittedOrApproved, items]);

  return (
    <>
      <p className="text-body text-muted-foreground">
        Inventory health rolls up from submitted counts. Once a few weeks of
        counting pass, this view will show par adherence over time and waste
        signals month over month.
      </p>

      <div className="my-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricTile
          label="Active stations"
          value={`${stationCoverage.length}`}
          hint="Counted in physical walk order"
        />
        <MetricTile
          label="Active items"
          value={`${items.filter((i) => i.active).length}`}
        />
        <MetricTile
          label="Recent submissions"
          value={`${submittedOrApproved.length}`}
          hint="Submitted or approved sessions"
        />
        <MetricTile
          label="Flagged entries"
          value={`${flagged.length}`}
          hint=">20% variance"
        />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="bg-card p-5">
          <h2 className="font-display text-display-md text-foreground">
            Top variance items
          </h2>
          <p className="caption mb-4 text-muted-foreground">
            Average |variance %| across recent counts
          </p>
          {topVariance.length === 0 ? (
            <p className="text-body text-muted-foreground">
              Not enough count history yet. Submit a few sessions to see this.
            </p>
          ) : (
            <HorizontalBars
              variant="warning"
              rows={topVariance.map((r) => ({
                label: r.item.name,
                value: r.avgAbs,
                hint: `${r.count} count${r.count === 1 ? "" : "s"}`,
              }))}
              valueFormat={(n) => `${Math.round(n)}%`}
            />
          )}
        </Card>

        <Card className="bg-card p-5">
          <h2 className="font-display text-display-md text-foreground">
            Station coverage
          </h2>
          <p className="caption mb-4 text-muted-foreground">
            Submissions per station
          </p>
          <ul className="flex flex-col gap-3">
            {stationCoverage.map((row) => (
              <li
                key={row.station.id}
                className="flex items-center justify-between gap-3"
              >
                <div>
                  <p className="text-body text-foreground">{row.station.name}</p>
                  <p className="caption text-muted-foreground">
                    {row.items} item{row.items === 1 ? "" : "s"}
                  </p>
                </div>
                <span className="tabular caption font-mono text-foreground">
                  {row.sessions} session{row.sessions === 1 ? "" : "s"}
                </span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="bg-card p-5">
        <h2 className="font-display text-display-md text-foreground">
          Reading this page
        </h2>
        <ul className="mt-3 flex list-disc flex-col gap-2 pl-5 text-body text-muted-foreground">
          <li>
            Once 4–6 weeks of counts are in, the top-variance list becomes the
            chronic-outlier list — items that are always off. Those are the
            purchasing or par-level conversations to have.
          </li>
          <li>
            Sage = stable. Warm gold = drifting. Terracotta = something to
            investigate this week.
          </li>
          <li>
            The full audit log is in the admin section.
          </li>
        </ul>
      </Card>
    </>
  );
}
