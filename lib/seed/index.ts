import type { RestaurantSeed } from "./types";
import { miami } from "./miami";
import { fortLauderdale } from "./fort-lauderdale";
import { dsSports } from "./ds-sports";

export const SEEDS: Record<string, RestaurantSeed> = {
  miami,
  "fort-lauderdale": fortLauderdale,
  "ds-sports": dsSports,
};

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

export type { Menu, MenuSection, MenuItem, Station, InventoryItem, RestaurantSeed, UnitType } from "./types";
