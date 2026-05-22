import { notFound } from "next/navigation";
import Link from "next/link";
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
    <main className="mx-auto max-w-[1400px] px-4 md:px-8 py-8 md:py-10">
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

        {/* Primary CTA — what counters arrive to do */}
        <section className="mb-8">
          <div className="rounded-lg border border-accent/40 bg-gradient-to-r from-accent/10 to-accent/5 p-5 md:p-6 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-accent flex items-center justify-center shrink-0">
                <ClipboardList className="h-6 w-6 text-accent-foreground" />
              </div>
              <div>
                <div className="font-display text-display-md leading-tight">Start a count</div>
                <div className="text-sm text-muted-foreground mt-0.5">
                  Pick a station — items are sorted in physical walk order.
                </div>
              </div>
            </div>
            <Link
              href={`/r/${restaurant.slug}/count`}
              className="inline-flex items-center gap-2 rounded-md bg-accent text-accent-foreground px-4 py-2.5 text-sm font-medium hover:bg-accent/90 transition-colors"
            >
              Choose station <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

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

        <section className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
          <div data-show-when="manager">
            <NavCard
              href={`/r/${restaurant.slug}/approvals`}
              caption="Approvals"
              title={kpi.pendingApproval > 0 ? `${kpi.pendingApproval} pending` : "All clear"}
              sub="Manager queue — review and approve / reject counts"
            />
          </div>
          <NavCard
            href={`/r/${restaurant.slug}/inventory`}
            caption="Inventory"
            title="By station"
            sub={`${kpi.itemsTracked} items · ${kpi.stationsActive} stations`}
          />
          <NavCard
            href={`/r/${restaurant.slug}/sessions`}
            caption="Sessions"
            title="History"
            sub="All counts — pending, approved, rejected, in progress"
          />
          <div data-show-when="manager">
            <NavCard
              href={`/r/${restaurant.slug}/reorder`}
              caption="Reorder"
              title="Below par"
              sub="Items short of par with critical / watch tiers"
            />
          </div>
          <NavCard
            href={`/r/${restaurant.slug}/menu`}
            caption="Menu"
            title={`${totalMenuItems} dishes`}
            sub="Full published menu by section"
          />
          <div data-show-when="manager">
            <NavCard
              href={`/r/${restaurant.slug}/avt`}
              caption="AvT"
              title="Actual vs Theoretical"
              sub="v2 preview · awaiting Toast sales feed"
              muted
            />
          </div>
          <div data-show-when="admin">
            <NavCard
              href={`/r/${restaurant.slug}/integrations`}
              caption="Integrations"
              title="Connect"
              sub="Toast POS · invoice OCR · alerts"
              muted
            />
          </div>
        </section>

        {kpi.topVariance && (
          <section className="mb-10" data-show-when="manager">
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

        <section className="mb-10">
          <div className="rounded-lg border border-border bg-card px-5 py-4 flex items-center justify-between flex-wrap gap-2">
            <div>
              <div className="micro text-muted-foreground">Last approved count</div>
              <div className="text-sm mt-1">
                <span className="tabular">{kpi.lastCountAt}</span>
                <span className="text-muted-foreground"> · {kpi.lastCountBy}</span>
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              {kpi.sessionsThisWeek} sessions this week
            </div>
          </div>
        </section>

        <section className="mb-10" data-show-when="admin">
          <div className="flex items-end justify-between mb-3">
            <h2 className="font-display text-display-md">Admin</h2>
            <span className="micro text-muted-foreground">visible to admins only</span>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <Link
              href={`/r/${restaurant.slug}/changelog`}
              className="group rounded-lg border border-border bg-card p-4 hover:border-accent/60 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="micro text-accent">Audit log</div>
                  <div className="text-sm font-medium mt-1.5">Changelog</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Every state change, in order</div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors shrink-0" />
              </div>
            </Link>
            <Link
              href={`/r/${restaurant.slug}/settings`}
              className="group rounded-lg border border-border bg-card p-4 hover:border-accent/60 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="micro text-accent">Configuration</div>
                  <div className="text-sm font-medium mt-1.5">Settings</div>
                  <div className="text-xs text-muted-foreground mt-0.5">Variance thresholds · notifications · cadence</div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors shrink-0" />
              </div>
            </Link>
            <div className="rounded-lg border border-border bg-card p-4 opacity-60">
              <div className="micro text-muted-foreground">Users &amp; roles</div>
              <div className="text-sm font-medium mt-1.5">Manage access</div>
              <div className="text-xs text-muted-foreground mt-0.5">Counter · manager · admin — v2</div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4 opacity-60">
              <div className="micro text-muted-foreground">Export</div>
              <div className="text-sm font-medium mt-1.5">Sessions to CSV</div>
              <div className="text-xs text-muted-foreground mt-0.5">For existing back-office workflows</div>
            </div>
          </div>
        </section>

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
  );
}

function NavCard({
  href, caption, title, sub, muted,
}: { href: string; caption: string; title: string; sub: string; muted?: boolean }) {
  return (
    <Link
      href={href}
      className={`group block h-full rounded-lg border bg-card p-5 transition-colors ${
        muted ? "border-border hover:border-accent/40" : "border-border hover:border-accent/60"
      }`}
    >
      <div className="flex items-center justify-between">
        <div className={`micro ${muted ? "text-accent" : "text-muted-foreground"}`}>{caption}</div>
        <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
      </div>
      <div className="font-display text-display-md mt-2">{title}</div>
      <p className="text-sm text-muted-foreground mt-1.5 leading-snug">{sub}</p>
    </Link>
  );
}
