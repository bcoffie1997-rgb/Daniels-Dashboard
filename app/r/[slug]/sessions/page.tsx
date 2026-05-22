import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { getRestaurant, type RestaurantSlug } from "@/lib/restaurants";
import { sessionsFor, type MockSession, type SessionStatus, relativeTime } from "@/lib/seed/sessions";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import {
  ChevronRight,
  ClipboardList,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
} from "lucide-react";

const STATUS_FILTERS: Array<{ key: SessionStatus | "all"; label: string }> = [
  { key: "all", label: "All" },
  { key: "in_progress", label: "In progress" },
  { key: "submitted", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
];

export default function SessionsPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { status?: string };
}) {
  const restaurant = getRestaurant(params.slug);
  if (!restaurant) notFound();
  const slug = restaurant.slug as RestaurantSlug;
  const all = sessionsFor(slug);
  const activeFilter = (searchParams.status as SessionStatus | "all") || "all";
  const filtered =
    activeFilter === "all" ? all : all.filter((s) => s.status === activeFilter);

  // Sort by most recent activity desc
  const sorted = filtered.slice().sort((a, b) => {
    const aTs = a.approvedAt ?? a.rejectedAt ?? a.submittedAt ?? a.startedAt;
    const bTs = b.approvedAt ?? b.rejectedAt ?? b.submittedAt ?? b.startedAt;
    return aTs < bTs ? 1 : -1;
  });

  const counts = {
    all: all.length,
    in_progress: all.filter((s) => s.status === "in_progress").length,
    submitted: all.filter((s) => s.status === "submitted").length,
    approved: all.filter((s) => s.status === "approved").length,
    rejected: all.filter((s) => s.status === "rejected").length,
  };

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader current={restaurant} />
      <div className="h-1 w-full" style={{ backgroundColor: restaurant.accentHex }} />
      <main className="mx-auto max-w-[1400px] px-4 md:px-8 py-8 md:py-10">
        <nav className="text-sm text-muted-foreground flex items-center gap-2 mb-4">
          <Link href={`/r/${restaurant.slug}`} className="hover:text-accent">
            {restaurant.shortName}
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground">Sessions</span>
        </nav>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1.5">
            <ClipboardList className="h-4 w-4 text-accent" />
            <span className="micro text-accent">Count history</span>
          </div>
          <h1 className="font-display text-display-2xl tracking-tight">Sessions</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Every count session — pending, approved, rejected, or in progress right now.
            Drill into any session for the variance breakdown.
          </p>
        </div>

        {/* Status filter pills */}
        <div className="mb-6 flex gap-2 overflow-x-auto -mx-1 px-1">
          {STATUS_FILTERS.map((f) => {
            const count = counts[f.key];
            const isActive = activeFilter === f.key;
            return (
              <Link
                key={f.key}
                href={
                  f.key === "all"
                    ? `/r/${restaurant.slug}/sessions`
                    : `/r/${restaurant.slug}/sessions?status=${f.key}`
                }
                className={`shrink-0 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  isActive
                    ? "border-accent bg-accent/10 text-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-accent/60"
                }`}
              >
                {f.label}
                <span className="text-xs tabular text-muted-foreground">{count}</span>
              </Link>
            );
          })}
        </div>

        {sorted.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title={activeFilter === "all" ? "No sessions yet" : "Nothing matches this filter"}
            body={
              activeFilter === "all"
                ? "Once a counter submits a count, you'll see it here."
                : "Try a different status — or clear the filter to see everything."
            }
            action={
              activeFilter !== "all" ? (
                <Link
                  href={`/r/${restaurant.slug}/sessions`}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-sm hover:border-accent/60"
                >
                  Show all
                </Link>
              ) : (
                <Link
                  href={`/r/${restaurant.slug}/count`}
                  className="inline-flex items-center gap-1.5 rounded-md bg-accent text-accent-foreground px-3 py-2 text-sm font-medium hover:bg-accent/90"
                >
                  Start a count
                </Link>
              )
            }
          />
        ) : (
          <ul className="space-y-3">
            {sorted.map((s) => (
              <SessionRow key={s.id} session={s} restaurantSlug={restaurant.slug} />
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}

function SessionRow({
  session,
  restaurantSlug,
}: {
  session: MockSession;
  restaurantSlug: string;
}) {
  const bigVariances = session.entries.filter(
    (e) => Math.abs(e.variancePct ?? 0) >= 15,
  ).length;
  const ts =
    session.approvedAt ?? session.rejectedAt ?? session.submittedAt ?? session.startedAt;

  const statusMeta: Record<SessionStatus, { label: string; tone: any; icon: any }> = {
    in_progress: { label: "In progress", tone: "warning", icon: Clock },
    submitted: { label: "Pending", tone: "warning", icon: ClipboardList },
    approved: { label: "Approved", tone: "success", icon: CheckCircle2 },
    rejected: { label: "Rejected", tone: "destructive", icon: XCircle },
  };
  const meta = statusMeta[session.status];
  const StatusIcon = meta.icon;

  // Destination:
  // - in-progress → resume in the count flow
  // - submitted (pending) → manager approval queue detail (decision needed)
  // - approved / rejected → read-only session detail
  const href =
    session.status === "in_progress"
      ? `/r/${restaurantSlug}/count/${encodeURIComponent(session.stationName)}`
      : session.status === "submitted"
      ? `/r/${restaurantSlug}/approvals/${session.id}`
      : `/r/${restaurantSlug}/sessions/${session.id}`;

  return (
    <li>
      <Link
        href={href}
        className="group block rounded-lg border border-border bg-card p-5 hover:border-accent/60 transition-colors"
      >
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <StatusIcon className={`h-4 w-4 ${toneIconClass(meta.tone)}`} />
              <span className="font-display text-xl leading-tight">{session.stationName}</span>
              <Badge variant={meta.tone as any}>{meta.label}</Badge>
              {bigVariances > 0 && session.status !== "in_progress" && (
                <Badge variant="destructive">
                  <AlertTriangle className="h-3 w-3 mr-1 inline" />
                  {bigVariances} large variance{bigVariances === 1 ? "" : "s"}
                </Badge>
              )}
            </div>
            <div className="text-sm text-muted-foreground mt-1.5">
              {session.entries.length} item{session.entries.length === 1 ? "" : "s"} · counted by{" "}
              <span className="text-foreground">{session.countedBy.name}</span>
              {session.approvedBy && (
                <>
                  {" · "}
                  approved by{" "}
                  <span className="text-foreground">{session.approvedBy.name}</span>
                </>
              )}
            </div>
            {session.rejectionReason && (
              <div className="text-xs text-destructive italic mt-2 leading-relaxed max-w-2xl">
                Rejected: “{session.rejectionReason}”
              </div>
            )}
            {session.notes && session.status !== "rejected" && (
              <div className="text-xs text-muted-foreground italic mt-2 leading-relaxed max-w-2xl">
                “{session.notes}”
              </div>
            )}
          </div>
          <div className="text-right shrink-0">
            <div className="text-xs text-muted-foreground tabular">{relativeTime(ts)}</div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">
              {session.status === "in_progress"
                ? "started"
                : session.status === "approved"
                ? "approved"
                : session.status === "rejected"
                ? "rejected"
                : "submitted"}
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors mt-1" />
        </div>
      </Link>
    </li>
  );
}

function toneIconClass(tone: string): string {
  switch (tone) {
    case "success":
      return "text-success";
    case "destructive":
      return "text-destructive";
    case "warning":
      return "text-warning";
    case "accent":
      return "text-accent";
    default:
      return "text-muted-foreground";
  }
}
