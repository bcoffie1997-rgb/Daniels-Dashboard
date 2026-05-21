import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { getRestaurant } from "@/lib/restaurants";
import { getSeed } from "@/lib/seed";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";

export default function InventoryPage({ params }: { params: { slug: string } }) {
  const restaurant = getRestaurant(params.slug);
  if (!restaurant) notFound();
  const seed = getSeed(restaurant.slug)!;
  const totalItems = seed.stations.reduce((s, st) => s + st.items.length, 0);

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

        <div className="mb-8">
          <h1 className="font-display text-display-2xl tracking-tight">Inventory</h1>
          <p className="text-muted-foreground mt-2">
            {totalItems} items · {seed.stations.length} stations · seeded from menu analysis.
            Pars are starting points — managers tune them as cycle counts come in.
          </p>
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
          {seed.stations.map((s) => (
            <section key={s.name} id={s.name} className="scroll-mt-32">
              <div className="flex items-end justify-between mb-3 flex-wrap gap-2">
                <h2 className="font-display text-display-md">{s.name}</h2>
                <span className="micro text-muted-foreground">{s.items.length} items</span>
              </div>
              <div className="rounded-lg border border-border bg-card overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/30">
                    <tr className="text-left">
                      <th className="micro text-muted-foreground px-4 py-3 font-medium">Item</th>
                      <th className="micro text-muted-foreground px-4 py-3 font-medium hidden sm:table-cell">Category</th>
                      <th className="micro text-muted-foreground px-4 py-3 font-medium w-20">Unit</th>
                      <th className="micro text-muted-foreground px-4 py-3 font-medium w-20 text-right">Par</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {s.items.map((it, i) => (
                      <tr key={i} className="hover:bg-muted/30">
                        <td className="px-4 py-2.5">
                          <div>{it.name}</div>
                          {it.notes && <div className="text-xs text-muted-foreground mt-0.5">{it.notes}</div>}
                        </td>
                        <td className="px-4 py-2.5 hidden sm:table-cell">
                          {it.category ? (
                            <Badge variant="outline">{it.category}</Badge>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 py-2.5 text-muted-foreground">{it.unit}</td>
                        <td className="px-4 py-2.5 text-right tabular">{it.par ?? "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
