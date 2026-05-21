"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { LineChart } from "@/components/charts/line-chart";
import { HorizontalBars } from "@/components/charts/bar-chart";
import { CalendarHeatmap } from "@/components/charts/calendar-heatmap";
import { MetricTile } from "@/components/charts/metric-tile";
import { RangePicker, type RangePeriod } from "@/components/charts/range-picker";
import {
  barItems,
  barSales,
  metricsInRange,
  rangeDates,
  sum,
  formatMoney,
} from "@/lib/mock/insights";

export default function BarInsightsPage() {
  const [period, setPeriod] = useState<RangePeriod>("30d");
  const { start, end } = rangeDates(period);

  const inRange = useMemo(
    () => barSales.filter((s) => s.date >= start && s.date <= end),
    [start, end],
  );
  const days = useMemo(() => metricsInRange(start, end), [start, end]);

  const byItem = useMemo(() => {
    const map = new Map<string, { units: number; revenue: number }>();
    for (const s of inRange) {
      const prev = map.get(s.item_id) ?? { units: 0, revenue: 0 };
      map.set(s.item_id, {
        units: prev.units + s.units,
        revenue: prev.revenue + s.revenue,
      });
    }
    return map;
  }, [inRange]);

  const itemRows = useMemo(() => {
    return barItems
      .map((it) => {
        const tot = byItem.get(it.id) ?? { units: 0, revenue: 0 };
        return {
          item: it,
          units: tot.units,
          revenue: tot.revenue,
          margin: tot.revenue - tot.units * it.cost,
        };
      })
      .sort((a, b) => b.revenue - a.revenue);
  }, [byItem]);

  const totalUnits = sum(itemRows, (r) => r.units);
  const totalRevenue = sum(itemRows, (r) => r.revenue);
  const totalMargin = sum(itemRows, (r) => r.margin);

  const categoryRows = useMemo(() => {
    const map = new Map<string, { units: number; revenue: number }>();
    for (const r of itemRows) {
      const prev = map.get(r.item.category) ?? { units: 0, revenue: 0 };
      map.set(r.item.category, {
        units: prev.units + r.units,
        revenue: prev.revenue + r.revenue,
      });
    }
    const labelMap: Record<string, string> = {
      cocktail: "Cocktails",
      spirit: "Spirits, neat / rocks",
      wine_btg: "Wine by the glass",
      beer: "Beer",
    };
    return Array.from(map.entries()).map(([cat, v]) => ({
      label: labelMap[cat] ?? cat,
      value: v.revenue,
      hint: `${v.units.toLocaleString()} units`,
    }));
  }, [itemRows]);

  const dailyBevRevenue = useMemo(
    () =>
      days
        .filter((d) => !d.closed)
        .map((d) => ({ x: d.date.slice(5), y: d.bev_revenue })),
    [days],
  );

  const heatmapCells = useMemo(
    () =>
      days
        .filter((d) => !d.closed)
        .map((d) => ({ date: d.date, value: d.bev_revenue })),
    [days],
  );

  // Slow movers — items in the bottom quartile by units in the range, that
  // also have non-zero cost (i.e., tying up shelf or par).
  const slowMovers = useMemo(() => {
    const sorted = [...itemRows].sort((a, b) => a.units - b.units);
    return sorted.slice(0, 5);
  }, [itemRows]);

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-body text-muted-foreground">
          Bar performance · {start} to {end}
        </p>
        <RangePicker value={period} onChange={setPeriod} />
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricTile
          label="Bar revenue"
          value={formatMoney(totalRevenue, { compact: true })}
        />
        <MetricTile
          label="Drinks sold"
          value={totalUnits.toLocaleString("en-US")}
        />
        <MetricTile
          label="Estimated margin"
          value={formatMoney(totalMargin, { compact: true })}
          hint={`${((totalMargin / Math.max(totalRevenue, 1)) * 100).toFixed(1)}% gross`}
        />
        <MetricTile
          label="Active menu"
          value={`${barItems.length}`}
          hint="Cocktails, spirits, BTG, beer"
        />
      </div>

      <Card className="mb-6 bg-card p-5">
        <h2 className="font-display text-display-md text-foreground">
          Beverage revenue, day by day
        </h2>
        <p className="caption text-muted-foreground">
          Closed days excluded. Hover the line to read each day&apos;s number.
        </p>
        <div className="mt-4">
          <LineChart
            data={dailyBevRevenue}
            height={220}
            yLabel={(v) => formatMoney(v, { compact: true })}
          />
        </div>
      </Card>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="bg-card p-5">
          <h2 className="font-display text-display-md text-foreground">
            Top sellers by revenue
          </h2>
          <p className="caption mb-4 text-muted-foreground">
            Top 8 of {barItems.length}
          </p>
          <HorizontalBars
            rows={itemRows.slice(0, 8).map((r) => ({
              label: r.item.name,
              value: r.revenue,
              hint: `${r.units} sold`,
            }))}
            valueFormat={(n) => formatMoney(n, { compact: true })}
          />
        </Card>

        <Card className="bg-card p-5">
          <h2 className="font-display text-display-md text-foreground">
            Slow movers
          </h2>
          <p className="caption mb-4 text-muted-foreground">
            Bottom 5 by units. Candidates for menu refresh.
          </p>
          <HorizontalBars
            variant="warning"
            rows={slowMovers.map((r) => ({
              label: r.item.name,
              value: Math.max(r.units, 1),
              hint: `${formatMoney(r.revenue, { compact: true })}`,
            }))}
            valueFormat={(n) => `${Math.round(n)} sold`}
          />
        </Card>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="bg-card p-5">
          <h2 className="font-display text-display-md text-foreground">
            Category mix
          </h2>
          <p className="caption mb-4 text-muted-foreground">
            Revenue by drink type
          </p>
          <HorizontalBars
            rows={categoryRows.sort((a, b) => b.value - a.value)}
            valueFormat={(n) => formatMoney(n, { compact: true })}
          />
        </Card>

        <Card className="bg-card p-5">
          <h2 className="font-display text-display-md text-foreground">
            Pattern by day
          </h2>
          <p className="caption mb-4 text-muted-foreground">
            Daily beverage revenue. Darker = stronger night.
          </p>
          <CalendarHeatmap
            cells={heatmapCells}
            valueLabel={(v) => formatMoney(v, { compact: true })}
          />
        </Card>
      </div>

      <Card className="bg-card p-0">
        <div className="border-b border-border px-5 py-4">
          <h2 className="font-display text-display-md text-foreground">
            All menu items
          </h2>
          <p className="caption text-muted-foreground">
            Sorted by revenue. Units, revenue, and estimated margin.
          </p>
        </div>
        <ul className="divide-y divide-border">
          {itemRows.map((r) => (
            <li
              key={r.item.id}
              className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 px-5 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-body text-foreground">
                  {r.item.name}
                </p>
                <p className="caption text-muted-foreground">
                  {r.item.category.replace("_", " ")} · ${r.item.price}
                </p>
              </div>
              <p className="tabular text-right font-mono text-body-sm text-foreground">
                {r.units.toLocaleString()}
              </p>
              <p className="tabular text-right font-mono text-body-sm text-foreground">
                {formatMoney(r.revenue, { compact: true })}
              </p>
              <p className="tabular text-right font-mono text-body-sm text-accent">
                {formatMoney(r.margin, { compact: true })}
              </p>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
