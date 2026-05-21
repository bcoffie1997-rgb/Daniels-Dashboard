"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { MetricTile } from "@/components/charts/metric-tile";
import { LineChart } from "@/components/charts/line-chart";
import { HorizontalBars } from "@/components/charts/bar-chart";
import { RangePicker, type RangePeriod } from "@/components/charts/range-picker";
import {
  metricsInRange,
  rangeDates,
  sum,
  formatMoney,
  formatPct,
  formatChangePct,
  changePct,
  barItems,
  barSales,
  wineBottles,
  wineSales,
  events,
  TODAY,
} from "@/lib/mock/insights";

export default function InsightsOverviewPage() {
  const [period, setPeriod] = useState<RangePeriod>("30d");
  const { start, end } = rangeDates(period);

  // Current-period totals
  const days = useMemo(() => metricsInRange(start, end), [start, end]);

  // Prior period of the same length for comparison
  const prior = useMemo(() => {
    const length = days.length;
    if (length === 0) return [];
    const priorEnd = new Date(start + "T12:00:00Z");
    priorEnd.setUTCDate(priorEnd.getUTCDate() - 1);
    const priorStart = new Date(priorEnd);
    priorStart.setUTCDate(priorStart.getUTCDate() - length + 1);
    return metricsInRange(
      priorStart.toISOString().slice(0, 10),
      priorEnd.toISOString().slice(0, 10),
    );
  }, [days, start]);

  const totalRevenue = sum(days, (d) => d.revenue);
  const totalCovers = sum(days, (d) => d.covers);
  const totalFoodRevenue = sum(days, (d) => d.food_revenue);
  const totalFoodCost = sum(days, (d) => d.food_cost);
  const totalBevRevenue = sum(days, (d) => d.bev_revenue);
  const totalBevCost = sum(days, (d) => d.bev_cost);
  const foodCostPct = totalFoodRevenue > 0 ? totalFoodCost / totalFoodRevenue : 0;
  const bevCostPct = totalBevRevenue > 0 ? totalBevCost / totalBevRevenue : 0;
  const avgCheck = totalCovers > 0 ? totalRevenue / totalCovers : 0;

  const priorRevenue = sum(prior, (d) => d.revenue);
  const priorCovers = sum(prior, (d) => d.covers);
  const priorFoodCostPct =
    sum(prior, (d) => d.food_revenue) > 0
      ? sum(prior, (d) => d.food_cost) / sum(prior, (d) => d.food_revenue)
      : 0;
  const priorBevCostPct =
    sum(prior, (d) => d.bev_revenue) > 0
      ? sum(prior, (d) => d.bev_cost) / sum(prior, (d) => d.bev_revenue)
      : 0;

  // Bar
  const barSalesInRange = useMemo(
    () => barSales.filter((s) => s.date >= start && s.date <= end),
    [start, end],
  );
  const barByItem = useMemo(() => {
    const map = new Map<string, { units: number; revenue: number }>();
    for (const s of barSalesInRange) {
      const prev = map.get(s.item_id) ?? { units: 0, revenue: 0 };
      map.set(s.item_id, {
        units: prev.units + s.units,
        revenue: prev.revenue + s.revenue,
      });
    }
    return map;
  }, [barSalesInRange]);
  const topBar = useMemo(() => {
    const rows = barItems.map((it) => {
      const tot = barByItem.get(it.id) ?? { units: 0, revenue: 0 };
      return { item: it, ...tot };
    });
    return rows.sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [barByItem]);
  const totalBarRevenue = sum(Array.from(barByItem.values()), (v) => v.revenue);

  // Wine
  const monthsInRange = useMemo(() => {
    const set = new Set<string>();
    days.forEach((d) => set.add(d.date.slice(0, 7)));
    return Array.from(set);
  }, [days]);
  const wineInRange = useMemo(
    () => wineSales.filter((s) => monthsInRange.includes(s.yearMonth)),
    [monthsInRange],
  );
  const wineByBottle = useMemo(() => {
    const map = new Map<string, { bottles: number; revenue: number }>();
    for (const s of wineInRange) {
      const prev = map.get(s.bottle_id) ?? { bottles: 0, revenue: 0 };
      map.set(s.bottle_id, {
        bottles: prev.bottles + s.bottles_sold,
        revenue: prev.revenue + s.revenue,
      });
    }
    return map;
  }, [wineInRange]);
  const topWine = useMemo(() => {
    const rows = wineBottles.map((w) => {
      const tot = wineByBottle.get(w.id) ?? { bottles: 0, revenue: 0 };
      return { bottle: w, ...tot };
    });
    return rows.sort((a, b) => b.revenue - a.revenue).slice(0, 5);
  }, [wineByBottle]);
  const totalWineBottles = sum(Array.from(wineByBottle.values()), (v) => v.bottles);

  // Events
  const eventsInRange = useMemo(
    () => events.filter((e) => e.date >= start && e.date <= end),
    [start, end],
  );
  const completedEvents = eventsInRange.filter((e) => e.status === "completed");
  const upcomingEvents = events
    .filter((e) => e.date >= TODAY && e.status === "upcoming")
    .slice(0, 5);
  const eventRevenue = sum(completedEvents, (e) => e.revenue);
  const eventCovers = sum(completedEvents, (e) => e.covers_shown);

  // Revenue trend line points
  const trendPoints = useMemo(
    () =>
      days
        .filter((d) => !d.closed)
        .map((d) => ({
          x: d.date.slice(5),
          y: d.revenue,
        })),
    [days],
  );
  const trendSpark = trendPoints.map((p) => p.y);

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-body text-muted-foreground">
          {start} to {end} · {days.length} day{days.length === 1 ? "" : "s"}
        </p>
        <RangePicker value={period} onChange={setPeriod} />
      </div>

      {/* Headline KPIs */}
      <div className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricTile
          label="Revenue"
          value={formatMoney(totalRevenue, { compact: true })}
          delta={
            priorRevenue
              ? {
                  label: formatChangePct(changePct(totalRevenue, priorRevenue)),
                  direction:
                    totalRevenue > priorRevenue
                      ? "up"
                      : totalRevenue < priorRevenue
                        ? "down"
                        : "flat",
                  tone:
                    totalRevenue >= priorRevenue ? "good" : "bad",
                }
              : undefined
          }
          trend={trendSpark}
        />
        <MetricTile
          label="Covers"
          value={totalCovers.toLocaleString("en-US")}
          delta={
            priorCovers
              ? {
                  label: formatChangePct(changePct(totalCovers, priorCovers)),
                  direction:
                    totalCovers > priorCovers
                      ? "up"
                      : totalCovers < priorCovers
                        ? "down"
                        : "flat",
                  tone: totalCovers >= priorCovers ? "good" : "bad",
                }
              : undefined
          }
          trend={days.filter((d) => !d.closed).map((d) => d.covers)}
          hint={`${formatMoney(avgCheck)} avg check`}
        />
        <MetricTile
          label="Food cost"
          value={formatPct(foodCostPct)}
          delta={
            priorFoodCostPct
              ? {
                  label: formatChangePct(foodCostPct - priorFoodCostPct),
                  direction:
                    foodCostPct < priorFoodCostPct
                      ? "down"
                      : foodCostPct > priorFoodCostPct
                        ? "up"
                        : "flat",
                  tone: foodCostPct <= priorFoodCostPct ? "good" : "bad",
                }
              : undefined
          }
          hint="Target: 32%"
        />
        <MetricTile
          label="Beverage cost"
          value={formatPct(bevCostPct)}
          delta={
            priorBevCostPct
              ? {
                  label: formatChangePct(bevCostPct - priorBevCostPct),
                  direction:
                    bevCostPct < priorBevCostPct
                      ? "down"
                      : bevCostPct > priorBevCostPct
                        ? "up"
                        : "flat",
                  tone: bevCostPct <= priorBevCostPct ? "good" : "bad",
                }
              : undefined
          }
          hint="Target: 22%"
        />
      </div>

      {/* Revenue trend chart */}
      <Card className="mb-8 bg-card p-5">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="font-display text-display-md text-foreground">
            Daily revenue
          </h2>
          <span className="caption text-muted-foreground">
            Closed days excluded
          </span>
        </div>
        <LineChart
          data={trendPoints}
          height={240}
          yLabel={(v) => formatMoney(v, { compact: true })}
        />
      </Card>

      {/* Domain summary cards */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <DomainCard
          title="Bar"
          href="/insights/bar"
          big={formatMoney(totalBarRevenue, { compact: true })}
          hint="Bar revenue in range"
        >
          <HorizontalBars
            rows={topBar.map((r) => ({
              label: r.item.name,
              value: r.revenue,
              hint: `${r.units} sold`,
            }))}
            valueFormat={(n) => formatMoney(n, { compact: true })}
          />
          <p className="caption mt-4 text-muted-foreground">
            Top 5 of {barItems.length} bar items
          </p>
        </DomainCard>

        <DomainCard
          title="Wine cellar"
          href="/insights/wine"
          big={`${totalWineBottles}`}
          hint="Bottles sold in range"
        >
          <HorizontalBars
            rows={topWine.map((r) => ({
              label: `${r.bottle.name} ${r.bottle.vintage}`,
              value: r.revenue,
              hint: `${r.bottles} bottle${r.bottles === 1 ? "" : "s"}`,
            }))}
            variant="warning"
            valueFormat={(n) => formatMoney(n, { compact: true })}
          />
          <p className="caption mt-4 text-muted-foreground">
            Top 5 by revenue
          </p>
        </DomainCard>

        <DomainCard
          title="Events"
          href="/insights/events"
          big={`${completedEvents.length}`}
          hint={`Completed · ${formatMoney(eventRevenue, { compact: true })} · ${eventCovers.toLocaleString()} covers`}
        >
          {upcomingEvents.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {upcomingEvents.map((e) => (
                <li
                  key={e.id}
                  className="grid grid-cols-[auto_1fr_auto] items-center gap-3"
                >
                  <span className="tabular caption text-muted-foreground">
                    {e.date.slice(5)}
                  </span>
                  <span className="text-body-sm text-foreground">
                    {e.name}
                  </span>
                  <span className="tabular caption font-mono text-foreground">
                    {e.covers_booked} booked
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-body-sm text-muted-foreground">
              No upcoming events on the calendar.
            </p>
          )}
          <p className="caption mt-4 text-muted-foreground">
            Upcoming bookings
          </p>
        </DomainCard>

        <DomainCard
          title="Inventory"
          href="/insights/inventory"
          big="42"
          hint="Active SKUs across 5 stations"
        >
          <p className="text-body-sm text-muted-foreground">
            Counts roll up into trends here. Once a few weeks of counts are
            submitted, this view shows par adherence, top variance items, and
            waste signals month over month.
          </p>
        </DomainCard>
      </div>
    </>
  );
}

function DomainCard({
  title,
  href,
  big,
  hint,
  children,
}: {
  title: string;
  href: string;
  big: string;
  hint: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="flex flex-col bg-card p-5">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-display-md text-foreground">
            {title}
          </h2>
          <p className="caption text-muted-foreground">{hint}</p>
        </div>
        <p className="tabular font-display text-display-lg text-foreground">
          {big}
        </p>
      </div>
      <div className="mt-3 flex-1">{children}</div>
      <Link
        href={href}
        className="caption mt-4 inline-block text-accent hover:underline"
      >
        Open {title.toLowerCase()} →
      </Link>
    </Card>
  );
}
