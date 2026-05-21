"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { LineChart } from "@/components/charts/line-chart";
import { HorizontalBars } from "@/components/charts/bar-chart";
import { MetricTile } from "@/components/charts/metric-tile";
import { RangePicker, type RangePeriod } from "@/components/charts/range-picker";
import {
  wineBottles,
  wineSales,
  metricsInRange,
  rangeDates,
  sum,
  formatMoney,
} from "@/lib/mock/insights";

export default function WineInsightsPage() {
  const [period, setPeriod] = useState<RangePeriod>("90d");
  const { start, end } = rangeDates(period);

  const days = useMemo(() => metricsInRange(start, end), [start, end]);
  const monthsInRange = useMemo(() => {
    const set = new Set<string>();
    days.forEach((d) => set.add(d.date.slice(0, 7)));
    return Array.from(set).sort();
  }, [days]);

  const inRange = useMemo(
    () => wineSales.filter((s) => monthsInRange.includes(s.yearMonth)),
    [monthsInRange],
  );

  const byBottle = useMemo(() => {
    const map = new Map<string, { bottles: number; revenue: number }>();
    for (const s of inRange) {
      const prev = map.get(s.bottle_id) ?? { bottles: 0, revenue: 0 };
      map.set(s.bottle_id, {
        bottles: prev.bottles + s.bottles_sold,
        revenue: prev.revenue + s.revenue,
      });
    }
    return map;
  }, [inRange]);

  const rows = useMemo(() => {
    return wineBottles
      .map((wb) => {
        const tot = byBottle.get(wb.id) ?? { bottles: 0, revenue: 0 };
        const margin = tot.revenue - tot.bottles * wb.cost;
        const daysInRange = days.length;
        const turnsPerMonth =
          daysInRange > 0 ? (tot.bottles / daysInRange) * 30 : 0;
        return {
          bottle: wb,
          bottles: tot.bottles,
          revenue: tot.revenue,
          margin,
          turnsPerMonth,
        };
      })
      .sort((a, b) => b.revenue - a.revenue);
  }, [byBottle, days]);

  const totalBottles = sum(rows, (r) => r.bottles);
  const totalRevenue = sum(rows, (r) => r.revenue);
  const totalMargin = sum(rows, (r) => r.margin);

  // Dead inventory: bottles with zero or 1 sales in range
  const deadInventory = useMemo(
    () => rows.filter((r) => r.bottles <= 1).slice(0, 6),
    [rows],
  );

  // Monthly revenue trend
  const monthlyRevenue = useMemo(() => {
    const map = new Map<string, number>();
    for (const s of inRange) {
      map.set(s.yearMonth, (map.get(s.yearMonth) ?? 0) + s.revenue);
    }
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([ym, v]) => ({ x: ym.slice(2), y: v }));
  }, [inRange]);

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-body text-muted-foreground">
          Wine cellar · {start} to {end}
        </p>
        <RangePicker value={period} onChange={setPeriod} />
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricTile
          label="Bottles sold"
          value={totalBottles.toLocaleString("en-US")}
        />
        <MetricTile
          label="Wine revenue"
          value={formatMoney(totalRevenue, { compact: true })}
        />
        <MetricTile
          label="Estimated margin"
          value={formatMoney(totalMargin, { compact: true })}
          hint={`${((totalMargin / Math.max(totalRevenue, 1)) * 100).toFixed(1)}% gross`}
        />
        <MetricTile
          label="Cellar SKUs"
          value={`${wineBottles.length}`}
          hint="Active list"
        />
      </div>

      <Card className="mb-6 bg-card p-5">
        <h2 className="font-display text-display-md text-foreground">
          Monthly wine revenue
        </h2>
        <p className="caption mb-3 text-muted-foreground">
          Pace of the program across the range
        </p>
        <LineChart
          data={monthlyRevenue}
          height={220}
          yLabel={(v) => formatMoney(v, { compact: true })}
        />
      </Card>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="bg-card p-5">
          <h2 className="font-display text-display-md text-foreground">
            Top bottles by revenue
          </h2>
          <p className="caption mb-4 text-muted-foreground">
            What&apos;s actually moving
          </p>
          <HorizontalBars
            rows={rows.slice(0, 8).map((r) => ({
              label: `${r.bottle.name} ${r.bottle.vintage}`,
              value: r.revenue,
              hint: `${r.bottles} bottle${r.bottles === 1 ? "" : "s"}`,
            }))}
            valueFormat={(n) => formatMoney(n, { compact: true })}
          />
        </Card>

        <Card className="bg-card p-5">
          <h2 className="font-display text-display-md text-foreground">
            Dead inventory
          </h2>
          <p className="caption mb-4 text-muted-foreground">
            Bottles with one or zero sales in range — review the list
          </p>
          {deadInventory.length === 0 ? (
            <p className="text-body text-muted-foreground">
              No dead inventory in this range.
            </p>
          ) : (
            <ul className="flex flex-col gap-3">
              {deadInventory.map((r) => (
                <li
                  key={r.bottle.id}
                  className="flex items-start justify-between gap-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-body-sm text-foreground">
                      {r.bottle.name} {r.bottle.vintage}
                    </p>
                    <p className="caption text-muted-foreground">
                      {r.bottle.region} · listed at {formatMoney(r.bottle.list_price)}
                    </p>
                  </div>
                  <span className="tabular shrink-0 caption text-warning">
                    {r.bottles} sold
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
            Full cellar
          </h2>
          <p className="caption text-muted-foreground">
            Sorted by revenue · turns is bottles sold per month in range
          </p>
        </div>
        <ul className="divide-y divide-border">
          {rows.map((r) => (
            <li
              key={r.bottle.id}
              className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 px-5 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-body text-foreground">
                  {r.bottle.name} {r.bottle.vintage}
                </p>
                <p className="caption text-muted-foreground">
                  {r.bottle.region} · {formatMoney(r.bottle.list_price)} list
                </p>
              </div>
              <p className="tabular text-right font-mono text-body-sm text-foreground">
                {r.bottles}
              </p>
              <p className="tabular text-right font-mono text-body-sm text-foreground">
                {r.turnsPerMonth.toFixed(1)}/mo
              </p>
              <p className="tabular text-right font-mono text-body-sm text-accent">
                {formatMoney(r.revenue, { compact: true })}
              </p>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
