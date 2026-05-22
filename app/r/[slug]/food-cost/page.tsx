import { notFound } from "next/navigation";
import Link from "next/link";
import { getRestaurant, type RestaurantSlug } from "@/lib/restaurants";
import { getSeed, belowParItems } from "@/lib/seed";
import { sessionsFor } from "@/lib/seed/sessions";
import {
  foodCostByCategoryFor,
  vendorSpendFor,
  varianceTrendFor,
  dailySalesFor,
  forecastFromSeries,
  comparePeriods,
  rangeDays,
  rangeLabel,
} from "@/lib/seed/analytics";
import { LineChart, BarChart, Donut, Sparkline } from "@/components/charts";
import { TimeRangeSelector, parseRange } from "@/components/time-range";
import { Badge } from "@/components/ui/badge";
import {
  ChevronRight,
  Coins,
  Plug,
  AlertTriangle,
  TrendingDown,
  Boxes,
  Receipt,
  XCircle,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

const PALETTE = ["#7BA890", "#C9A86B", "#E78F8E", "#D4A24A", "#9F9683", "#5E6660"];

export default function FoodCostDashboard({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { range?: string };
}) {
  const restaurant = getRestaurant(params.slug);
  if (!restaurant) notFound();
  const slug = restaurant.slug as RestaurantSlug;
  const ACCENT = restaurant.accentHex;
  const range = parseRange(searchParams.range);
  const dRange = rangeDays(range);

  const seed = getSeed(slug)!;
  const belowPar = belowParItems(seed);
  const allVariance = varianceTrendFor(slug, 365);
  const variance = allVariance.slice(-dRange);
  const last7 = allVariance.slice(-7);
  const avgVariance7 =
    last7.reduce((s, d) => s + d.variancePct, 0) / last7.length;
  const last30AvgVariance =
    allVariance.slice(-30).reduce((s, d) => s + d.variancePct, 0) / 30;
  const varianceSeries = allVariance.map((d) => ({ date: d.date, value: d.variancePct }));
  const varianceCompare = comparePeriods(varianceSeries, range);
  const varianceForecast = forecastFromSeries(allVariance.slice(-90).map((d) => d.variancePct));

  const categories = foodCostByCategoryFor(slug);
  const totalSpend = categories.reduce((s, c) => s + c.spend, 0);
  const totalFoodCostPct =
    categories
      .filter((c) => !c.category.toLowerCase().includes("bar"))
      .reduce((s, c) => s + c.pctOfSales, 0);

  const vendors = vendorSpendFor(slug);

  // Recently rejected sessions
  const allSessions = sessionsFor(slug);
  const rejected = allSessions.filter((s) => s.status === "rejected").slice(0, 5);

  // Top variance items right now (from belowPar)
  const topVariance = belowPar.slice(0, 6);

  const totalSales30 = dailySalesFor(slug, 30).reduce((s, d) => s + d.gross, 0);

  return (
    <main className="mx-auto max-w-[1400px] px-4 md:px-8 py-8 md:py-10">
      <nav className="text-sm text-muted-foreground flex items-center gap-2 mb-4">
        <Link href={`/r/${restaurant.slug}`} className="hover:text-accent">
          {restaurant.shortName}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">Inventory & Food Cost</span>
      </nav>

      <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Coins className="h-4 w-4 text-accent" />
            <span className="micro text-accent">Cost analytics</span>
          </div>
          <h1 className="font-display text-display-2xl tracking-tight">Inventory & Food Cost</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Where the money is going. Variance trend, food cost by category, vendor spend,
            and items that need a recount.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <TimeRangeSelector basePath={`/r/${restaurant.slug}/food-cost`} current={range} />
          <Link
            href={`/r/${restaurant.slug}/integrations`}
            className="inline-flex items-center gap-2 rounded-md border border-warning/40 bg-warning-bg px-3 py-2 text-sm text-warning hover:border-warning transition-colors"
          >
            <Plug className="h-4 w-4" />
            Connect invoice OCR
          </Link>
        </div>
      </div>

      <section className="rounded-lg border border-accent/40 bg-accent/5 p-4 mb-6 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2 shrink-0">
          <Sparkles className="h-4 w-4 text-accent" />
          <span className="micro text-accent">Forecast · variance trend</span>
        </div>
        <div className="flex-1 flex flex-wrap gap-x-8 gap-y-3 min-w-0">
          <div>
            <div className="micro text-muted-foreground">Projected next 7d avg</div>
            <div className="font-display text-display-md tabular mt-1 inline-flex items-baseline gap-2">
              {(varianceForecast.next7d / 7).toFixed(1)}%
              {varianceForecast.trend === "up" && <ArrowUpRight className="h-3 w-3 text-destructive" />}
              {varianceForecast.trend === "down" && <ArrowDownRight className="h-3 w-3 text-success" />}
            </div>
          </div>
          <div>
            <div className="micro text-muted-foreground">vs prior period</div>
            <div
              className={`font-display text-display-md tabular mt-1 ${
                varianceCompare.vsPriorPct >= 0 ? "text-destructive" : "text-success"
              }`}
            >
              {varianceCompare.vsPriorPct >= 0 ? "+" : ""}
              {varianceCompare.vsPriorPct.toFixed(1)}%
            </div>
          </div>
          <div>
            <div className="micro text-muted-foreground">vs same period LY</div>
            <div className="font-display text-display-md tabular mt-1">
              {varianceCompare.vsYoyPct >= 0 ? "+" : ""}
              {varianceCompare.vsYoyPct.toFixed(1)}%
            </div>
          </div>
        </div>
        <div className="text-xs text-muted-foreground italic max-w-xs">
          For variance, lower is better. Down trend = tighter operations.
        </div>
      </section>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <Kpi
          label="Food cost % (30d)"
          value={`${totalFoodCostPct.toFixed(1)}%`}
          sub={`target 30%`}
          icon={Coins}
          tone={totalFoodCostPct > 33 ? "destructive" : totalFoodCostPct > 31 ? "warning" : "success"}
        />
        <Kpi
          label="Avg variance — last 7d"
          value={`${avgVariance7.toFixed(1)}%`}
          sub={`30d avg ${last30AvgVariance.toFixed(1)}%`}
          icon={TrendingDown}
          tone={avgVariance7 > 5 ? "destructive" : avgVariance7 > 3 ? "warning" : "success"}
        />
        <Kpi
          label="Items below par"
          value={belowPar.length}
          sub={`${belowPar.filter((x) => x.pctOfPar < 70).length} critical`}
          icon={Boxes}
          tone={belowPar.length > 30 ? "warning" : "default"}
        />
        <Kpi
          label="30d ingredient spend"
          value={`$${(totalSpend / 1000).toFixed(0)}k`}
          sub={`vs $${(totalSales30 / 1000).toFixed(0)}k sales`}
          icon={Receipt}
        />
      </section>

      {/* Variance trend */}
      <section className="rounded-lg border border-border bg-card p-5 mb-8">
        <div className="flex items-end justify-between mb-4 flex-wrap gap-2">
          <div>
            <h2 className="font-display text-display-md">Variance trend</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Avg daily variance %, {rangeLabel(range).toLowerCase()}
            </p>
          </div>
          <div className="text-xs text-muted-foreground">
            Today:{" "}
            <span className="text-foreground tabular">
              {variance[variance.length - 1].variancePct.toFixed(1)}%
            </span>
          </div>
        </div>
        <div style={{ color: ACCENT }}>
          <LineChart
            data={variance.map((v) => ({
              label: range === "12mo" ? v.date.slice(0, 7) : v.date.slice(5),
              value: v.variancePct,
            }))}
            color={ACCENT}
          />
        </div>
      </section>

      <section className="grid lg:grid-cols-2 gap-5 mb-8">
        {/* Spend by category */}
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-end justify-between mb-4">
            <div>
              <h2 className="font-display text-display-md">Spend by category</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Trailing 30 days</p>
            </div>
            <span className="text-xs text-muted-foreground tabular">
              ${(totalSpend / 1000).toFixed(0)}k
            </span>
          </div>
          <Donut
            segments={categories.map((c, i) => ({
              label: `${c.category} — $${(c.spend / 1000).toFixed(0)}k · ${c.pctOfSales}%`,
              value: c.spend,
              color: PALETTE[i % PALETTE.length],
            }))}
          />
        </div>

        {/* Top vendors */}
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-end justify-between mb-4">
            <div>
              <h2 className="font-display text-display-md">Top vendors</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Spend with sparklines, last 4 weeks</p>
            </div>
          </div>
          <ul className="space-y-3.5">
            {vendors.map((v) => (
              <li key={v.vendor} className="flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{v.vendor}</div>
                  <div className="text-xs text-muted-foreground">
                    {v.invoices} invoices · ${(v.spend / 1000).toFixed(1)}k
                  </div>
                </div>
                <div className="text-accent" style={{ color: ACCENT }}>
                  <Sparkline values={v.trend} width={100} height={30} color={ACCENT} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Top variance items + Rejected counts */}
      <section className="grid lg:grid-cols-2 gap-5 mb-8">
        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-end justify-between mb-4">
            <div>
              <h2 className="font-display text-display-md">Top variance items</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Ranked by short-by amount</p>
            </div>
            <Link
              href={`/r/${restaurant.slug}/reorder`}
              className="text-xs text-accent hover:underline inline-flex items-center gap-1"
            >
              Reorder list <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          {topVariance.length === 0 ? (
            <div className="py-6 text-sm text-muted-foreground text-center">
              All stations at par.
            </div>
          ) : (
            <ul className="divide-y divide-border -my-2">
              {topVariance.map((x, i) => (
                <li key={i} className="py-2.5 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{x.item.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{x.station}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs text-muted-foreground">
                      <span className="text-foreground tabular">{x.item.lastCounted}</span> /{" "}
                      <span className="tabular">{x.item.par}</span> {x.item.unit}
                    </div>
                    <div className="mt-0.5">
                      {x.pctOfPar < 70 ? (
                        <Badge variant="destructive">{x.pctOfPar}%</Badge>
                      ) : (
                        <Badge variant="warning">{x.pctOfPar}%</Badge>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-lg border border-border bg-card p-5">
          <div className="flex items-end justify-between mb-4">
            <div>
              <h2 className="font-display text-display-md">Recently rejected</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Counts the manager sent back
              </p>
            </div>
            <Link
              href={`/r/${restaurant.slug}/sessions?status=rejected`}
              className="text-xs text-accent hover:underline inline-flex items-center gap-1"
            >
              All rejected <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          {rejected.length === 0 ? (
            <div className="py-6 text-sm text-muted-foreground text-center">
              No rejected counts in the last 30 days.
            </div>
          ) : (
            <ul className="divide-y divide-border -my-2">
              {rejected.map((s) => (
                <li key={s.id} className="py-2.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <XCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
                    <span className="text-sm font-medium truncate">{s.stationName}</span>
                    <span className="text-xs text-muted-foreground">
                      · {s.countedBy.name}
                    </span>
                  </div>
                  {s.rejectionReason && (
                    <div className="text-xs text-muted-foreground italic mt-1 leading-relaxed line-clamp-2">
                      “{s.rejectionReason}”
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Detailed category table */}
      <section>
        <h2 className="font-display text-display-md mb-3">Category detail</h2>
        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/30">
              <tr className="text-left">
                <th className="micro text-muted-foreground px-4 py-3 font-medium">Category</th>
                <th className="micro text-muted-foreground px-4 py-3 font-medium w-28 text-right">Spend</th>
                <th className="micro text-muted-foreground px-4 py-3 font-medium w-32 text-right">% of sales</th>
                <th className="micro text-muted-foreground px-4 py-3 font-medium w-32 text-right">% of food cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {categories.map((c, i) => (
                <tr key={c.category} className="hover:bg-muted/30">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="h-2.5 w-2.5 rounded shrink-0"
                        style={{ backgroundColor: PALETTE[i % PALETTE.length] }}
                      />
                      <span className="font-medium">{c.category}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-right tabular">
                    ${c.spend.toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular">{c.pctOfSales.toFixed(1)}%</td>
                  <td className="px-4 py-2.5 text-right tabular text-muted-foreground">
                    {((c.spend / totalSpend) * 100).toFixed(1)}%
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
