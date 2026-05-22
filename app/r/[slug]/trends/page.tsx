import { notFound } from "next/navigation";
import Link from "next/link";
import { getRestaurant, type RestaurantSlug } from "@/lib/restaurants";
import { getSeed } from "@/lib/seed";
import {
  dailySalesFor,
  laborDaysFor,
  varianceTrendFor,
  topItemsFor,
  itemHistoryFor,
  forecastFromSeries,
  comparePeriods,
  rangeDays,
  rangeLabel,
} from "@/lib/seed/analytics";
import { TimeRangeSelector, parseRange } from "@/components/time-range";
import { Sparkline } from "@/components/charts";
import { Badge } from "@/components/ui/badge";
import {
  ChevronRight,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertTriangle,
  DollarSign,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

export default function TrendsPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { range?: string };
}) {
  const restaurant = getRestaurant(params.slug);
  if (!restaurant) notFound();
  const slug = restaurant.slug as RestaurantSlug;
  const range = parseRange(searchParams.range);
  const days = rangeDays(range);
  const ACCENT = restaurant.accentHex;

  const seed = getSeed(slug)!;

  // 1. Sales: trend + comparison
  const allSales = dailySalesFor(slug, 365);
  const salesSeries = allSales.map((d) => ({ date: d.date, value: d.gross }));
  const salesCompare = comparePeriods(salesSeries, range);
  const salesForecast = forecastFromSeries(allSales.slice(-90).map((d) => d.gross));

  // 2. Labor
  const allLabor = laborDaysFor(slug, 365);
  const laborSeries = allLabor.map((d) => ({ date: d.date, value: d.cost }));
  const laborCompare = comparePeriods(laborSeries, range);

  // 3. Variance
  const allVariance = varianceTrendFor(slug, 365);
  const varianceSeries = allVariance.map((d) => ({ date: d.date, value: d.variancePct }));
  const varianceCompare = comparePeriods(varianceSeries, range);

  // 4. Biggest movers — items growing/falling in sales (mock: top items shuffled with delta)
  const topItems = topItemsFor(slug, 10);
  const movers = topItems.map((it, i) => {
    // Synthesize a believable WoW % per item
    const seed = (it.name.length * (i + 7)) % 47;
    const wowPct = (seed - 23) * 1.2; // -28 to +28
    return { ...it, wowPct };
  });
  const risers = movers.filter((m) => m.wowPct > 0).sort((a, b) => b.wowPct - a.wowPct).slice(0, 4);
  const fallers = movers.filter((m) => m.wowPct < 0).sort((a, b) => a.wowPct - b.wowPct).slice(0, 4);

  // 5. Predicted reorders this week — items most likely to hit zero
  const reorderCandidates: Array<{
    name: string;
    station: string;
    unit: string;
    par: number;
    current: number;
    dailyUsage: number;
    daysLeft: number;
    suggestedOrder: number;
  }> = [];
  for (const s of seed.stations) {
    for (const it of s.items) {
      if (!it.par || !it.lastCounted) continue;
      const history = itemHistoryFor(slug, it.name, it.par, 60);
      const recent = history.slice(-10);
      let totalDecrease = 0;
      let totalDays = 0;
      for (let i = 1; i < recent.length; i++) {
        const diff = recent[i - 1].quantity - recent[i].quantity;
        if (diff > 0) {
          totalDecrease += diff;
          totalDays += recent[i].daysSinceLast;
        }
      }
      const dailyUsage = totalDays > 0 ? totalDecrease / totalDays : 0;
      if (dailyUsage <= 0) continue;
      const current = it.lastCounted;
      const daysLeft = Math.round(current / dailyUsage);
      if (daysLeft > 10) continue; // only flag the ones running out soon
      reorderCandidates.push({
        name: it.name,
        station: s.name,
        unit: it.unit,
        par: it.par,
        current,
        dailyUsage,
        daysLeft,
        suggestedOrder: Math.max(0, Math.ceil(it.par * 1.2 - current)),
      });
    }
  }
  reorderCandidates.sort((a, b) => a.daysLeft - b.daysLeft);
  const urgentReorders = reorderCandidates.slice(0, 8);

  // 6. Seasonal callout — compare current month vs same month last year, and what's coming
  const now = new Date("2026-05-21T00:00:00");
  const month = now.getMonth(); // 4 = May
  const nextMonth = (month + 1) % 12;
  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const seasonalNote = (() => {
    if (slug === "ds-sports") {
      if (month >= 8 && month <= 11) return "NFL regular season — drafts and game-day food trend high.";
      if (month >= 0 && month <= 1) return "Playoffs + Super Bowl approaching. Spike expected.";
      if (month >= 5 && month <= 7) return "Off-season slump — keep labor target lean.";
      return "Shoulder season. Watch staffing.";
    }
    if (month >= 0 && month <= 3) return "Peak winter season at " + restaurant.shortName + ". Wagyu / caviar / dover sole running.";
    if (month >= 5 && month <= 8) return "Summer slowdown — South Florida is quiet. Plan invoice spend lower.";
    if (month === 11) return "Holidays + season opening. Highest revenue month of the year.";
    return "Shoulder season. Watch labor target.";
  })();

  // 7. Anomalies & alerts (high-variance items that are 2-person flagged)
  const dualCountAtRisk = seed.stations.flatMap((s) =>
    s.items
      .filter((it) => it.requiresDualCount && it.par && it.lastCounted && it.lastCounted < it.par * 0.8)
      .map((it) => ({ name: it.name, station: s.name, lastCounted: it.lastCounted!, par: it.par! })),
  );

  return (
    <main className="mx-auto max-w-[1400px] px-4 md:px-8 py-8 md:py-10">
      <nav className="text-sm text-muted-foreground flex items-center gap-2 mb-4">
        <Link href={`/r/${restaurant.slug}`} className="hover:text-accent">
          {restaurant.shortName}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">Trends</span>
      </nav>

      <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="h-4 w-4 text-accent" />
            <span className="micro text-accent">Intelligence layer</span>
          </div>
          <h1 className="font-display text-display-2xl tracking-tight">Trends & insights</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            {rangeLabel(range)} at {restaurant.shortName}. Where the business is heading,
            what to act on this week, what we can predict.
          </p>
        </div>
        <TimeRangeSelector basePath={`/r/${restaurant.slug}/trends`} current={range} />
      </div>

      {/* Seasonal callout */}
      <section className="rounded-lg border border-accent/40 bg-accent/5 p-4 mb-6 flex items-start gap-3">
        <Sparkles className="h-5 w-5 text-accent shrink-0 mt-0.5" />
        <div>
          <div className="micro text-accent mb-1">Seasonal context · {monthNames[month]} → {monthNames[nextMonth]}</div>
          <div className="text-sm">{seasonalNote}</div>
        </div>
      </section>

      {/* Headline metric trends — three sparkline cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8">
        <TrendCard
          tag="Sales"
          value={`$${(salesCompare.current / 1000).toFixed(0)}k`}
          delta={salesCompare.vsPriorPct}
          yoy={salesCompare.vsYoyPct}
          sparkValues={allSales.slice(-days).map((d) => d.gross)}
          forecast={`Forecast 30d: $${(salesForecast.next30d / 1000).toFixed(0)}k`}
          href={`/r/${restaurant.slug}/sales`}
          color={ACCENT}
        />
        <TrendCard
          tag="Labor cost"
          value={`$${(laborCompare.current / 1000).toFixed(0)}k`}
          delta={laborCompare.vsPriorPct}
          yoy={laborCompare.vsYoyPct}
          deltaInverse
          sparkValues={allLabor.slice(-days).map((d) => d.cost)}
          forecast={`As % of sales: ${((laborCompare.current / salesCompare.current) * 100).toFixed(1)}%`}
          href={`/r/${restaurant.slug}/labor`}
          color={ACCENT}
        />
        <TrendCard
          tag="Avg variance"
          value={`${(allVariance.slice(-days).reduce((s, v) => s + v.variancePct, 0) / days).toFixed(1)}%`}
          delta={varianceCompare.vsPriorPct}
          yoy={varianceCompare.vsYoyPct}
          deltaInverse
          sparkValues={allVariance.slice(-days).map((d) => d.variancePct)}
          forecast={`Lower = tighter operations`}
          href={`/r/${restaurant.slug}/food-cost`}
          color={ACCENT}
        />
      </section>

      {/* Two-column: Risers / Fallers */}
      <section className="grid lg:grid-cols-2 gap-5 mb-8">
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-end justify-between mb-4">
            <div>
              <h2 className="font-display text-display-md inline-flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-success" />
                Biggest risers
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">Items selling faster, WoW</p>
            </div>
          </div>
          <ul className="divide-y divide-border -my-2">
            {risers.map((r, i) => (
              <li key={r.name} className="py-2.5 flex items-center gap-3">
                <span className="text-xs text-muted-foreground tabular w-5 text-right">
                  {i + 1}.
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{r.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {r.units} units · ${(r.revenue / 1000).toFixed(1)}k revenue
                  </div>
                </div>
                <span className="inline-flex items-center gap-0.5 text-sm text-success tabular shrink-0">
                  <ArrowUpRight className="h-3.5 w-3.5" />+{r.wowPct.toFixed(1)}%
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-end justify-between mb-4">
            <div>
              <h2 className="font-display text-display-md inline-flex items-center gap-2">
                <TrendingDown className="h-5 w-5 text-destructive" />
                Biggest fallers
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">Items selling slower, WoW</p>
            </div>
          </div>
          <ul className="divide-y divide-border -my-2">
            {fallers.map((r, i) => (
              <li key={r.name} className="py-2.5 flex items-center gap-3">
                <span className="text-xs text-muted-foreground tabular w-5 text-right">
                  {i + 1}.
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{r.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {r.units} units · ${(r.revenue / 1000).toFixed(1)}k revenue
                  </div>
                </div>
                <span className="inline-flex items-center gap-0.5 text-sm text-destructive tabular shrink-0">
                  <ArrowDownRight className="h-3.5 w-3.5" />
                  {r.wowPct.toFixed(1)}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Predicted reorders this week */}
      <section className="rounded-lg border border-border bg-card overflow-hidden mb-8">
        <div className="px-5 py-4 border-b border-border flex items-end justify-between">
          <div>
            <h2 className="font-display text-display-md inline-flex items-center gap-2">
              <Clock className="h-5 w-5 text-warning" />
              Reorder predictions
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Items projected to hit zero within 10 days at current usage
            </p>
          </div>
          <Link
            href={`/r/${restaurant.slug}/reorder`}
            className="text-xs text-accent hover:underline inline-flex items-center gap-1"
          >
            Full reorder list <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
        {urgentReorders.length === 0 ? (
          <div className="px-5 py-8 text-center text-sm text-muted-foreground">
            Nothing urgent. All depletion timelines are healthy.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/30">
              <tr className="text-left">
                <th className="micro text-muted-foreground px-5 py-3 font-medium">Item</th>
                <th className="micro text-muted-foreground px-5 py-3 font-medium hidden md:table-cell">Station</th>
                <th className="micro text-muted-foreground px-5 py-3 font-medium w-24 text-right">Current</th>
                <th className="micro text-muted-foreground px-5 py-3 font-medium w-28 text-right">Usage / day</th>
                <th className="micro text-muted-foreground px-5 py-3 font-medium w-24 text-right">Days left</th>
                <th className="micro text-muted-foreground px-5 py-3 font-medium w-32 text-right">Order qty</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {urgentReorders.map((r) => (
                <tr key={r.name} className="hover:bg-muted/30">
                  <td className="px-5 py-2.5">
                    <Link
                      href={`/r/${restaurant.slug}/items/${encodeURIComponent(r.name)}`}
                      className="font-medium hover:text-accent"
                    >
                      {r.name}
                    </Link>
                  </td>
                  <td className="px-5 py-2.5 hidden md:table-cell text-muted-foreground text-xs">
                    {r.station}
                  </td>
                  <td className="px-5 py-2.5 text-right tabular">
                    {r.current.toFixed(1)} {r.unit}
                  </td>
                  <td className="px-5 py-2.5 text-right tabular text-muted-foreground">
                    {r.dailyUsage.toFixed(2)} {r.unit}
                  </td>
                  <td className="px-5 py-2.5 text-right tabular">
                    {r.daysLeft < 3 ? (
                      <Badge variant="destructive">{r.daysLeft}d</Badge>
                    ) : r.daysLeft < 7 ? (
                      <Badge variant="warning">{r.daysLeft}d</Badge>
                    ) : (
                      <span>{r.daysLeft}d</span>
                    )}
                  </td>
                  <td className="px-5 py-2.5 text-right tabular font-medium">
                    {r.suggestedOrder} {r.unit}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {/* Anomalies */}
      {dualCountAtRisk.length > 0 && (
        <section className="rounded-lg border border-destructive/40 bg-destructive-bg p-5 mb-8">
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="font-display text-display-md">High-value items at risk</div>
              <p className="text-sm text-muted-foreground mt-1">
                These items require two-person counts and are below 80% of par.
                Investigate before reordering — variance on high-value items is the
                fastest path to controllable loss.
              </p>
              <ul className="mt-3 space-y-1.5">
                {dualCountAtRisk.slice(0, 6).map((x) => (
                  <li key={x.name} className="text-sm flex items-center gap-2">
                    <AlertTriangle className="h-3 w-3 text-destructive shrink-0" />
                    <Link
                      href={`/r/${restaurant.slug}/items/${encodeURIComponent(x.name)}`}
                      className="font-medium hover:text-accent"
                    >
                      {x.name}
                    </Link>
                    <span className="text-xs text-muted-foreground">
                      {x.lastCounted.toFixed(1)} / {x.par} · {x.station}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* The dollar opportunity */}
      <section className="rounded-lg border border-success/40 bg-success/10 p-5">
        <div className="flex items-start gap-3">
          <DollarSign className="h-5 w-5 text-success shrink-0 mt-0.5" />
          <div>
            <div className="font-display text-display-md">If we tighten by 1%</div>
            <p className="text-sm mt-1.5 leading-relaxed max-w-3xl">
              Annualized sales at {restaurant.shortName} run ~$
              <span className="text-foreground font-medium tabular">
                {((salesCompare.current / days) * 365 / 1_000_000).toFixed(1)}M
              </span>
              . Closing 1% of food cost ={" "}
              <span className="text-success font-medium tabular">
                ~${Math.round(((salesCompare.current / days) * 365 * 0.01) / 1000).toLocaleString()}k
              </span>{" "}
              recovered per year. That's the prize AvT chases.
            </p>
            <Link
              href={`/r/${restaurant.slug}/avt`}
              className="inline-flex items-center gap-1.5 text-sm text-success font-medium mt-3 hover:underline"
            >
              See AvT breakdown <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function TrendCard({
  tag,
  value,
  delta,
  yoy,
  sparkValues,
  forecast,
  href,
  color,
  deltaInverse = false,
}: {
  tag: string;
  value: string;
  delta: number;
  yoy: number;
  sparkValues: number[];
  forecast: string;
  href: string;
  color: string;
  deltaInverse?: boolean;
}) {
  const isGood = deltaInverse ? delta <= 0 : delta >= 0;
  return (
    <Link
      href={href}
      className="block rounded-lg border border-border bg-card p-5 hover:border-accent/60 transition-colors"
    >
      <div className="flex items-center justify-between">
        <span className="micro text-muted-foreground">{tag}</span>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="font-display text-display-lg tabular mt-2">{value}</div>
      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-3 flex-wrap">
        <span className={`inline-flex items-center gap-0.5 tabular ${isGood ? "text-success" : "text-destructive"}`}>
          {delta >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {delta >= 0 ? "+" : ""}
          {delta.toFixed(1)}% vs prior
        </span>
        <span className={`inline-flex items-center gap-0.5 tabular ${(deltaInverse ? yoy <= 0 : yoy >= 0) ? "text-success" : "text-destructive"}`}>
          {yoy >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {yoy >= 0 ? "+" : ""}
          {yoy.toFixed(1)}% YoY
        </span>
      </div>
      <div className="mt-3" style={{ color }}>
        <Sparkline values={sparkValues} width={240} height={36} color={color} />
      </div>
      <div className="text-xs text-muted-foreground mt-2 italic">{forecast}</div>
    </Link>
  );
}
