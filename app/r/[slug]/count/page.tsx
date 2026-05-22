import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { getRestaurant, type RestaurantSlug } from "@/lib/restaurants";
import { getSeed } from "@/lib/seed";
import { lastCountedFor, relativeTime } from "@/lib/seed/sessions";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, ClipboardList, ShieldCheck, Clock } from "lucide-react";

export default function CountStationPicker({ params }: { params: { slug: string } }) {
  const restaurant = getRestaurant(params.slug);
  if (!restaurant) notFound();
  const seed = getSeed(restaurant.slug)!;

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
          <span className="text-foreground">Start a count</span>
        </nav>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1.5">
            <ClipboardList className="h-4 w-4 text-accent" />
            <span className="micro text-accent">Step 1 of 3</span>
          </div>
          <h1 className="font-display text-display-2xl tracking-tight">Pick a station</h1>
          <p className="text-muted-foreground mt-2 max-w-xl">
            Items appear in physical walk order. Tap a station to begin counting.
          </p>
        </div>

        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {seed.stations.map((s) => {
            const dualCount = s.items.filter((it) => it.requiresDualCount).length;
            const total = s.items.length;
            const last = lastCountedFor(restaurant.slug as RestaurantSlug, s.name);
            const isStale = last == null || (() => {
              const ts = new Date(last.ts.replace(" ", "T")).getTime();
              const now = new Date("2026-05-21T19:00:00").getTime();
              return now - ts > 24 * 3600 * 1000;
            })();
            return (
              <li key={s.name}>
                <Link
                  href={`/r/${restaurant.slug}/count/${encodeURIComponent(s.name)}`}
                  className="group block rounded-lg border border-border bg-card p-5 hover:border-accent/60 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="font-display text-xl leading-tight">{s.name}</div>
                      <div className="text-sm text-muted-foreground mt-1.5">
                        {total} items
                        {dualCount > 0 && (
                          <>
                            {" · "}
                            <span className="inline-flex items-center gap-1 text-accent">
                              <ShieldCheck className="h-3 w-3" />
                              {dualCount} require 2-person
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-accent transition-colors shrink-0" />
                  </div>
                  <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                    <Badge variant="outline">~{Math.max(3, Math.round(total * 0.6))} min</Badge>
                    {last ? (
                      <span
                        className={`inline-flex items-center gap-1 ${
                          isStale ? "text-warning" : ""
                        }`}
                      >
                        <Clock className="h-3 w-3" />
                        Last counted {relativeTime(last.ts)} by {last.by}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-warning">
                        <Clock className="h-3 w-3" />
                        Never counted
                      </span>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-8 rounded-lg border border-accent/40 bg-accent/5 p-4 flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-accent shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-medium">2-person verification</div>
            <div className="text-xs text-muted-foreground mt-1 max-w-2xl">
              High-value items (wagyu, caviar, foie gras, top-shelf liquor) require a
              second counter to attest the count before submit. The app guides you through
              it.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
