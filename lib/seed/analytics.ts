import { RESTAURANTS, type RestaurantSlug } from "../restaurants";

/* ─────────── Sales & Revenue ─────────── */

export type DailySales = {
  date: string;
  gross: number;
  comps: number;
  voids: number;
  covers: number;
  avgCheck: number;
};

export type ItemSold = {
  name: string;
  category: string;
  units: number;
  revenue: number;
  cogs: number; // ~estimated
};

export type ServerScore = {
  name: string;
  shifts: number;
  covers: number;
  sales: number;
  avgCheck: number;
  upsellRate: number; // % of checks with a dessert/upgrade
};

export type DaypartSales = {
  daypart: "Lunch" | "Happy Hour" | "Dinner" | "Late Night" | "All Day";
  gross: number;
  covers: number;
};

function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function rnd(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const DAILY_BASE: Record<RestaurantSlug, number> = {
  miami: 28000,
  "fort-lauderdale": 24000,
  "ds-sports": 12000,
  "la-sponda": 0, // coming soon
};

const AVG_CHECK_BASE: Record<RestaurantSlug, number> = {
  miami: 185,
  "fort-lauderdale": 145,
  "ds-sports": 58,
  "la-sponda": 0,
};

const DAY_OF_WEEK_FACTOR = [0.72, 0.78, 0.85, 0.95, 1.18, 1.42, 1.32]; // Sun-Sat

// Seasonal multiplier per month (S Florida — strong winter season, soft summer)
const MONTH_FACTOR_MIAMI_FTL = [
  1.20, // Jan
  1.22, // Feb
  1.28, // Mar — peak season
  1.18, // Apr
  1.02, // May
  0.86, // Jun
  0.78, // Jul
  0.75, // Aug
  0.82, // Sep
  0.95, // Oct
  1.10, // Nov
  1.30, // Dec
];

// Sports bar — less seasonal, sports-schedule driven (NFL Sep-Feb, March Madness, NBA playoffs)
const MONTH_FACTOR_DS = [
  1.18, // Jan — playoffs + Super Bowl
  1.32, // Feb — Super Bowl + start of March Madness
  1.28, // Mar — March Madness
  1.10, // Apr
  0.92, // May
  0.85, // Jun
  0.82, // Jul
  0.94, // Aug — preseason NFL
  1.20, // Sep — NFL starts
  1.18, // Oct
  1.22, // Nov
  1.22, // Dec
];

function monthFactor(slug: RestaurantSlug, month: number): number {
  if (slug === "ds-sports") return MONTH_FACTOR_DS[month];
  return MONTH_FACTOR_MIAMI_FTL[month];
}

// Year-over-year base growth (we're growing as a business)
function yoyGrowthFactor(slug: RestaurantSlug, daysAgo: number): number {
  // 12% YoY growth, applied linearly day-by-day
  const growthPerDay = 0.12 / 365;
  return 1 + growthPerDay * (365 - daysAgo);
}

export function dailySalesFor(slug: RestaurantSlug, days = 30): DailySales[] {
  const base = DAILY_BASE[slug];
  const checkBase = AVG_CHECK_BASE[slug];
  // End date anchor — mock "now" matches relativeTime anchor
  const end = new Date("2026-05-21T00:00:00");
  const out: DailySales[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(d.getDate() - i);
    const dow = d.getDay();
    const month = d.getMonth();
    const seed = hash(`${slug}:${d.toISOString().slice(0, 10)}`);
    const noise = 0.85 + rnd(seed) * 0.3; // ±15%
    const seasonal = monthFactor(slug, month);
    const growth = yoyGrowthFactor(slug, i);
    const gross = Math.round(base * DAY_OF_WEEK_FACTOR[dow] * seasonal * growth * noise);
    const compsRate = 0.015 + rnd(seed + 1) * 0.025;
    const voidsRate = 0.008 + rnd(seed + 2) * 0.012;
    const avgCheck = Math.round(checkBase * (0.95 + rnd(seed + 3) * 0.1));
    const covers = Math.max(1, Math.round(gross / avgCheck));
    out.push({
      date: d.toISOString().slice(0, 10),
      gross,
      comps: Math.round(gross * compsRate),
      voids: Math.round(gross * voidsRate),
      covers,
      avgCheck,
    });
  }
  return out;
}

export function topItemsFor(slug: RestaurantSlug, limit = 10): ItemSold[] {
  const ITEM_LIBRARY: Record<RestaurantSlug, ItemSold[]> = {
    miami: [
      { name: "Margaret River Wagyu Tomahawk (32oz)", category: "Steak", units: 38, revenue: 17480, cogs: 8740 },
      { name: "Demkota Prime Filet Mignon (8oz)", category: "Steak", units: 142, revenue: 16898, cogs: 5680 },
      { name: "Greater Omaha Dry-Aged Cowboy Ribeye", category: "Steak", units: 86, revenue: 14620, cogs: 5160 },
      { name: "Maine Lobster Mac & Cheese", category: "Side", units: 124, revenue: 5208, cogs: 1488 },
      { name: "Wagyu & Pearls", category: "Raw Bar", units: 96, revenue: 3648, cogs: 1056 },
      { name: "Buffalo Mozzarella & Caviar", category: "Appetizer", units: 88, revenue: 3344, cogs: 968 },
      { name: "Lobster Fra Diavolo", category: "Pasta", units: 64, revenue: 5632, cogs: 1664 },
      { name: "Florida Blue Crab Cake", category: "Appetizer", units: 102, revenue: 3978, cogs: 1224 },
      { name: "N25 Ossetra Caviar", category: "Caviar", units: 24, revenue: 5400, cogs: 1920 },
      { name: "Truffled Potato Fonduta", category: "Side", units: 156, revenue: 5304, cogs: 1248 },
    ],
    "fort-lauderdale": [
      { name: "Demkota Prime Filet Mignon (8oz)", category: "Steak", units: 168, revenue: 13104, cogs: 4368 },
      { name: "Stone Axe Wagyu Tomahawk", category: "Steak", units: 22, revenue: 9900, cogs: 5060 },
      { name: "Creekstone Dry-Aged Prime Cowboy Ribeye", category: "Steak", units: 64, revenue: 9920, cogs: 3456 },
      { name: "Maine Lobster Mac & Cheese", category: "Side", units: 142, revenue: 5964, cogs: 1704 },
      { name: "Florida Blue Crab Cake", category: "Appetizer", units: 96, revenue: 3744, cogs: 1152 },
      { name: "Wagyu & Pearls", category: "Appetizer", units: 78, revenue: 2964, cogs: 858 },
      { name: "Key Lime Pie", category: "Dessert", units: 184, revenue: 3680, cogs: 552 },
      { name: "Truffled Potato Fonduta", category: "Side", units: 142, revenue: 4828, cogs: 1136 },
      { name: "Lobster Fra Diavolo", category: "Pasta", units: 38, revenue: 3344, cogs: 988 },
      { name: "Grilled Asparagus", category: "Side", units: 198, revenue: 3762, cogs: 792 },
    ],
    "ds-sports": [
      { name: "Daniel's Double Patty Smash Burger", category: "Burger", units: 312, revenue: 7488, cogs: 1872 },
      { name: "Chicken Wings (6pc)", category: "Wings", units: 286, revenue: 5148, cogs: 1430 },
      { name: "D's French Dip Steak Sandwich", category: "Sandwich", units: 198, revenue: 4554, cogs: 1386 },
      { name: "Rosemary French Fries", category: "Side", units: 384, revenue: 3072, cogs: 614 },
      { name: "Heritage Burger", category: "Burger", units: 142, revenue: 3408, cogs: 824 },
      { name: "Cacio e Pepe Tater Tots", category: "Side", units: 226, revenue: 2486, cogs: 498 },
      { name: "Wagyu Empanadas", category: "Starter", units: 178, revenue: 2492, cogs: 712 },
      { name: "Chicken Parm", category: "Entrée", units: 96, revenue: 2496, cogs: 624 },
      { name: "Spinach Artichoke Dip", category: "Starter", units: 168, revenue: 2016, cogs: 504 },
      { name: "Brownie Sundae", category: "Dessert", units: 132, revenue: 1716, cogs: 343 },
    ],
    "la-sponda": [],
  };
  return ITEM_LIBRARY[slug].slice(0, limit);
}

export function daypartFor(slug: RestaurantSlug): DaypartSales[] {
  const baseDinner: Record<RestaurantSlug, DaypartSales[]> = {
    miami: [
      { daypart: "Happy Hour", gross: 18420, covers: 198 },
      { daypart: "Dinner", gross: 134680, covers: 942 },
      { daypart: "Late Night", gross: 22340, covers: 184 },
    ],
    "fort-lauderdale": [
      { daypart: "Lunch", gross: 12240, covers: 168 },
      { daypart: "Happy Hour", gross: 14820, covers: 192 },
      { daypart: "Dinner", gross: 108450, covers: 832 },
      { daypart: "Late Night", gross: 8920, covers: 78 },
    ],
    "ds-sports": [
      { daypart: "Lunch", gross: 18640, covers: 412 },
      { daypart: "Happy Hour", gross: 22440, covers: 568 },
      { daypart: "Dinner", gross: 28680, covers: 524 },
      { daypart: "Late Night", gross: 12440, covers: 268 },
    ],
    "la-sponda": [],
  };
  return baseDinner[slug];
}

export function serverScoresFor(slug: RestaurantSlug): ServerScore[] {
  const lib: Record<RestaurantSlug, ServerScore[]> = {
    miami: [
      { name: "Mateo C.", shifts: 6, covers: 198, sales: 38420, avgCheck: 194, upsellRate: 78 },
      { name: "Camila R.", shifts: 5, covers: 168, sales: 31240, avgCheck: 186, upsellRate: 72 },
      { name: "Diego H.", shifts: 6, covers: 224, sales: 39820, avgCheck: 178, upsellRate: 68 },
      { name: "Sofia M.", shifts: 4, covers: 142, sales: 25420, avgCheck: 179, upsellRate: 64 },
      { name: "Tomás L.", shifts: 5, covers: 178, sales: 28920, avgCheck: 162, upsellRate: 52 },
    ],
    "fort-lauderdale": [
      { name: "Riley T.", shifts: 6, covers: 218, sales: 32820, avgCheck: 151, upsellRate: 71 },
      { name: "Marco D.", shifts: 5, covers: 184, sales: 26920, avgCheck: 146, upsellRate: 68 },
      { name: "Olivia P.", shifts: 6, covers: 226, sales: 31460, avgCheck: 139, upsellRate: 64 },
      { name: "Ethan B.", shifts: 4, covers: 142, sales: 19840, avgCheck: 140, upsellRate: 58 },
      { name: "Hannah G.", shifts: 5, covers: 198, sales: 24960, avgCheck: 126, upsellRate: 48 },
    ],
    "ds-sports": [
      { name: "Jordan T.", shifts: 6, covers: 384, sales: 21680, avgCheck: 56, upsellRate: 62 },
      { name: "Drew M.", shifts: 5, covers: 326, sales: 18420, avgCheck: 57, upsellRate: 58 },
      { name: "Tasha K.", shifts: 6, covers: 412, sales: 22340, avgCheck: 54, upsellRate: 54 },
      { name: "Reggie F.", shifts: 4, covers: 254, sales: 13620, avgCheck: 54, upsellRate: 51 },
      { name: "Quinn A.", shifts: 5, covers: 298, sales: 16480, avgCheck: 55, upsellRate: 49 },
    ],
    "la-sponda": [],
  };
  return lib[slug];
}

/* ─────────── Labor ─────────── */

export type LaborDay = {
  date: string;
  hours: number;
  cost: number;
  sales: number;
};

export type RoleBreakdown = {
  role: "FOH" | "BOH" | "Bar" | "Mgmt";
  hours: number;
  cost: number;
  headcount: number;
};

const LABOR_TARGET: Record<RestaurantSlug, number> = {
  miami: 0.26, // labor % of sales
  "fort-lauderdale": 0.28,
  "ds-sports": 0.32,
  "la-sponda": 0,
};

export function laborDaysFor(slug: RestaurantSlug, days = 30): LaborDay[] {
  const sales = dailySalesFor(slug, days);
  const target = LABOR_TARGET[slug];
  return sales.map((d, i) => {
    const seed = hash(`${slug}-labor:${d.date}`);
    const noise = 0.92 + rnd(seed) * 0.18; // 0.92–1.10
    const cost = Math.round(d.gross * target * noise);
    const hourlyAvg = 28; // blended
    const hours = Math.round(cost / hourlyAvg);
    return { date: d.date, hours, cost, sales: d.gross };
  });
}

export function roleBreakdownFor(slug: RestaurantSlug): RoleBreakdown[] {
  const lib: Record<RestaurantSlug, RoleBreakdown[]> = {
    miami: [
      { role: "FOH", hours: 1124, cost: 32420, headcount: 22 },
      { role: "BOH", hours: 1542, cost: 38560, headcount: 28 },
      { role: "Bar", hours: 624, cost: 19840, headcount: 9 },
      { role: "Mgmt", hours: 412, cost: 16480, headcount: 4 },
    ],
    "fort-lauderdale": [
      { role: "FOH", hours: 1042, cost: 28640, headcount: 18 },
      { role: "BOH", hours: 1320, cost: 32820, headcount: 24 },
      { role: "Bar", hours: 542, cost: 16240, headcount: 7 },
      { role: "Mgmt", hours: 384, cost: 14920, headcount: 3 },
    ],
    "ds-sports": [
      { role: "FOH", hours: 824, cost: 19840, headcount: 12 },
      { role: "BOH", hours: 968, cost: 22340, headcount: 14 },
      { role: "Bar", hours: 642, cost: 17420, headcount: 8 },
      { role: "Mgmt", hours: 268, cost: 9420, headcount: 2 },
    ],
    "la-sponda": [],
  };
  return lib[slug];
}

/* ─────────── Food Cost ─────────── */

export type FoodCostByCategory = {
  category: string;
  spend: number;
  pctOfSales: number;
};

export type VendorSpend = {
  vendor: string;
  spend: number;
  invoices: number;
  trend: number[]; // last 4 weeks
};

export function foodCostByCategoryFor(slug: RestaurantSlug): FoodCostByCategory[] {
  const lib: Record<RestaurantSlug, FoodCostByCategory[]> = {
    miami: [
      { category: "Beef & Lamb", spend: 142680, pctOfSales: 11.8 },
      { category: "Seafood & Caviar", spend: 88420, pctOfSales: 7.3 },
      { category: "Dairy & Cheese", spend: 24820, pctOfSales: 2.1 },
      { category: "Produce", spend: 18920, pctOfSales: 1.6 },
      { category: "Pasta & Dry Goods", spend: 11420, pctOfSales: 0.9 },
      { category: "Bar & Wine", spend: 96240, pctOfSales: 8.0 },
    ],
    "fort-lauderdale": [
      { category: "Beef & Lamb", spend: 121640, pctOfSales: 12.4 },
      { category: "Seafood", spend: 64820, pctOfSales: 6.6 },
      { category: "Dairy & Cheese", spend: 19420, pctOfSales: 2.0 },
      { category: "Produce", spend: 14820, pctOfSales: 1.5 },
      { category: "Pasta & Dry Goods", spend: 9220, pctOfSales: 0.9 },
      { category: "Bar & Wine", spend: 78420, pctOfSales: 8.0 },
    ],
    "ds-sports": [
      { category: "Beef (burgers/steak)", spend: 38420, pctOfSales: 14.2 },
      { category: "Poultry & Wings", spend: 21420, pctOfSales: 7.9 },
      { category: "Bread & Buns", spend: 6420, pctOfSales: 2.4 },
      { category: "Produce", spend: 8420, pctOfSales: 3.1 },
      { category: "Fryer Oil + Frozen", spend: 9820, pctOfSales: 3.6 },
      { category: "Bar (beer/liquor)", spend: 42320, pctOfSales: 15.7 },
    ],
    "la-sponda": [],
  };
  return lib[slug];
}

export function vendorSpendFor(slug: RestaurantSlug): VendorSpend[] {
  const lib: Record<RestaurantSlug, VendorSpend[]> = {
    miami: [
      { vendor: "Sysco", spend: 64820, invoices: 24, trend: [14800, 16240, 18420, 15360] },
      { vendor: "Beacon Fisheries", spend: 32420, invoices: 12, trend: [7820, 8240, 8920, 7440] },
      { vendor: "Suwannee River Wagyu", spend: 28420, invoices: 8, trend: [6820, 7120, 7860, 6620] },
      { vendor: "Sunshine Provisions", spend: 21240, invoices: 14, trend: [5240, 5420, 5840, 4740] },
      { vendor: "Swank Farms", spend: 12420, invoices: 10, trend: [2820, 3240, 3460, 2900] },
      { vendor: "Gratitude Farms", spend: 9820, invoices: 8, trend: [2240, 2540, 2720, 2320] },
    ],
    "fort-lauderdale": [
      { vendor: "Sysco", spend: 58420, invoices: 22, trend: [13820, 14820, 16240, 13540] },
      { vendor: "Quincey Cattle", spend: 31420, invoices: 10, trend: [7420, 8120, 8420, 7460] },
      { vendor: "Beacon Fisheries", spend: 26840, invoices: 11, trend: [6240, 6820, 7240, 6540] },
      { vendor: "Loxahatchee Farms", spend: 14820, invoices: 12, trend: [3420, 3720, 3920, 3760] },
      { vendor: "Creekstone Farms", spend: 22420, invoices: 8, trend: [5240, 5640, 5940, 5600] },
    ],
    "ds-sports": [
      { vendor: "Sysco", spend: 31420, invoices: 18, trend: [7420, 7820, 8240, 7940] },
      { vendor: "Snake River Farms", spend: 8420, invoices: 6, trend: [1940, 2120, 2240, 2120] },
      { vendor: "Florida Grassfed Co.", spend: 12420, invoices: 9, trend: [2820, 3120, 3340, 3140] },
      { vendor: "Gulfstream Brewing", spend: 14820, invoices: 12, trend: [3420, 3720, 3940, 3740] },
      { vendor: "Sunshine Provisions", spend: 9820, invoices: 8, trend: [2240, 2440, 2640, 2500] },
    ],
    "la-sponda": [],
  };
  return lib[slug];
}

export type ItemVarianceTrend = {
  date: string;
  variancePct: number;
};

export function varianceTrendFor(slug: RestaurantSlug, days = 30): ItemVarianceTrend[] {
  const out: ItemVarianceTrend[] = [];
  const end = new Date("2026-05-21T00:00:00");
  const baseline =
    slug === "miami" ? 3.6 : slug === "fort-lauderdale" ? 2.0 : 5.2;
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(d.getDate() - i);
    const seed = hash(`${slug}-variance:${d.toISOString().slice(0, 10)}`);
    const noise = (rnd(seed) - 0.5) * 1.6; // ±0.8
    const trend = (-i / days) * 0.5; // gentle downward drift
    out.push({
      date: d.toISOString().slice(0, 10),
      variancePct: +Math.max(0.5, baseline + noise + trend).toFixed(1),
    });
  }
  return out;
}

/* ─────────── Per-item count history ─────────── */

export type CountPoint = {
  date: string;
  quantity: number;
  par: number;
  daysSinceLast: number;
};

/**
 * Mock per-item count history. Generates a count entry every ~2-7 days
 * with realistic depletion + restocking pattern.
 */
export function itemHistoryFor(
  slug: RestaurantSlug,
  itemName: string,
  par: number,
  days = 180,
): CountPoint[] {
  const out: CountPoint[] = [];
  const end = new Date("2026-05-21T00:00:00");
  const baseSeed = hash(`${slug}:${itemName}`);
  let currentDay = days;
  let lastQty = par * (0.9 + rnd(baseSeed) * 0.2);

  while (currentDay > 0) {
    // Cycle: count happens every 2-7 days
    const cycleSeed = hash(`${slug}:${itemName}:${currentDay}`);
    const stride = 2 + Math.floor(rnd(cycleSeed) * 5);
    currentDay -= stride;
    if (currentDay < 0) break;

    const d = new Date(end);
    d.setDate(d.getDate() - currentDay);
    const month = d.getMonth();

    // Depletion rate scales with seasonal demand
    const seasonal = monthFactor(slug, month);
    const usage = par * (0.18 + rnd(cycleSeed + 1) * 0.18) * seasonal * stride / 4;
    let next = lastQty - usage;
    // 30% chance of a restock
    if (next < par * 0.6 || rnd(cycleSeed + 2) < 0.3) {
      next = par * (0.95 + rnd(cycleSeed + 3) * 0.25); // restocked
    }
    next = Math.max(0, +next.toFixed(1));
    out.push({
      date: d.toISOString().slice(0, 10),
      quantity: next,
      par,
      daysSinceLast: stride,
    });
    lastQty = next;
  }
  return out;
}

/* ─────────── Forecasting ─────────── */

export type Forecast = {
  next7d: number;
  next30d: number;
  trend: "up" | "down" | "flat";
  weeklyAvg: number;
  monthlyAvg: number;
};

/**
 * Simple linear projection from the trailing series.
 * Returns the projected total for the next 7d and 30d.
 */
export function forecastFromSeries(values: number[]): Forecast {
  if (values.length < 14) {
    const avg = values.reduce((s, v) => s + v, 0) / Math.max(1, values.length);
    return {
      next7d: avg * 7,
      next30d: avg * 30,
      trend: "flat",
      weeklyAvg: avg * 7,
      monthlyAvg: avg * 30,
    };
  }
  // Linear regression on the last 60 days (or all available)
  const window = values.slice(-Math.min(60, values.length));
  const n = window.length;
  const xs = Array.from({ length: n }, (_, i) => i);
  const ys = window;
  const sumX = xs.reduce((s, x) => s + x, 0);
  const sumY = ys.reduce((s, y) => s + y, 0);
  const sumXY = xs.reduce((s, x, i) => s + x * ys[i], 0);
  const sumX2 = xs.reduce((s, x) => s + x * x, 0);
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  let next7Total = 0;
  let next30Total = 0;
  for (let k = 1; k <= 30; k++) {
    const projected = Math.max(0, intercept + slope * (n - 1 + k));
    if (k <= 7) next7Total += projected;
    next30Total += projected;
  }

  const weeklyAvg = window.slice(-7).reduce((s, v) => s + v, 0);
  const monthlyAvg = window.slice(-30).reduce((s, v) => s + v, 0);
  const trend: "up" | "down" | "flat" =
    Math.abs(slope) < (intercept * 0.001) ? "flat" : slope > 0 ? "up" : "down";

  return {
    next7d: Math.round(next7Total),
    next30d: Math.round(next30Total),
    trend,
    weeklyAvg: Math.round(weeklyAvg),
    monthlyAvg: Math.round(monthlyAvg),
  };
}

/* ─────────── Range helpers ─────────── */

export type TimeRange = "7d" | "30d" | "90d" | "12mo";

export function rangeDays(range: TimeRange): number {
  return range === "7d" ? 7 : range === "30d" ? 30 : range === "90d" ? 90 : 365;
}

export function rangeLabel(range: TimeRange): string {
  return range === "7d" ? "Last 7 days" : range === "30d" ? "Last 30 days" : range === "90d" ? "Last 90 days" : "Last 12 months";
}

/**
 * Build period-over-period comparisons: current period total vs same prior period
 * and vs same period one year ago.
 */
export type PeriodComparison = {
  current: number;
  priorPeriod: number;
  yoy: number;
  vsPriorPct: number;
  vsYoyPct: number;
};

export function comparePeriods(
  series: Array<{ date: string; value: number }>,
  range: TimeRange,
): PeriodComparison {
  const days = rangeDays(range);
  if (series.length < days) {
    const total = series.reduce((s, x) => s + x.value, 0);
    return {
      current: total,
      priorPeriod: 0,
      yoy: 0,
      vsPriorPct: 0,
      vsYoyPct: 0,
    };
  }
  const current = series.slice(-days);
  const prior = series.slice(-days * 2, -days);
  const yoyStart = series.length - 365 - days / 2;
  const yoy =
    yoyStart > 0
      ? series.slice(yoyStart, yoyStart + days)
      : [];
  const sum = (arr: Array<{ value: number }>) => arr.reduce((s, x) => s + x.value, 0);
  const cur = sum(current);
  const pri = sum(prior);
  const yo = sum(yoy);
  return {
    current: cur,
    priorPeriod: pri,
    yoy: yo,
    vsPriorPct: pri > 0 ? ((cur - pri) / pri) * 100 : 0,
    vsYoyPct: yo > 0 ? ((cur - yo) / yo) * 100 : 0,
  };
}
