import { notFound } from "next/navigation";
import Link from "next/link";
import { getRestaurant, type RestaurantSlug } from "@/lib/restaurants";
import {
  laborDaysFor,
  roleBreakdownFor,
  dailySalesFor,
} from "@/lib/seed/analytics";
import { LineChart, BarChart } from "@/components/charts";
import { Badge } from "@/components/ui/badge";
import {
  ChevronRight,
  Users,
  Plug,
  Clock,
  DollarSign,
  TrendingDown,
  AlertTriangle,
} from "lucide-react";

export default function LaborDashboard({ params }: { params: { slug: string } }) {
  const restaurant = getRestaurant(params.slug);
  if (!restaurant) notFound();
  const slug = restaurant.slug as RestaurantSlug;
  const ACCENT = restaurant.accentHex;

  const days = laborDaysFor(slug, 30);
  const sales = dailySalesFor(slug, 30);
  const last7 = days.slice(-7);
  const prior7 = days.slice(-14, -7);
  const last7Cost = last7.reduce((s, d) => s + d.cost, 0);
  const last7Sales = last7.reduce((s, d) => s + d.sales, 0);
  const last7Hours = last7.reduce((s, d) => s + d.hours, 0);
  const last7Pct = (last7Cost / last7Sales) * 100;
  const prior7Pct = (prior7.reduce((s, d) => s + d.cost, 0) / prior7.reduce((s, d) => s + d.sales, 0)) * 100;

  // Prime cost estimate (labor% + food cost%) — assume food cost at typical rate per slug
  const foodCostPct = slug === "miami" ? 31 : slug === "fort-lauderdale" ? 31 : 34;
  const primeCost = last7Pct + foodCostPct;

  // OT estimate: anything over 40 hr/week assumed at 12% of hours
  const overtimeHours = Math.round(last7Hours * 0.12);

  const roles = roleBreakdownFor(slug);
  const totalCost = roles.reduce((s, r) => s + r.cost, 0);

  return (
    <main className="mx-auto max-w-[1400px] px-4 md:px-8 py-8 md:py-10">
      <nav className="text-sm text-muted-foreground flex items-center gap-2 mb-4">
        <Link href={`/r/${restaurant.slug}`} className="hover:text-accent">
          {restaurant.shortName}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">Labor</span>
      </nav>

      <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Users className="h-4 w-4 text-accent" />
            <span className="micro text-accent">Labor analytics</span>
          </div>
          <h1 className="font-display text-display-2xl tracking-tight">Labor</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Labor cost as % of sales, hours, overtime exposure, prime cost. Per-role
            breakdown and trend.
          </p>
        </div>
        <Link
          href={`/r/${restaurant.slug}/integrations`}
          className="inline-flex items-center gap-2 rounded-md border border-warning/40 bg-warning-bg px-3 py-2 text-sm text-warning hover:border-warning transition-colors"
        >
          <Plug className="h-4 w-4" />
          Mock — connect 7shifts / Toast Payroll
        </Link>
      </div>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <Kpi
          label="Labor cost — last 7d"
          value={`$${last7Cost.toLocaleString()}`}
          sub={`${last7Hours.toLocaleString()} hours`}
          icon={DollarSign}
        />
        <Kpi
          label="Labor % of sales"
          value={`${last7Pct.toFixed(1)}%`}
          sub={`vs ${prior7Pct.toFixed(1)}% prior week`}
          icon={TrendingDown}
          tone={last7Pct > 30 ? "warning" : "success"}
        />
        <Kpi
          label="Overtime exposure"
          value={`${overtimeHours} hrs`}
          sub="last 7 days · estimate"
          icon={AlertTriangle}
          tone={overtimeHours > last7Hours * 0.15 ? "warning" : "default"}
        />
        <Kpi
          label="Prime cost"
          value={`${primeCost.toFixed(1)}%`}
          sub={`labor + food (${foodCostPct}%)`}
          icon={Clock}
          tone={primeCost > 60 ? "destructive" : primeCost > 55 ? "warning" : "success"}
        />
      </section>

      {/* Trend chart: Labor % vs Sales */}
      <section className="rounded-lg border border-border bg-card p-5 mb-8">
        <div className="flex items-end justify-between mb-4 flex-wrap gap-2">
          <div>
            <h2 className="font-display text-display-md">Labor cost trend</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Daily labor cost, last 30 days
            </p>
          </div>
          <div className="text-xs text-muted-foreground">
            Avg / day:{" "}
            <span className="text-foreground tabular">
              ${Math.round(days.reduce((s, d) => s + d.cost, 0) / days.length).toLocaleString()}
            </span>
          </div>
        </div>
        <div style={{ color: ACCENT }}>
          <LineChart
            data={days.map((d) => ({ label: d.date.slice(5), value: d.cost }))}
            color={ACCENT}
          />
        </div>
      </section>

      <section className="grid lg:grid-cols-2 gap-5 mb-8">
        {/* Role breakdown */}
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-end justify-between mb-4">
            <div>
              <h2 className="font-display text-display-md">By role</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Trailing 30 days</p>
            </div>
            <span className="text-xs text-muted-foreground tabular">
              ${(totalCost / 1000).toFixed(0)}k total
            </span>
          </div>
          <div style={{ color: ACCENT }}>
            <BarChart
              data={roles.map((r) => ({
                label: `${r.role} · ${r.headcount} people`,
                value: r.cost,
                sub: `${r.hours}h`,
              }))}
              color={ACCENT}
            />
          </div>
        </div>

        {/* Per-day labor % */}
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-end justify-between mb-4">
            <div>
              <h2 className="font-display text-display-md">Labor % per day</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Last 7 days</p>
            </div>
          </div>
          <ul className="space-y-2 text-sm">
            {last7.map((d) => {
              const pct = (d.cost / d.sales) * 100;
              const overTarget = pct > 30;
              const dayName = new Date(d.date + "T00:00:00").toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              });
              return (
                <li key={d.date} className="flex items-center gap-3">
                  <span className="w-24 text-muted-foreground shrink-0">{dayName}</span>
                  <div className="flex-1 h-5 bg-muted/40 rounded overflow-hidden relative">
                    <div
                      className={`h-full rounded ${overTarget ? "bg-warning" : ""}`}
                      style={{
                        width: `${Math.min(100, pct * 2)}%`,
                        backgroundColor: overTarget ? undefined : ACCENT,
                      }}
                    />
                    <div
                      className="absolute top-0 bottom-0 border-r border-foreground/40"
                      style={{ left: `${30 * 2}%` }}
                      title="30% target"
                    />
                  </div>
                  <span
                    className={`w-14 text-right tabular shrink-0 ${
                      overTarget ? "text-warning" : ""
                    }`}
                  >
                    {pct.toFixed(1)}%
                  </span>
                </li>
              );
            })}
          </ul>
          <div className="text-xs text-muted-foreground mt-3 flex items-center gap-2">
            <span
              className="inline-block w-3 h-0.5 border-t border-foreground/60"
              aria-hidden
            />
            30% target line
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-display text-display-md mb-3">Role-level detail</h2>
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/30">
              <tr className="text-left">
                <th className="micro text-muted-foreground px-4 py-3 font-medium">Role</th>
                <th className="micro text-muted-foreground px-4 py-3 font-medium w-24 text-right">Headcount</th>
                <th className="micro text-muted-foreground px-4 py-3 font-medium w-24 text-right">Hours</th>
                <th className="micro text-muted-foreground px-4 py-3 font-medium w-28 text-right">Cost</th>
                <th className="micro text-muted-foreground px-4 py-3 font-medium w-28 text-right">% of total</th>
                <th className="micro text-muted-foreground px-4 py-3 font-medium w-28 text-right">$/hour</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {roles.map((r) => (
                <tr key={r.role} className="hover:bg-muted/30">
                  <td className="px-4 py-2.5 font-medium">{r.role}</td>
                  <td className="px-4 py-2.5 text-right tabular">{r.headcount}</td>
                  <td className="px-4 py-2.5 text-right tabular">{r.hours.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-right tabular">${r.cost.toLocaleString()}</td>
                  <td className="px-4 py-2.5 text-right tabular text-muted-foreground">
                    {((r.cost / totalCost) * 100).toFixed(1)}%
                  </td>
                  <td className="px-4 py-2.5 text-right tabular">
                    ${(r.cost / r.hours).toFixed(2)}
                  </td>
                </tr>
              ))}
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
  sub,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string;
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
