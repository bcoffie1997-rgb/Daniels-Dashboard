"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  Boxes,
  ClipboardList,
  ClipboardCheck,
  ChefHat,
  BookOpen,
  TrendingDown,
  Plug,
  Settings,
  ShieldCheck,
  LayoutDashboard,
  Layers,
  Bell,
  Command,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { RESTAURANTS, type Restaurant } from "@/lib/restaurants";
import { getSeed } from "@/lib/seed";
import { recipesFor } from "@/lib/seed/recipes";
import { sessionsFor } from "@/lib/seed/sessions";
import { cn } from "@/lib/cn";

type Entry = {
  id: string;
  label: string;
  detail?: string;
  href: string;
  group: "Navigation" | "Inventory" | "Recipes" | "Menu" | "Sessions" | "Locations" | "Admin";
  Icon: any;
  keywords?: string;
};

function buildIndex(current?: Restaurant): Entry[] {
  const restaurant = current ?? RESTAURANTS[1]; // FTL default
  const base = `/r/${restaurant.slug}`;

  const nav: Entry[] = [
    { id: "nav-ops", label: "Operations dashboard", detail: restaurant.shortName, href: base, group: "Navigation", Icon: LayoutDashboard },
    { id: "nav-trends", label: "Trends & insights", detail: "Risers · fallers · forecasts · reorders", href: `${base}/trends`, group: "Navigation", Icon: LayoutDashboard },
    { id: "nav-sales", label: "Sales & Revenue", detail: "Daily sales · top items · servers", href: `${base}/sales`, group: "Navigation", Icon: LayoutDashboard },
    { id: "nav-foodcost", label: "Inventory & Food Cost", detail: "Variance · spend · vendors", href: `${base}/food-cost`, group: "Navigation", Icon: LayoutDashboard },
    { id: "nav-labor", label: "Labor", detail: "Labor % · prime cost · roles", href: `${base}/labor`, group: "Navigation", Icon: LayoutDashboard },
    { id: "nav-count", label: "Start a count", detail: "Pick a station", href: `${base}/count`, group: "Navigation", Icon: ClipboardList },
    { id: "nav-appr", label: "Approvals queue", detail: "Manager — pending counts", href: `${base}/approvals`, group: "Navigation", Icon: ClipboardCheck },
    { id: "nav-sess", label: "Sessions history", detail: "All count sessions", href: `${base}/sessions`, group: "Navigation", Icon: ClipboardList },
    { id: "nav-inv", label: "Inventory list", detail: "By station", href: `${base}/inventory`, group: "Navigation", Icon: Boxes },
    { id: "nav-reord", label: "Reorder list", detail: "Items below par", href: `${base}/reorder`, group: "Navigation", Icon: Bell },
    { id: "nav-recipes", label: "Recipes", detail: "Menu → BOM mapping", href: `${base}/recipes`, group: "Navigation", Icon: ChefHat },
    { id: "nav-menu", label: "Menu", detail: "Published menu by section", href: `${base}/menu`, group: "Navigation", Icon: BookOpen },
    { id: "nav-avt", label: "Actual vs Theoretical (AvT)", detail: "v2 — awaiting Toast", href: `${base}/avt`, group: "Navigation", Icon: TrendingDown },
    { id: "nav-int", label: "Integrations", detail: "Toast · invoice OCR · alerts", href: `${base}/integrations`, group: "Navigation", Icon: Plug },
    { id: "nav-set", label: "Settings", detail: "Variance thresholds · notifications", href: `${base}/settings`, group: "Navigation", Icon: Settings },
    { id: "nav-clog", label: "Changelog", detail: "Audit log", href: `${base}/changelog`, group: "Navigation", Icon: ShieldCheck },
  ];

  const locations: Entry[] = RESTAURANTS.map((r) => ({
    id: `loc-${r.slug}`,
    label: r.comingSoon ? `${r.name}  ·  Coming ${r.opensAt ?? "soon"}` : r.name,
    detail: r.city,
    href: `/r/${r.slug}`,
    group: "Locations",
    Icon: Layers,
    keywords: r.shortName + (r.comingSoon ? " coming soon new" : ""),
  }));
  locations.push({
    id: "loc-group",
    label: "Group view (all locations)",
    detail: "Admin · cross-restaurant rollup",
    href: "/admin",
    group: "Locations",
    Icon: Layers,
  });

  // Inventory items + sessions + recipes scoped to current restaurant
  const seed = getSeed(restaurant.slug);
  const items: Entry[] = seed
    ? seed.stations.flatMap((s) =>
        s.items.map((it) => ({
          id: `inv-${restaurant.slug}-${s.name}-${it.name}`,
          label: it.name,
          detail: `${s.name} · ${it.unit}${it.par ? ` · par ${it.par}` : ""}`,
          href: `${base}/inventory#${encodeURIComponent(s.name)}`,
          group: "Inventory" as const,
          Icon: Boxes,
          keywords: s.name + " " + (it.category ?? ""),
        })),
      )
    : [];

  const menus: Entry[] = seed
    ? seed.menus.flatMap((m) =>
        m.sections.flatMap((sec) =>
          sec.items.map((d) => ({
            id: `menu-${restaurant.slug}-${sec.name}-${d.name}`,
            label: d.name,
            detail: `${m.service} · ${sec.name}`,
            href: `${base}/menu`,
            group: "Menu" as const,
            Icon: BookOpen,
            keywords: sec.name,
          })),
        ),
      )
    : [];

  const recipes: Entry[] = recipesFor(restaurant.slug).map((r) => ({
    id: `rec-${r.id}`,
    label: r.menuDish,
    detail: `${r.station} · ${r.ingredients.length} ingredients`,
    href: `${base}/recipes/${r.id}`,
    group: "Recipes",
    Icon: ChefHat,
  }));

  const sessions: Entry[] = sessionsFor(restaurant.slug as any).map((s) => {
    const Icon =
      s.status === "approved"
        ? CheckCircle2
        : s.status === "rejected"
        ? XCircle
        : s.status === "submitted"
        ? AlertTriangle
        : Clock;
    return {
      id: `sess-${s.id}`,
      label: s.stationName,
      detail: `${s.status} · ${s.entries.length} items · ${s.countedBy.name}`,
      href:
        s.status === "submitted"
          ? `${base}/approvals/${s.id}`
          : s.status === "in_progress"
          ? `${base}/count/${encodeURIComponent(s.stationName)}`
          : `${base}/sessions/${s.id}`,
      group: "Sessions",
      Icon,
      keywords: s.countedBy.name + " " + (s.approvedBy?.name ?? "") + " " + s.status,
    };
  });

  return [...nav, ...locations, ...items, ...recipes, ...menus, ...sessions];
}

function score(entry: Entry, q: string): number {
  if (!q) return 0;
  const haystack = (entry.label + " " + (entry.detail ?? "") + " " + (entry.keywords ?? "")).toLowerCase();
  const query = q.toLowerCase();
  if (entry.label.toLowerCase() === query) return 1000;
  if (entry.label.toLowerCase().startsWith(query)) return 500 - entry.label.length;
  if (entry.label.toLowerCase().includes(query)) return 200 - entry.label.length;
  if (haystack.includes(query)) return 50;
  // Fuzzy: every char in q appears in order in haystack
  let i = 0;
  for (const ch of haystack) {
    if (ch === query[i]) i++;
    if (i === query.length) return 10;
  }
  return 0;
}

const GROUP_ORDER: Array<Entry["group"]> = [
  "Navigation",
  "Locations",
  "Inventory",
  "Recipes",
  "Menu",
  "Sessions",
  "Admin",
];

export function CommandPalette({ current }: { current?: Restaurant }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const router = useRouter();

  const index = useMemo(() => buildIndex(current), [current]);

  const results = useMemo(() => {
    if (!q.trim()) {
      // Default: show navigation + locations only when no query
      return index.filter((e) => e.group === "Navigation" || e.group === "Locations").slice(0, 14);
    }
    return index
      .map((e) => ({ entry: e, s: score(e, q) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .slice(0, 50)
      .map((x) => x.entry);
  }, [index, q]);

  // Group results
  const grouped = useMemo(() => {
    const out = new Map<Entry["group"], Entry[]>();
    for (const e of results) {
      if (!out.has(e.group)) out.set(e.group, []);
      out.get(e.group)!.push(e);
    }
    return Array.from(out.entries()).sort(
      (a, b) => GROUP_ORDER.indexOf(a[0]) - GROUP_ORDER.indexOf(b[0]),
    );
  }, [results]);

  // Reset active row on query change
  useEffect(() => setActive(0), [q]);

  // Global keyboard shortcut
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape" && open) setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Focus input when opening
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQ("");
      setActive(0);
    }
  }, [open]);

  // Allow other code to trigger via window event (e.g. header button)
  useEffect(() => {
    function onOpen() {
      setOpen(true);
    }
    window.addEventListener("mise:open-search", onOpen);
    return () => window.removeEventListener("mise:open-search", onOpen);
  }, []);

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(a + 1, results.length - 1));
      scrollToActive(active + 1);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
      scrollToActive(active - 1);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const choice = results[active];
      if (choice) {
        setOpen(false);
        router.push(choice.href);
      }
    }
  }

  function scrollToActive(idx: number) {
    const list = listRef.current;
    if (!list) return;
    const el = list.querySelector(`[data-idx="${idx}"]`) as HTMLElement | null;
    if (el) el.scrollIntoView({ block: "nearest" });
  }

  if (!open) return null;

  let runningIdx = -1;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[8vh] px-4"
      onClick={() => setOpen(false)}
    >
      <div className="fixed inset-0 bg-background/70 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-[640px] rounded-xl border border-border bg-popover shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={handleKey}
            placeholder="Search items, recipes, menu, sessions, pages…"
            className="flex-1 bg-transparent outline-none text-base placeholder:text-muted-foreground"
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 text-xs text-muted-foreground border border-border rounded px-1.5 py-0.5">
            ESC
          </kbd>
        </div>

        <ul ref={listRef} className="max-h-[60vh] overflow-y-auto py-1.5">
          {results.length === 0 ? (
            <li className="px-4 py-8 text-center text-sm text-muted-foreground">
              No matches for &ldquo;{q}&rdquo;
            </li>
          ) : (
            grouped.map(([group, entries]) => (
              <li key={group}>
                <div className="px-4 py-1.5 micro text-muted-foreground">{group}</div>
                <ul>
                  {entries.map((e) => {
                    runningIdx++;
                    const Icon = e.Icon;
                    const isActive = runningIdx === active;
                    const idx = runningIdx;
                    return (
                      <li key={e.id} data-idx={idx}>
                        <button
                          onClick={() => {
                            setOpen(false);
                            router.push(e.href);
                          }}
                          onMouseEnter={() => setActive(idx)}
                          className={cn(
                            "w-full flex items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-muted",
                            isActive && "bg-muted",
                          )}
                        >
                          <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{e.label}</div>
                            {e.detail && (
                              <div className="text-xs text-muted-foreground truncate">
                                {e.detail}
                              </div>
                            )}
                          </div>
                          {isActive && (
                            <ChevronRight className="h-4 w-4 text-accent shrink-0" />
                          )}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))
          )}
        </ul>

        <div className="flex items-center justify-between gap-3 px-4 py-2 text-xs text-muted-foreground border-t border-border bg-muted/20">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1">
              <Kbd>↑</Kbd>
              <Kbd>↓</Kbd>
              navigate
            </span>
            <span className="inline-flex items-center gap-1">
              <Kbd>↵</Kbd>
              open
            </span>
            <span className="inline-flex items-center gap-1">
              <Kbd>esc</Kbd>
              close
            </span>
          </div>
          <span className="inline-flex items-center gap-1">
            <Command className="h-3 w-3" />
            <Kbd>K</Kbd>
            toggle
          </span>
        </div>
      </div>
    </div>
  );
}

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[1.25rem] h-5 text-[10px] text-muted-foreground border border-border rounded px-1">
      {children}
    </kbd>
  );
}
