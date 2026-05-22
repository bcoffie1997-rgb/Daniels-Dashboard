import Link from "next/link";
import { RESTAURANTS } from "@/lib/restaurants";
import { getKpiFor } from "@/lib/mock-data";
import { sessionsFor, relativeTime } from "@/lib/seed/sessions";
import { Badge } from "@/components/ui/badge";
import {
  ChevronRight,
  Boxes,
  AlertTriangle,
  ClipboardList,
  TrendingDown,
  ShieldCheck,
  ArrowUpRight,
  Clock,
  Activity,
} from "lucide-react";

export default function GroupDashboard() {
  const locations = RESTAURANTS.map((r) => ({
    restaurant: r,
    kpi: getKpiFor(r.slug),
    sessions: sessionsFor(r.slug),
  }));

  const groupTotals = {
    items: locations.reduce((s, l) => s + l.kpi.itemsTracked, 0),
    pending: locations.reduce((s, l) => s + l.kpi.pendingApproval, 0),
    openVariances: locations.reduce((s, l) => s + l.kpi.openVariances, 0),
    sessionsThisWeek: locations.reduce((s, l) => s + l.kpi.sessionsThisWeek, 0),
    avgVariance:
      locations.reduce((s, l) => s + l.kpi.avgVariancePct, 0) / locations.length,
  };

  // Group-wide recent activity — last 8 sessions across all 3 restaurants
  const recentActivity = locations
    .flatMap((l) => l.sessions)
    .sort((a, b) => {
      const aTs = a.approvedAt ?? a.rejectedAt ?? a.submittedAt ?? a.startedAt;
      const bTs = b.approvedAt ?? b.rejectedAt ?? b.submittedAt ?? b.startedAt;
      return aTs < bTs ? 1 : -1;
    })
    .slice(0, 8);

  // Worst-variance restaurant
  const sortedByVariance = [...locations].sort(
    (a, b) => b.kpi.avgVariancePct - a.kpi.avgVariancePct,
  );

  return (
    <main className="mx-auto max-w-[1400px] px-4 md:px-8 py-8 md:py-10">
        <nav className="text-sm text-muted-foreground flex items-center gap-2 mb-4">
          <span className="text-foreground">Admin</span>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground">Group</span>
        </nav>

        <div className="mb-8 flex items-end justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <ShieldCheck className="h-4 w-4 text-accent" />
              <span className="micro text-accent">Gioia Hospitality · all locations</span>
            </div>
            <h1 className="font-display text-display-2xl tracking-tight">
              Group overview
            </h1>
            <p className="text-muted-foreground mt-2 max-w-xl">
              Live across Daniel's Miami, Daniel's Fort Lauderdale, and D's Sports Bar.
              Click any location to drill in.
            </p>
          </div>
          <div className="text-right">
            <div className="micro text-muted-foreground">This week</div>
            <div className="font-display text-2xl tabular mt-1">
              {groupTotals.sessionsThisWeek} sessions
            </div>
          </div>
        </div>

        {/* Group KPIs */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <Kpi label="Items tracked" value={groupTotals.items} sub="across 3 locations" icon={Boxes} />
          <Kpi
            label="Pending approvals"
            value={groupTotals.pending}
            sub="awaiting manager"
            icon={ClipboardList}
            tone={groupTotals.pending > 0 ? "warning" : "success"}
          />
          <Kpi
            label="Open variances"
            value={groupTotals.openVariances}
            sub="> 10% deviation"
            icon={AlertTriangle}
            tone={groupTotals.openVariances > 0 ? "destructive" : "success"}
          />
          <Kpi
            label="Avg variance"
            value={`${groupTotals.avgVariance.toFixed(1)}%`}
            sub="rolling 7-day mean"
            icon={TrendingDown}
            tone={groupTotals.avgVariance >= 4 ? "warning" : "success"}
          />
        </section>

        {/* Locations */}
        <section className="mb-10">
          <div className="flex items-end justify-between mb-4">
            <h2 className="font-display text-display-md">Locations</h2>
            <span className="text-sm text-muted-foreground">Tap a location to drill in</span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {locations.map((l) => (
              <LocationCard key={l.restaurant.slug} restaurant={l.restaurant} kpi={l.kpi} />
            ))}
          </div>
        </section>

        {/* Health bars + Recent activity */}
        <section className="grid lg:grid-cols-3 gap-5 mb-10">
          <div className="lg:col-span-2 rounded-lg border border-border bg-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex items-center justify-between">
              <h2 className="font-display text-lg flex items-center gap-2">
                <Activity className="h-4 w-4 text-accent" />
                Recent activity
              </h2>
              <Link
                href="/admin/changelog"
                className="text-xs text-muted-foreground hover:text-accent inline-flex items-center gap-1"
              >
                Full changelog <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <ul className="divide-y divide-border">
              {recentActivity.map((s) => {
                const r = RESTAURANTS.find((x) => x.slug === s.restaurantSlug)!;
                const ts =
                  s.approvedAt ?? s.rejectedAt ?? s.submittedAt ?? s.startedAt;
                const verb =
                  s.status === "approved"
                    ? "approved"
                    : s.status === "rejected"
                    ? "rejected"
                    : s.status === "submitted"
                    ? "submitted"
                    : "started";
                const toneClass =
                  s.status === "approved"
                    ? "text-success"
                    : s.status === "rejected"
                    ? "text-destructive"
                    : s.status === "submitted"
                    ? "text-warning"
                    : "text-muted-foreground";
                return (
                  <li key={s.id} className="px-5 py-3.5 flex items-start gap-3 hover:bg-muted/30">
                    <div
                      className="mt-1.5 h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: r.accentHex }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap text-sm">
                        <span className="font-medium">
                          {s.approvedBy?.name ?? s.countedBy.name}
                        </span>
                        <span className={toneClass}>{verb}</span>
                        <span className="font-medium">{s.stationName}</span>
                        <span className="text-xs text-muted-foreground">· {r.shortName}</span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {s.entries.length} item{s.entries.length === 1 ? "" : "s"}
                        {s.rejectionReason && (
                          <span className="italic"> · “{s.rejectionReason.slice(0, 70)}{s.rejectionReason.length > 70 ? "…" : ""}”</span>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground tabular shrink-0">
                      {relativeTime(ts)}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Group health */}
          <div className="rounded-lg border border-border bg-card p-5">
            <h2 className="font-display text-lg">Where to look first</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Locations ranked by avg variance.
            </p>
            <ul className="mt-5 space-y-3.5">
              {sortedByVariance.map((l) => {
                const v = l.kpi.avgVariancePct;
                const tone = v >= 5 ? "destructive" : v >= 3 ? "warning" : "success";
                return (
                  <li key={l.restaurant.slug} className="flex items-center gap-3">
                    <Link
                      href={`/r/${l.restaurant.slug}`}
                      className="text-sm flex-1 hover:text-accent"
                    >
                      {l.restaurant.shortName}
                    </Link>
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          tone === "destructive"
                            ? "bg-destructive"
                            : tone === "warning"
                            ? "bg-warning"
                            : "bg-success"
                        }`}
                        style={{ width: `${Math.min(100, v * 12)}%` }}
                      />
                    </div>
                    <span className="text-sm tabular w-12 text-right">
                      {v.toFixed(1)}%
                    </span>
                  </li>
                );
              })}
            </ul>
            <div className="mt-6 pt-5 border-t border-border space-y-3">
              <Link
                href="/admin/changelog"
                className="flex items-center justify-between text-sm hover:text-accent"
              >
                <span>Group changelog</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
              <div className="text-xs text-muted-foreground italic">
                Group-level admin tools land in v2 (users · billing · integrations across locations).
              </div>
            </div>
          </div>
        </section>

        {/* Per-location pending breakdown */}
        <section>
          <h2 className="font-display text-display-md mb-4">Pending approvals by location</h2>
          <div className="grid sm:grid-cols-3 gap-3">
            {locations.map((l) => {
              const pending = l.sessions.filter((s) => s.status === "submitted");
              return (
                <div
                  key={l.restaurant.slug}
                  className="rounded-lg border border-border bg-card p-5"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="micro"
                      style={{ color: l.restaurant.accentHex }}
                    >
                      {l.restaurant.shortName}
                    </span>
                    <Link
                      href={`/r/${l.restaurant.slug}/approvals`}
                      className="text-xs text-muted-foreground hover:text-accent inline-flex items-center gap-1"
                    >
                      Open queue <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>
                  <div className="font-display text-display-md tabular mt-2">
                    {pending.length} pending
                  </div>
                  <ul className="mt-3 space-y-1.5">
                    {pending.length === 0 ? (
                      <li className="text-xs text-muted-foreground italic">All clear.</li>
                    ) : (
                      pending.slice(0, 3).map((p) => (
                        <li key={p.id} className="text-xs flex items-center gap-2">
                          <Clock className="h-3 w-3 text-muted-foreground shrink-0" />
                          <span className="truncate">{p.stationName}</span>
                          <span className="text-muted-foreground tabular shrink-0">
                            {relativeTime(p.submittedAt!)}
                          </span>
                        </li>
                      ))
                    )}
                    {pending.length > 3 && (
                      <li className="text-xs text-muted-foreground">
                        +{pending.length - 3} more
                      </li>
                    )}
                  </ul>
                </div>
              );
            })}
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
  sub: string;
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
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="micro text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className={`font-display text-display-lg tabular mt-3 ${toneCls}`}>{value}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>
    </div>
  );
}

function LocationCard({
  restaurant,
  kpi,
}: {
  restaurant: (typeof RESTAURANTS)[number];
  kpi: ReturnType<typeof getKpiFor>;
}) {
  const varianceTone =
    kpi.avgVariancePct >= 5
      ? "destructive"
      : kpi.avgVariancePct >= 3
      ? "warning"
      : "success";
  const varianceColorClass =
    varianceTone === "destructive"
      ? "text-destructive"
      : varianceTone === "warning"
      ? "text-warning"
      : "text-success";

  return (
    <Link
      href={`/r/${restaurant.slug}`}
      className="group block rounded-lg border border-border bg-card overflow-hidden hover:border-accent/50 transition-colors"
    >
      <div className="h-1.5 w-full" style={{ backgroundColor: restaurant.accentHex }} />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="font-display text-display-md leading-tight">
              {restaurant.name}
            </div>
            <div className="text-sm text-muted-foreground mt-0.5">{restaurant.city}</div>
          </div>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
        </div>

        <div className="grid grid-cols-3 gap-3 mt-5">
          <div>
            <div className="micro text-muted-foreground">Items</div>
            <div className="font-display text-2xl tabular mt-1">{kpi.itemsTracked}</div>
          </div>
          <div>
            <div className="micro text-muted-foreground">Stations</div>
            <div className="font-display text-2xl tabular mt-1">{kpi.stationsActive}</div>
          </div>
          <div>
            <div className="micro text-muted-foreground">Variance</div>
            <div className={`font-display text-2xl tabular mt-1 ${varianceColorClass}`}>
              {kpi.avgVariancePct.toFixed(1)}%
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" /> Last count
            </span>
            <span className="tabular">{kpi.lastCountAt}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground inline-flex items-center gap-1.5">
              <ClipboardList className="h-3.5 w-3.5" /> Pending
            </span>
            <span>
              {kpi.pendingApproval > 0 ? (
                <Badge variant="warning">{kpi.pendingApproval}</Badge>
              ) : (
                <Badge variant="success">0</Badge>
              )}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground inline-flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" /> Variances
            </span>
            <span>
              {kpi.openVariances > 0 ? (
                <Badge variant="destructive">{kpi.openVariances}</Badge>
              ) : (
                <Badge variant="success">0</Badge>
              )}
            </span>
          </div>
        </div>

        {kpi.topVariance && (
          <div className="mt-4 rounded-md border border-destructive/30 bg-destructive-bg px-3 py-2.5">
            <div className="micro text-destructive">Biggest variance</div>
            <div className="text-sm mt-0.5 leading-snug">{kpi.topVariance.item}</div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {kpi.topVariance.station} · {kpi.topVariance.variancePct}%
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}
