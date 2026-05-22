import { notFound } from "next/navigation";
import Link from "next/link";
import { getRestaurant } from "@/lib/restaurants";
import { getSeed } from "@/lib/seed";
import { ChevronRight } from "lucide-react";

export default function MenuPage({ params }: { params: { slug: string } }) {
  const restaurant = getRestaurant(params.slug);
  if (!restaurant) notFound();
  const seed = getSeed(restaurant.slug)!;

  return (
    <main className="mx-auto max-w-[1400px] px-4 md:px-8 py-8 md:py-10">
        <nav className="text-sm text-muted-foreground flex items-center gap-2 mb-4">
          <Link href={`/r/${restaurant.slug}`} className="hover:text-accent">{restaurant.shortName}</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground">Menu</span>
        </nav>

        <div className="mb-10">
          <h1 className="font-display text-display-2xl tracking-tight">Menu breakdown</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Full published menu, broken down by section. Inventory pars derive from these dishes —
            update the menu, then update what we count.
          </p>
        </div>

        {seed.menus.map((menu) => (
          <section key={menu.service} className="mb-12">
            <div className="flex items-baseline gap-3 mb-5">
              <h2 className="font-display text-display-lg">{menu.service}</h2>
              <span className="micro text-muted-foreground">
                {menu.sections.length} sections ·{" "}
                {menu.sections.reduce((s, sec) => s + sec.items.length, 0)} items
              </span>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {menu.sections.map((sec) => (
                <div
                  key={sec.name}
                  className="rounded-lg border border-border bg-card overflow-hidden"
                >
                  <div
                    className="px-4 py-3 border-b border-border flex items-center justify-between"
                    style={{ borderTop: `2px solid ${restaurant.accentHex}` }}
                  >
                    <h3 className="font-display text-lg">{sec.name}</h3>
                    <span className="text-xs text-muted-foreground">{sec.items.length}</span>
                  </div>
                  <ul className="divide-y divide-border">
                    {sec.items.map((it, i) => (
                      <li key={i} className="px-4 py-3">
                        <div className="flex items-baseline justify-between gap-3">
                          <span className="text-sm font-medium leading-snug">{it.name}</span>
                          {it.price && (
                            <span className="text-sm text-muted-foreground tabular shrink-0">
                              {it.price}
                            </span>
                          )}
                        </div>
                        {it.components && it.components.length > 0 && (
                          <div className="text-xs text-muted-foreground mt-1 leading-relaxed">
                            {it.components.join(" · ")}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        ))}
      </main>
  );
}
