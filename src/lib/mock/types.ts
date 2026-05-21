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
  active: boolean;
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
