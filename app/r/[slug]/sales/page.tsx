import { notFound } from "next/navigation";
import Link from "next/link";
import { getRestaurant, type RestaurantSlug } from "@/lib/restaurants";
import {
  dailySalesFor,
  topItemsFor,
  daypartFor,
  serverScoresFor,
} from "@/lib/seed/analytics";
import { LineChart, BarChart, Donut } from "@/components/charts";
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
} from "lucide-react";

export default function SalesDashboard({ params }: { params: { slug: string } }) {
  const restaurant = getRestaurant(params.slug);
  if (!restaurant) notFound();
  const slug = restaurant.slug as RestaurantSlug;

  const days = dailySalesFor(slug, 30);
  const last7 = days.slice(-7);
  const prior7 = days.slice(-14, -7);

  const mtdGross = days.reduce((s, d) => s + d.gross, 0);
  const last7Gross = last7.reduce((s, d) => s + d.gross, 0);
  const prior7Gross = prior7.reduce((s, d) => s + d.gross, 0);
  const wow = ((last7Gross - prior7Gross) / prior7Gross) * 100;
  const last7Covers = last7.reduce((s, d) => s + d.covers, 0);
  const last7AvgCheck = Math.round(last7Gross / last7Covers);
  const last7Comps = last7.reduce((s, d) => s + d.comps, 0);
  const last7Voids = last7.reduce((s, d) => s + d.voids, 0);

  const topItems = topItemsFor(slug);
  const daypart = daypartFor(slug);
  const servers = serverScoresFor(slug);
  const totalUnits = topItems.reduce((s, i) => s + i.units, 0);

  const ACCENT = restaurant.accentHex;

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
            Trailing 30 days at {restaurant.shortName}. Cover counts, average check, daypart
            mix, top items, server scorecards.
          </p>
        </div>
        <Link
          href={`/r/${restaurant.slug}/integrations`}
          className="inline-flex items-center gap-2 rounded-md border border-warning/40 bg-warning-bg px-3 py-2 text-sm text-warning hover:border-warning transition-colors"
        >
          <Plug className="h-4 w-4" />
          Mock data — connect Toast
        </Link>
      </div>

      {/* Headline KPIs */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <Kpi
          label="Gross — last 7d"
          value={`$${last7Gross.toLocaleString()}`}
          delta={wow}
          icon={DollarSign}
        />
        <Kpi
          label="MTD gross"
          value={`$${(mtdGross / 1000).toFixed(0)}k`}
          sub="30 days"
          icon={DollarSign}
        />
        <Kpi
          label="Avg check — last 7d"
          value={`$${last7AvgCheck}`}
          sub={`${last7Covers.toLocaleString()} covers`}
          icon={Users}
        />
        <Kpi
          label="Comps + voids"
          value={`$${(last7Comps + last7Voids).toLocaleString()}`}
          sub={`${(((last7Comps + last7Voids) / last7Gross) * 100).toFixed(1)}% of gross`}
          icon={Receipt}
          tone={(last7Comps + last7Voids) / last7Gross > 0.04 ? "warning" : "default"}
        />
      </section>

      {/* Trend chart */}
      <section className="rounded-lg border border-border bg-card p-5 mb-8">
        <div className="flex items-end justify-between mb-4 flex-wrap gap-2">
          <div>
            <h2 className="font-display text-display-md">Daily gross sales</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Last 30 days</p>
          </div>
          <div className="text-xs text-muted-foreground">
            Avg / day: <span className="text-foreground tabular">${Math.round(mtdGross / days.length).toLocaleString()}</span>
          </div>
        </div>
        <div style={{ color: ACCENT }}>
          <LineChart
            data={days.map((d) => ({
              label: d.date.slice(5), // MM-DD
              value: d.gross,
            }))}
            color={ACCENT}
          />
        </div>
      </section>

      <section className="grid lg:grid-cols-2 gap-5 mb-8">
        {/* Top items */}
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

        {/* Daypart donut */}
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-end justify-between mb-4">
            <div>
              <h2 className="font-display text-display-md">Daypart mix</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Last 7 days by gross</p>
            </div>
          </div>
          <div className="text-foreground">
            <Donut
              segments={daypart.map((d, i) => ({
                label: `${d.daypart} — $${(d.gross / 1000).toFixed(1)}k · ${d.covers} covers`,
                value: d.gross,
                color: ["#7BA890", "#C9A86B", "#E78F8E", "#D4A24A"][i % 4],
              }))}
            />
          </div>
        </div>
      </section>

      {/* Server scorecards */}
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
  delta,
  sub,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string;
  delta?: number;
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
      <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1.5">
        {delta != null ? (
          <span
            className={`inline-flex items-center gap-0.5 ${
              delta >= 0 ? "text-success" : "text-destructive"
            }`}
          >
            {delta >= 0 ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {Math.abs(delta).toFixed(1)}% WoW
          </span>
        ) : (
          sub && <span>{sub}</span>
        )}
      </div>
    </div>
  );
}
