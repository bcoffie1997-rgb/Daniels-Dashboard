"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { HorizontalBars } from "@/components/charts/bar-chart";
import { MetricTile } from "@/components/charts/metric-tile";
import { RangePicker, type RangePeriod } from "@/components/charts/range-picker";
import { events, rangeDates, formatMoney, sum, TODAY } from "@/lib/mock/insights";

const TYPE_LABEL: Record<string, string> = {
  wine_dinner: "Wine dinner",
  private_dining: "Private dining",
  buyout: "Full buyout",
  tasting: "Tasting",
  holiday: "Holiday",
};

export default function EventsInsightsPage() {
  const [period, setPeriod] = useState<RangePeriod>("90d");
  const { start, end } = rangeDates(period);

  const inRange = useMemo(
    () => events.filter((e) => e.date >= start && e.date <= end),
    [start, end],
  );
  const completed = inRange.filter((e) => e.status === "completed");
  const upcoming = useMemo(
    () =>
      events
        .filter((e) => e.date > TODAY && e.status === "upcoming")
        .sort((a, b) => a.date.localeCompare(b.date)),
    [],
  );

  const totalRevenue = sum(completed, (e) => e.revenue);
  const totalCovers = sum(completed, (e) => e.covers_shown);
  const avgPerCover = totalCovers > 0 ? totalRevenue / totalCovers : 0;
  const showRate =
    sum(completed, (e) => e.covers_booked) > 0
      ? totalCovers / sum(completed, (e) => e.covers_booked)
      : 0;

  const byType = useMemo(() => {
    const map = new Map<
      string,
      { count: number; revenue: number; covers: number }
    >();
    for (const e of completed) {
      const prev = map.get(e.type) ?? { count: 0, revenue: 0, covers: 0 };
      map.set(e.type, {
        count: prev.count + 1,
        revenue: prev.revenue + e.revenue,
        covers: prev.covers + e.covers_shown,
      });
    }
    return Array.from(map.entries())
      .map(([type, v]) => ({
        label: TYPE_LABEL[type] ?? type,
        value: v.revenue,
        hint: `${v.count} event${v.count === 1 ? "" : "s"} · ${v.covers} covers`,
      }))
      .sort((a, b) => b.value - a.value);
  }, [completed]);

  const topByRevenue = useMemo(
    () => [...completed].sort((a, b) => b.revenue - a.revenue).slice(0, 8),
    [completed],
  );

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-body text-muted-foreground">
          Private events · {start} to {end}
        </p>
        <RangePicker value={period} onChange={setPeriod} />
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricTile
          label="Events"
          value={`${completed.length}`}
          hint={`${upcoming.length} upcoming`}
        />
        <MetricTile
          label="Event revenue"
          value={formatMoney(totalRevenue, { compact: true })}
        />
        <MetricTile
          label="Revenue per cover"
          value={formatMoney(avgPerCover)}
          hint={`${totalCovers.toLocaleString()} covers shown`}
        />
        <MetricTile
          label="Show rate"
          value={`${(showRate * 100).toFixed(0)}%`}
          hint="Shown vs booked"
        />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="bg-card p-5">
          <h2 className="font-display text-display-md text-foreground">
            By type
          </h2>
          <p className="caption mb-4 text-muted-foreground">
            Revenue contribution
          </p>
          <HorizontalBars
            rows={byType}
            valueFormat={(n) => formatMoney(n, { compact: true })}
          />
        </Card>

        <Card className="bg-card p-5">
          <h2 className="font-display text-display-md text-foreground">
            Upcoming bookings
          </h2>
          <p className="caption mb-4 text-muted-foreground">
            Next on the calendar
          </p>
          {upcoming.length === 0 ? (
            <p className="text-body text-muted-foreground">
              No future bookings yet.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {upcoming.slice(0, 8).map((e) => (
                <li
                  key={e.id}
                  className="grid grid-cols-[auto_1fr_auto] items-center gap-3"
                >
                  <span className="tabular caption text-muted-foreground">
                    {e.date}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-body-sm text-foreground">
                      {e.name}
                    </p>
                    <p className="caption text-muted-foreground">
                      {TYPE_LABEL[e.type]}
                    </p>
                  </div>
                  <span className="tabular shrink-0 caption font-mono text-foreground">
                    {e.covers_booked} booked
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card className="bg-card p-0">
        <div className="border-b border-border px-5 py-4">
          <h2 className="font-display text-display-md text-foreground">
            Top events in range
          </h2>
          <p className="caption text-muted-foreground">
            Sorted by revenue · food cost % computed at completion
          </p>
        </div>
        <ul className="divide-y divide-border">
          {topByRevenue.map((e) => {
            const fcPct = e.revenue > 0 ? e.food_cost / e.revenue : 0;
            return (
              <li
                key={e.id}
                className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 px-5 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-body text-foreground">{e.name}</p>
                  <p className="caption text-muted-foreground">
                    {e.date} · {TYPE_LABEL[e.type]}
                  </p>
                </div>
                <p className="tabular text-right font-mono text-body-sm text-foreground">
                  {e.covers_shown}
                </p>
                <p className="tabular text-right font-mono text-body-sm text-foreground">
                  {formatMoney(e.revenue, { compact: true })}
                </p>
                <p
                  className={`tabular text-right font-mono text-body-sm ${
                    fcPct > 0.36
                      ? "text-warning"
                      : fcPct < 0.3
                        ? "text-accent"
                        : "text-foreground"
                  }`}
                >
                  {(fcPct * 100).toFixed(1)}%
                </p>
              </li>
            );
          })}
        </ul>
      </Card>
    </>
  );
}
