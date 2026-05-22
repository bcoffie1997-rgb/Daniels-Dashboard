import { notFound } from "next/navigation";
import Link from "next/link";
import { getRestaurant } from "@/lib/restaurants";
import { getSeed } from "@/lib/seed";
import { recipesFor } from "@/lib/seed/recipes";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/empty-state";
import { ChevronRight, ChefHat } from "lucide-react";

export default function RecipesPage({ params }: { params: { slug: string } }) {
  const restaurant = getRestaurant(params.slug);
  if (!restaurant) notFound();
  const seed = getSeed(restaurant.slug)!;
  const recipes = recipesFor(restaurant.slug);
  const totalMenuItems = seed.menus.reduce(
    (s, m) => s + m.sections.reduce((ss, sec) => ss + sec.items.length, 0),
    0,
  );

  const mapped = new Set(recipes.map((r) => r.menuDish));
  const allDishes = seed.menus.flatMap((m) => m.sections.flatMap((sec) => sec.items.map((it) => ({ section: sec.name, name: it.name }))));
  const unmapped = allDishes.filter((d) => !mapped.has(d.name));

  return (
    <main className="mx-auto max-w-[1400px] px-4 md:px-8 py-8 md:py-10">
        <nav className="text-sm text-muted-foreground flex items-center gap-2 mb-4">
          <Link href={`/r/${restaurant.slug}`} className="hover:text-accent">{restaurant.shortName}</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground">Recipes</span>
        </nav>

        <div className="mb-8">
          <h1 className="font-display text-display-2xl tracking-tight">Recipes</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Each menu dish maps to a small set of inventory items. Once unit costs land
            from invoice OCR (v2), this becomes the theoretical-usage feed that powers AvT.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          <Stat label="Menu dishes" value={totalMenuItems} />
          <Stat label="Recipes defined" value={recipes.length} tone="success" />
          <Stat label="Coverage" value={`${Math.round((recipes.length / totalMenuItems) * 100)}%`} />
          <Stat label="Unmapped" value={unmapped.length} tone="warning" />
        </div>

        <section className="mb-10">
          <div className="flex items-end justify-between mb-3">
            <h2 className="font-display text-display-md">Defined</h2>
            <span className="micro text-muted-foreground">{recipes.length} recipes</span>
          </div>
          {recipes.length === 0 ? (
            <EmptyState
              icon={ChefHat}
              title="No recipes yet"
              body="Recipes map menu dishes to inventory items. Once defined, sales × recipes feeds theoretical usage in AvT."
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {recipes.map((r) => (
                <Link
                  key={r.id}
                  href={`/r/${restaurant.slug}/recipes/${r.id}`}
                  className="group rounded-lg border border-border bg-card p-5 hover:border-accent/60 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <ChefHat className="h-5 w-5 text-accent shrink-0" />
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
                  </div>
                  <div className="font-display text-xl mt-3 leading-tight">{r.menuDish}</div>
                  <div className="text-xs text-muted-foreground mt-1.5">
                    {r.station} · serves {r.yieldPortions} · {r.ingredients.length} ingredients
                    {r.laborMinutes && <> · {r.laborMinutes} min</>}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {unmapped.length > 0 && (
          <section>
            <div className="flex items-end justify-between mb-3">
              <h2 className="font-display text-display-md">Awaiting recipe</h2>
              <span className="micro text-muted-foreground">{unmapped.length} dishes</span>
            </div>
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted/30">
                  <tr className="text-left">
                    <th className="micro text-muted-foreground px-4 py-3 font-medium">Dish</th>
                    <th className="micro text-muted-foreground px-4 py-3 font-medium hidden md:table-cell">Section</th>
                    <th className="micro text-muted-foreground px-4 py-3 font-medium w-28 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {unmapped.map((d, i) => (
                    <tr key={i} className="hover:bg-muted/30">
                      <td className="px-4 py-2.5">{d.name}</td>
                      <td className="px-4 py-2.5 hidden md:table-cell text-muted-foreground text-xs">
                        {d.section}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <Badge variant="outline">No recipe</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <div className="mt-10 rounded-lg border border-accent/40 bg-accent/5 p-4 flex items-start gap-3">
          <ChefHat className="h-5 w-5 text-accent shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-medium">v2 — recipe builder UI coming</div>
            <div className="text-xs text-muted-foreground mt-1 max-w-2xl">
              Chef builds recipes in-app, drags inventory items into a BOM, sets yield + labor
              minutes. Combined with Toast sales feed → theoretical usage → AvT. The starter
              recipes here are seeded from menu analysis to bootstrap the workflow.
            </div>
          </div>
        </div>
      </main>
  );
}

function Stat({ label, value, tone }: { label: string; value: number | string; tone?: "success" | "warning" }) {
  const colorClass =
    tone === "success" ? "text-success" : tone === "warning" ? "text-warning" : "text-foreground";
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="micro text-muted-foreground">{label}</div>
      <div className={`font-display text-display-md tabular mt-1.5 ${colorClass}`}>{value}</div>
    </div>
  );
}
