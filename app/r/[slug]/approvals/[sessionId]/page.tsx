import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { getRestaurant } from "@/lib/restaurants";
import { sessionById } from "@/lib/seed/sessions";
import { ApprovalActions } from "./approval-actions";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, AlertTriangle, ClipboardCheck } from "lucide-react";

export default function ApprovalDetailPage({
  params,
}: {
  params: { slug: string; sessionId: string };
}) {
  const restaurant = getRestaurant(params.slug);
  if (!restaurant) notFound();
  const session = sessionById(params.sessionId);
  if (!session || session.restaurantSlug !== restaurant.slug) notFound();

  const bigVariances = session.entries.filter(
    (e) => Math.abs(e.variancePct ?? 0) >= 15,
  );

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader current={restaurant} />
      <div className="h-1 w-full" style={{ backgroundColor: restaurant.accentHex }} />
      <main className="mx-auto max-w-[1100px] px-4 md:px-8 py-8 md:py-10 pb-32">
        <Link
          href={`/r/${restaurant.slug}/approvals`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ChevronLeft className="h-4 w-4" /> All approvals
        </Link>

        <div className="mb-6">
          <div className="flex items-center gap-2 mb-1.5">
            <ClipboardCheck className="h-4 w-4 text-accent" />
            <span className="micro text-accent">Review count</span>
          </div>
          <div className="flex items-baseline gap-3 flex-wrap">
            <h1 className="font-display text-display-2xl tracking-tight">
              {session.stationName}
            </h1>
            <Badge variant="warning">Pending</Badge>
          </div>
          <div className="text-sm text-muted-foreground mt-2 flex flex-wrap gap-x-4 gap-y-1">
            <span>Counted by <span className="text-foreground">{session.countedBy.name}</span></span>
            <span>Started <span className="tabular text-foreground">{session.startedAt}</span></span>
            <span>Submitted <span className="tabular text-foreground">{session.submittedAt}</span></span>
            <span>{session.entries.length} items</span>
          </div>
          {session.notes && (
            <div className="mt-4 rounded-lg border border-border bg-card px-4 py-3">
              <div className="micro text-muted-foreground mb-1">Counter notes</div>
              <p className="text-sm italic leading-relaxed">“{session.notes}”</p>
            </div>
          )}
        </div>

        {bigVariances.length > 0 && (
          <div className="rounded-lg border border-warning/40 bg-warning-bg p-4 mb-6 flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-sm">
                {bigVariances.length} variance{bigVariances.length === 1 ? "" : "s"} over 15%
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Pull receiving invoices and 86 lists for the items below before deciding. If
                the variance is unexplained, reject with a recount reason.
              </div>
            </div>
          </div>
        )}

        <div className="rounded-lg border border-border bg-card overflow-hidden mb-8">
          <table className="w-full text-sm">
            <thead className="bg-muted/30">
              <tr className="text-left">
                <th className="micro text-muted-foreground px-4 py-3 font-medium">Item</th>
                <th className="micro text-muted-foreground px-4 py-3 font-medium w-24 text-right">Last</th>
                <th className="micro text-muted-foreground px-4 py-3 font-medium w-24 text-right">Counted</th>
                <th className="micro text-muted-foreground px-4 py-3 font-medium w-28 text-right">Δ %</th>
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

        <ApprovalActions
          restaurantSlug={restaurant.slug}
          sessionId={session.id}
          stationName={session.stationName}
        />
      </main>
    </div>
  );
}
