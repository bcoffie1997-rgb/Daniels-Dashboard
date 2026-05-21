// Seed data for the demo shell. Plausible steakhouse inventory — these are
// NOT Daniel's actual items, just realistic placeholders so the flows feel
// real when walked through. Per the project rules, real Daniel inventory
// goes in a gitignored seed-daniel.sql, never here.

import type {
  CountEntry,
  CountSession,
  Item,
  Station,
  User,
} from "./types";

export const seedUsers: User[] = [
  {
    id: "u-admin",
    email: "branden@danielssteak.com",
    full_name: "Branden",
    role: "admin",
    active: true,
    created_at: "2026-01-15T14:00:00Z",
  },
  {
    id: "u-manager",
    email: "chef.j@danielssteak.com",
    full_name: "Chef J.",
    role: "manager",
    active: true,
    created_at: "2026-01-18T14:00:00Z",
  },
  {
    id: "u-counter-1",
    email: "marisol@danielssteak.com",
    full_name: "Marisol R.",
    role: "counter",
    active: true,
    created_at: "2026-02-02T14:00:00Z",
  },
  {
    id: "u-counter-2",
    email: "tomas@danielssteak.com",
    full_name: "Tomás L.",
    role: "counter",
    active: true,
    created_at: "2026-02-04T14:00:00Z",
  },
];

export const seedStations: Station[] = [
  {
    id: "s-walkin1",
    name: "Walk-in 1 — Proteins",
    sort_order: 10,
    active: true,
  },
  {
    id: "s-walkin2",
    name: "Walk-in 2 — Produce",
    sort_order: 20,
    active: true,
  },
  { id: "s-drystorage", name: "Dry Storage", sort_order: 30, active: true },
  { id: "s-bar", name: "Bar — Spirits", sort_order: 40, active: true },
  { id: "s-wine", name: "Wine Cellar", sort_order: 50, active: true },
];

export const seedItems: Item[] = [
  // Walk-in 1 — Proteins (in physical walk order)
  { id: "i-1", station_id: "s-walkin1", name: "Ribeye, 14 oz", unit: "each", sort_order: 10, par_level: 40, active: true },
  { id: "i-2", station_id: "s-walkin1", name: "Filet mignon, 8 oz", unit: "each", sort_order: 20, par_level: 32, active: true },
  { id: "i-3", station_id: "s-walkin1", name: "New York strip, 12 oz", unit: "each", sort_order: 30, par_level: 28, active: true },
  { id: "i-4", station_id: "s-walkin1", name: "Dry-aged tomahawk", unit: "each", sort_order: 40, par_level: 8, active: true },
  { id: "i-5", station_id: "s-walkin1", name: "Lamb chop, frenched", unit: "each", sort_order: 50, par_level: 24, active: true },
  { id: "i-6", station_id: "s-walkin1", name: "Berkshire pork chop", unit: "each", sort_order: 60, par_level: 16, active: true },
  { id: "i-7", station_id: "s-walkin1", name: "Half chicken, marinated", unit: "each", sort_order: 70, par_level: 18, active: true },
  { id: "i-8", station_id: "s-walkin1", name: "Florida red snapper", unit: "lb", sort_order: 80, par_level: 15, active: true },
  { id: "i-9", station_id: "s-walkin1", name: "Maine lobster tail", unit: "each", sort_order: 90, par_level: 20, active: true },
  { id: "i-10", station_id: "s-walkin1", name: "Stone crab claws", unit: "lb", sort_order: 100, par_level: 12, active: true },
  { id: "i-11", station_id: "s-walkin1", name: "Diver scallops", unit: "lb", sort_order: 110, par_level: 8, active: true },
  { id: "i-12", station_id: "s-walkin1", name: "Beef tartare trim", unit: "lb", sort_order: 120, par_level: 5, active: true },

  // Walk-in 2 — Produce
  { id: "i-13", station_id: "s-walkin2", name: "Heirloom tomatoes", unit: "lb", sort_order: 10, par_level: 12, active: true },
  { id: "i-14", station_id: "s-walkin2", name: "Mâche, washed", unit: "lb", sort_order: 20, par_level: 3, active: true },
  { id: "i-15", station_id: "s-walkin2", name: "Butter lettuce", unit: "each", sort_order: 30, par_level: 24, active: true },
  { id: "i-16", station_id: "s-walkin2", name: "Brussels sprouts", unit: "lb", sort_order: 40, par_level: 10, active: true },
  { id: "i-17", station_id: "s-walkin2", name: "Yukon gold potatoes", unit: "lb", sort_order: 50, par_level: 40, active: true },
  { id: "i-18", station_id: "s-walkin2", name: "Heirloom carrots", unit: "lb", sort_order: 60, par_level: 8, active: true },
  { id: "i-19", station_id: "s-walkin2", name: "Cremini mushrooms", unit: "lb", sort_order: 70, par_level: 6, active: true },
  { id: "i-20", station_id: "s-walkin2", name: "Microgreens, mixed", unit: "oz", sort_order: 80, par_level: 12, active: true },
  { id: "i-21", station_id: "s-walkin2", name: "Rosemary, bunch", unit: "each", sort_order: 90, par_level: 8, active: true },
  { id: "i-22", station_id: "s-walkin2", name: "Thyme, bunch", unit: "each", sort_order: 100, par_level: 8, active: true },

  // Dry Storage
  { id: "i-23", station_id: "s-drystorage", name: "Maldon sea salt", unit: "kg", sort_order: 10, par_level: 4, active: true },
  { id: "i-24", station_id: "s-drystorage", name: "Black peppercorns", unit: "lb", sort_order: 20, par_level: 3, active: true },
  { id: "i-25", station_id: "s-drystorage", name: "Castelvetrano olives", unit: "case", sort_order: 30, par_level: 2, active: true },
  { id: "i-26", station_id: "s-drystorage", name: "EVOO, finishing", unit: "l", sort_order: 40, par_level: 6, active: true },
  { id: "i-27", station_id: "s-drystorage", name: "Aged balsamic", unit: "ml", sort_order: 50, par_level: 750, active: true },
  { id: "i-28", station_id: "s-drystorage", name: "Sourdough flour", unit: "lb", sort_order: 60, par_level: 50, active: true },
  { id: "i-29", station_id: "s-drystorage", name: "Bone marrow stock base", unit: "qt", sort_order: 70, par_level: 8, active: true },

  // Bar — Spirits
  { id: "i-30", station_id: "s-bar", name: "Pappy Van Winkle 15", unit: "bottle", sort_order: 10, par_level: 1, active: true },
  { id: "i-31", station_id: "s-bar", name: "Macallan 18", unit: "bottle", sort_order: 20, par_level: 2, active: true },
  { id: "i-32", station_id: "s-bar", name: "Hendrick's gin", unit: "bottle", sort_order: 30, par_level: 4, active: true },
  { id: "i-33", station_id: "s-bar", name: "Casa Dragones blanco", unit: "bottle", sort_order: 40, par_level: 3, active: true },
  { id: "i-34", station_id: "s-bar", name: "Angostura bitters", unit: "bottle", sort_order: 50, par_level: 6, active: true },
  { id: "i-35", station_id: "s-bar", name: "Dolin dry vermouth", unit: "bottle", sort_order: 60, par_level: 3, active: true },
  { id: "i-36", station_id: "s-bar", name: "Maraschino cherries, Luxardo", unit: "bottle", sort_order: 70, par_level: 4, active: true },

  // Wine Cellar
  { id: "i-37", station_id: "s-wine", name: "Caymus Cabernet 2021", unit: "bottle", sort_order: 10, par_level: 12, active: true },
  { id: "i-38", station_id: "s-wine", name: "Rombauer Chardonnay 2022", unit: "bottle", sort_order: 20, par_level: 18, active: true },
  { id: "i-39", station_id: "s-wine", name: "Domaine Tempier Bandol 2021", unit: "bottle", sort_order: 30, par_level: 6, active: true },
  { id: "i-40", station_id: "s-wine", name: "Sancerre, Pascal Cotat 2022", unit: "bottle", sort_order: 40, par_level: 10, active: true },
  { id: "i-41", station_id: "s-wine", name: "Krug Grande Cuvée", unit: "bottle", sort_order: 50, par_level: 4, active: true },
];

// Helper to make ISO timestamps relative to "now" so demo data feels current
// regardless of when the page is opened.
const hoursAgo = (h: number) =>
  new Date(Date.now() - h * 60 * 60 * 1000).toISOString();
const daysAgo = (d: number) => hoursAgo(d * 24);

export const seedSessions: CountSession[] = [
  {
    id: "sess-1",
    user_id: "u-counter-1",
    station_id: "s-walkin1",
    status: "submitted",
    started_at: hoursAgo(3),
    submitted_at: hoursAgo(2),
    approved_at: null,
    approved_by: null,
    rejection_reason: null,
    manager_notes: null,
    notes: "Stone crab delivery is short again.",
  },
  {
    id: "sess-2",
    user_id: "u-counter-2",
    station_id: "s-walkin2",
    status: "approved",
    started_at: daysAgo(1),
    submitted_at: daysAgo(1),
    approved_at: hoursAgo(20),
    approved_by: "u-manager",
    rejection_reason: null,
    manager_notes: "Variance on microgreens looks right; new supplier portions.",
    notes: null,
  },
  {
    id: "sess-3",
    user_id: "u-counter-1",
    station_id: "s-bar",
    status: "approved",
    started_at: daysAgo(2),
    submitted_at: daysAgo(2),
    approved_at: daysAgo(2),
    approved_by: "u-manager",
    rejection_reason: null,
    manager_notes: null,
    notes: null,
  },
  {
    id: "sess-4",
    user_id: "u-counter-2",
    station_id: "s-drystorage",
    status: "rejected",
    started_at: daysAgo(3),
    submitted_at: daysAgo(3),
    approved_at: null,
    approved_by: "u-manager",
    rejection_reason:
      "Flour count looks low by half a bag — please re-count and resubmit.",
    manager_notes: null,
    notes: null,
  },
];

// Per-entry helper: assemble entries for each session quickly.
const e = (
  session_id: string,
  item_id: string,
  quantity: number,
  previous_quantity: number | null,
  reason?: string,
): CountEntry => {
  const variance_pct =
    previous_quantity === null || previous_quantity === 0
      ? null
      : Number(
          (((quantity - previous_quantity) / previous_quantity) * 100).toFixed(
            2,
          ),
        );
  return {
    id: `${session_id}-${item_id}`,
    session_id,
    item_id,
    quantity,
    previous_quantity,
    variance_pct,
    entered_at: hoursAgo(2.5),
    reason,
  };
};

export const seedEntries: CountEntry[] = [
  // Session 1 — Walk-in 1 (submitted, awaiting review)
  e("sess-1", "i-1", 38, 42),
  e("sess-1", "i-2", 28, 30),
  e("sess-1", "i-3", 25, 26),
  e("sess-1", "i-4", 6, 8),
  e("sess-1", "i-5", 22, 24),
  e("sess-1", "i-6", 14, 16),
  e("sess-1", "i-7", 17, 18),
  e("sess-1", "i-8", 11, 15),
  e("sess-1", "i-9", 18, 20),
  e("sess-1", "i-10", 4, 12, "Delivery short — only got half the case."),
  e("sess-1", "i-11", 6, 8),
  e("sess-1", "i-12", 4, 5),

  // Session 2 — Walk-in 2 (approved, includes a big variance the manager OK'd)
  e("sess-2", "i-13", 10, 12),
  e("sess-2", "i-14", 2.5, 3),
  e("sess-2", "i-15", 22, 24),
  e("sess-2", "i-16", 9, 10),
  e("sess-2", "i-17", 38, 40),
  e("sess-2", "i-18", 7, 8),
  e("sess-2", "i-19", 5.5, 6),
  e("sess-2", "i-20", 4, 12, "New supplier portions are smaller."),
  e("sess-2", "i-21", 8, 8),
  e("sess-2", "i-22", 7, 8),

  // Session 3 — Bar (approved)
  e("sess-3", "i-30", 1, 1),
  e("sess-3", "i-31", 2, 2),
  e("sess-3", "i-32", 3, 4),
  e("sess-3", "i-33", 2, 3),
  e("sess-3", "i-34", 6, 6),
  e("sess-3", "i-35", 2, 3),
  e("sess-3", "i-36", 4, 4),

  // Session 4 — Dry Storage (rejected)
  e("sess-4", "i-23", 4, 4),
  e("sess-4", "i-24", 3, 3),
  e("sess-4", "i-25", 2, 2),
  e("sess-4", "i-26", 5, 6),
  e("sess-4", "i-27", 600, 750),
  e("sess-4", "i-28", 22, 50),
  e("sess-4", "i-29", 7, 8),
];
