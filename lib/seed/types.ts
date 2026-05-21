export type UnitType =
  | "lb"
  | "oz"
  | "each"
  | "bottle"
  | "case"
  | "gal"
  | "qt"
  | "l"
  | "ml"
  | "kg"
  | "g";

export type MenuItem = {
  name: string;
  components?: string[];
  price?: string;
};

export type MenuSection = {
  name: string;
  items: MenuItem[];
};

export type Menu = {
  service: "Dinner" | "Lunch" | "Brunch" | "Happy Hour" | "All Day";
  sections: MenuSection[];
};

export type InventoryItem = {
  name: string;
  unit: UnitType;
  par?: number;
  category?: string;
  notes?: string;
  // v2 scaffolding
  lastCounted?: number;
  unitCost?: number;
  requiresDualCount?: boolean;
};

export type Station = {
  name: string;
  sortOrder: number;
  items: InventoryItem[];
};

export type RestaurantSeed = {
  slug: string;
  menus: Menu[];
  stations: Station[];
};
