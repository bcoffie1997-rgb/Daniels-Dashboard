import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { getRestaurant, type RestaurantSlug } from "@/lib/restaurants";
import { getSeed, belowParItems } from "@/lib/seed";
import { lastCountedFor, relativeTime } from "@/lib/seed/sessions";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, AlertTriangle, ShieldCheck, Clock } from "lucide-react";

export default function InventoryPage({ params }: { params: { slug: string } }) {
  const restaurant = getRestaurant(params.slug);
  if (!restaurant) notFound();
  const seed = getSeed(restaurant.slug)!;
  const totalItems = seed.stations.reduce((s, st) => s + st.items.length, 0);
  const belowParCount = belowParItems(seed).length;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader current={restaurant} />
      <div className="h-1 w-full" style={{ backgroundColor: restaurant.accentHex }} />
      <main className="mx-auto max-w-[1400px] px-4 md:px-8 py-8 md:py-10">
        <nav className="text-sm text-muted-foreground flex items-center gap-2 mb-4">
          <Link href={`/r/${restaurant.slug}`} className="hover:text-accent">{restaurant.shortName}</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground">Inventory</span>
        </nav>

        <div className="mb-6 flex items-end justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-display text-display-2xl tracking-tight">Inventory</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              {totalItems} items · {seed.stations.length} stations · seeded from menu analysis.
              Pars are starting points — managers tune them as cycle counts come in.
            </p>
          </div>
          {belowParCount > 0 && (
            <Link
              href={`/r/${restaurant.slug}/reorder`}
              className="inline-flex items-center gap-2 rounded-md border border-warning/40 bg-warning-bg px-3 py-2 text-sm hover:border-warning transition-colors"
            >
              <AlertTriangle className="h-4 w-4 text-warning" />
              <span className="text-warning font-medium">{belowParCount} items below par</span>
              <ChevronRight className="h-4 w-4 text-warning" />
            </Link>
          )}
        </div>

        <div className="mb-8 sticky top-16 z-10 -mx-4 px-4 md:-mx-8 md:px-8 py-3 bg-background/85 backdrop-blur border-b border-border">
          <div className="flex gap-2 overflow-x-auto -mx-1 px-1">
            {seed.stations.map((s) => (
              <a
                key={s.name}
                href={`#${encodeURIComponent(s.name)}`}
                className="shrink-0 text-xs px-3 py-1.5 rounded-full border border-border bg-card hover:border-accent/60 transition-colors"
              >
                {s.name.replace(/^Walk-in Cooler — /, "Cooler · ").replace(/^Bar — /, "Bar · ")}
                <span className="text-muted-foreground ml-1.5">{s.items.length}</span>
              </a>
            ))}
          </div>
        </div>

        <div className="space-y-10">
          {seed.stations.map((s) => {
            const last = lastCountedFor(restaurant.slug as RestaurantSlug, s.name);
            return (
            <section key={s.name} id={s.name} className="scroll-mt-32">
              <div className="flex items-end justify-between mb-3 flex-wrap gap-2">
                <div>
                  <h2 className="font-display text-display-md">{s.name}</h2>
                  {last ? (
                    <div className="text-xs text-muted-foreground mt-1 inline-flex items-center gap-1.5">
                      <Clock className="h-3 w-3" />
                      Last counted {relativeTime(last.ts)} by {last.by}
                    </div>
                  ) : (
                    <div className="text-xs text-warning mt-1 inline-flex items-center gap-1.5">
                      <Clock className="h-3 w-3" />
                      Never counted
                    </div>
                  )}
                </div>
                <span className="micro text-muted-foreground">{s.items.length} items</span>
              </div>
              <div className="rounded-lg border border-border bg-card overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/30">
                    <tr className="text-left">
                      <th className="micro text-muted-foreground px-4 py-3 font-medium">Item</th>
                      <th className="micro text-muted-foreground px-4 py-3 font-medium hidden md:table-cell">Category</th>
                      <th className="micro text-muted-foreground px-4 py-3 font-medium w-20">Unit</th>
                      <th className="micro text-muted-foreground px-4 py-3 font-medium w-24 text-right">Last count</th>
                      <th className="micro text-muted-foreground px-4 py-3 font-medium w-20 text-right">Par</th>
                      <th className="micro text-muted-foreground px-4 py-3 font-medium w-28 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {s.items.map((it, i) => {
                      const belowPar = it.par != null && it.lastCounted != null && it.lastCounted < it.par;
                      const wellBelow = belowPar && it.lastCounted! / it.par! < 0.7;
                      return (
                        <tr key={i} className="hover:bg-muted/30">
                          <td className="px-4 py-2.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span>{it.name}</span>
                              {it.requiresDualCount && (
                                <span
                                  className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded border border-accent/40 bg-accent/10 text-accent font-medium"
                                  title="Requires two-person count at submit"
                                >
                                  <ShieldCheck className="h-3 w-3" />
                                  2-person
                                </span>
                              )}
                            </div>
                            {it.notes && <div className="text-xs text-muted-foreground mt-0.5">{it.notes}</div>}
                          </td>
                          <td className="px-4 py-2.5 hidden md:table-cell">
                            {it.category ? (
                              <Badge variant="outline">{it.category}</Badge>
                            ) : (
                              <span className="text-muted-foreground text-xs">—</span>
                            )}
                          </td>
                          <td className="px-4 py-2.5 text-muted-foreground">{it.unit}</td>
                          <td className="px-4 py-2.5 text-right tabular">
                            {it.lastCounted ?? <span className="text-muted-foreground">—</span>}
                          </td>
                          <td className="px-4 py-2.5 text-right tabular">{it.par ?? "—"}</td>
                          <td className="px-4 py-2.5 text-right">
                            {wellBelow ? (
                              <Badge variant="destructive">Reorder</Badge>
                            ) : belowPar ? (
                              <Badge variant="warning">Below par</Badge>
                            ) : (
                              <span className="text-muted-foreground text-xs">OK</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
            );
          })}
        </div>
      </main>
    </div>
  );
}
