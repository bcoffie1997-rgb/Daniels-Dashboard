import type { RestaurantSlug } from "../restaurants";

export type SessionStatus = "in_progress" | "submitted" | "approved" | "rejected";

export type MockSessionEntry = {
  itemName: string;
  quantity: number;
  previousQuantity?: number;
  variancePct?: number;
};

export type MockSession = {
  id: string;
  restaurantSlug: RestaurantSlug;
  stationName: string;
  startedAt: string;
  submittedAt?: string;
  approvedAt?: string;
  rejectedAt?: string;
  status: SessionStatus;
  countedBy: { name: string; role: "counter" | "manager" | "admin" };
  approvedBy?: { name: string; role: "manager" | "admin" };
  rejectionReason?: string;
  entries: MockSessionEntry[];
  notes?: string;
};

export const MOCK_SESSIONS: MockSession[] = [
  // Pending — Miami
  {
    id: "sess-mia-001",
    restaurantSlug: "miami",
    stationName: "Walk-in Cooler — Seafood & Raw Bar",
    startedAt: "2026-05-20 22:14",
    submittedAt: "2026-05-20 22:36",
    status: "submitted",
    countedBy: { name: "Andres R.", role: "manager" },
    entries: [
      { itemName: "Serenoa Skipper Sweet Oysters", quantity: 3.5, previousQuantity: 4, variancePct: -12.5 },
      { itemName: "Black Tiger Shrimp", quantity: 5, previousQuantity: 6, variancePct: -16.7 },
      { itemName: "Maine Lobster (1.5 lb)", quantity: 9, previousQuantity: 12, variancePct: -25.0 },
      { itemName: "Yellowfin Tuna", quantity: 5.2, previousQuantity: 6, variancePct: -13.3 },
      { itemName: "Hamachi", quantity: 3.8, previousQuantity: 4, variancePct: -5.0 },
      { itemName: "Umai Kaluga Caviar", quantity: 6, previousQuantity: 8, variancePct: -25.0 },
    ],
    notes: "Oyster delivery delayed — using yesterday's stock plus 2 boxes from FTL.",
  },
  {
    id: "sess-mia-002",
    restaurantSlug: "miami",
    stationName: "Bar — Liquor",
    startedAt: "2026-05-21 03:12",
    submittedAt: "2026-05-21 03:28",
    status: "submitted",
    countedBy: { name: "Marisol G.", role: "manager" },
    entries: [
      { itemName: "Grey Goose Vodka (1L)", quantity: 7, previousQuantity: 8, variancePct: -12.5 },
      { itemName: "Bacardi Rum (1L)", quantity: 3, previousQuantity: 4, variancePct: -25.0 },
      { itemName: "Fiola Cask Bourbon", quantity: 2.5, previousQuantity: 4, variancePct: -37.5 },
    ],
  },
  // Pending — FTL
  {
    id: "sess-ftl-001",
    restaurantSlug: "fort-lauderdale",
    stationName: "Walk-in Cooler — Proteins",
    startedAt: "2026-05-21 17:48",
    submittedAt: "2026-05-21 18:14",
    status: "submitted",
    countedBy: { name: "Sarah K.", role: "manager" },
    entries: [
      { itemName: "Demkota Prime Filet Mignon (8oz)", quantity: 21, previousQuantity: 24, variancePct: -12.5 },
      { itemName: "Margaret River Wagyu NY Strip", quantity: 7.2, previousQuantity: 8, variancePct: -10.0 },
    ],
  },
  // Pending — D's
  {
    id: "sess-ds-001",
    restaurantSlug: "ds-sports",
    stationName: "Walk-in Cooler — Burgers & Proteins",
    startedAt: "2026-05-21 02:31",
    submittedAt: "2026-05-21 02:52",
    status: "submitted",
    countedBy: { name: "Jordan T.", role: "counter" },
    entries: [
      { itemName: "Florida Grassfed Burger Patties (smash)", quantity: 24, previousQuantity: 30, variancePct: -20.0 },
      { itemName: "Bacon", quantity: 11, previousQuantity: 15, variancePct: -26.7 },
      { itemName: "Chicken Wings", quantity: 22, previousQuantity: 30, variancePct: -26.7 },
    ],
    notes: "Sunday football crowd. Smash burger orders 2x normal.",
  },
  {
    id: "sess-ds-002",
    restaurantSlug: "ds-sports",
    stationName: "Bar — Liquor",
    startedAt: "2026-05-21 02:48",
    submittedAt: "2026-05-21 03:05",
    status: "submitted",
    countedBy: { name: "Marisol G.", role: "manager" },
    entries: [
      { itemName: "Fiola Cask Bourbon", quantity: 3.5, previousQuantity: 6, variancePct: -41.7 },
      { itemName: "Tito's Vodka", quantity: 6, previousQuantity: 8, variancePct: -25.0 },
    ],
  },
  {
    id: "sess-ds-003",
    restaurantSlug: "ds-sports",
    stationName: "Bar — Beer & Seltzer",
    startedAt: "2026-05-21 04:02",
    submittedAt: "2026-05-21 04:18",
    status: "submitted",
    countedBy: { name: "Marisol G.", role: "manager" },
    entries: [
      { itemName: "Gulfstream Brewing (keg)", quantity: 1, previousQuantity: 2, variancePct: -50.0 },
    ],
  },
];

export function sessionsFor(slug: RestaurantSlug, statuses?: SessionStatus[]): MockSession[] {
  return MOCK_SESSIONS.filter(
    (s) => s.restaurantSlug === slug && (!statuses || statuses.includes(s.status)),
  );
}

export function pendingSessionsFor(slug: RestaurantSlug): MockSession[] {
  return sessionsFor(slug, ["submitted"]);
}

export function sessionById(id: string): MockSession | undefined {
  return MOCK_SESSIONS.find((s) => s.id === id);
}
