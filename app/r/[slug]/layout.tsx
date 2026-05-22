import { notFound } from "next/navigation";
import Link from "next/link";
import { getRestaurant } from "@/lib/restaurants";
import { SiteHeader } from "@/components/site-header";
import { AppSidebar, MobileSidebarTrigger } from "@/components/app-sidebar";
import { Sparkles, Clock, ChevronRight } from "lucide-react";

export default function RestaurantLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { slug: string };
}) {
  const restaurant = getRestaurant(params.slug);
  if (!restaurant) notFound();

  // For coming-soon restaurants, short-circuit and show a placeholder page.
  // No sidebar, no children — none of those features apply yet.
  if (restaurant.comingSoon) {
    return (
      <div className="min-h-screen bg-background">
        <SiteHeader current={restaurant} />
        <div className="h-1 w-full" style={{ backgroundColor: restaurant.accentHex }} />
        <main className="mx-auto max-w-[800px] px-4 md:px-8 py-12 md:py-16 text-center">
          <div
            className="h-16 w-16 rounded-full mx-auto flex items-center justify-center"
            style={{
              backgroundColor: `${restaurant.accentHex}20`,
              border: `1px solid ${restaurant.accentHex}40`,
            }}
          >
            <Sparkles className="h-8 w-8" style={{ color: restaurant.accentHex }} />
          </div>
          <div className="micro mt-5" style={{ color: restaurant.accentHex }}>
            Coming soon · {restaurant.opensAt ?? "TBD"}
          </div>
          <h1 className="font-display text-display-2xl tracking-tight mt-2">
            {restaurant.name}
          </h1>
          <p className="text-muted-foreground mt-3 max-w-md mx-auto leading-relaxed">
            {restaurant.concept}
          </p>
          <div className="text-sm text-muted-foreground mt-4 inline-flex items-center gap-2 justify-center">
            <Clock className="h-3.5 w-3.5" />
            {restaurant.address}
          </div>

          <div className="mt-10 grid sm:grid-cols-3 gap-3 text-left">
            <Placeholder
              tag="Inventory"
              body="Stations and items will be seeded from the opening menu once it's locked."
            />
            <Placeholder
              tag="Recipes"
              body="Chef BOMs map dishes to inventory. Lights up the AvT loop from day one."
            />
            <Placeholder
              tag="Integrations"
              body="POS, payroll, and invoice OCR connectors land before the first cover."
            />
          </div>

          <div className="mt-10">
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2.5 text-sm hover:border-accent/60 transition-colors"
            >
              Back to group view
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader current={restaurant} />
      <div className="h-1 w-full" style={{ backgroundColor: restaurant.accentHex }} />
      <div className="flex">
        <AppSidebar slug={restaurant.slug} />
        <div className="flex-1 min-w-0">
          <div className="lg:hidden px-4 py-2 border-b border-border">
            <MobileSidebarTrigger activeLabel={restaurant.shortName} />
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

function Placeholder({ tag, body }: { tag: string; body: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="micro text-muted-foreground">{tag}</div>
      <p className="text-xs text-muted-foreground mt-2 leading-relaxed">{body}</p>
    </div>
  );
}
