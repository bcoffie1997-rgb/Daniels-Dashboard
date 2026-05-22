import { notFound } from "next/navigation";
import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { getRestaurant } from "@/lib/restaurants";
import { ChevronRight, Settings, AlertTriangle } from "lucide-react";

export default function SettingsPage({ params }: { params: { slug: string } }) {
  const restaurant = getRestaurant(params.slug);
  if (!restaurant) notFound();

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader current={restaurant} />
      <div className="h-1 w-full" style={{ backgroundColor: restaurant.accentHex }} />
      <main className="mx-auto max-w-[900px] px-4 md:px-8 py-8 md:py-10">
        <nav className="text-sm text-muted-foreground flex items-center gap-2 mb-4">
          <Link href={`/r/${restaurant.slug}`} className="hover:text-accent">
            {restaurant.shortName}
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground">Settings</span>
        </nav>

        <div className="mb-8">
          <div className="flex items-center gap-2 mb-1.5">
            <Settings className="h-4 w-4 text-accent" />
            <span className="micro text-accent">Restaurant configuration</span>
          </div>
          <h1 className="font-display text-display-2xl tracking-tight">Settings</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Per-location preferences — variance thresholds, notification rules, count
            cadence. Persists once Supabase is wired.
          </p>
        </div>

        <div className="rounded-lg border border-warning/40 bg-warning-bg p-4 mb-8 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
          <div className="text-xs text-muted-foreground">
            Settings are read-only in the current build. Once Supabase is wired, admin users
            can edit and the changes propagate to all counters at this location.
          </div>
        </div>

        <SettingsSection
          title="Variance thresholds"
          description="When a count's delta vs the last approved count crosses these lines, Mise behaves differently."
          rows={[
            { label: "Warn the counter at", value: "15 %", hint: "Inline warning on the count row at review-time" },
            { label: "Require a counter note at", value: "25 %", hint: "Submit is gated until the counter explains the variance" },
            { label: "Flag for admin escalation at", value: "40 %", hint: "Manager approval is logged with elevated audit detail" },
          ]}
        />

        <SettingsSection
          title="Two-person verification"
          description="High-value items require a second counter to attest before submit."
          rows={[
            { label: "Auto-flag categories", value: "Caviar · Wagyu · Foie gras · Top-shelf liquor", hint: "Matches by item keywords today" },
            { label: "Witness must be different from counter", value: "Yes", hint: "Same person can't co-attest their own count" },
            { label: "Item count threshold for full-attestation", value: "All flagged items", hint: "Each dual-count item is individually attested" },
          ]}
        />

        <SettingsSection
          title="Notifications"
          description="Where Mise sends alerts. Wired in v2 once Resend and Slack integrations land."
          rows={[
            { label: "Below-par email digest", value: "06:00 every day", hint: "Recipient: purchaser@gioia.com" },
            { label: "Below-par Slack notification", value: "On rejection · daily summary", hint: "Channel: #kitchen-" + restaurant.shortName.toLowerCase().replace(/\s+/g, "-") },
            { label: "Rejected count alert to counter", value: "Immediate", hint: "Email + push notification" },
            { label: "Weekly admin digest", value: "Mondays at 06:00", hint: "Last 7 days summary across all 3 locations" },
          ]}
        />

        <SettingsSection
          title="Count cadence"
          description="How often each station is expected to be counted. Surfaces stale stations on the dashboard."
          rows={[
            { label: "Proteins & seafood", value: "Daily", hint: "End of service" },
            { label: "Dairy & produce", value: "Daily", hint: "End of service" },
            { label: "Dry storage", value: "Weekly", hint: "Sundays" },
            { label: "Bar (all)", value: "Weekly", hint: "Mondays before open" },
            { label: "Pastry & dessert", value: "Twice weekly", hint: "Wednesday + Sunday" },
          ]}
        />

        <SettingsSection
          title="Restaurant metadata"
          description="Public-ish info about this location. Used in the dashboard header."
          rows={[
            { label: "Display name", value: restaurant.name },
            { label: "Short name", value: restaurant.shortName, hint: "Shown in switcher and group views" },
            { label: "City", value: restaurant.city },
            { label: "Address", value: restaurant.address },
            { label: "Phone", value: restaurant.phone },
            { label: "Concept tagline", value: restaurant.concept },
            { label: "Brand accent", value: restaurant.accentHex, hint: "Used on dashboard accent stripes and switcher dot" },
            { label: "Website", value: restaurant.website },
          ]}
        />

        <SettingsSection
          title="Data & retention"
          description="How long Mise holds onto what."
          rows={[
            { label: "Audit log retention", value: "Indefinite", hint: "Required for HACCP and food-safety reviews" },
            { label: "Submitted count history", value: "Indefinite", hint: "Variance trend depends on it" },
            { label: "Photo uploads (v2)", value: "12 months", hint: "Storage cost optimization" },
            { label: "CSV export window", value: "Any range", hint: "Bounded by what's in audit_log" },
          ]}
        />
      </main>
    </div>
  );
}

function SettingsSection({
  title,
  description,
  rows,
}: {
  title: string;
  description: string;
  rows: Array<{ label: string; value: string; hint?: string }>;
}) {
  return (
    <section className="mb-8 rounded-lg border border-border bg-card overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h2 className="font-display text-display-md">{title}</h2>
        <p className="text-sm text-muted-foreground mt-1.5">{description}</p>
      </div>
      <dl className="divide-y divide-border">
        {rows.map((r, i) => (
          <div key={i} className="px-5 py-3.5 flex items-start justify-between gap-4 flex-wrap">
            <div className="flex-1 min-w-0">
              <dt className="text-sm font-medium">{r.label}</dt>
              {r.hint && <div className="text-xs text-muted-foreground mt-0.5">{r.hint}</div>}
            </div>
            <dd className="text-sm tabular shrink-0 text-right max-w-[55%] break-words">
              {r.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
