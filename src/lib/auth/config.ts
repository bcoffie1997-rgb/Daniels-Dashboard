import type { UserRole } from "@/types/database";

export type Role = UserRole;

export const ROLE_RANK: Record<Role, number> = {
  counter: 0,
  manager: 1,
  admin: 2,
};

export function isMockMode(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";
}

export function hasMinRole(userRole: Role, minRole: Role): boolean {
  return ROLE_RANK[userRole] >= ROLE_RANK[minRole];
}

export const ROLE_LABEL: Record<Role, string> = {
  counter: "Counter",
  manager: "Manager",
  admin: "Admin",
};
