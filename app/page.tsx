import { SiteHeader } from "@/components/site-header";
import { KpiStat } from "@/components/kpi-stat";
import { LocationCard } from "@/components/location-card";
import { ActivityFeed } from "@/components/activity-feed";
import { getKpis } from "@/lib/mock-data";
import { Boxes, AlertTriangle, ClipboardList, TrendingDown } from "lucide-react";

export default function GioiaDashboard() {
  const kpis = getKpis();
  const totalItems = kpis.reduce((s, k) => s + k.itemsTracked, 0);
  const totalPending = kpis.reduce((s, k) => s + k.pendingApproval, 0);
  const totalOpenVariances = kpis.reduce((s, k) => s + k.openVariances, 0);
  const avgVariance =
    kpis.reduce((s, k) => s + k.avgVariancePct, 0) / kpis.length;
  const sessionsThisWeek = kpis.reduce((s, k) => s + k.sessionsThisWeek, 0);

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-[1400px] px-4 md:px-8 py-8 md:py-10">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-8">
          <div>
            <div className="micro text-accent">Gioia Hospitality</div>
            <h1 className="font-display text-display-2xl tracking-tight mt-1.5">
              Group Inventory
            </h1>
            <p className="text-muted-foreground mt-2 max-w-xl">
              Live operations across Daniel's Miami, Daniel's Fort Lauderdale, and D's Sports
              Bar. Counts, variances, and approvals from one place.
            </p>
          </div>
          <div className="text-right">
            <div className="micro text-muted-foreground">Tonight's service</div>
            <div className="font-display text-2xl tabular mt-1">{sessionsThisWeek} sessions this week</div>
          </div>
        </div>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <KpiStat label="Items tracked" value={totalItems} delta="across 3 locations" icon={Boxes} />
          <KpiStat
            label="Pending approvals"
            value={totalPending}
            delta="awaiting manager sign-off"
            icon={ClipboardList}
            tone={totalPending > 0 ? "warning" : "success"}
          />
          <KpiStat
            label="Open variances"
            value={totalOpenVariances}
            delta="> 10% deviation"
            icon={AlertTriangle}
            tone={totalOpenVariances > 0 ? "destructive" : "success"}
          />
          <KpiStat
            label="Avg variance"
            value={`${avgVariance.toFixed(1)}%`}
            delta="rolling 7-day mean"
            icon={TrendingDown}
            tone={avgVariance >= 4 ? "warning" : "success"}
          />
        </section>

        <section className="mb-10">
          <div className="flex items-end justify-between mb-4">
            <h2 className="font-display text-display-md">Locations</h2>
            <span className="text-sm text-muted-foreground">Tap a location to drill in</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {kpis.map((k) => (
              <LocationCard key={k.slug} kpi={k} />
            ))}
          </div>
        </section>

        <section className="grid lg:grid-cols-3 gap-5 mb-10">
          <div className="lg:col-span-2">
            <ActivityFeed />
          </div>
          <div className="rounded-lg border border-border bg-card p-5">
            <h2 className="font-display text-lg">Group health</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Where to look first.
            </p>
            <ul className="mt-5 space-y-3.5">
              {kpis
                .slice()
                .sort((a, b) => b.avgVariancePct - a.avgVariancePct)
                .map((k) => {
                  const r = k;
                  const tone =
                    k.avgVariancePct >= 5
                      ? "destructive"
                      : k.avgVariancePct >= 3
                      ? "warning"
                      : "success";
                  return (
                    <li key={k.slug} className="flex items-center gap-3">
                      <span className="text-sm flex-1">
                        {k.slug === "miami"
                          ? "Daniel's Miami"
                          : k.slug === "fort-lauderdale"
                          ? "Daniel's FTL"
                          : "D's Sports Bar"}
                      </span>
                      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            tone === "destructive"
                              ? "bg-destructive"
                              : tone === "warning"
                              ? "bg-warning"
                              : "bg-success"
                          }`}
                          style={{ width: `${Math.min(100, r.avgVariancePct * 12)}%` }}
                        />
                      </div>
                      <span className="text-sm tabular w-12 text-right">{k.avgVariancePct.toFixed(1)}%</span>
                    </li>
                  );
                })}
            </ul>

            <div className="mt-6 pt-5 border-t border-border">
              <div className="micro text-muted-foreground mb-2">Top variance, group-wide</div>
              {kpis
                .filter((k) => k.topVariance)
                .sort((a, b) =>
                  Math.abs(b.topVariance!.variancePct) - Math.abs(a.topVariance!.variancePct),
                )
                .slice(0, 1)
                .map((k) => (
                  <div key={k.slug}>
                    <div className="text-sm font-medium">{k.topVariance!.item}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      {k.topVariance!.station} · {k.slug === "miami" ? "Miami" : k.slug === "fort-lauderdale" ? "FTL" : "D's Sports"} · {k.topVariance!.variancePct}%
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </section>

        <footer className="mt-12 pt-6 border-t border-border text-xs text-muted-foreground flex justify-between flex-wrap gap-2">
          <div>© 2026 Gioia Hospitality Group · Mise inventory · v0.1</div>
          <div>Mock data — not connected to Supabase yet</div>
        </footer>
      </main>
    </div>
  );
}
