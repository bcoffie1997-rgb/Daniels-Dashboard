import { notFound } from "next/navigation";
import Link from "next/link";
import { getRestaurant, type RestaurantSlug } from "@/lib/restaurants";
import { getSeed } from "@/lib/seed";
import {
  dailySalesFor,
  varianceTrendFor,
  rangeDays,
  rangeLabel,
  comparePeriods,
  forecastFromSeries,
} from "@/lib/seed/analytics";
import { TimeRangeSelector, parseRange } from "@/components/time-range";
import { LineChart, BarChart } from "@/components/charts";
import { Badge } from "@/components/ui/badge";
import {
  ChevronRight,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Receipt,
  ChefHat,
  ShoppingCart,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

export default function AvtPage({
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

  // Mock AvT pipeline: theoretical = sales × ~32% expected food cost ratio
  // Actual = derived from variance trend ± noise
  const allSales = dailySalesFor(slug, 365);
  const variance = varianceTrendFor(slug, 365);
  const FOOD_COST_BASELINE = slug === "miami" ? 0.31 : slug === "fort-lauderdale" ? 0.31 : 0.34;

  const series = allSales.map((d, i) => {
    const theoretical = Math.round(d.gross * FOOD_COST_BASELINE);
    const variancePct = variance[i]?.variancePct ?? 3;
    // actual = theoretical × (1 + variance/100) — actual is higher than theoretical when variance is positive
    const actual = Math.round(theoretical * (1 + variancePct / 100));
    return {
      date: d.date,
      theoretical,
      actual,
      delta: actual - theoretical,
      sales: d.gross,
    };
  });

  const window = series.slice(-days);
  const totalTheoretical = window.reduce((s, x) => s + x.theoretical, 0);
  const totalActual = window.reduce((s, x) => s + x.actual, 0);
  const totalDelta = totalActual - totalTheoretical;
  const totalSales = window.reduce((s, x) => s + x.sales, 0);
  const wasteRate = totalActual > 0 ? (totalDelta / totalActual) * 100 : 0;
  const actualFoodCostPct = totalSales > 0 ? (totalActual / totalSales) * 100 : 0;
  const theoreticalFoodCostPct = totalSales > 0 ? (totalTheoretical / totalSales) * 100 : 0;

  // Comparisons
  const deltaSeries = series.map((x) => ({ date: x.date, value: x.delta }));
  const deltaCompare = comparePeriods(deltaSeries, range);
  const forecast = forecastFromSeries(series.slice(-90).map((x) => x.delta));

  // Annualize the delta — this is the bottom-line waste $/year impact
  const annualizedWaste = (totalDelta / days) * 365;

  // Top waste contributors — derived from inventory items
  const allItems = seed.stations.flatMap((s) =>
    s.items.map((it) => ({ station: s.name, ...it })),
  );
  const wasteContributors = allItems
    .filter((it) => it.unitCost && it.par && it.lastCounted)
    .map((it) => {
      // estimated weekly waste: variance × unit cost × (par - lastCounted) × correction
      const shortBy = Math.max(0, (it.par ?? 0) - (it.lastCounted ?? 0));
      const weeklyWasteDollars = shortBy * (it.unitCost ?? 0) * 0.18;
      return {
        name: it.name,
        station: it.station,
        unit: it.unit,
        weeklyWaste: Math.round(weeklyWasteDollars),
        unitCost: it.unitCost,
        shortBy,
      };
    })
    .filter((x) => x.weeklyWaste > 0)
    .sort((a, b) => b.weeklyWaste - a.weeklyWaste)
    .slice(0, 8);

  return (
    <main className="mx-auto max-w-[1400px] px-4 md:px-8 py-8 md:py-10">
      <nav className="text-sm text-muted-foreground flex items-center gap-2 mb-4">
        <Link href={`/r/${restaurant.slug}`} className="hover:text-accent">
          {restaurant.shortName}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">AvT</span>
      </nav>

      <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <TrendingDown className="h-4 w-4 text-accent" />
            <span className="micro text-accent">Actual vs Theoretical</span>
          </div>
          <h1 className="font-display text-display-2xl tracking-tight">AvT — waste & shrink</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Theoretical = sales × recipe COGS. Actual = inventory consumed. Delta is
            waste, theft, over-portioning, or spoilage.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <TimeRangeSelector basePath={`/r/${restaurant.slug}/avt`} current={range} />
          <Link
            href={`/r/${restaurant.slug}/integrations`}
            className="inline-flex items-center gap-2 rounded-md border border-warning/40 bg-warning-bg px-3 py-2 text-sm text-warning hover:border-warning transition-colors"
          >
            <AlertTriangle className="h-4 w-4" />
            Modeled — connect Toast + OCR
          </Link>
        </div>
      </div>

      {/* Headline KPIs */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Kpi
          label="Theoretical COGS"
          value={`$${(totalTheoretical / 1000).toFixed(0)}k`}
          sub={`${theoreticalFoodCostPct.toFixed(1)}% of sales`}
          icon={ChefHat}
        />
        <Kpi
          label="Actual COGS"
          value={`$${(totalActual / 1000).toFixed(0)}k`}
          sub={`${actualFoodCostPct.toFixed(1)}% of sales`}
          icon={ShoppingCart}
          tone={actualFoodCostPct - theoreticalFoodCostPct > 2 ? "warning" : "default"}
        />
        <Kpi
          label="Waste / shrink"
          value={`$${(totalDelta / 1000).toFixed(1)}k`}
          sub={`${wasteRate.toFixed(1)}% over theoretical`}
          icon={Receipt}
          tone={wasteRate > 8 ? "destructive" : wasteRate > 5 ? "warning" : "success"}
        />
        <Kpi
          label="Annualized waste"
          value={`$${(annualizedWaste / 1000).toFixed(0)}k`}
          sub={`If trend holds`}
          icon={TrendingDown}
          tone="warning"
        />
      </section>

      {/* Forecast strip */}
      <section className="rounded-lg border border-accent/40 bg-accent/5 p-4 mb-6 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 shrink-0">
          <Sparkles className="h-4 w-4 text-accent" />
          <span className="micro text-accent">Forecast · waste trend</span>
        </div>
        <div className="flex-1 flex flex-wrap gap-x-8 gap-y-3 min-w-0">
          <div>
            <div className="micro text-muted-foreground">Projected waste next 30d</div>
            <div className="font-display text-display-md tabular mt-1 inline-flex items-baseline gap-2">
              ${(forecast.next30d / 1000).toFixed(1)}k
              {forecast.trend === "up" && <ArrowUpRight className="h-3 w-3 text-destructive" />}
              {forecast.trend === "down" && <ArrowDownRight className="h-3 w-3 text-success" />}
            </div>
          </div>
          <div>
            <div className="micro text-muted-foreground">vs prior period</div>
            <div
              className={`font-display text-display-md tabular mt-1 ${
                deltaCompare.vsPriorPct >= 0 ? "text-destructive" : "text-success"
              }`}
            >
              {deltaCompare.vsPriorPct >= 0 ? "+" : ""}
              {deltaCompare.vsPriorPct.toFixed(1)}%
            </div>
          </div>
          <div>
            <div className="micro text-muted-foreground">vs same period LY</div>
            <div
              className={`font-display text-display-md tabular mt-1 ${
                deltaCompare.vsYoyPct >= 0 ? "text-destructive" : "text-success"
              }`}
            >
              {deltaCompare.vsYoyPct >= 0 ? "+" : ""}
              {deltaCompare.vsYoyPct.toFixed(1)}%
            </div>
          </div>
        </div>
        <div className="text-xs text-muted-foreground italic max-w-xs">
          Closing 1% of waste here = ${Math.round((totalSales * 0.01) / 1000)}k / year recovered.
        </div>
      </section>

      {/* Trend chart: Theoretical vs Actual */}
      <section className="rounded-lg border border-border bg-card p-5 mb-8">
        <div className="flex items-end justify-between mb-4 flex-wrap gap-2">
          <div>
            <h2 className="font-display text-display-md">Theoretical vs Actual</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {rangeLabel(range)} · gap = waste, theft, shrink, over-portion
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded shrink-0" style={{ backgroundColor: "#7BA890" }} />
              <span className="text-muted-foreground">Theoretical</span>
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded shrink-0" style={{ backgroundColor: "#C85A4E" }} />
              <span className="text-muted-foreground">Actual</span>
            </span>
          </div>
        </div>
        <DualLineChart
          theoretical={window.map((x) => ({
            label: range === "12mo" ? x.date.slice(0, 7) : x.date.slice(5),
            value: x.theoretical,
          }))}
          actual={window.map((x) => ({
            label: range === "12mo" ? x.date.slice(0, 7) : x.date.slice(5),
            value: x.actual,
          }))}
        />
      </section>

      {/* Top waste contributors */}
      <section className="grid lg:grid-cols-2 gap-5 mb-8">
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-end justify-between mb-4">
            <div>
              <h2 className="font-display text-display-md">Top waste contributors</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Estimated $/week from item variances
              </p>
            </div>
          </div>
          {wasteContributors.length === 0 ? (
            <div className="py-6 text-sm text-muted-foreground text-center">
              No significant contributors yet — variance is low across costed items.
            </div>
          ) : (
            <div style={{ color: ACCENT }}>
              <BarChart
                data={wasteContributors.map((w) => ({
                  label: w.name,
                  value: w.weeklyWaste,
                  sub: `${w.shortBy.toFixed(1)} ${w.unit}`,
                }))}
                color={ACCENT}
              />
            </div>
          )}
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-end justify-between mb-4">
            <div>
              <h2 className="font-display text-display-md">How AvT works</h2>
              <p className="text-xs text-muted-foreground mt-0.5">The math behind this dashboard</p>
            </div>
          </div>
          <ol className="space-y-4">
            <Step
              n={1}
              tag="Theoretical"
              body={
                <>
                  Pull <span className="text-foreground">items sold</span> from Toast. Multiply each
                  by its recipe BOM (cost per portion). Sum to get expected COGS.
                </>
              }
            />
            <Step
              n={2}
              tag="Actual"
              body={
                <>
                  Compute from inventory:{" "}
                  <span className="text-foreground">beginning + received − ending</span>. The
                  received side needs invoice OCR; the ending side is what Mise counts handle today.
                </>
              }
            />
            <Step
              n={3}
              tag="Delta"
              body={
                <>
                  Actual − Theoretical ={" "}
                  <span className="text-foreground">waste · theft · over-portion · spoilage</span>.
                  High variance + dual-count items = priority investigation list.
                </>
              }
            />
            <Step
              n={4}
              tag="ROI"
              body={
                <>
                  Closing 1% of food cost across the group at ~${(totalSales * 0.01 / 1000).toFixed(0)}
                  k of sales for this restaurant alone =
                  <span className="text-success font-medium">
                    {" "}
                    ~${Math.round(totalSales * 0.01).toLocaleString()}/period saved
                  </span>
                  .
                </>
              }
            />
          </ol>
          <div className="text-xs text-muted-foreground italic mt-4">
            Numbers shown are modeled from variance trend × baseline food cost. Real values
            light up the same UI once Toast + invoice OCR land.
          </div>
        </div>
      </section>

      {/* Worst offender items table */}
      <section>
        <div className="flex items-end justify-between mb-3">
          <h2 className="font-display text-display-md">Worst offenders</h2>
          <span className="micro text-muted-foreground">By weekly waste $</span>
        </div>
        {wasteContributors.length === 0 ? (
          <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground text-sm">
            Nothing significant to flag.
          </div>
        ) : (
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/30">
                <tr className="text-left">
                  <th className="micro text-muted-foreground px-4 py-3 font-medium">Item</th>
                  <th className="micro text-muted-foreground px-4 py-3 font-medium hidden md:table-cell">Station</th>
                  <th className="micro text-muted-foreground px-4 py-3 font-medium w-24 text-right">Short</th>
                  <th className="micro text-muted-foreground px-4 py-3 font-medium w-28 text-right">Unit cost</th>
                  <th className="micro text-muted-foreground px-4 py-3 font-medium w-32 text-right">~$ / week</th>
                  <th className="micro text-muted-foreground px-4 py-3 font-medium w-32 text-right">~$ / year</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {wasteContributors.map((w) => (
                  <tr key={w.name} className="hover:bg-muted/30">
                    <td className="px-4 py-2.5">
                      <Link
                        href={`/r/${restaurant.slug}/items/${encodeURIComponent(w.name)}`}
                        className="font-medium hover:text-accent"
                      >
                        {w.name}
                      </Link>
                    </td>
                    <td className="px-4 py-2.5 hidden md:table-cell text-muted-foreground text-xs">
                      {w.station}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular">
                      {w.shortBy.toFixed(1)} {w.unit}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular">${w.unitCost}</td>
                    <td className="px-4 py-2.5 text-right tabular text-destructive">
                      ${w.weeklyWaste}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular text-muted-foreground">
                      ${(w.weeklyWaste * 52).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

function Kpi({
  label,
  value,
  sub,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: any;
  tone?: "default" | "warning" | "destructive" | "success";
}) {
  const toneCls = {
    default: "text-foreground",
    warning: "text-warning",
    destructive: "text-destructive",
    success: "text-success",
  }[tone];
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between">
        <span className="micro text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className={`font-display text-display-md tabular mt-2.5 ${toneCls}`}>{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}

function Step({ n, tag, body }: { n: number; tag: string; body: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3">
      <div className="h-7 w-7 rounded-full bg-accent/15 text-accent text-sm font-medium flex items-center justify-center shrink-0">
        {n}
      </div>
      <div className="flex-1 pt-0.5">
        <div className="micro text-accent mb-1">{tag}</div>
        <div className="text-sm text-muted-foreground leading-relaxed">{body}</div>
      </div>
    </li>
  );
}

// Simple dual-line chart — two overlapping line series
function DualLineChart({
  theoretical,
  actual,
}: {
  theoretical: Array<{ label: string; value: number }>;
  actual: Array<{ label: string; value: number }>;
}) {
  const height = 220;
  const padL = 36;
  const padR = 4;
  const padT = 8;
  const padB = 20;
  const width = 800;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;
  const allValues = [...theoretical.map((x) => x.value), ...actual.map((x) => x.value)];
  const max = Math.max(...allValues) * 1.1 || 1;
  const stepX = innerW / Math.max(1, theoretical.length - 1);

  const points = (series: typeof theoretical) =>
    series
      .map((d, i) => {
        const x = padL + i * stepX;
        const y = padT + innerH - (d.value / max) * innerH;
        return `${x.toFixed(1)},${y.toFixed(1)}`;
      })
      .join(" ");

  const yTicks = 4;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full" preserveAspectRatio="none" aria-hidden>
      {Array.from({ length: yTicks + 1 }).map((_, i) => {
        const y = padT + (innerH * i) / yTicks;
        return (
          <g key={i}>
            <line
              x1={padL}
              y1={y}
              x2={padL + innerW}
              y2={y}
              stroke="currentColor"
              strokeOpacity={i === yTicks ? 0.3 : 0.08}
              strokeDasharray={i === yTicks ? "" : "2 4"}
            />
            <text
              x={padL - 6}
              y={y + 3}
              fontSize="10"
              fill="currentColor"
              opacity={0.5}
              textAnchor="end"
            >
              ${Math.round((max * (yTicks - i)) / yTicks / 1000)}k
            </text>
          </g>
        );
      })}
      <polyline points={points(theoretical)} fill="none" stroke="#7BA890" strokeWidth={2} />
      <polyline points={points(actual)} fill="none" stroke="#C85A4E" strokeWidth={2} />
      {theoretical.map((d, i) => {
        const stride = Math.max(1, Math.ceil(theoretical.length / 8));
        if (i % stride !== 0 && i !== theoretical.length - 1) return null;
        const x = padL + i * stepX;
        return (
          <text
            key={i}
            x={x}
            y={padT + innerH + 14}
            fontSize="10"
            fill="currentColor"
            opacity={0.5}
            textAnchor="middle"
          >
            {d.label}
          </text>
        );
      })}
    </svg>
  );
}
