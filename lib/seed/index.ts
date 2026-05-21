import type { RestaurantSeed, InventoryItem, Station } from "./types";
import { miami } from "./miami";
import { fortLauderdale } from "./fort-lauderdale";
import { dsSports } from "./ds-sports";

const RAW_SEEDS: Record<string, RestaurantSeed> = {
  miami,
  "fort-lauderdale": fortLauderdale,
  "ds-sports": dsSports,
};

const DUAL_COUNT_KEYWORDS = [
  "tomahawk",
  "porterhouse",
  "wagyu",
  "caviar",
  "foie gras",
  "fiola cask",
  "kaluga",
  "ossetra",
  "dover sole",
  "txuleton",
];

const UNIT_COST_MAP: Array<{ keyword: string; cost: number }> = [
  { keyword: "caviar", cost: 145 },
  { keyword: "foie gras", cost: 89 },
  { keyword: "tomahawk", cost: 220 },
  { keyword: "porterhouse", cost: 180 },
  { keyword: "wagyu", cost: 95 },
  { keyword: "lamb chops", cost: 38 },
  { keyword: "lobster", cost: 28 },
  { keyword: "branzino", cost: 22 },
  { keyword: "filet mignon", cost: 32 },
  { keyword: "ny strip", cost: 28 },
  { keyword: "ribeye", cost: 36 },
  { keyword: "short rib", cost: 18 },
  { keyword: "tuna", cost: 24 },
  { keyword: "snapper", cost: 19 },
  { keyword: "hamachi", cost: 26 },
  { keyword: "fiola cask", cost: 95 },
  { keyword: "grey goose", cost: 38 },
  { keyword: "bacardi", cost: 22 },
  { keyword: "tito", cost: 19 },
];

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function deriveItem(it: InventoryItem, restaurantSlug: string): InventoryItem {
  const key = it.name.toLowerCase();
  const requiresDualCount = DUAL_COUNT_KEYWORDS.some((k) => key.includes(k));
  const costMatch = UNIT_COST_MAP.find((c) => key.includes(c.keyword));
  const unitCost = costMatch?.cost;

  let lastCounted: number | undefined;
  if (it.par != null) {
    const seed = hash(`${restaurantSlug}::${it.name}`);
    const r = (seed % 1000) / 1000; // 0–1 deterministic per item
    // Distribution: ~25% below par, ~50% in 0.85–1.1× par, ~25% above par
    if (r < 0.25) {
      lastCounted = +(it.par * (0.4 + r * 1.5)).toFixed(1);
    } else if (r < 0.75) {
      lastCounted = +(it.par * (0.85 + (r - 0.25) * 0.5)).toFixed(1);
    } else {
      lastCounted = +(it.par * (1.0 + (r - 0.75) * 0.8)).toFixed(1);
    }
  }

  return { ...it, requiresDualCount: requiresDualCount || undefined, unitCost, lastCounted };
}

function deriveStation(st: Station, slug: string): Station {
  return { ...st, items: st.items.map((it) => deriveItem(it, slug)) };
}

export const SEEDS: Record<string, RestaurantSeed> = Object.fromEntries(
  Object.entries(RAW_SEEDS).map(([slug, seed]) => [
    slug,
    { ...seed, stations: seed.stations.map((st) => deriveStation(st, slug)) },
  ]),
);

export function getSeed(slug: string): RestaurantSeed | undefined {
  return SEEDS[slug];
}

export function totalItems(seed: RestaurantSeed): number {
  return seed.stations.reduce((sum, s) => sum + s.items.length, 0);
}

export function totalMenuItems(seed: RestaurantSeed): number {
  return seed.menus.reduce(
    (sum, m) => sum + m.sections.reduce((s, sec) => s + sec.items.length, 0),
    0,
  );
}

export function belowParItems(seed: RestaurantSeed): Array<{
  station: string;
  item: InventoryItem;
  delta: number;
  pctOfPar: number;
}> {
  const out: Array<{ station: string; item: InventoryItem; delta: number; pctOfPar: number }> = [];
  for (const st of seed.stations) {
    for (const it of st.items) {
      if (it.par != null && it.lastCounted != null && it.lastCounted < it.par) {
        out.push({
          station: st.name,
          item: it,
          delta: +(it.par - it.lastCounted).toFixed(1),
          pctOfPar: +((it.lastCounted / it.par) * 100).toFixed(1),
        });
      }
    }
  }
  return out.sort((a, b) => a.pctOfPar - b.pctOfPar);
}

export function dualCountItems(seed: RestaurantSeed): Array<{ station: string; item: InventoryItem }> {
  const out: Array<{ station: string; item: InventoryItem }> = [];
  for (const st of seed.stations) {
    for (const it of st.items) {
      if (it.requiresDualCount) out.push({ station: st.name, item: it });
    }
  }
  return out;
}

export type { Menu, MenuSection, MenuItem, Station, InventoryItem, RestaurantSeed, UnitType } from "./types";
