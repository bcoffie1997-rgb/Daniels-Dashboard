"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

type UnitType = Database["public"]["Enums"]["unit_type"];
type UserRole = Database["public"]["Enums"]["user_role"];

const UNIT_VALUES: UnitType[] = [
  "lb",
  "oz",
  "each",
  "bottle",
  "case",
  "gal",
  "qt",
  "l",
  "ml",
  "kg",
  "g",
];

async function getCurrentUserId() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

async function audit(
  action: string,
  entityType: string,
  entityId: string | null,
  payload?: unknown,
) {
  const userId = await getCurrentUserId();
  if (!userId) return;
  const supabase = await createClient();
  await supabase.from("audit_log").insert({
    user_id: userId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    payload: (payload ?? null) as import("@/types/database").Json,
  });
}

// ============================================================================
// Stations
// ============================================================================

const stationNameSchema = z
  .string()
  .min(1, "Required")
  .max(100, "Must be 100 characters or fewer");

export async function createStation(name: string, sortOrder?: number) {
  const supabase = await createClient();
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, error: "Not authenticated" } as const;

  const parsed = stationNameSchema.safeParse(name);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message } as const;
  }

  const { data, error } = await supabase
    .from("stations")
    .insert({
      name: parsed.data,
      sort_order: sortOrder ?? 0,
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message } as const;
  }

  await audit("station.create", "station", data.id, { name: parsed.data });
  revalidatePath("/admin/stations");
  return { success: true, data } as const;
}

export async function updateStation(id: string, name: string) {
  const supabase = await createClient();
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, error: "Not authenticated" } as const;

  const parsed = stationNameSchema.safeParse(name);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message } as const;
  }

  const { data: before } = await supabase
    .from("stations")
    .select("name")
    .eq("id", id)
    .single();

  const { data, error } = await supabase
    .from("stations")
    .update({ name: parsed.data })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message } as const;
  }

  await audit("station.update", "station", id, {
    before: { name: before?.name },
    after: { name: parsed.data },
  });
  revalidatePath("/admin/stations");
  revalidatePath("/admin/items");
  return { success: true, data } as const;
}

export async function archiveStation(id: string, active: boolean) {
  const supabase = await createClient();
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, error: "Not authenticated" } as const;

  const { data, error } = await supabase
    .from("stations")
    .update({ active })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message } as const;
  }

  await audit("station.archive", "station", id, { active });
  revalidatePath("/admin/stations");
  revalidatePath("/admin/items");
  return { success: true, data } as const;
}

export async function reorderStations(orderedIds: string[]) {
  const supabase = await createClient();
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, error: "Not authenticated" } as const;

  const updates = orderedIds.map((id, idx) => ({
    id,
    sort_order: (idx + 1) * 10,
  }));

  for (const u of updates) {
    const { error } = await supabase
      .from("stations")
      .update({ sort_order: u.sort_order })
      .eq("id", u.id);
    if (error) {
      return { success: false, error: error.message } as const;
    }
  }

  await audit("station.reorder", "station", null, { orderedIds });
  revalidatePath("/admin/stations");
  revalidatePath("/admin/items");
  return { success: true } as const;
}

// ============================================================================
// Items
// ============================================================================

const itemNameSchema = z
  .string()
  .min(1, "Required")
  .max(100, "Must be 100 characters or fewer");
const unitSchema = z.enum(UNIT_VALUES as [UnitType, ...UnitType[]]);

export async function createItem(
  stationId: string,
  name: string,
  unit: string,
  parLevel?: number | null,
  sortOrder?: number,
) {
  const supabase = await createClient();
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, error: "Not authenticated" } as const;

  const nameParsed = itemNameSchema.safeParse(name);
  if (!nameParsed.success) {
    return { success: false, error: nameParsed.error.issues[0].message } as const;
  }
  const unitParsed = unitSchema.safeParse(unit);
  if (!unitParsed.success) {
    return { success: false, error: "Select a unit" } as const;
  }

  const { data, error } = await supabase
    .from("items")
    .insert({
      station_id: stationId,
      name: nameParsed.data,
      unit: unitParsed.data,
      par_level: parLevel ?? null,
      sort_order: sortOrder ?? 0,
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message } as const;
  }

  await audit("item.create", "item", data.id, {
    name: nameParsed.data,
    station_id: stationId,
  });
  revalidatePath("/admin/items");
  return { success: true, data } as const;
}

export async function updateItem(
  id: string,
  updates: {
    name?: string;
    unit?: string;
    par_level?: number | null;
    station_id?: string;
  },
) {
  const supabase = await createClient();
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, error: "Not authenticated" } as const;

  const toUpdate: { name?: string; unit?: UnitType; par_level?: number | null; station_id?: string } = {};

  if (updates.name !== undefined) {
    const parsed = itemNameSchema.safeParse(updates.name);
    if (!parsed.success) {
      return { success: false, error: parsed.error.issues[0].message } as const;
    }
    toUpdate.name = parsed.data;
  }
  if (updates.unit !== undefined) {
    const parsed = unitSchema.safeParse(updates.unit);
    if (!parsed.success) {
      return { success: false, error: "Select a unit" } as const;
    }
    toUpdate.unit = parsed.data;
  }
  if (updates.par_level !== undefined) {
    toUpdate.par_level = updates.par_level;
  }
  if (updates.station_id !== undefined) {
    toUpdate.station_id = updates.station_id;
  }

  const { data: before } = await supabase
    .from("items")
    .select("name, unit, par_level, station_id")
    .eq("id", id)
    .single();

  const { data, error } = await supabase
    .from("items")
    .update(toUpdate)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message } as const;
  }

  await audit("item.update", "item", id, { before, after: toUpdate });
  revalidatePath("/admin/items");
  return { success: true, data } as const;
}

export async function archiveItem(id: string, active: boolean) {
  const supabase = await createClient();
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, error: "Not authenticated" } as const;

  const { data, error } = await supabase
    .from("items")
    .update({ active })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message } as const;
  }

  await audit("item.archive", "item", id, { active });
  revalidatePath("/admin/items");
  return { success: true, data } as const;
}

export async function reorderItems(stationId: string, orderedIds: string[]) {
  const supabase = await createClient();
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, error: "Not authenticated" } as const;

  const updates = orderedIds.map((id, idx) => ({
    id,
    sort_order: (idx + 1) * 10,
  }));

  for (const u of updates) {
    const { error } = await supabase
      .from("items")
      .update({ sort_order: u.sort_order })
      .eq("id", u.id);
    if (error) {
      return { success: false, error: error.message } as const;
    }
  }

  await audit("item.reorder", "item", null, { stationId, orderedIds });
  revalidatePath("/admin/items");
  return { success: true } as const;
}

export async function bulkImportItems(
  stationId: string,
  rows: { name: string; unit: string; par_level?: number | null }[],
) {
  const supabase = await createClient();
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, error: "Not authenticated" } as const;

  const { data: existing } = await supabase
    .from("items")
    .select("sort_order")
    .eq("station_id", stationId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .single();

  let nextSort = (existing?.sort_order ?? 0) + 10;

  const inserts = rows
    .map((r) => {
      const nameParsed = itemNameSchema.safeParse(r.name.trim());
      const unitParsed = unitSchema.safeParse(r.unit.trim());
      if (!nameParsed.success || !unitParsed.success) return null;
      const nameVal = nameParsed.data;
      const unitVal = unitParsed.data;
      const row = {
        station_id: stationId,
        name: nameVal,
        unit: unitVal,
        par_level: r.par_level ?? null,
        sort_order: nextSort,
      };
      nextSort += 10;
      return row;
    })
    .filter(Boolean) as {
    station_id: string;
    name: string;
    unit: UnitType;
    par_level: number | null;
    sort_order: number;
  }[];

  if (inserts.length === 0) {
    return { success: false, error: "No valid rows to import" } as const;
  }

  const { data, error } = await supabase
    .from("items")
    .insert(inserts)
    .select();

  if (error) {
    return { success: false, error: error.message } as const;
  }

  await audit("item.bulk_import", "item", null, {
    stationId,
    count: inserts.length,
  });
  revalidatePath("/admin/items");
  return { success: true, count: inserts.length, data } as const;
}

// ============================================================================
// Users
// ============================================================================

export async function setUserRole(id: string, role: UserRole) {
  const supabase = await createClient();
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, error: "Not authenticated" } as const;

  const { data: before } = await supabase
    .from("users")
    .select("role")
    .eq("id", id)
    .single();

  const { data, error } = await supabase
    .from("users")
    .update({ role })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message } as const;
  }

  await audit("user.set_role", "user", id, {
    before: { role: before?.role },
    after: { role },
  });
  revalidatePath("/admin/users");
  return { success: true, data } as const;
}

export async function setUserActive(id: string, active: boolean) {
  const supabase = await createClient();
  const userId = await getCurrentUserId();
  if (!userId) return { success: false, error: "Not authenticated" } as const;

  const { data: before } = await supabase
    .from("users")
    .select("active")
    .eq("id", id)
    .single();

  const { data, error } = await supabase
    .from("users")
    .update({ active })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message } as const;
  }

  await audit("user.set_active", "user", id, {
    before: { active: before?.active },
    after: { active },
  });
  revalidatePath("/admin/users");
  return { success: true, data } as const;
}
