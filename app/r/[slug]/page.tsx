import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { KpiStat } from "@/components/kpi-stat";
import { getRestaurant } from "@/lib/restaurants";
import { getKpiFor } from "@/lib/mock-data";
import { getSeed } from "@/lib/seed";
import { Badge } from "@/components/ui/badge";
import { Boxes, AlertTriangle, ClipboardList, TrendingDown, ChevronRight, ExternalLink } from "lucide-react";

export default function RestaurantDashboard({ params }: { params: { slug: string } }) {
  const restaurant = getRestaurant(params.slug);
  if (!restaurant) notFound();
  const kpi = getKpiFor(restaurant.slug);
  const seed = getSeed(restaurant.slug)!;
  const totalMenuItems = seed.menus.reduce(
    (s, m) => s + m.sections.reduce((ss, sec) => ss + sec.items.length, 0),
    0,
  );

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader current={restaurant} />
      <div
        className="h-1 w-full"
        style={{ backgroundColor: restaurant.accentHex }}
      />
      <main className="mx-auto max-w-[1400px] px-4 md:px-8 py-8 md:py-10">
        <nav className="text-sm text-muted-foreground flex items-center gap-2 mb-4">
          <Link href="/" className="hover:text-accent">Gioia</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground">{restaurant.shortName}</span>
        </nav>

        <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
          <div>
            <div className="micro" style={{ color: restaurant.accentHex }}>
              {restaurant.shortName}
            </div>
            <h1 className="font-display text-display-2xl tracking-tight mt-1.5">
              {restaurant.name}
            </h1>
            <p className="text-muted-foreground mt-2 max-w-xl">{restaurant.concept}</p>
            <div className="text-sm text-muted-foreground mt-3 flex flex-wrap gap-x-4 gap-y-1">
              <span>{restaurant.address}</span>
              <span>{restaurant.phone}</span>
              <a
                href={restaurant.website}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 hover:text-accent"
              >
                Website <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
        </div>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <KpiStat label="Items tracked" value={kpi.itemsTracked} delta={`${kpi.stationsActive} stations`} icon={Boxes} />
          <KpiStat
            label="Pending approvals"
            value={kpi.pendingApproval}
            icon={ClipboardList}
            tone={kpi.pendingApproval > 0 ? "warning" : "success"}
          />
          <KpiStat
            label="Open variances"
            value={kpi.openVariances}
            icon={AlertTriangle}
            tone={kpi.openVariances > 0 ? "destructive" : "success"}
          />
          <KpiStat
            label="Avg variance"
            value={`${kpi.avgVariancePct.toFixed(1)}%`}
            icon={TrendingDown}
            tone={kpi.avgVariancePct >= 4 ? "warning" : "success"}
          />
        </section>

        <section className="grid lg:grid-cols-3 gap-5 mb-10">
          <Link
            href={`/r/${restaurant.slug}/inventory`}
            className="group rounded-lg border border-border bg-card p-6 hover:border-accent/60 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="micro text-muted-foreground">Inventory</div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
            </div>
            <div className="font-display text-display-md mt-2">By station</div>
            <p className="text-sm text-muted-foreground mt-1.5">
              {kpi.itemsTracked} items across {kpi.stationsActive} stations.
              Par levels seeded from menu analysis.
            </p>
          </Link>

          <Link
            href={`/r/${restaurant.slug}/menu`}
            className="group rounded-lg border border-border bg-card p-6 hover:border-accent/60 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="micro text-muted-foreground">Menu</div>
              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
            </div>
            <div className="font-display text-display-md mt-2">{totalMenuItems} dishes</div>
            <p className="text-sm text-muted-foreground mt-1.5">
              Full menu breakdown by section — the source of the inventory.
            </p>
          </Link>

          <div className="rounded-lg border border-border bg-card p-6">
            <div className="micro text-muted-foreground">Last count</div>
            <div className="font-display text-display-md mt-2 tabular">{kpi.lastCountAt}</div>
            <p className="text-sm text-muted-foreground mt-1.5">{kpi.lastCountBy}</p>
          </div>
        </section>

        {kpi.topVariance && (
          <section className="mb-10">
            <h2 className="font-display text-display-md mb-4">Where to look first</h2>
            <div className="rounded-lg border border-destructive/40 bg-destructive-bg p-5">
              <div className="flex items-start gap-4">
                <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="font-display text-xl">{kpi.topVariance.item}</span>
                    <Badge variant="destructive">{kpi.topVariance.variancePct}%</Badge>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {kpi.topVariance.station}
                  </div>
                  <div className="text-sm mt-3 text-foreground/80">
                    Counted quantity is materially lower than expected based on the last
                    approved count. Pull receiving invoices and 86 lists since then.
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        <section>
          <h2 className="font-display text-display-md mb-4">Stations</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {seed.stations.map((s) => (
              <Link
                key={s.name}
                href={`/r/${restaurant.slug}/inventory#${encodeURIComponent(s.name)}`}
                className="group rounded-lg border border-border bg-card p-4 hover:border-accent/60 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="text-sm font-medium">{s.name}</div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors shrink-0" />
                </div>
                <div className="text-xs text-muted-foreground mt-1">{s.items.length} items</div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
