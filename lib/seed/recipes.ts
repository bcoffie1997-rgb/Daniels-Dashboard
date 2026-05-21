// Sample recipes — scaffold for the v2 recipe builder.
// Each recipe ties a menu item to a small set of inventory components.

export type RecipeIngredient = {
  itemName: string;
  qty: number;
  unit: string;
  notes?: string;
};

export type Recipe = {
  id: string;
  restaurantSlug: string;
  menuDish: string;
  yieldPortions: number;
  station: string;
  ingredients: RecipeIngredient[];
  laborMinutes?: number;
  notes?: string;
};

export const RECIPES: Recipe[] = [
  // ─────── MIAMI ───────
  {
    id: "miami-lobster-fra-diavolo",
    restaurantSlug: "miami",
    menuDish: "Lobster Fra Diavolo",
    yieldPortions: 1,
    station: "Pasta",
    laborMinutes: 12,
    ingredients: [
      { itemName: "Maine Lobster (1.5 lb)", qty: 1, unit: "each" },
      { itemName: "Monograno Linguine", qty: 0.25, unit: "lb" },
      { itemName: "Cherry Tomatoes", qty: 0.15, unit: "case", notes: "approx. 6oz" },
      { itemName: "GIOIA Hospitality Extra Virgin Olive Oil", qty: 0.06, unit: "l" },
      { itemName: "Calabrian Chili", qty: 0.02, unit: "lb" },
      { itemName: "Basil", qty: 0.02, unit: "lb" },
    ],
    notes: "Plated tableside in the half-shell. 1.5 lb lobster = 8oz tail + 4oz claw meat.",
  },
  {
    id: "miami-wagyu-pearls",
    restaurantSlug: "miami",
    menuDish: "Wagyu & Pearls",
    yieldPortions: 1,
    station: "Cold / Raw Bar",
    laborMinutes: 6,
    ingredients: [
      { itemName: "Arrowhead Wagyu (tartare)", qty: 0.22, unit: "lb", notes: "~3.5oz portion" },
      { itemName: "Kaluga Caviar (service tin)", qty: 0.5, unit: "oz" },
      { itemName: "Sullivan Street Sourdough (par-baked)", qty: 0.05, unit: "case", notes: "2 toast points" },
      { itemName: "Cultured Butter", qty: 0.05, unit: "lb" },
    ],
    notes: "Black garlic aioli batched separately (Sub-recipe).",
  },
  {
    id: "miami-cowboy-ribeye",
    restaurantSlug: "miami",
    menuDish: "Greater Omaha Dry-Aged Cowboy Ribeye (22oz)",
    yieldPortions: 1,
    station: "Grill",
    laborMinutes: 18,
    ingredients: [
      { itemName: "Greater Omaha Dry-Aged Cowboy Ribeye", qty: 1, unit: "each" },
      { itemName: "Cultured Butter", qty: 0.04, unit: "lb" },
      { itemName: "Sea Salt", qty: 0.01, unit: "lb" },
      { itemName: "Rosemary", qty: 0.01, unit: "lb" },
    ],
    notes: "Bone-in. Rest 8 minutes after grill. Service with chimichurri (sub-recipe).",
  },

  // ─────── FORT LAUDERDALE ───────
  {
    id: "ftl-filet-mignon",
    restaurantSlug: "fort-lauderdale",
    menuDish: "Demkota Prime Filet Mignon (8oz)",
    yieldPortions: 1,
    station: "Grill",
    laborMinutes: 14,
    ingredients: [
      { itemName: "Demkota Prime Filet Mignon (8oz)", qty: 1, unit: "each" },
      { itemName: "Cultured Butter", qty: 0.04, unit: "lb" },
      { itemName: "Sea Salt", qty: 0.01, unit: "lb" },
      { itemName: "Garlic", qty: 0.02, unit: "lb" },
    ],
    notes: "Sear hot, rest 5 minutes. Compound butter baste at finish.",
  },
  {
    id: "ftl-crab-cake",
    restaurantSlug: "fort-lauderdale",
    menuDish: "Florida Blue Crab Cake",
    yieldPortions: 1,
    station: "Sauté",
    laborMinutes: 9,
    ingredients: [
      { itemName: "Florida Blue Crab Meat", qty: 0.25, unit: "lb" },
      { itemName: "Eggs", qty: 0.02, unit: "case" },
      { itemName: "All-Purpose Flour", qty: 0.04, unit: "lb" },
      { itemName: "Lemons", qty: 0.02, unit: "case" },
      { itemName: "Crème Fraîche", qty: 0.05, unit: "qt" },
    ],
    notes: "Hand-formed. Pan-sear in cultured butter, 3 min per side.",
  },
  {
    id: "ftl-key-lime-pie",
    restaurantSlug: "fort-lauderdale",
    menuDish: "Key Lime Pie",
    yieldPortions: 8,
    station: "Pastry",
    laborMinutes: 35,
    ingredients: [
      { itemName: "Eggs", qty: 0.06, unit: "case" },
      { itemName: "Sugar", qty: 0.5, unit: "lb" },
      { itemName: "Lemons", qty: 0.1, unit: "case", notes: "stand-in for key limes in BOM" },
      { itemName: "Graham Cracker Crumb", qty: 0.4, unit: "lb" },
      { itemName: "Cultured Butter", qty: 0.25, unit: "lb" },
      { itemName: "Heavy Cream", qty: 0.5, unit: "qt" },
    ],
    notes: "Yields one 9-inch pie, 8 slices.",
  },

  // ─────── D'S SPORTS BAR ───────
  {
    id: "ds-smash-burger",
    restaurantSlug: "ds-sports",
    menuDish: "Daniel's Double Patty Smash Burger",
    yieldPortions: 1,
    station: "Grill",
    laborMinutes: 7,
    ingredients: [
      { itemName: "Florida Grassfed Burger Patties (smash)", qty: 0.5, unit: "lb", notes: "2 × 4oz patties" },
      { itemName: "Brioche Buns", qty: 0.02, unit: "case" },
      { itemName: "American Cheese (smash)", qty: 0.08, unit: "lb" },
      { itemName: "Bacon", qty: 0.1, unit: "lb" },
      { itemName: "Smash Sauce", qty: 0.05, unit: "qt" },
      { itemName: "Pickles", qty: 0.02, unit: "gal" },
    ],
    notes: "Smash thin on flat-top. Cheese melts under steel dome.",
  },
  {
    id: "ds-wings",
    restaurantSlug: "ds-sports",
    menuDish: "Chicken Wings (6pc)",
    yieldPortions: 1,
    station: "Fry",
    laborMinutes: 12,
    ingredients: [
      { itemName: "Chicken Wings", qty: 0.75, unit: "lb" },
      { itemName: "Fryer Oil", qty: 0.05, unit: "gal", notes: "marginal cost only" },
      { itemName: "Buffalo Sauce", qty: 0.08, unit: "qt" },
      { itemName: "Hawthorne Creamery Blue Cheese", qty: 0.05, unit: "lb" },
    ],
    notes: "Brined 24h. Fry 6 min @ 365°F. Toss to order in chosen sauce.",
  },
  {
    id: "ds-french-dip",
    restaurantSlug: "ds-sports",
    menuDish: "D's French Dip Steak Sandwich",
    yieldPortions: 1,
    station: "Sandwich",
    laborMinutes: 9,
    ingredients: [
      { itemName: "French Dip Steak (sliced)", qty: 0.35, unit: "lb" },
      { itemName: "Hoagie Rolls", qty: 0.04, unit: "case" },
      { itemName: "Provolone", qty: 0.08, unit: "lb" },
      { itemName: "Au Jus Base", qty: 0.15, unit: "qt" },
      { itemName: "Yellow Onions", qty: 0.04, unit: "case" },
    ],
    notes: "Onions caramelized for 35 minutes. Au jus served warm in ramekin.",
  },
];

export function recipesFor(slug: string): Recipe[] {
  return RECIPES.filter((r) => r.restaurantSlug === slug);
}

export function recipeById(id: string): Recipe | undefined {
  return RECIPES.find((r) => r.id === id);
}
