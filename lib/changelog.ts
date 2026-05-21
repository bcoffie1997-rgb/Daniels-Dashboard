import type { RestaurantSlug } from "./restaurants";

export type ChangelogAction =
  | "created"
  | "updated"
  | "deleted"
  | "approved"
  | "rejected"
  | "invited"
  | "role_changed"
  | "login"
  | "exported"
  | "integration"
  | "system";

export type ChangelogEntry = {
  id: string;
  ts: string;
  restaurant: RestaurantSlug | "group";
  actor: { name: string; role: "admin" | "manager" | "counter" | "system" };
  action: ChangelogAction;
  entityType: "item" | "station" | "session" | "user" | "restaurant" | "integration" | "alert" | "auth";
  entity: string;
  detail?: string;
  ip?: string;
};

const A = (role: "admin" | "manager" | "counter") => ({
  Branden: { name: "Branden M.", role: "admin" as const },
  Tom: { name: "Tom Angelo", role: "admin" as const },
  Kassidy: { name: "Kassidy Angelo", role: "admin" as const },
  Andres: { name: "Andres R.", role: "manager" as const },
  Sarah: { name: "Sarah K.", role: "manager" as const },
  Marisol: { name: "Marisol G.", role: "manager" as const },
  Jordan: { name: "Jordan T.", role: "counter" as const },
  Danny: { name: "Danny Ganem", role: "admin" as const },
});

const SYS = { name: "System", role: "system" as const };

const U = A("admin");

export const CHANGELOG: ChangelogEntry[] = [
  {
    id: "evt_001",
    ts: "2026-05-21 14:32",
    restaurant: "fort-lauderdale",
    actor: U.Branden,
    action: "updated",
    entityType: "item",
    entity: "Demkota Prime Filet Mignon (8oz)",
    detail: "par_level: 24 → 28",
    ip: "73.18.211.4",
  },
  {
    id: "evt_002",
    ts: "2026-05-21 13:14",
    restaurant: "miami",
    actor: U.Kassidy,
    action: "approved",
    entityType: "session",
    entity: "Walk-in Cooler — Seafood & Raw Bar",
    detail: "14 items · counted by Andres R. · 2 variances flagged",
  },
  {
    id: "evt_003",
    ts: "2026-05-21 11:48",
    restaurant: "miami",
    actor: U.Kassidy,
    action: "rejected",
    entityType: "session",
    entity: "Dry Storage",
    detail: "Reason: pasta units mismatch — recount Monograno Linguine and Lumachine in lb, not case",
  },
  {
    id: "evt_004",
    ts: "2026-05-21 10:22",
    restaurant: "fort-lauderdale",
    actor: U.Branden,
    action: "created",
    entityType: "item",
    entity: "House Pastrami",
    detail: "Station: Walk-in Cooler — Proteins · unit: lb · par: 4",
  },
  {
    id: "evt_005",
    ts: "2026-05-21 09:05",
    restaurant: "ds-sports",
    actor: U.Branden,
    action: "invited",
    entityType: "user",
    entity: "jordan@gioia.com",
    detail: "Role: counter · location: D's Sports Bar",
  },
  {
    id: "evt_006",
    ts: "2026-05-21 06:30",
    restaurant: "group",
    actor: SYS,
    action: "system",
    entityType: "alert",
    entity: "Below-par notification",
    detail: "Sent to purchaser@gioia.com · 52 items across 3 locations · 18 critical",
  },
  {
    id: "evt_007",
    ts: "2026-05-21 02:48",
    restaurant: "ds-sports",
    actor: A("manager").Marisol,
    action: "approved",
    entityType: "session",
    entity: "Bar — Liquor",
    detail: "9 items · 1 variance >10% (Fiola Cask Bourbon)",
  },
  {
    id: "evt_008",
    ts: "2026-05-20 22:14",
    restaurant: "miami",
    actor: A("counter").Jordan,
    action: "created",
    entityType: "session",
    entity: "Walk-in Cooler — Seafood & Raw Bar",
    detail: "Started count · 14 items",
  },
  {
    id: "evt_009",
    ts: "2026-05-20 18:02",
    restaurant: "group",
    actor: U.Tom,
    action: "role_changed",
    entityType: "user",
    entity: "danny@gioia.com",
    detail: "manager → admin · scope: all 3 restaurants",
  },
  {
    id: "evt_010",
    ts: "2026-05-20 16:45",
    restaurant: "fort-lauderdale",
    actor: U.Branden,
    action: "exported",
    entityType: "session",
    entity: "Weekly summary 2026-W20",
    detail: "CSV · 4 sessions · downloaded to local",
  },
  {
    id: "evt_011",
    ts: "2026-05-20 14:18",
    restaurant: "fort-lauderdale",
    actor: U.Branden,
    action: "updated",
    entityType: "item",
    entity: "Maine Lobster (1.5 lb)",
    detail: "par_level: 10 → 12 · unit_cost: $26 → $28",
  },
  {
    id: "evt_012",
    ts: "2026-05-20 11:55",
    restaurant: "group",
    actor: U.Tom,
    action: "integration",
    entityType: "integration",
    entity: "Toast Partner API",
    detail: "Enrollment initiated — application submitted. Status: pending review",
  },
  {
    id: "evt_013",
    ts: "2026-05-20 10:30",
    restaurant: "ds-sports",
    actor: A("manager").Marisol,
    action: "deleted",
    entityType: "item",
    entity: "Hawthorne Creamery Blue Cheese (duplicate)",
    detail: "Soft-deleted · active=false · 9 historical counts preserved",
  },
  {
    id: "evt_014",
    ts: "2026-05-20 08:12",
    restaurant: "miami",
    actor: U.Danny,
    action: "updated",
    entityType: "station",
    entity: "Walk-in Cooler — Proteins",
    detail: "Reordered items: moved Wagyu Tomahawk above Tomahawks (walk order correction)",
  },
  {
    id: "evt_015",
    ts: "2026-05-20 06:00",
    restaurant: "group",
    actor: SYS,
    action: "system",
    entityType: "auth",
    entity: "Weekly admin digest",
    detail: "Sent to all admins · 22 sessions last 7d · 4 rejected · 2 integration alerts",
  },
  {
    id: "evt_016",
    ts: "2026-05-19 22:48",
    restaurant: "ds-sports",
    actor: U.Branden,
    action: "created",
    entityType: "station",
    entity: "Bar — Garnish & Mixers",
    detail: "10 items seeded · sort_order: 8",
  },
  {
    id: "evt_017",
    ts: "2026-05-19 15:20",
    restaurant: "fort-lauderdale",
    actor: A("manager").Sarah,
    action: "approved",
    entityType: "session",
    entity: "Bar — Wine & Beer",
    detail: "6 items · no variances · counted by Sarah K.",
  },
  {
    id: "evt_018",
    ts: "2026-05-19 11:02",
    restaurant: "group",
    actor: U.Tom,
    action: "created",
    entityType: "restaurant",
    entity: "D's Sports Bar",
    detail: "Slug: ds-sports · city: Fort Lauderdale, FL · concept added",
  },
];

export function changelogFor(slug: RestaurantSlug | "group" | "all"): ChangelogEntry[] {
  if (slug === "all") return CHANGELOG;
  return CHANGELOG.filter((e) => e.restaurant === slug || e.restaurant === "group");
}
