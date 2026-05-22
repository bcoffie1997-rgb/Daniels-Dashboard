import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { getRestaurant } from "@/lib/restaurants";
import { sessionById, relativeTime } from "@/lib/seed/sessions";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ClipboardList,
} from "lucide-react";

export default function SessionDetailPage({
  params,
}: {
  params: { slug: string; id: string };
}) {
  const restaurant = getRestaurant(params.slug);
  if (!restaurant) notFound();
  const session = sessionById(params.id);
  if (!session || session.restaurantSlug !== restaurant.slug) notFound();

  const bigVariances = session.entries.filter(
    (e) => Math.abs(e.variancePct ?? 0) >= 15,
  ).length;
  const totalUnits = session.entries.reduce((s, e) => s + e.quantity, 0);

  const statusMeta = {
    approved: { Icon: CheckCircle2, tone: "success" as const, label: "Approved" },
    rejected: { Icon: XCircle, tone: "destructive" as const, label: "Rejected" },
    submitted: { Icon: ClipboardList, tone: "warning" as const, label: "Pending" },
    in_progress: { Icon: Clock, tone: "warning" as const, label: "In progress" },
  }[session.status];
  const StatusIcon = statusMeta.Icon;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader current={restaurant} />
      <div className="h-1 w-full" style={{ backgroundColor: restaurant.accentHex }} />
      <main className="mx-auto max-w-[1100px] px-4 md:px-8 py-8 md:py-10">
        <Link
          href={`/r/${restaurant.slug}/sessions`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ChevronLeft className="h-4 w-4" /> All sessions
        </Link>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1.5">
            <StatusIcon className={`h-4 w-4 ${toneIconClass(statusMeta.tone)}`} />
            <span className="micro text-accent">Session detail</span>
          </div>
          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="font-display text-display-2xl tracking-tight">
              {session.stationName}
            </h1>
            <Badge variant={statusMeta.tone as any}>{statusMeta.label}</Badge>
            {bigVariances > 0 && (
              <Badge variant="destructive">
                <AlertTriangle className="h-3 w-3 mr-1 inline" />
                {bigVariances} large variance{bigVariances === 1 ? "" : "s"}
              </Badge>
            )}
          </div>
          <div className="text-sm text-muted-foreground mt-2 flex flex-wrap gap-x-4 gap-y-1">
            <span>
              Counted by <span className="text-foreground">{session.countedBy.name}</span>
            </span>
            {session.approvedBy && (
              <span>
                {session.status === "rejected" ? "Rejected by" : "Approved by"}{" "}
                <span className="text-foreground">{session.approvedBy.name}</span>
              </span>
            )}
            <span>
              Started <span className="tabular text-foreground">{session.startedAt}</span>
            </span>
            {session.submittedAt && (
              <span>
                Submitted <span className="tabular text-foreground">{session.submittedAt}</span>
              </span>
            )}
            {session.approvedAt && (
              <span>
                Approved <span className="tabular text-foreground">{session.approvedAt}</span>
              </span>
            )}
            {session.rejectedAt && (
              <span>
                Rejected <span className="tabular text-foreground">{session.rejectedAt}</span>
              </span>
            )}
          </div>
        </div>

        {session.notes && (
          <div className="mb-4 rounded-lg border border-border bg-card px-4 py-3">
            <div className="micro text-muted-foreground mb-1">Counter notes</div>
            <p className="text-sm italic leading-relaxed">“{session.notes}”</p>
          </div>
        )}

        {session.rejectionReason && (
          <div className="mb-6 rounded-lg border border-destructive/40 bg-destructive-bg px-4 py-3">
            <div className="micro text-destructive mb-1">Rejection reason</div>
            <p className="text-sm leading-relaxed">{session.rejectionReason}</p>
            <div className="text-xs text-muted-foreground mt-2">
              The counter sees this when they reopen the count flow at this station.
            </div>
          </div>
        )}

        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Stat label="Items counted" value={session.entries.length} />
          <Stat label="Total units" value={totalUnits.toFixed(1)} />
          <Stat
            label="Large variances"
            value={bigVariances}
            tone={bigVariances > 0 ? "warning" : "success"}
          />
          <Stat
            label="Elapsed"
            value={
              session.submittedAt
                ? minutesBetween(session.startedAt, session.submittedAt) + " min"
                : "in progress"
            }
          />
        </section>

        <div className="rounded-lg border border-border bg-card overflow-hidden mb-6">
          <table className="w-full text-sm">
            <thead className="bg-muted/30">
              <tr className="text-left">
                <th className="micro text-muted-foreground px-4 py-3 font-medium">Item</th>
                <th className="micro text-muted-foreground px-4 py-3 font-medium w-24 text-right">
                  Last
                </th>
                <th className="micro text-muted-foreground px-4 py-3 font-medium w-24 text-right">
                  Counted
                </th>
                <th className="micro text-muted-foreground px-4 py-3 font-medium w-28 text-right">
                  Δ %
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {session.entries.map((e, i) => {
                const big = Math.abs(e.variancePct ?? 0) >= 15;
                return (
                  <tr key={i} className={big ? "bg-warning-bg/40" : ""}>
                    <td className="px-4 py-2.5 font-medium">{e.itemName}</td>
                    <td className="px-4 py-2.5 text-right tabular text-muted-foreground">
                      {e.previousQuantity ?? "—"}
                    </td>
                    <td className="px-4 py-2.5 text-right tabular font-medium">{e.quantity}</td>
                    <td className="px-4 py-2.5 text-right tabular">
                      {e.variancePct == null ? (
                        <span className="text-muted-foreground">—</span>
                      ) : big ? (
                        <Badge variant="destructive">
                          {e.variancePct > 0 ? "+" : ""}
                          {e.variancePct.toFixed(1)}%
                        </Badge>
                      ) : (
                        <span>
                          {e.variancePct > 0 ? "+" : ""}
                          {e.variancePct.toFixed(1)}%
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {session.status === "submitted" && (
          <div className="rounded-lg border border-accent/40 bg-accent/5 p-4 flex items-start gap-3">
            <ClipboardList className="h-5 w-5 text-accent shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-sm font-medium">Awaiting approval</div>
              <div className="text-xs text-muted-foreground mt-1">
                A manager hasn't reviewed this yet. Open the approvals queue to decide.
              </div>
            </div>
            <Link
              href={`/r/${restaurant.slug}/approvals/${session.id}`}
              data-show-when="manager"
              className="shrink-0 inline-flex items-center gap-1.5 rounded-md bg-accent text-accent-foreground px-3 py-1.5 text-sm font-medium hover:bg-accent/90"
            >
              Review
            </Link>
          </div>
        )}

        {session.status === "in_progress" && (
          <div className="rounded-lg border border-warning/40 bg-warning-bg p-4 flex items-start gap-3">
            <Clock className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-sm font-medium">Still counting</div>
              <div className="text-xs text-muted-foreground mt-1">
                Started {relativeTime(session.startedAt)}. {session.entries.length} item
                {session.entries.length === 1 ? "" : "s"} recorded so far.
              </div>
            </div>
            <Link
              href={`/r/${restaurant.slug}/count/${encodeURIComponent(session.stationName)}`}
              className="shrink-0 inline-flex items-center gap-1.5 rounded-md bg-warning text-warning-foreground px-3 py-1.5 text-sm font-medium hover:bg-warning/90"
            >
              Resume
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string | number;
  tone?: "warning" | "success";
}) {
  const color =
    tone === "warning"
      ? "text-warning"
      : tone === "success"
      ? "text-success"
      : "text-foreground";
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="micro text-muted-foreground">{label}</div>
      <div className={`font-display text-display-md tabular mt-1.5 ${color}`}>{value}</div>
    </div>
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

function minutesBetween(start: string, end: string): number {
  const a = new Date(start.replace(" ", "T")).getTime();
  const b = new Date(end.replace(" ", "T")).getTime();
  return Math.max(0, Math.round((b - a) / 60000));
}
