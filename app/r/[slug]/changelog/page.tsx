import { notFound } from "next/navigation";
import Link from "next/link";
import { getRestaurant, type RestaurantSlug } from "@/lib/restaurants";
import { changelogFor } from "@/lib/changelog";
import { ChangelogList } from "@/components/changelog-list";
import { ChevronRight, ShieldCheck } from "lucide-react";

export default function ChangelogPage({ params }: { params: { slug: string } }) {
  const restaurant = getRestaurant(params.slug);
  if (!restaurant) notFound();
  const entries = changelogFor(restaurant.slug as RestaurantSlug);

  return (
    <main className="mx-auto max-w-[1400px] px-4 md:px-8 py-8 md:py-10">
        <nav className="text-sm text-muted-foreground flex items-center gap-2 mb-4">
          <Link href={`/r/${restaurant.slug}`} className="hover:text-accent">
            {restaurant.shortName}
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground">Changelog</span>
        </nav>

        <div className="mb-6 flex items-end justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <ShieldCheck className="h-4 w-4 text-accent" />
              <span className="micro text-accent">Admin · audit log</span>
            </div>
            <h1 className="font-display text-display-2xl tracking-tight">Changelog</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              Every state change in Mise, in order. Filterable by actor, action, and entity.
              Backed by the <code className="text-xs bg-muted px-1.5 py-0.5 rounded">audit_log</code> table —
              one row per mutation, retained indefinitely.
            </p>
          </div>
          <Link
            href="/admin/changelog"
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm hover:border-accent/60 transition-colors"
          >
            Group-wide view <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <ChangelogList entries={entries} showRestaurant={false} />

        <div className="mt-10 rounded-lg border border-accent/40 bg-accent/5 p-4 flex items-start gap-3">
          <ShieldCheck className="h-5 w-5 text-accent shrink-0 mt-0.5" />
          <div>
            <div className="text-sm font-medium">Who sees this</div>
            <div className="text-xs text-muted-foreground mt-1 max-w-2xl">
              Visible to <strong>admins only</strong>. Managers see only their own session
              approvals via the dashboard. Counters see their own count history. RLS enforced
              at the database — not just the UI.
            </div>
          </div>
        </div>
      </main>
  );
}
