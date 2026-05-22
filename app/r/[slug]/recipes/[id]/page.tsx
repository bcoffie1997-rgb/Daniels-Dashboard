import { notFound } from "next/navigation";
import Link from "next/link";
import { getRestaurant } from "@/lib/restaurants";
import { getSeed } from "@/lib/seed";
import { recipeById } from "@/lib/seed/recipes";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, ChefHat, Timer, Users } from "lucide-react";

export default function RecipeDetail({ params }: { params: { slug: string; id: string } }) {
  const restaurant = getRestaurant(params.slug);
  if (!restaurant) notFound();
  const recipe = recipeById(params.id);
  if (!recipe || recipe.restaurantSlug !== restaurant.slug) notFound();
  const seed = getSeed(restaurant.slug)!;

  // Look up each ingredient against inventory for unit cost
  const allItems = seed.stations.flatMap((s) => s.items.map((it) => ({ station: s.name, ...it })));
  const lines = recipe.ingredients.map((ing) => {
    const inv = allItems.find((it) => it.name === ing.itemName);
    const lineCost = inv?.unitCost ? +(inv.unitCost * ing.qty).toFixed(2) : null;
    return { ing, inv, lineCost };
  });
  const totalCost = lines.reduce((s, l) => s + (l.lineCost ?? 0), 0);
  const knownCostLines = lines.filter((l) => l.lineCost != null).length;
  const coverage = recipe.ingredients.length ? Math.round((knownCostLines / recipe.ingredients.length) * 100) : 0;

  return (
    <main className="mx-auto max-w-[1400px] px-4 md:px-8 py-8 md:py-10">
        <nav className="text-sm text-muted-foreground flex items-center gap-2 mb-4">
          <Link href={`/r/${restaurant.slug}`} className="hover:text-accent">{restaurant.shortName}</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <Link href={`/r/${restaurant.slug}/recipes`} className="hover:text-accent">Recipes</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground truncate">{recipe.menuDish}</span>
        </nav>

        <div className="mb-6 flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="micro text-accent">{recipe.station}</div>
            <h1 className="font-display text-display-2xl tracking-tight mt-1.5">{recipe.menuDish}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" /> serves {recipe.yieldPortions}
              </span>
              {recipe.laborMinutes && (
                <span className="inline-flex items-center gap-1.5">
                  <Timer className="h-3.5 w-3.5" /> {recipe.laborMinutes} min
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <ChefHat className="h-3.5 w-3.5" /> {recipe.ingredients.length} ingredients
              </span>
            </div>
          </div>
        </div>

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="micro text-muted-foreground">Ingredient cost coverage</div>
            <div className="font-display text-display-md tabular mt-1.5">{coverage}%</div>
            <div className="text-xs text-muted-foreground mt-0.5">{knownCostLines} of {recipe.ingredients.length} priced</div>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="micro text-muted-foreground">Estimated food cost</div>
            <div className="font-display text-display-md tabular mt-1.5">${totalCost.toFixed(2)}</div>
            <div className="text-xs text-muted-foreground mt-0.5">per portion · partial</div>
          </div>
          <div className="rounded-lg border border-accent/40 bg-accent/5 p-4">
            <div className="micro text-accent">v2 unlock</div>
            <div className="font-display text-display-md tabular mt-1.5">AvT</div>
            <div className="text-xs text-muted-foreground mt-0.5">once Toast sales feed lands</div>
          </div>
        </section>

        <div className="rounded-lg border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/30">
              <tr className="text-left">
                <th className="micro text-muted-foreground px-4 py-3 font-medium">Ingredient</th>
                <th className="micro text-muted-foreground px-4 py-3 font-medium hidden md:table-cell">Station</th>
                <th className="micro text-muted-foreground px-4 py-3 font-medium w-20 text-right">Qty</th>
                <th className="micro text-muted-foreground px-4 py-3 font-medium w-16">Unit</th>
                <th className="micro text-muted-foreground px-4 py-3 font-medium w-28 text-right">Unit cost</th>
                <th className="micro text-muted-foreground px-4 py-3 font-medium w-28 text-right">Line cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {lines.map((l, i) => (
                <tr key={i} className="hover:bg-muted/30">
                  <td className="px-4 py-2.5">
                    <div>{l.ing.itemName}</div>
                    {l.ing.notes && (
                      <div className="text-xs text-muted-foreground mt-0.5 italic">{l.ing.notes}</div>
                    )}
                    {!l.inv && (
                      <Badge variant="warning" className="mt-1">Not in inventory</Badge>
                    )}
                  </td>
                  <td className="px-4 py-2.5 hidden md:table-cell text-muted-foreground text-xs">
                    {l.inv?.station ?? "—"}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular">{l.ing.qty}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{l.ing.unit}</td>
                  <td className="px-4 py-2.5 text-right tabular">
                    {l.inv?.unitCost ? `$${l.inv.unitCost}` : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="px-4 py-2.5 text-right tabular">
                    {l.lineCost != null ? `$${l.lineCost.toFixed(2)}` : <span className="text-muted-foreground">—</span>}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-muted/20">
              <tr>
                <td colSpan={4} className="px-4 py-3 text-right text-muted-foreground micro">Total food cost (partial)</td>
                <td colSpan={2} className="px-4 py-3 text-right font-display text-lg tabular">${totalCost.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {recipe.notes && (
          <div className="mt-6 rounded-lg border border-border bg-card p-4">
            <div className="micro text-muted-foreground mb-1.5">Chef notes</div>
            <p className="text-sm">{recipe.notes}</p>
          </div>
        )}
      </main>
  );
}
