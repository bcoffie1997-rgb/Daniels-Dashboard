import Link from "next/link";
import { changelogFor } from "@/lib/changelog";
import { ChangelogList } from "@/components/changelog-list";
import { ShieldCheck, ChevronRight, Filter } from "lucide-react";

export default function GroupChangelogPage() {
  const entries = changelogFor("all");
  const restaurantsSet = new Set(entries.map((e) => e.restaurant));
  const groupCount = entries.filter((e) => e.restaurant === "group").length;
  const actorRoles = new Map<string, number>();
  entries.forEach((e) => actorRoles.set(e.actor.role, (actorRoles.get(e.actor.role) ?? 0) + 1));

  return (
    <main className="mx-auto max-w-[1400px] px-4 md:px-8 py-8 md:py-10">
        <nav className="text-sm text-muted-foreground flex items-center gap-2 mb-4">
          <span className="text-foreground">Admin</span>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground">Group changelog</span>
        </nav>

        <div className="mb-6 flex items-end justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <ShieldCheck className="h-4 w-4 text-accent" />
              <span className="micro text-accent">Admin · group-wide audit log</span>
            </div>
            <h1 className="font-display text-display-2xl tracking-tight">Changelog · all locations</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              Every state change across Daniel's Miami, Daniel's Fort Lauderdale, and D's
              Sports Bar — plus group-level events (user invites, role changes, integrations,
              scheduled system jobs).
            </p>
          </div>
          <button
            disabled
            className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm text-muted-foreground opacity-60 cursor-not-allowed"
            title="Coming in v2: filter by actor, action, entity, date range"
          >
            <Filter className="h-4 w-4" />
            Filters (v2)
          </button>
        </div>

        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <Stat label="Total events" value={entries.length} />
          <Stat label="Locations" value={restaurantsSet.size} />
          <Stat label="Group-level" value={groupCount} />
          <Stat label="Last 24h" value={entries.filter((e) => {
            const ts = new Date(e.ts.replace(" ", "T")).getTime();
            return Date.now() - ts < 24 * 3600 * 1000;
          }).length} />
        </section>

        <ChangelogList entries={entries} showRestaurant={true} />

        <div className="mt-10 rounded-lg border border-accent/40 bg-accent/5 p-4">
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-accent shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-medium">Retention &amp; access</div>
              <div className="text-xs text-muted-foreground mt-1 max-w-3xl">
                Indefinite retention. Visible to admins only — RLS enforced at the DB.
                Exportable as CSV for compliance reviews. Every login (incl. system jobs)
                also lands here in v2 once auth is wired.
              </div>
            </div>
          </div>
        </div>
      </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="micro text-muted-foreground">{label}</div>
      <div className="font-display text-display-md tabular mt-1.5">{value}</div>
    </div>
  );
}
