import { notFound } from "next/navigation";
import Link from "next/link";
import { getRestaurant, type RestaurantSlug } from "@/lib/restaurants";
import {
  dailySalesFor,
  topItemsFor,
  daypartFor,
  serverScoresFor,
  forecastFromSeries,
  comparePeriods,
  rangeDays,
  rangeLabel,
  type TimeRange,
} from "@/lib/seed/analytics";
import { LineChart, BarChart, Donut } from "@/components/charts";
import { TimeRangeSelector, parseRange } from "@/components/time-range";
import { Badge } from "@/components/ui/badge";
import {
  ChevronRight,
  TrendingUp,
  Plug,
  DollarSign,
  Users,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
} from "lucide-react";

export default function SalesDashboard({
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

  // Always pull 365 days so YoY comparisons work
  const allDays = dailySalesFor(slug, 365);
  const current = allDays.slice(-days);

  const grossSeries = allDays.map((d) => ({ date: d.date, value: d.gross }));
  const grossCompare = comparePeriods(grossSeries, range);
  const forecast = forecastFromSeries(allDays.slice(-90).map((d) => d.gross));

  const totalCovers = current.reduce((s, d) => s + d.covers, 0);
  const avgCheck = Math.round(grossCompare.current / Math.max(1, totalCovers));
  const totalComps = current.reduce((s, d) => s + d.comps, 0);
  const totalVoids = current.reduce((s, d) => s + d.voids, 0);

  const topItems = topItemsFor(slug);
  const daypart = daypartFor(slug);
  const servers = serverScoresFor(slug);
  const totalUnits = topItems.reduce((s, i) => s + i.units, 0);

  const ACCENT = restaurant.accentHex;
  const basePath = `/r/${restaurant.slug}/sales`;

  return (
    <main className="mx-auto max-w-[1400px] px-4 md:px-8 py-8 md:py-10">
      <nav className="text-sm text-muted-foreground flex items-center gap-2 mb-4">
        <Link href={`/r/${restaurant.slug}`} className="hover:text-accent">
          {restaurant.shortName}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">Sales & Revenue</span>
      </nav>

      <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <TrendingUp className="h-4 w-4 text-accent" />
            <span className="micro text-accent">Sales analytics</span>
          </div>
          <h1 className="font-display text-display-2xl tracking-tight">Sales & Revenue</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            {rangeLabel(range)} at {restaurant.shortName}. Cover counts, average check,
            daypart mix, top items, server scorecards.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <TimeRangeSelector basePath={basePath} current={range} />
          <Link
            href={`/r/${restaurant.slug}/integrations`}
            className="inline-flex items-center gap-2 rounded-md border border-warning/40 bg-warning-bg px-3 py-2 text-sm text-warning hover:border-warning transition-colors"
          >
            <Plug className="h-4 w-4" />
            Mock — connect Toast
          </Link>
        </div>
      </div>

      {/* Headline KPIs with period comparisons */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Kpi
          label={`Gross — ${rangeLabel(range).toLowerCase()}`}
          value={`$${(grossCompare.current / 1000).toFixed(0)}k`}
          vsPrior={grossCompare.vsPriorPct}
          vsYoy={grossCompare.vsYoyPct}
          icon={DollarSign}
        />
        <Kpi
          label="Avg daily"
          value={`$${Math.round(grossCompare.current / days).toLocaleString()}`}
          sub={`${days} day average`}
          icon={DollarSign}
        />
        <Kpi
          label="Avg check"
          value={`$${avgCheck}`}
          sub={`${totalCovers.toLocaleString()} covers`}
          icon={Users}
        />
        <Kpi
          label="Comps + voids"
          value={`$${(totalComps + totalVoids).toLocaleString()}`}
          sub={`${(((totalComps + totalVoids) / Math.max(1, grossCompare.current)) * 100).toFixed(1)}% of gross`}
          icon={Receipt}
          tone={(totalComps + totalVoids) / Math.max(1, grossCompare.current) > 0.04 ? "warning" : "default"}
        />
      </section>

      {/* Forecasting strip */}
      <section className="rounded-lg border border-accent/40 bg-accent/5 p-4 mb-8 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 shrink-0">
          <Sparkles className="h-4 w-4 text-accent" />
          <span className="micro text-accent">Forecast · trailing 90d trend</span>
        </div>
        <div className="flex-1 flex flex-wrap gap-x-8 gap-y-3 min-w-0">
          <ForecastTile
            label="Projected next 7d"
            value={`$${(forecast.next7d / 1000).toFixed(0)}k`}
            sub={`Avg/day $${Math.round(forecast.next7d / 7).toLocaleString()}`}
            trend={forecast.trend}
          />
          <ForecastTile
            label="Projected next 30d"
            value={`$${(forecast.next30d / 1000).toFixed(0)}k`}
            sub={`Annualized $${((forecast.next30d * 12) / 1_000_000).toFixed(1)}M`}
            trend={forecast.trend}
          />
        </div>
        <div className="text-xs text-muted-foreground italic">
          Linear projection. Improves with real history when Toast lands.
        </div>
      </section>

      {/* Trend chart */}
      <section className="rounded-lg border border-border bg-card p-5 mb-8">
        <div className="flex items-end justify-between mb-4 flex-wrap gap-2">
          <div>
            <h2 className="font-display text-display-md">Daily gross sales</h2>
            <p className="text-xs text-muted-foreground mt-0.5">{rangeLabel(range)}</p>
          </div>
          <div className="text-xs text-muted-foreground">
            Total:{" "}
            <span className="text-foreground tabular">
              ${(grossCompare.current / 1000).toFixed(0)}k
            </span>
          </div>
        </div>
        <div style={{ color: ACCENT }}>
          <LineChart
            data={current.map((d) => ({
              label: range === "12mo" ? d.date.slice(0, 7) : d.date.slice(5),
              value: d.gross,
            }))}
            color={ACCENT}
          />
        </div>
      </section>

      <section className="grid lg:grid-cols-2 gap-5 mb-8">
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-end justify-between mb-4">
            <div>
              <h2 className="font-display text-display-md">Top items</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Last 7 days by units</p>
            </div>
            <span className="text-xs text-muted-foreground tabular">
              {totalUnits.toLocaleString()} units
            </span>
          </div>
          <div style={{ color: ACCENT }}>
            <BarChart
              data={topItems.map((it) => ({
                label: it.name,
                value: it.units,
                sub: `$${(it.revenue / 1000).toFixed(1)}k`,
              }))}
              color={ACCENT}
            />
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-end justify-between mb-4">
            <div>
              <h2 className="font-display text-display-md">Daypart mix</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Last 7 days by gross</p>
            </div>
          </div>
          <Donut
            segments={daypart.map((d, i) => ({
              label: `${d.daypart} — $${(d.gross / 1000).toFixed(1)}k · ${d.covers} covers`,
              value: d.gross,
              color: ["#7BA890", "#C9A86B", "#E78F8E", "#D4A24A"][i % 4],
            }))}
          />
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between mb-3">
          <h2 className="font-display text-display-md">Server scorecards</h2>
          <span className="micro text-muted-foreground">Last 7 days</span>
        </div>
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/30">
              <tr className="text-left">
                <th className="micro text-muted-foreground px-4 py-3 font-medium">Server</th>
                <th className="micro text-muted-foreground px-4 py-3 font-medium w-20 text-right">Shifts</th>
                <th className="micro text-muted-foreground px-4 py-3 font-medium w-24 text-right">Covers</th>
                <th className="micro text-muted-foreground px-4 py-3 font-medium w-28 text-right">Sales</th>
                <th className="micro text-muted-foreground px-4 py-3 font-medium w-28 text-right">Avg check</th>
                <th className="micro text-muted-foreground px-4 py-3 font-medium w-32 text-right">Upsell rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {servers.map((s, i) => {
                const isTop = i === 0;
                return (
                  <tr key={s.name} className="hover:bg-muted/30">
                    <td className="px-4 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{s.name}</span>
                        {isTop && <Badge variant="success">Top</Badge>}
                      </div>
                    </td>
                    <td className="px-4 py-2.5 text-right tabular">{s.shifts}</td>
                    <td className="px-4 py-2.5 text-right tabular">{s.covers}</td>
                    <td className="px-4 py-2.5 text-right tabular">${s.sales.toLocaleString()}</td>
                    <td className="px-4 py-2.5 text-right tabular">${s.avgCheck}</td>
                    <td className="px-4 py-2.5 text-right tabular">{s.upsellRate}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

function Kpi({
  label,
  value,
  vsPrior,
  vsYoy,
  sub,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string;
  vsPrior?: number;
  vsYoy?: number;
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
      <div className="text-xs text-muted-foreground mt-1 flex items-center gap-3 flex-wrap">
        {vsPrior != null && (
          <DeltaPill value={vsPrior} label="vs prior" />
        )}
        {vsYoy != null && vsYoy !== 0 && (
          <DeltaPill value={vsYoy} label="YoY" />
        )}
        {sub && !vsPrior && <span>{sub}</span>}
      </div>
    </div>
  );
}

function DeltaPill({ value, label }: { value: number; label: string }) {
  const positive = value >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 ${
        positive ? "text-success" : "text-destructive"
      }`}
      title={`${label}: ${value.toFixed(1)}%`}
    >
      {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {Math.abs(value).toFixed(1)}% {label}
    </span>
  );
}

function ForecastTile({
  label,
  value,
  sub,
  trend,
}: {
  label: string;
  value: string;
  sub?: string;
  trend: "up" | "down" | "flat";
}) {
  const trendIcon =
    trend === "up" ? (
      <ArrowUpRight className="h-3 w-3 text-success" />
    ) : trend === "down" ? (
      <ArrowDownRight className="h-3 w-3 text-destructive" />
    ) : null;
  return (
    <div>
      <div className="micro text-muted-foreground">{label}</div>
      <div className="font-display text-display-md tabular mt-1 inline-flex items-baseline gap-2">
        {value}
        {trendIcon}
      </div>
      {sub && <div className="text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}
