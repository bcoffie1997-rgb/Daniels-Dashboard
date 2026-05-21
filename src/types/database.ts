export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "counter" | "manager" | "admin";
export type SessionStatus =
  | "in_progress"
  | "submitted"
  | "approved"
  | "rejected";
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

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: UserRole;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          role?: UserRole;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          role?: UserRole;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      stations: {
        Row: {
          id: string;
          name: string;
          sort_order: number;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          sort_order?: number;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          sort_order?: number;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      items: {
        Row: {
          id: string;
          station_id: string;
          name: string;
          unit: UnitType;
          sort_order: number;
          par_level: number | null;
          product_id: string | null;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          station_id: string;
          name: string;
          unit: UnitType;
          sort_order?: number;
          par_level?: number | null;
          product_id?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          station_id?: string;
          name?: string;
          unit?: UnitType;
          sort_order?: number;
          par_level?: number | null;
          product_id?: string | null;
          active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      count_sessions: {
        Row: {
          id: string;
          user_id: string;
          station_id: string;
          status: SessionStatus;
          started_at: string;
          submitted_at: string | null;
          approved_at: string | null;
          approved_by: string | null;
          rejection_reason: string | null;
          notes: string | null;
          client_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          station_id: string;
          status?: SessionStatus;
          started_at?: string;
          submitted_at?: string | null;
          approved_at?: string | null;
          approved_by?: string | null;
          rejection_reason?: string | null;
          notes?: string | null;
          client_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          station_id?: string;
          status?: SessionStatus;
          started_at?: string;
          submitted_at?: string | null;
          approved_at?: string | null;
          approved_by?: string | null;
          rejection_reason?: string | null;
          notes?: string | null;
          client_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      count_entries: {
        Row: {
          id: string;
          session_id: string;
          item_id: string;
          quantity: number;
          previous_quantity: number | null;
          variance_pct: number | null;
          entered_at: string;
          device_id: string | null;
        };
        Insert: {
          id?: string;
          session_id: string;
          item_id: string;
          quantity: number;
          previous_quantity?: number | null;
          variance_pct?: number | null;
          entered_at?: string;
          device_id?: string | null;
        };
        Update: {
          id?: string;
          session_id?: string;
          item_id?: string;
          quantity?: number;
          previous_quantity?: number | null;
          variance_pct?: number | null;
          entered_at?: string;
          device_id?: string | null;
        };
        Relationships: [];
      };
      audit_log: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string | null;
          payload: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          payload?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          payload?: Json | null;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      session_status: SessionStatus;
      unit_type: UnitType;
    };
  };
}

export type AppUser = Database["public"]["Tables"]["users"]["Row"];
