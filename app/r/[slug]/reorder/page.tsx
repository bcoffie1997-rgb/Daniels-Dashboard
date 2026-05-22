import { notFound } from "next/navigation";
import Link from "next/link";
import { getRestaurant } from "@/lib/restaurants";
import { getSeed, belowParItems } from "@/lib/seed";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { ChevronRight, AlertTriangle, Send, CheckCircle2 } from "lucide-react";

export default function ReorderPage({ params }: { params: { slug: string } }) {
  const restaurant = getRestaurant(params.slug);
  if (!restaurant) notFound();
  const seed = getSeed(restaurant.slug)!;
  const items = belowParItems(seed);
  const critical = items.filter((x) => x.pctOfPar < 70);
  const watch = items.filter((x) => x.pctOfPar >= 70);

  return (
    <main className="mx-auto max-w-[1400px] px-4 md:px-8 py-8 md:py-10">
        <nav className="text-sm text-muted-foreground flex items-center gap-2 mb-4">
          <Link href={`/r/${restaurant.slug}`} className="hover:text-accent">{restaurant.shortName}</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground">Reorder</span>
        </nav>

        <div className="mb-6 flex items-end justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-display-2xl tracking-tight">Reorder list</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              Items whose last approved count fell below par. Below 70% of par is flagged
              critical — pull invoices and put it on tomorrow's order.
            </p>
          </div>
          <button
            disabled
            title="Wiring email + Slack delivery in v2"
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm text-muted-foreground opacity-60 cursor-not-allowed"
          >
            <Send className="h-4 w-4" />
            Email to purchaser (v2)
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          <div className="rounded-lg border border-destructive/40 bg-destructive-bg p-4">
            <div className="micro text-destructive">Critical</div>
            <div className="font-display text-display-md tabular mt-1.5">{critical.length}</div>
            <div className="text-xs text-muted-foreground mt-0.5">below 70% of par</div>
          </div>
          <div className="rounded-lg border border-warning/40 bg-warning-bg p-4">
            <div className="micro text-warning">Watch</div>
            <div className="font-display text-display-md tabular mt-1.5">{watch.length}</div>
            <div className="text-xs text-muted-foreground mt-0.5">70–99% of par</div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="micro text-muted-foreground">Total below par</div>
            <div className="font-display text-display-md tabular mt-1.5">{items.length}</div>
            <div className="text-xs text-muted-foreground mt-0.5">across all stations</div>
          </div>
        </div>

        {items.length === 0 ? (
          <EmptyState
            icon={CheckCircle2}
            tone="success"
            title="All stations at par"
            body="Nothing to reorder right now. We'll flag items the moment the next approved count drops below par."
          />
        ) : (
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/30">
                <tr className="text-left">
                  <th className="micro text-muted-foreground px-4 py-3 font-medium">Item</th>
                  <th className="micro text-muted-foreground px-4 py-3 font-medium hidden md:table-cell">Station</th>
                  <th className="micro text-muted-foreground px-4 py-3 font-medium w-24 text-right">Last</th>
                  <th className="micro text-muted-foreground px-4 py-3 font-medium w-20 text-right">Par</th>
                  <th className="micro text-muted-foreground px-4 py-3 font-medium w-24 text-right">Short by</th>
                  <th className="micro text-muted-foreground px-4 py-3 font-medium w-24 text-right">% of par</th>
                  <th className="micro text-muted-foreground px-4 py-3 font-medium w-28 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((x, i) => {
                  const isCritical = x.pctOfPar < 70;
                  return (
                    <tr key={i} className="hover:bg-muted/30">
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span>{x.item.name}</span>
                          {x.item.unitCost && (
                            <span className="text-xs text-muted-foreground">~${x.item.unitCost}/{x.item.unit}</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 hidden md:table-cell text-muted-foreground text-xs">
                        {x.station}
                      </td>
                      <td className="px-4 py-2.5 text-right tabular">{x.item.lastCounted}</td>
                      <td className="px-4 py-2.5 text-right tabular text-muted-foreground">{x.item.par}</td>
                      <td className="px-4 py-2.5 text-right tabular text-destructive">{x.delta}</td>
                      <td className="px-4 py-2.5 text-right tabular">{x.pctOfPar}%</td>
                      <td className="px-4 py-2.5 text-right">
                        {isCritical ? (
                          <Badge variant="destructive">Critical</Badge>
                        ) : (
                          <Badge variant="warning">Watch</Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-8 rounded-lg border border-accent/40 bg-accent/5 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-accent shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-medium">v2 — automated notifier coming</div>
            <div className="text-xs text-muted-foreground mt-1 max-w-2xl">
              Below-par alerts will fire to the purchaser's email + the kitchen Slack on a
              cron schedule. Today this list is computed live from the last approved count
              per item.
            </div>
          </div>
        </div>
      </main>
  );
}
