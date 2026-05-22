import { type RestaurantSlug } from "./restaurants";
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
  // Coming soon — La Sponda has no operational data yet
  "la-sponda": {
    slug: "la-sponda",
    lastCountAt: "—",
    lastCountBy: "—",
    itemsTracked: 0,
    stationsActive: 0,
    pendingApproval: 0,
    openVariances: 0,
    avgVariancePct: 0,
    sessionsThisWeek: 0,
    topVariance: null,
  },
};

export function getKpiFor(slug: RestaurantSlug): LocationKpi {
  return SEED[slug];
}
