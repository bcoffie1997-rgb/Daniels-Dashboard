import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { getRestaurant } from "@/lib/restaurants";
import { ChevronRight, Lock, TrendingDown, Receipt, ChefHat, ShoppingCart } from "lucide-react";

export default function AvtPage({ params }: { params: { slug: string } }) {
  const restaurant = getRestaurant(params.slug);
  if (!restaurant) notFound();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader current={restaurant} />
      <div className="h-1 w-full" style={{ backgroundColor: restaurant.accentHex }} />
      <main className="mx-auto max-w-[1400px] px-4 md:px-8 py-8 md:py-10">
        <nav className="text-sm text-muted-foreground flex items-center gap-2 mb-4">
          <Link href={`/r/${restaurant.slug}`} className="hover:text-accent">{restaurant.shortName}</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground">AvT</span>
        </nav>

        <div className="mb-8 flex items-end justify-between flex-wrap gap-4">
          <div>
            <div className="micro text-accent">v2 preview</div>
            <h1 className="font-display text-display-2xl tracking-tight mt-1.5">Actual vs. Theoretical</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              Sales × recipes = theoretical usage. Mise counts = actual. The delta is
              waste, theft, and shrink — broken out per item, per station, per shift.
            </p>
          </div>
        </div>

        {/* Locked banner */}
        <div className="rounded-lg border border-warning/40 bg-warning-bg p-5 mb-8 flex items-start gap-4">
          <Lock className="h-6 w-6 text-warning shrink-0 mt-0.5" />
          <div className="flex-1">
            <div className="font-display text-xl">Awaiting Toast POS integration</div>
            <p className="text-sm text-muted-foreground mt-1.5 max-w-3xl">
              This dashboard fills in once we connect the Toast POS sales feed and finish the
              recipe coverage. Until then, the numbers below are placeholders to show shape.
            </p>
            <Link
              href={`/r/${restaurant.slug}/integrations`}
              className="inline-flex items-center gap-1.5 text-sm text-warning font-medium mt-3 hover:underline"
            >
              Open integrations <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Headline KPIs — placeholders */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 opacity-70">
          <PlaceholderTile label="Theoretical usage" value="$0.00" sub="awaiting sales feed" icon={ChefHat} />
          <PlaceholderTile label="Actual usage" value="$0.00" sub="from approved counts" icon={ShoppingCart} />
          <PlaceholderTile label="Variance ($)" value="—" sub="actual − theoretical" icon={Receipt} />
          <PlaceholderTile label="Variance %" value="—" sub="of theoretical" icon={TrendingDown} />
        </section>

        {/* Section: AvT formula explainer */}
        <section className="rounded-lg border border-border bg-card p-6 mb-10">
          <div className="micro text-muted-foreground">How AvT works</div>
          <div className="mt-3 grid md:grid-cols-3 gap-5">
            <FormulaBlock
              tag="Toast Sales"
              expr="× recipes"
              result="= theoretical usage"
              detail="Dish_sold × ingredient_qty for every line on the menu."
            />
            <FormulaBlock
              tag="Mise Count"
              expr="physical inventory"
              result="= actual usage"
              detail="Beginning + received − ending, by item."
            />
            <FormulaBlock
              tag="Δ"
              expr="actual − theoretical"
              result="= waste · theft · shrink"
              detail="High variance + dual-count items = priority investigations."
            />
          </div>
        </section>

        {/* Section: Worst offenders — placeholder */}
        <section>
          <div className="flex items-end justify-between mb-3">
            <h2 className="font-display text-display-md">Worst offenders</h2>
            <span className="micro text-muted-foreground">by variance %</span>
          </div>
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/30">
                <tr className="text-left">
                  <th className="micro text-muted-foreground px-4 py-3 font-medium">Item</th>
                  <th className="micro text-muted-foreground px-4 py-3 font-medium hidden md:table-cell">Station</th>
                  <th className="micro text-muted-foreground px-4 py-3 font-medium w-28 text-right">Theoretical</th>
                  <th className="micro text-muted-foreground px-4 py-3 font-medium w-28 text-right">Actual</th>
                  <th className="micro text-muted-foreground px-4 py-3 font-medium w-24 text-right">Δ</th>
                  <th className="micro text-muted-foreground px-4 py-3 font-medium w-24 text-right">Δ %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td className="px-4 py-3.5 text-muted-foreground italic">— awaiting data —</td>
                    <td className="px-4 py-3.5 hidden md:table-cell text-muted-foreground text-xs">—</td>
                    <td className="px-4 py-3.5 text-right tabular text-muted-foreground">—</td>
                    <td className="px-4 py-3.5 text-right tabular text-muted-foreground">—</td>
                    <td className="px-4 py-3.5 text-right tabular text-muted-foreground">—</td>
                    <td className="px-4 py-3.5 text-right tabular text-muted-foreground">—</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

function PlaceholderTile({
  label, value, sub, icon: Icon,
}: { label: string; value: string; sub: string; icon: any }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <span className="micro text-muted-foreground">{label}</span>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="font-display text-display-md tabular mt-3 text-muted-foreground">{value}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>
    </div>
  );
}

function FormulaBlock({ tag, expr, result, detail }: { tag: string; expr: string; result: string; detail: string }) {
  return (
    <div>
      <div className="micro text-accent">{tag}</div>
      <div className="font-display text-2xl mt-1">{expr}</div>
      <div className="font-display text-base text-muted-foreground italic mt-0.5">{result}</div>
      <div className="text-xs text-muted-foreground mt-2 leading-snug">{detail}</div>
    </div>
  );
}
