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

  // ─── APPROVED — recent history ───
  {
    id: "sess-mia-h001",
    restaurantSlug: "miami",
    stationName: "Walk-in Cooler — Proteins",
    startedAt: "2026-05-20 16:12",
    submittedAt: "2026-05-20 16:48",
    approvedAt: "2026-05-20 17:02",
    status: "approved",
    countedBy: { name: "Andres R.", role: "manager" },
    approvedBy: { name: "Kassidy Angelo", role: "admin" },
    entries: [
      { itemName: "Demkota Prime Filet Mignon (8oz)", quantity: 22, previousQuantity: 24, variancePct: -8.3 },
      { itemName: "Margaret River Wagyu NY Strip", quantity: 9, previousQuantity: 10, variancePct: -10.0 },
    ],
  },
  {
    id: "sess-mia-h002",
    restaurantSlug: "miami",
    stationName: "Walk-in Cooler — Dairy & Produce",
    startedAt: "2026-05-20 14:30",
    submittedAt: "2026-05-20 15:14",
    approvedAt: "2026-05-20 15:32",
    status: "approved",
    countedBy: { name: "Andres R.", role: "manager" },
    approvedBy: { name: "Danny Ganem", role: "admin" },
    entries: [
      { itemName: "Buffalo Mozzarella", quantity: 5.5, previousQuantity: 6, variancePct: -8.3 },
      { itemName: "Burrata", quantity: 10, previousQuantity: 12, variancePct: -16.7 },
      { itemName: "Parmigiano Reggiano", quantity: 7.2, previousQuantity: 8, variancePct: -10.0 },
    ],
  },
  {
    id: "sess-mia-h003",
    restaurantSlug: "miami",
    stationName: "Dry Storage",
    startedAt: "2026-05-19 11:00",
    submittedAt: "2026-05-19 11:42",
    approvedAt: "2026-05-19 12:08",
    status: "approved",
    countedBy: { name: "Andres R.", role: "manager" },
    approvedBy: { name: "Branden M.", role: "admin" },
    entries: [
      { itemName: "Monograno Linguine", quantity: 18, previousQuantity: 20, variancePct: -10.0 },
      { itemName: "GIOIA Hospitality Extra Virgin Olive Oil", quantity: 11, previousQuantity: 12, variancePct: -8.3 },
    ],
  },
  {
    id: "sess-ftl-h001",
    restaurantSlug: "fort-lauderdale",
    stationName: "Walk-in Cooler — Proteins",
    startedAt: "2026-05-21 05:30",
    submittedAt: "2026-05-21 05:58",
    approvedAt: "2026-05-21 06:02",
    status: "approved",
    countedBy: { name: "Branden M.", role: "admin" },
    approvedBy: { name: "Branden M.", role: "admin" },
    entries: [
      { itemName: "Demkota Prime Filet Mignon (8oz)", quantity: 23, previousQuantity: 24, variancePct: -4.2 },
      { itemName: "Upper Iowa Prime NY Strip", quantity: 14, previousQuantity: 15, variancePct: -6.7 },
    ],
  },
  {
    id: "sess-ftl-h002",
    restaurantSlug: "fort-lauderdale",
    stationName: "Walk-in Cooler — Seafood & Raw Bar",
    startedAt: "2026-05-20 17:14",
    submittedAt: "2026-05-20 17:42",
    approvedAt: "2026-05-20 18:00",
    status: "approved",
    countedBy: { name: "Sarah K.", role: "manager" },
    approvedBy: { name: "Branden M.", role: "admin" },
    entries: [
      { itemName: "Maine Lobster (1.5 lb)", quantity: 11, previousQuantity: 12, variancePct: -8.3 },
      { itemName: "Florida Keys Red Snapper", quantity: 5.5, previousQuantity: 6, variancePct: -8.3 },
    ],
  },
  {
    id: "sess-ftl-h003",
    restaurantSlug: "fort-lauderdale",
    stationName: "Bar — Wine & Beer",
    startedAt: "2026-05-20 20:30",
    submittedAt: "2026-05-20 20:42",
    approvedAt: "2026-05-20 20:48",
    status: "approved",
    countedBy: { name: "Sarah K.", role: "manager" },
    approvedBy: { name: "Sarah K.", role: "manager" },
    entries: [
      { itemName: "BTG Red (rolling)", quantity: 28, previousQuantity: 30, variancePct: -6.7 },
      { itemName: "BTG White (rolling)", quantity: 22, previousQuantity: 24, variancePct: -8.3 },
    ],
  },
  {
    id: "sess-ftl-h004",
    restaurantSlug: "fort-lauderdale",
    stationName: "Walk-in Cooler — Dairy & Produce",
    startedAt: "2026-05-19 06:30",
    submittedAt: "2026-05-19 07:12",
    approvedAt: "2026-05-19 07:34",
    status: "approved",
    countedBy: { name: "Branden M.", role: "admin" },
    approvedBy: { name: "Branden M.", role: "admin" },
    entries: [
      { itemName: "Parmigiano Reggiano", quantity: 7.5, previousQuantity: 8, variancePct: -6.3 },
    ],
  },
  {
    id: "sess-ds-h001",
    restaurantSlug: "ds-sports",
    stationName: "Walk-in Cooler — Dairy & Produce",
    startedAt: "2026-05-20 11:42",
    submittedAt: "2026-05-20 12:18",
    approvedAt: "2026-05-20 12:30",
    status: "approved",
    countedBy: { name: "Jordan T.", role: "counter" },
    approvedBy: { name: "Marisol G.", role: "manager" },
    entries: [
      { itemName: "American Cheese (smash)", quantity: 7.5, previousQuantity: 8, variancePct: -6.3 },
      { itemName: "Provolone", quantity: 5.2, previousQuantity: 6, variancePct: -13.3 },
    ],
  },
  {
    id: "sess-ds-h002",
    restaurantSlug: "ds-sports",
    stationName: "Dry Storage",
    startedAt: "2026-05-19 10:14",
    submittedAt: "2026-05-19 10:48",
    approvedAt: "2026-05-19 11:02",
    status: "approved",
    countedBy: { name: "Jordan T.", role: "counter" },
    approvedBy: { name: "Marisol G.", role: "manager" },
    entries: [
      { itemName: "Fryer Oil", quantity: 8, previousQuantity: 10, variancePct: -20.0 },
      { itemName: "Buffalo Sauce", quantity: 5, previousQuantity: 6, variancePct: -16.7 },
    ],
  },

  // ─── REJECTED ───
  {
    id: "sess-mia-r001",
    restaurantSlug: "miami",
    stationName: "Dry Storage",
    startedAt: "2026-05-20 13:42",
    submittedAt: "2026-05-20 14:08",
    rejectedAt: "2026-05-20 14:14",
    status: "rejected",
    countedBy: { name: "Jordan T.", role: "counter" },
    approvedBy: { name: "Kassidy Angelo", role: "admin" },
    rejectionReason:
      "Recount Monograno Linguine and Lumachine in lb, not case — you have 24 lb listed as 24 case which would be ~120 lb. Likely typo. Also re-verify Calabrian Chili count.",
    entries: [
      { itemName: "Monograno Linguine", quantity: 24, previousQuantity: 20, variancePct: 20.0 },
      { itemName: "Lumachine Pasta", quantity: 16, previousQuantity: 16, variancePct: 0 },
      { itemName: "Calabrian Chili", quantity: 0.5, previousQuantity: 2, variancePct: -75.0 },
    ],
  },
  {
    id: "sess-ftl-r001",
    restaurantSlug: "fort-lauderdale",
    stationName: "Pastry & Dessert",
    startedAt: "2026-05-18 22:14",
    submittedAt: "2026-05-18 22:36",
    rejectedAt: "2026-05-18 23:02",
    status: "rejected",
    countedBy: { name: "Sarah K.", role: "manager" },
    approvedBy: { name: "Branden M.", role: "admin" },
    rejectionReason:
      "Soft Serve Mix count is in liters but we order in gallons. Recount as gallons.",
    entries: [
      { itemName: "Soft Serve Mix", quantity: 4, previousQuantity: 3, variancePct: 33.3 },
    ],
  },

  // ─── IN-PROGRESS — someone counting right now ───
  {
    id: "sess-ds-ip001",
    restaurantSlug: "ds-sports",
    stationName: "Walk-in Cooler — Seafood",
    startedAt: "2026-05-21 18:48",
    status: "in_progress",
    countedBy: { name: "Jordan T.", role: "counter" },
    entries: [
      { itemName: "Branzino", quantity: 8, previousQuantity: 10, variancePct: -20.0 },
      { itemName: "Shrimp (scampi 21-25)", quantity: 9, previousQuantity: 12, variancePct: -25.0 },
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

export type LastCount = {
  ts: string; // approvedAt or submittedAt fallback
  by: string;
  status: SessionStatus;
  sessionId: string;
};

/**
 * Most recent count session for a station — prefers approved, falls back
 * to most-recent regardless of status.
 */
export function lastCountedFor(
  slug: RestaurantSlug,
  stationName: string,
): LastCount | null {
  const matches = MOCK_SESSIONS.filter(
    (s) => s.restaurantSlug === slug && s.stationName === stationName,
  );
  if (matches.length === 0) return null;

  const sortedByApproved = matches
    .filter((s) => s.status === "approved" && s.approvedAt)
    .sort((a, b) => (b.approvedAt! < a.approvedAt! ? -1 : 1));

  if (sortedByApproved.length > 0) {
    const s = sortedByApproved[0];
    return { ts: s.approvedAt!, by: s.countedBy.name, status: "approved", sessionId: s.id };
  }
  const fallback = matches
    .slice()
    .sort((a, b) => (a.startedAt < b.startedAt ? 1 : -1))[0];
  const ts = fallback.approvedAt ?? fallback.submittedAt ?? fallback.startedAt;
  return { ts, by: fallback.countedBy.name, status: fallback.status, sessionId: fallback.id };
}

/**
 * Relative timestamp like "2h ago" / "3d ago". Pure string math so it
 * doesn't depend on the clock at SSR time.
 */
export function relativeTime(ts: string): string {
  // Parse as local time; mock data uses "YYYY-MM-DD HH:MM"
  const t = new Date(ts.replace(" ", "T")).getTime();
  const now = new Date("2026-05-21T19:00:00").getTime(); // anchor to mock "now"
  const diff = now - t;
  if (diff < 0) return "just now";
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  const w = Math.floor(d / 7);
  return `${w}w ago`;
}
