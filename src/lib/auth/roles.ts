import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { AppUser } from "@/types/database";
import { hasMinRole, isMockMode, type Role } from "./config";

export type { Role } from "./config";

export async function getCurrentUser(): Promise<AppUser | null> {
  if (isMockMode()) return null;

  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("*")
    .eq("id", authUser.id)
    .maybeSingle();

  const row = profile as AppUser | null;
  if (!row || !row.active) return null;
  return row;
}

export async function requireRole(minRole: Role): Promise<AppUser> {
  if (isMockMode()) {
    return null as unknown as AppUser;
  }

  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (!hasMinRole(user.role, minRole)) redirect("/403");
  return user;
}

export async function signOutServer(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
