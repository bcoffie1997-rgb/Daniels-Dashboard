import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { getRestaurant, type RestaurantSlug } from "@/lib/restaurants";
import { pendingSessionsFor } from "@/lib/seed/sessions";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { ChevronRight, ClipboardCheck, AlertTriangle, ShieldCheck, CheckCircle2 } from "lucide-react";

export default function ApprovalsPage({ params }: { params: { slug: string } }) {
  const restaurant = getRestaurant(params.slug);
  if (!restaurant) notFound();
  const pending = pendingSessionsFor(restaurant.slug as RestaurantSlug);

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
          <span className="text-foreground">Approvals</span>
        </nav>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1.5">
            <ClipboardCheck className="h-4 w-4 text-accent" />
            <span className="micro text-accent">Manager queue</span>
          </div>
          <h1 className="font-display text-display-2xl tracking-tight">
            Pending approvals
          </h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Count sessions waiting for a manager to approve or reject. Approve to
            commit the count; reject with a reason to send it back.
          </p>
        </div>

        {pending.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            tone="success"
            title="All clear"
            body="No pending count sessions. Counts will appear here when counters submit."
            action={
              <Link
                href={`/r/${restaurant.slug}/sessions?status=approved`}
                className="inline-flex items-center gap-1.5 rounded-md border border-border bg-card px-3 py-2 text-sm hover:border-accent/60"
              >
                View approved history
              </Link>
            }
          />
        ) : (
          <ul className="space-y-3">
            {pending.map((s) => {
              const bigVar = s.entries.filter((e) => Math.abs(e.variancePct ?? 0) >= 15).length;
              return (
                <li key={s.id}>
                  <Link
                    href={`/r/${restaurant.slug}/approvals/${s.id}`}
                    className="group block rounded-lg border border-border bg-card p-5 hover:border-accent/60 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-display text-xl leading-tight">{s.stationName}</span>
                          <Badge variant="warning">Pending</Badge>
                          {bigVar > 0 && (
                            <Badge variant="destructive">
                              {bigVar} variance{bigVar === 1 ? "" : "s"} &gt; 15%
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground mt-1.5">
                          {s.entries.length} items · counted by {s.countedBy.name} · submitted {fmtTime(s.submittedAt!)}
                        </div>
                        {s.notes && (
                          <div className="text-sm text-muted-foreground mt-2 italic leading-relaxed">
                            “{s.notes}”
                          </div>
                        )}
                      </div>
                      <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors shrink-0" />
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}

function fmtTime(ts: string): string {
  const [_, time] = ts.split(" ");
  return time;
}
