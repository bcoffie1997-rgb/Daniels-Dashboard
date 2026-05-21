// 12 months of synthesized operations data for Daniel's, A Florida Steakhouse.
// All numbers are plausible but invented — used for the demo Insights view
// to show what trends and decisions the real product would surface.
//
// Patterns baked in:
// - Florida winter season (Dec–Apr): higher covers + revenue
// - Summer dip (Jun–Sep): slower nights, more closed days possible
// - Weekly rhythm: Fri/Sat strongest, Sun/Mon weakest
// - Special dates: Valentine's, Mother's Day, NYE, etc. get a multiplier
// - Deterministic: same inputs → same outputs across renders, no Math.random.

export const OPEN_DATE = "2025-05-21";
export const TODAY = "2026-05-21";

// ----- Tiny deterministic PRNG (mulberry32) -----
function hashSeed(...parts: (string | number)[]): number {
  let h = 2166136261 >>> 0;
  for (const p of parts) {
    const s = String(p);
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619) >>> 0;
    }
  }
  return h;
}
function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ----- Date helpers -----
function addDays(iso: string, days: number): string {
  const d = new Date(iso + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}
function daysBetween(a: string, b: string): number {
  const da = new Date(a + "T12:00:00Z").getTime();
  const db = new Date(b + "T12:00:00Z").getTime();
  return Math.round((db - da) / 86400000);
}
function parseISO(iso: string): {
  year: number;
  month: number; // 1–12
  day: number;
  weekday: number; // 0=Sun..6=Sat
} {
  const d = new Date(iso + "T12:00:00Z");
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth() + 1,
    day: d.getUTCDate(),
    weekday: d.getUTCDay(),
  };
}

// ----- Multipliers -----
const WEEKDAY_MULT = [0.55, 0.5, 0.7, 0.8, 1.0, 1.45, 1.6]; // Sun..Sat
const MONTH_MULT = {
  1: 1.25,  // Jan — high season
  2: 1.3,   // Feb
  3: 1.3,   // Mar — peak
  4: 1.2,   // Apr
  5: 0.95,  // May — softening
  6: 0.7,   // Jun — summer dip
  7: 0.65,  // Jul
  8: 0.7,   // Aug
  9: 0.8,   // Sep
  10: 1.0,  // Oct — building
  11: 1.1,  // Nov
  12: 1.4,  // Dec — peak (holiday)
} as Record<number, number>;

const SPECIAL_DAYS: Record<string, number> = {
  "02-14": 1.7, // Valentine's
  "12-31": 1.9, // NYE
  "12-24": 1.45, // Christmas Eve
  "12-25": 0,    // closed
  "11-27": 0,    // closed-ish Thanksgiving
  "07-04": 0.6,  // 4th of July
  "05-11": 1.55, // Mother's Day (Florida cue)
  "05-10": 1.55,
  "03-17": 1.2, // St Pat's
  "10-31": 0.85,
};

// ----- Per-day record -----
export interface DayMetrics {
  date: string;
  covers: number;
  revenue: number;        // total revenue
  food_revenue: number;
  bev_revenue: number;
  food_cost: number;
  bev_cost: number;
  food_cost_pct: number;
  bev_cost_pct: number;
  closed: boolean;
}

const baseCovers = 110; // typical Saturday post-warmup
const avgCheck = 165;   // upscale steakhouse, beverage-driven

function dayMetrics(date: string, anchor: number): DayMetrics {
  const { weekday, month, day } = parseISO(date);
  const mm = String(month).padStart(2, "0");
  const dd = String(day).padStart(2, "0");
  const sp = SPECIAL_DAYS[`${mm}-${dd}`];
  if (sp === 0) {
    return {
      date,
      covers: 0,
      revenue: 0,
      food_revenue: 0,
      bev_revenue: 0,
      food_cost: 0,
      bev_cost: 0,
      food_cost_pct: 0,
      bev_cost_pct: 0,
      closed: true,
    };
  }

  const dayIdx = daysBetween(OPEN_DATE, date);
  const seed = hashSeed("day", date, anchor);
  const jitter = 0.85 + rng(seed)() * 0.3; // ±15%
  const rampUp = Math.min(1, 0.7 + dayIdx / 240); // first 8 months ramp
  const special = sp ?? 1;

  const mult = WEEKDAY_MULT[weekday] * MONTH_MULT[month] * jitter * rampUp * special;
  const covers = Math.max(0, Math.round(baseCovers * mult));
  const avgCheckJ = avgCheck * (0.9 + rng(seed + 7)() * 0.25);
  const revenue = Math.round(covers * avgCheckJ);
  const bevShare = 0.40 + rng(seed + 11)() * 0.08; // 40–48% beverage
  const bev_revenue = Math.round(revenue * bevShare);
  const food_revenue = revenue - bev_revenue;

  // Food cost 30–34%, beverage cost 20–24% (pour cost for an upscale program)
  const food_cost_pct = 0.30 + rng(seed + 13)() * 0.04;
  const bev_cost_pct = 0.20 + rng(seed + 17)() * 0.04;
  const food_cost = Math.round(food_revenue * food_cost_pct);
  const bev_cost = Math.round(bev_revenue * bev_cost_pct);

  return {
    date,
    covers,
    revenue,
    food_revenue,
    bev_revenue,
    food_cost,
    bev_cost,
    food_cost_pct,
    bev_cost_pct,
    closed: false,
  };
}

export const dailyMetrics: DayMetrics[] = (() => {
  const days: DayMetrics[] = [];
  const total = daysBetween(OPEN_DATE, TODAY);
  for (let i = 0; i <= total; i++) {
    days.push(dayMetrics(addDays(OPEN_DATE, i), 42));
  }
  return days;
})();

// ----- Bar items -----
export interface BarItem {
  id: string;
  name: string;
  category: "cocktail" | "spirit" | "wine_btg" | "beer";
  price: number;
  cost: number;
}

export const barItems: BarItem[] = [
  { id: "bi-1", name: "Old Fashioned", category: "cocktail", price: 22, cost: 4.2 },
  { id: "bi-2", name: "Negroni", category: "cocktail", price: 21, cost: 3.9 },
  { id: "bi-3", name: "Espresso Martini", category: "cocktail", price: 19, cost: 3.6 },
  { id: "bi-4", name: "Daniel's Manhattan", category: "cocktail", price: 24, cost: 4.5 },
  { id: "bi-5", name: "Florida Mule", category: "cocktail", price: 18, cost: 3.2 },
  { id: "bi-6", name: "Spicy Margarita", category: "cocktail", price: 20, cost: 3.4 },
  { id: "bi-7", name: "Vesper", category: "cocktail", price: 23, cost: 4.4 },
  { id: "bi-8", name: "French 75", category: "cocktail", price: 22, cost: 4.6 },

  { id: "bi-9", name: "Macallan 18 (1.5 oz)", category: "spirit", price: 95, cost: 24 },
  { id: "bi-10", name: "Pappy 15 (1.5 oz)", category: "spirit", price: 120, cost: 32 },
  { id: "bi-11", name: "Casa Dragones blanco", category: "spirit", price: 38, cost: 9 },
  { id: "bi-12", name: "Hendrick's gin", category: "spirit", price: 16, cost: 3.2 },
  { id: "bi-13", name: "Don Julio 1942", category: "spirit", price: 65, cost: 18 },
  { id: "bi-14", name: "Yamazaki 12", category: "spirit", price: 48, cost: 14 },

  { id: "bi-15", name: "Caymus Cab (glass)", category: "wine_btg", price: 28, cost: 8 },
  { id: "bi-16", name: "Rombauer Chardonnay (glass)", category: "wine_btg", price: 22, cost: 6.4 },
  { id: "bi-17", name: "Sancerre (glass)", category: "wine_btg", price: 24, cost: 7.2 },
  { id: "bi-18", name: "Champagne (glass)", category: "wine_btg", price: 26, cost: 7.5 },
  { id: "bi-19", name: "Pinot Noir (glass)", category: "wine_btg", price: 21, cost: 6.1 },

  { id: "bi-20", name: "Stella Artois", category: "beer", price: 9, cost: 2.4 },
  { id: "bi-21", name: "Funky Buddha lager", category: "beer", price: 10, cost: 2.6 },
  { id: "bi-22", name: "NA beer", category: "beer", price: 8, cost: 2.0 },
];

// Per-item popularity (relative weight)
const BAR_WEIGHT: Record<string, number> = {
  "bi-1": 1.6, // Old Fashioned — signature
  "bi-2": 1.3, // Negroni
  "bi-3": 1.4, // Espresso Martini
  "bi-4": 1.5, // Daniel's Manhattan — house
  "bi-5": 0.9, // FL Mule
  "bi-6": 1.0, // Spicy Marg
  "bi-7": 0.7, // Vesper
  "bi-8": 0.8, // French 75
  "bi-9": 0.55, // Macallan 18
  "bi-10": 0.35, // Pappy
  "bi-11": 0.45, // Casa Dragones
  "bi-12": 0.6, // Hendrick's
  "bi-13": 0.5, // Don Julio
  "bi-14": 0.4, // Yamazaki
  "bi-15": 1.1, // Caymus glass
  "bi-16": 1.0, // Rombauer glass
  "bi-17": 0.85, // Sancerre glass
  "bi-18": 0.7, // Champagne glass
  "bi-19": 0.6, // Pinot glass
  "bi-20": 0.45,
  "bi-21": 0.4,
  "bi-22": 0.15,
};

export interface BarDaySale {
  date: string;
  item_id: string;
  units: number;
  revenue: number;
}

// Pre-aggregate item sales by day to keep page mounts fast.
export const barSales: BarDaySale[] = (() => {
  const out: BarDaySale[] = [];
  for (const day of dailyMetrics) {
    if (day.closed) continue;
    // Total bar units derived from beverage revenue and an avg item price
    const totalUnits = Math.round(day.bev_revenue / 21);
    let allocated = 0;
    const totalWeight = Object.values(BAR_WEIGHT).reduce((a, b) => a + b, 0);
    barItems.forEach((it, idx) => {
      const seed = hashSeed("bar", day.date, it.id);
      const w = BAR_WEIGHT[it.id] / totalWeight;
      const noise = 0.85 + rng(seed)() * 0.3;
      const share = idx === barItems.length - 1
        ? Math.max(0, totalUnits - allocated)
        : Math.round(totalUnits * w * noise);
      allocated += share;
      if (share > 0) {
        out.push({
          date: day.date,
          item_id: it.id,
          units: share,
          revenue: share * it.price,
        });
      }
    });
  }
  return out;
})();

// ----- Wine cellar (bottles, not by-the-glass) -----
export interface WineBottle {
  id: string;
  name: string;
  region: string;
  vintage: number;
  list_price: number;
  cost: number;
}

export const wineBottles: WineBottle[] = [
  { id: "wb-1", name: "Caymus Cabernet Sauvignon", region: "Napa Valley", vintage: 2021, list_price: 165, cost: 58 },
  { id: "wb-2", name: "Rombauer Chardonnay", region: "Carneros", vintage: 2022, list_price: 110, cost: 38 },
  { id: "wb-3", name: "Sancerre, Pascal Cotat", region: "Loire", vintage: 2022, list_price: 195, cost: 72 },
  { id: "wb-4", name: "Domaine Tempier Bandol", region: "Provence", vintage: 2021, list_price: 175, cost: 60 },
  { id: "wb-5", name: "Krug Grande Cuvée", region: "Champagne", vintage: 2018, list_price: 525, cost: 195 },
  { id: "wb-6", name: "Opus One", region: "Napa Valley", vintage: 2019, list_price: 695, cost: 285 },
  { id: "wb-7", name: "Silver Oak Alexander Valley", region: "Sonoma", vintage: 2020, list_price: 245, cost: 92 },
  { id: "wb-8", name: "Sassicaia", region: "Bolgheri", vintage: 2020, list_price: 525, cost: 215 },
  { id: "wb-9", name: "Cloudy Bay Sauvignon Blanc", region: "Marlborough", vintage: 2023, list_price: 85, cost: 28 },
  { id: "wb-10", name: "Whitehall Lane Cab", region: "Napa Valley", vintage: 2021, list_price: 145, cost: 48 },
  { id: "wb-11", name: "Schramsberg Blanc de Blancs", region: "Napa Valley", vintage: 2020, list_price: 155, cost: 52 },
  { id: "wb-12", name: "Châteauneuf-du-Pape, Vieux Donjon", region: "Rhône", vintage: 2020, list_price: 195, cost: 68 },
  { id: "wb-13", name: "Pio Cesare Barbaresco", region: "Piedmont", vintage: 2019, list_price: 245, cost: 88 },
  { id: "wb-14", name: "Quintessa", region: "Napa Valley", vintage: 2019, list_price: 425, cost: 165 },
  { id: "wb-15", name: "Ridge Lytton Springs", region: "Sonoma", vintage: 2021, list_price: 155, cost: 52 },
  { id: "wb-16", name: "Bond Pluribus", region: "Napa Valley", vintage: 2018, list_price: 985, cost: 425 },
  { id: "wb-17", name: "Albariño, Mar de Frades", region: "Rías Baixas", vintage: 2023, list_price: 85, cost: 26 },
  { id: "wb-18", name: "Cakebread Chardonnay", region: "Napa Valley", vintage: 2022, list_price: 165, cost: 58 },
  { id: "wb-19", name: "Brunello di Montalcino, Tenuta Caparzo", region: "Tuscany", vintage: 2019, list_price: 245, cost: 88 },
  { id: "wb-20", name: "Domaine Leflaive Bourgogne Blanc", region: "Burgundy", vintage: 2021, list_price: 175, cost: 62 },
];

// Pre-aggregate wine sales: monthly bottle count per wine.
export interface WineMonthSale {
  yearMonth: string; // "2026-04"
  bottle_id: string;
  bottles_sold: number;
  revenue: number;
}

const WINE_WEIGHT: Record<string, number> = {
  "wb-1": 2.4, "wb-2": 2.0, "wb-3": 1.1, "wb-4": 0.9, "wb-5": 0.5,
  "wb-6": 0.3, "wb-7": 1.6, "wb-8": 0.45, "wb-9": 1.8, "wb-10": 1.4,
  "wb-11": 1.0, "wb-12": 0.65, "wb-13": 0.6, "wb-14": 0.5, "wb-15": 1.2,
  "wb-16": 0.12, "wb-17": 1.5, "wb-18": 1.7, "wb-19": 0.7, "wb-20": 0.55,
};

export const wineSales: WineMonthSale[] = (() => {
  // 12 months of activity. Compute monthly aggregates from daily metrics.
  const byMonth = new Map<string, DayMetrics[]>();
  for (const d of dailyMetrics) {
    const key = d.date.slice(0, 7);
    if (!byMonth.has(key)) byMonth.set(key, []);
    byMonth.get(key)!.push(d);
  }
  const out: WineMonthSale[] = [];
  for (const [ym, days] of Array.from(byMonth.entries())) {
    const monthlyBev = days.reduce((s, d) => s + d.bev_revenue, 0);
    // Bottles roughly 22% of beverage revenue / avg bottle 195 list
    const totalBottles = Math.round((monthlyBev * 0.22) / 195);
    const totalW = Object.values(WINE_WEIGHT).reduce((a, b) => a + b, 0);
    let allocated = 0;
    wineBottles.forEach((wb, idx) => {
      const seed = hashSeed("wine", ym, wb.id);
      const w = WINE_WEIGHT[wb.id] / totalW;
      const noise = 0.7 + rng(seed)() * 0.6;
      const share = idx === wineBottles.length - 1
        ? Math.max(0, totalBottles - allocated)
        : Math.round(totalBottles * w * noise);
      allocated += share;
      if (share > 0) {
        out.push({
          yearMonth: ym,
          bottle_id: wb.id,
          bottles_sold: share,
          revenue: share * wb.list_price,
        });
      }
    });
  }
  return out;
})();

// ----- Events -----
export interface EventRecord {
  id: string;
  date: string;
  name: string;
  type: "wine_dinner" | "private_dining" | "buyout" | "tasting" | "holiday";
  covers_booked: number;
  covers_shown: number;
  revenue: number;
  food_cost: number;
  status: "completed" | "upcoming" | "canceled";
}

const EVENT_TEMPLATES: Array<{
  type: EventRecord["type"];
  name: string;
  size: [number, number];
  pricePerCover: [number, number];
  fcPct: [number, number];
}> = [
  { type: "wine_dinner", name: "Bordeaux dinner", size: [40, 60], pricePerCover: [285, 325], fcPct: [0.34, 0.4] },
  { type: "wine_dinner", name: "Brunello dinner", size: [36, 52], pricePerCover: [275, 315], fcPct: [0.34, 0.4] },
  { type: "wine_dinner", name: "Burgundy dinner", size: [30, 48], pricePerCover: [340, 385], fcPct: [0.32, 0.38] },
  { type: "wine_dinner", name: "Champagne tasting", size: [40, 60], pricePerCover: [195, 235], fcPct: [0.3, 0.36] },
  { type: "private_dining", name: "Private dining room", size: [16, 28], pricePerCover: [165, 240], fcPct: [0.3, 0.36] },
  { type: "buyout", name: "Full restaurant buyout", size: [120, 160], pricePerCover: [195, 285], fcPct: [0.3, 0.36] },
  { type: "tasting", name: "Whiskey tasting", size: [24, 36], pricePerCover: [145, 175], fcPct: [0.22, 0.28] },
  { type: "holiday", name: "Valentine's prix fixe", size: [180, 220], pricePerCover: [225, 265], fcPct: [0.3, 0.36] },
  { type: "holiday", name: "Mother's Day brunch", size: [200, 260], pricePerCover: [125, 165], fcPct: [0.28, 0.34] },
  { type: "holiday", name: "New Year's Eve service", size: [180, 230], pricePerCover: [325, 395], fcPct: [0.3, 0.36] },
];

function pick<T>(arr: T[], seed: number): T {
  return arr[Math.floor(rng(seed)() * arr.length)];
}

export const events: EventRecord[] = (() => {
  const out: EventRecord[] = [];
  const total = daysBetween(OPEN_DATE, TODAY);
  // Roughly 40 events across 12 months. Cluster on weekends.
  let id = 1;
  for (let i = 0; i < total + 14; i++) {
    const date = addDays(OPEN_DATE, i);
    const seed = hashSeed("event", date);
    const { weekday, month } = parseISO(date);
    const isWeekend = weekday >= 5 || weekday === 0;
    const winterBoost = MONTH_MULT[month] ?? 1;
    const prob = (isWeekend ? 0.18 : 0.04) * (winterBoost / 1.1);
    if (rng(seed)() < prob) {
      const tpl = pick(EVENT_TEMPLATES, seed + 3);
      const covers_booked = Math.round(
        tpl.size[0] + rng(seed + 5)() * (tpl.size[1] - tpl.size[0]),
      );
      const showRate = 0.86 + rng(seed + 7)() * 0.12;
      const covers_shown = Math.round(covers_booked * showRate);
      const price = tpl.pricePerCover[0] + rng(seed + 9)() * (tpl.pricePerCover[1] - tpl.pricePerCover[0]);
      const revenue = Math.round(covers_shown * price);
      const fcPct = tpl.fcPct[0] + rng(seed + 11)() * (tpl.fcPct[1] - tpl.fcPct[0]);
      const food_cost = Math.round(revenue * fcPct);
      const status: EventRecord["status"] = daysBetween(date, TODAY) >= 0 ? "completed" : "upcoming";
      out.push({
        id: `ev-${id++}`,
        date,
        name: tpl.name,
        type: tpl.type,
        covers_booked,
        covers_shown: status === "upcoming" ? 0 : covers_shown,
        revenue: status === "upcoming" ? 0 : revenue,
        food_cost: status === "upcoming" ? 0 : food_cost,
        status,
      });
    }
  }
  return out;
})();

// ----- Helpers for the views -----
export function metricsInRange(startDate: string, endDate: string): DayMetrics[] {
  return dailyMetrics.filter((d) => d.date >= startDate && d.date <= endDate);
}

export function rangeDates(period: "7d" | "30d" | "90d" | "ytd" | "all"): {
  start: string;
  end: string;
} {
  const end = TODAY;
  if (period === "all") return { start: OPEN_DATE, end };
  if (period === "ytd") {
    return { start: `${TODAY.slice(0, 4)}-01-01`, end };
  }
  const days = period === "7d" ? 7 : period === "30d" ? 30 : 90;
  return { start: addDays(TODAY, -days + 1), end };
}

export function sum<T>(arr: T[], pick: (x: T) => number): number {
  return arr.reduce((a, x) => a + pick(x), 0);
}

export function formatMoney(n: number, opts: { compact?: boolean } = {}): string {
  if (opts.compact && Math.abs(n) >= 1000) {
    if (Math.abs(n) >= 1_000_000)
      return `$${(n / 1_000_000).toFixed(2)}M`;
    return `$${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k`;
  }
  return `$${Math.round(n).toLocaleString("en-US")}`;
}

export function formatPct(n: number, digits = 1): string {
  return `${(n * 100).toFixed(digits)}%`;
}

export function changePct(current: number, prior: number): number | null {
  if (prior === 0) return null;
  return (current - prior) / prior;
}

export function formatChangePct(n: number | null): string {
  if (n === null) return "—";
  const sign = n > 0 ? "+" : "";
  return `${sign}${(n * 100).toFixed(1)}%`;
}
