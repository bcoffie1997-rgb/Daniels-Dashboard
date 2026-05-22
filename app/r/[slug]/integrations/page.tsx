import { notFound } from "next/navigation";
import Link from "next/link";
import { getRestaurant } from "@/lib/restaurants";
import { ChevronRight, CheckCircle2, AlertCircle, Plug, FileText, Camera, Slack, Mail } from "lucide-react";

type IntegrationStatus = "connected" | "needs-setup" | "coming-soon";

type Integration = {
  name: string;
  vendor: string;
  category: "POS" | "Back-office" | "Notification" | "Storage";
  status: IntegrationStatus;
  description: string;
  unlocks: string[];
  icon: any;
  setupNote?: string;
};

export default function IntegrationsPage({ params }: { params: { slug: string } }) {
  const restaurant = getRestaurant(params.slug);
  if (!restaurant) notFound();

  const integrations: Integration[] = [
    {
      name: "Toast POS — sales feed",
      vendor: "Toast",
      category: "POS",
      status: "needs-setup",
      description: "Read-only sync of items sold per service. Feeds theoretical usage in AvT.",
      unlocks: ["AvT dashboard", "Theoretical usage per item", "Sales × recipes math"],
      icon: Plug,
      setupNote: "Requires Toast Partner API enrollment. ~2 week lead time. Branden to initiate from Toast Web → Toast Central → Integrations.",
    },
    {
      name: "Invoice OCR — email ingest",
      vendor: "Google Document AI",
      category: "Back-office",
      status: "needs-setup",
      description: "Forward Sysco / vendor invoices to a dedicated inbox. We extract line items + prices and feed unit costs into inventory.",
      unlocks: ["Unit costs on inventory", "Dollar-denominated variance", "Recipe food-cost rollup"],
      icon: FileText,
      setupNote: "Set up a Gmail address (e.g. invoices@gioia.com) and forward all vendor invoices there. We point Document AI at it.",
    },
    {
      name: "Photo upload on counts",
      vendor: "Supabase Storage",
      category: "Storage",
      status: "coming-soon",
      description: "Counter snaps a photo of damaged goods or short pallets. Attaches to the count entry.",
      unlocks: ["Photo evidence on rejected counts", "Spoilage tracking"],
      icon: Camera,
    },
    {
      name: "Below-par alerts → Slack",
      vendor: "Slack",
      category: "Notification",
      status: "coming-soon",
      description: "Daily summary of items below par delivered to the kitchen Slack channel.",
      unlocks: ["Reorder before the gap", "Shared visibility"],
      icon: Slack,
    },
    {
      name: "Below-par alerts → Email",
      vendor: "Resend",
      category: "Notification",
      status: "coming-soon",
      description: "Same below-par summary delivered to the purchaser's email.",
      unlocks: ["Reorder before the gap"],
      icon: Mail,
    },
  ];

  return (
    <main className="mx-auto max-w-[1400px] px-4 md:px-8 py-8 md:py-10">
        <nav className="text-sm text-muted-foreground flex items-center gap-2 mb-4">
          <Link href={`/r/${restaurant.slug}`} className="hover:text-accent">{restaurant.shortName}</Link>
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground">Integrations</span>
        </nav>

        <div className="mb-8">
          <h1 className="font-display text-display-2xl tracking-tight">Integrations</h1>
          <p className="text-muted-foreground mt-2 max-w-2xl">
            Mise is intentionally narrow. Cost data, sales data, and notifications come
            from systems Gioia already runs. Connect them here.
          </p>
        </div>

        <div className="space-y-4">
          {integrations.map((it) => (
            <IntegrationCard key={it.name} integration={it} />
          ))}
        </div>

        <div className="mt-10 rounded-lg border border-accent/40 bg-accent/5 p-5">
          <div className="micro text-accent">Sequence matters</div>
          <p className="text-sm mt-2 max-w-3xl">
            Toast POS sync and Invoice OCR are the two unlocks that make every other v2
            feature meaningful. Wire those first — recipes get cost data from invoices,
            AvT gets theoretical usage from sales. Photo + notifications can land any
            time after.
          </p>
        </div>
      </main>
  );
}

function IntegrationCard({ integration: it }: { integration: Integration }) {
  const Icon = it.icon;
  const statusMeta: Record<IntegrationStatus, { label: string; tone: string }> = {
    connected: { label: "Connected", tone: "text-success border-success/40 bg-success/10" },
    "needs-setup": { label: "Needs setup", tone: "text-warning border-warning/40 bg-warning-bg" },
    "coming-soon": { label: "Coming soon", tone: "text-muted-foreground border-border bg-card" },
  };
  const meta = statusMeta[it.status];

  return (
    <div className="rounded-lg border border-border bg-card p-5 md:p-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          <div className="h-10 w-10 rounded-md border border-border bg-muted/30 flex items-center justify-center shrink-0">
            <Icon className="h-5 w-5 text-accent" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="font-display text-xl leading-tight">{it.name}</div>
              <span className={`micro px-2 py-0.5 rounded-full border ${meta.tone}`}>{meta.label}</span>
            </div>
            <div className="text-xs text-muted-foreground mt-1">{it.vendor} · {it.category}</div>
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{it.description}</p>
          </div>
        </div>
        {it.status === "needs-setup" ? (
          <button
            disabled
            className="inline-flex items-center gap-2 rounded-md border border-warning/40 bg-warning-bg px-3 py-2 text-sm text-warning opacity-90 cursor-not-allowed"
            title="Wiring up in v2 — see setup note"
          >
            Connect <ChevronRight className="h-4 w-4" />
          </button>
        ) : it.status === "connected" ? (
          <span className="inline-flex items-center gap-1.5 text-sm text-success">
            <CheckCircle2 className="h-4 w-4" /> Active
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4" /> v2+
          </span>
        )}
      </div>

      <div className="mt-5 grid md:grid-cols-2 gap-4">
        <div>
          <div className="micro text-muted-foreground">Unlocks</div>
          <ul className="mt-2 space-y-1.5">
            {it.unlocks.map((u, i) => (
              <li key={i} className="text-sm flex items-start gap-2">
                <span className="text-accent mt-1.5 h-1 w-1 rounded-full bg-accent inline-block shrink-0" />
                <span>{u}</span>
              </li>
            ))}
          </ul>
        </div>
        {it.setupNote && (
          <div>
            <div className="micro text-muted-foreground">Setup note</div>
            <p className="text-sm mt-2 text-muted-foreground italic leading-relaxed">{it.setupNote}</p>
          </div>
        )}
      </div>
    </div>
  );
}
