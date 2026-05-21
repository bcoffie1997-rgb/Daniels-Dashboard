import { RESTAURANTS, type RestaurantSlug } from "./restaurants";
import { SEEDS, totalItems } from "./seed";

export type LocationKpi = {
  slug: RestaurantSlug;
  lastCountAt: string;
  lastCountBy: string;
  itemsTracked: number;
  stationsActive: number;
  pendingApproval: number;
  openVariances: number;
  avgVariancePct: number;
  sessionsThisWeek: number;
  topVariance: { item: string; station: string; variancePct: number } | null;
};

const SEED: Record<RestaurantSlug, LocationKpi> = {
  miami: {
    slug: "miami",
    lastCountAt: "2026-05-20 22:14",
    lastCountBy: "Andres R. — Sous",
    itemsTracked: totalItems(SEEDS.miami),
    stationsActive: SEEDS.miami.stations.length,
    pendingApproval: 2,
    openVariances: 4,
    avgVariancePct: 3.8,
    sessionsThisWeek: 18,
    topVariance: {
      item: "Margaret River Wagyu Tomahawk",
      station: "Walk-in Cooler — Proteins",
      variancePct: -22.5,
    },
  },
  "fort-lauderdale": {
    slug: "fort-lauderdale",
    lastCountAt: "2026-05-21 06:02",
    lastCountBy: "Branden M. — Mgr",
    itemsTracked: totalItems(SEEDS["fort-lauderdale"]),
    stationsActive: SEEDS["fort-lauderdale"].stations.length,
    pendingApproval: 1,
    openVariances: 2,
    avgVariancePct: 2.1,
    sessionsThisWeek: 22,
    topVariance: {
      item: "Demkota Prime Filet Mignon (8oz)",
      station: "Walk-in Cooler — Proteins",
      variancePct: -11.2,
    },
  },
  "ds-sports": {
    slug: "ds-sports",
    lastCountAt: "2026-05-21 02:48",
    lastCountBy: "Marisol G. — Bar Lead",
    itemsTracked: totalItems(SEEDS["ds-sports"]),
    stationsActive: SEEDS["ds-sports"].stations.length,
    pendingApproval: 3,
    openVariances: 6,
    avgVariancePct: 5.4,
    sessionsThisWeek: 31,
    topVariance: {
      item: "Florida Grassfed Burger Patties (smash)",
      station: "Walk-in Cooler — Burgers & Proteins",
      variancePct: -18.7,
    },
  },
};

export function getKpis(): LocationKpi[] {
  return RESTAURANTS.map((r) => SEED[r.slug]);
}

export function getKpiFor(slug: RestaurantSlug): LocationKpi {
  return SEED[slug];
}

export type RecentActivity = {
  ts: string;
  location: RestaurantSlug;
  user: string;
  action: string;
  detail: string;
  status?: "approved" | "pending" | "rejected" | "info";
};

export const RECENT_ACTIVITY: RecentActivity[] = [
  { ts: "06:02", location: "fort-lauderdale", user: "Branden M.", action: "Approved count", detail: "Walk-in Cooler — Proteins · 16 items", status: "approved" },
  { ts: "02:48", location: "ds-sports", user: "Marisol G.", action: "Submitted count", detail: "Bar — Liquor · 9 items · 1 variance > 10%", status: "pending" },
  { ts: "02:31", location: "ds-sports", user: "Jordan T.", action: "Submitted count", detail: "Walk-in Cooler — Burgers · 17 items", status: "pending" },
  { ts: "22:14", location: "miami", user: "Andres R.", action: "Submitted count", detail: "Walk-in Cooler — Seafood · 14 items · 2 variances", status: "pending" },
  { ts: "21:50", location: "miami", user: "Kassidy A.", action: "Rejected count", detail: "Dry Storage · pasta units mismatch", status: "rejected" },
  { ts: "20:42", location: "fort-lauderdale", user: "Sarah K.", action: "Submitted count", detail: "Bar — Wine & Beer · 6 items", status: "approved" },
  { ts: "19:28", location: "ds-sports", user: "Marisol G.", action: "Started session", detail: "Bar — Beer & Seltzer", status: "info" },
];
