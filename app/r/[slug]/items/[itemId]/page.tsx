import { notFound } from "next/navigation";
import Link from "next/link";
import { getRestaurant, type RestaurantSlug } from "@/lib/restaurants";
import { getSeed } from "@/lib/seed";
import { itemHistoryFor, forecastFromSeries } from "@/lib/seed/analytics";
import { LineChart } from "@/components/charts";
import { Badge } from "@/components/ui/badge";
import {
  ChevronRight,
  ChevronLeft,
  Boxes,
  AlertTriangle,
  ShieldCheck,
  Clock,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Coins,
} from "lucide-react";

export default function ItemHistoryPage({
  params,
}: {
  params: { slug: string; itemId: string };
}) {
  const restaurant = getRestaurant(params.slug);
  if (!restaurant) notFound();
  const slug = restaurant.slug as RestaurantSlug;
  const seed = getSeed(slug)!;

  // itemId is URL-encoded item name
  const itemName = decodeURIComponent(params.itemId);
  let foundItem: typeof seed.stations[number]["items"][number] | undefined;
  let foundStation: string | undefined;
  for (const s of seed.stations) {
    const m = s.items.find((it) => it.name === itemName);
    if (m) {
      foundItem = m;
      foundStation = s.name;
      break;
    }
  }
  if (!foundItem || !foundStation) notFound();
  const item = foundItem;
  const stationName = foundStation;

  const par = item.par ?? 0;
  const history = itemHistoryFor(slug, item.name, par || 10, 180);
  const currentQty = history[history.length - 1]?.quantity ?? item.lastCounted ?? 0;
  const pctOfPar = par ? (currentQty / par) * 100 : 0;
  const belowPar = par && currentQty < par;
  const wellBelow = belowPar && pctOfPar < 70;

  // Usage analytics
  const totalEvents = history.length;
  const avgCountInterval = history.reduce((s, h) => s + h.daysSinceLast, 0) / totalEvents;

  // Estimate usage rate: total decreases per day across last 60 days
  const recent = history.slice(-Math.min(30, history.length));
  let totalDecrease = 0;
  let totalDays = 0;
  for (let i = 1; i < recent.length; i++) {
    const diff = recent[i - 1].quantity - recent[i].quantity;
    if (diff > 0) {
      // only count depletion
      totalDecrease += diff;
      totalDays += recent[i].daysSinceLast;
    }
  }
  const dailyUsage = totalDays > 0 ? totalDecrease / totalDays : 0;
  const daysToDepletion = dailyUsage > 0 ? Math.round(currentQty / dailyUsage) : null;
  const recommendedOrder = par
    ? Math.max(0, Math.ceil(par * 1.2 - currentQty))
    : Math.ceil(dailyUsage * 7);

  // Forecast (uses raw quantity values as series — gives "projected level in N days")
  const seriesValues = history.map((h) => h.quantity);
  const forecast = forecastFromSeries(seriesValues);

  const ACCENT = restaurant.accentHex;

  return (
    <main className="mx-auto max-w-[1200px] px-4 md:px-8 py-8 md:py-10">
      <Link
        href={`/r/${restaurant.slug}/inventory#${encodeURIComponent(stationName)}`}
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
      >
        <ChevronLeft className="h-4 w-4" /> Inventory
      </Link>

      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1.5">
          <Boxes className="h-4 w-4 text-accent" />
          <span className="micro text-accent">Item history</span>
        </div>
        <div className="flex items-baseline gap-3 flex-wrap">
          <h1 className="font-display text-display-2xl tracking-tight">{item.name}</h1>
          {item.requiresDualCount && (
            <span className="inline-flex items-center gap-1 text-xs uppercase tracking-wider px-2 py-1 rounded border border-accent/40 bg-accent/10 text-accent font-medium">
              <ShieldCheck className="h-3 w-3" />
              2-person count
            </span>
          )}
        </div>
        <div className="text-sm text-muted-foreground mt-2 flex flex-wrap gap-x-4 gap-y-1">
          <span>{stationName}</span>
          {item.category && <span>· {item.category}</span>}
          <span>· counted in <span className="text-foreground">{item.unit}</span></span>
          {item.unitCost && (
            <span>
              · ~<span className="text-foreground">${item.unitCost}</span>/{item.unit}
            </span>
          )}
        </div>
      </div>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Kpi
          label="Current count"
          value={currentQty.toFixed(1)}
          sub={`of ${par} ${item.unit} par`}
          tone={wellBelow ? "destructive" : belowPar ? "warning" : "success"}
        />
        <Kpi
          label="Daily usage rate"
          value={`${dailyUsage.toFixed(2)} ${item.unit}/d`}
          sub={`Trailing 30 days`}
        />
        <Kpi
          label="Days to depletion"
          value={daysToDepletion != null ? `${daysToDepletion}d` : "—"}
          sub={daysToDepletion != null && daysToDepletion < 5 ? "Order today" : "At current rate"}
          tone={daysToDepletion != null && daysToDepletion < 3 ? "destructive" : daysToDepletion != null && daysToDepletion < 7 ? "warning" : "default"}
        />
        <Kpi
          label="Suggested order qty"
          value={`${recommendedOrder} ${item.unit}`}
          sub="Brings to par + 20% buffer"
          tone="accent"
        />
      </section>

      {/* Forecast card */}
      <section className="rounded-lg border border-accent/40 bg-accent/5 p-4 mb-6 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 shrink-0">
          <Sparkles className="h-4 w-4 text-accent" />
          <span className="micro text-accent">Forecast</span>
        </div>
        <div className="flex-1 flex flex-wrap gap-x-6 gap-y-2 min-w-0 text-sm">
          <span>
            Avg weekly usage:{" "}
            <span className="font-medium tabular">
              {(dailyUsage * 7).toFixed(1)} {item.unit}
            </span>
          </span>
          <span>
            Avg monthly usage:{" "}
            <span className="font-medium tabular">
              {(dailyUsage * 30).toFixed(1)} {item.unit}
            </span>
          </span>
          <span>
            Count cadence:{" "}
            <span className="font-medium tabular">
              every {avgCountInterval.toFixed(1)} days
            </span>
          </span>
          <span className="inline-flex items-center gap-1">
            Trend:{" "}
            {forecast.trend === "down" ? (
              <span className="text-warning inline-flex items-center gap-0.5">
                <TrendingDown className="h-3.5 w-3.5" />
                Depleting faster than restocked
              </span>
            ) : forecast.trend === "up" ? (
              <span className="text-success inline-flex items-center gap-0.5">
                <TrendingUp className="h-3.5 w-3.5" />
                Stocked above usage
              </span>
            ) : (
              <span className="text-muted-foreground">stable</span>
            )}
          </span>
        </div>
      </section>

      {/* Chart: count over time */}
      <section className="rounded-lg border border-border bg-card p-5 mb-6">
        <div className="flex items-end justify-between mb-4 flex-wrap gap-2">
          <div>
            <h2 className="font-display text-display-md">Count history</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Last 180 days · {totalEvents} count events · par line at {par}
            </p>
          </div>
        </div>
        <div style={{ color: ACCENT }}>
          <LineChart
            data={history.map((h) => ({
              label: h.date.slice(5),
              value: h.quantity,
            }))}
            color={ACCENT}
          />
        </div>
      </section>

      {/* History table */}
      <section>
        <h2 className="font-display text-display-md mb-3">Count log</h2>
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/30">
              <tr className="text-left">
                <th className="micro text-muted-foreground px-4 py-3 font-medium">Date</th>
                <th className="micro text-muted-foreground px-4 py-3 font-medium w-32 text-right">Counted</th>
                <th className="micro text-muted-foreground px-4 py-3 font-medium w-24 text-right">vs Par</th>
                <th className="micro text-muted-foreground px-4 py-3 font-medium w-28 text-right">Δ vs prior</th>
                <th className="micro text-muted-foreground px-4 py-3 font-medium w-32 text-right">Days since last</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {history
                .slice()
                .reverse()
                .map((h, i, arr) => {
                  const prior = arr[i + 1];
                  const delta = prior ? h.quantity - prior.quantity : null;
                  const pct = par ? (h.quantity / par) * 100 : 0;
                  return (
                    <tr key={i} className="hover:bg-muted/30">
                      <td className="px-4 py-2.5 tabular text-muted-foreground">
                        {formatDate(h.date)}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular font-medium">
                        {h.quantity.toFixed(1)} {item.unit}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular">
                        {pct < 70 ? (
                          <Badge variant="destructive">{pct.toFixed(0)}%</Badge>
                        ) : pct < 100 ? (
                          <Badge variant="warning">{pct.toFixed(0)}%</Badge>
                        ) : (
                          <span className="text-muted-foreground">{pct.toFixed(0)}%</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular">
                        {delta == null ? (
                          <span className="text-muted-foreground">—</span>
                        ) : delta > 0 ? (
                          <span className="text-success">+{delta.toFixed(1)}</span>
                        ) : (
                          <span className="text-destructive">{delta.toFixed(1)}</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular text-muted-foreground">
                        {h.daysSinceLast}d
                      </td>
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
  sub,
  tone = "default",
}: {
  label: string;
  value: string;
  sub?: string;
  tone?: "default" | "warning" | "destructive" | "success" | "accent";
}) {
  const toneCls = {
    default: "text-foreground",
    warning: "text-warning",
    destructive: "text-destructive",
    success: "text-success",
    accent: "text-accent",
  }[tone];
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="micro text-muted-foreground">{label}</div>
      <div className={`font-display text-display-md tabular mt-2 ${toneCls}`}>{value}</div>
      {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
    </div>
  );
}

function formatDate(d: string): string {
  const date = new Date(d + "T00:00:00");
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}
