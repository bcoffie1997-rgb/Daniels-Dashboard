// Mirrors the shape of the locked schema (schema/0001_initial_schema.sql) so
// the demo shell composes cleanly with the real database layer later.

export type Role = "counter" | "manager" | "admin";

export type SessionStatus =
  | "in_progress"
  | "submitted"
  | "approved"
  | "rejected";

export type Unit =
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

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: Role;
  active: boolean;
  created_at: string;
}

export interface Station {
  id: string;
  name: string;
  sort_order: number;
  active: boolean;
}

export interface Item {
  id: string;
  station_id: string;
  name: string;
  unit: Unit;
  sort_order: number;
  par_level: number | null;
  product_id?: string | null;
  active: boolean;
}

// ---- Platform (xtraCHEF parity) ----

export type InvoiceStatus =
  | "draft"
  | "processing"
  | "pending_review"
  | "approved"
  | "rejected";

export type OrderStatus = "draft" | "submitted" | "received" | "cancelled";

export interface Vendor {
  id: string;
  name: string;
  account_number: string | null;
  contact_email: string | null;
  active: boolean;
}

export interface Product {
  id: string;
  name: string;
  category: string | null;
  default_unit: Unit;
  last_unit_cost: number | null;
  gl_code: string | null;
  active: boolean;
}

export interface ProductVendor {
  id: string;
  product_id: string;
  vendor_id: string;
  vendor_sku: string | null;
  pack_size: number;
  pack_unit: Unit;
  last_unit_cost: number | null;
  is_preferred: boolean;
}

export interface InvoiceLine {
  id: string;
  invoice_id: string;
  product_id: string | null;
  description: string;
  quantity: number;
  unit: Unit | null;
  unit_price: number;
  line_total: number;
}

export interface Invoice {
  id: string;
  vendor_id: string;
  invoice_number: string | null;
  invoice_date: string;
  status: InvoiceStatus;
  subtotal: number | null;
  tax: number | null;
  total: number;
  rejection_reason: string | null;
  submitted_by: string | null;
  approved_by: string | null;
  approved_at: string | null;
}

export interface MenuItem {
  id: string;
  toast_guid: string;
  name: string;
  menu_price: number;
  category: string | null;
  active: boolean;
  synced_at: string | null;
}

export interface RecipeLine {
  id: string;
  recipe_id: string;
  product_id: string;
  quantity: number;
  unit: Unit;
}

export interface Recipe {
  id: string;
  menu_item_id: string | null;
  name: string;
  yield_amount: number;
  yield_unit: string;
  plate_cost: number | null;
  active: boolean;
}

export interface OrderLine {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit: Unit;
  suggested_qty: number | null;
}

export interface Order {
  id: string;
  vendor_id: string;
  status: OrderStatus;
  created_by: string;
  submitted_at: string | null;
  notes: string | null;
}

export interface ToastSyncStatus {
  last_sync_at: string | null;
  menu_items_count: number;
  sales_days_synced: number;
  connected: boolean;
}

export interface AvtVariance {
  product_id: string;
  product_name: string;
  theoretical_qty: number;
  actual_qty: number;
  variance_qty: number;
  variance_pct: number;
  unit: Unit;
  dollar_impact: number;
}

export interface CountEntry {
  id: string;
  session_id: string;
  item_id: string;
  quantity: number;
  previous_quantity: number | null;
  variance_pct: number | null;
  entered_at: string;
  reason?: string;
}

export interface CountSession {
  id: string;
  user_id: string;
  station_id: string;
  status: SessionStatus;
  started_at: string;
  submitted_at: string | null;
  approved_at: string | null;
  approved_by: string | null;
  rejection_reason: string | null;
  manager_notes: string | null;
  notes: string | null;
}
