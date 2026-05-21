"use client";

import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { isMockMode } from "@/lib/auth/config";
import { useMockStore } from "@/lib/mock/store";
import { createClient } from "@/lib/supabase/client";
import type { Database } from "@/types/database";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { relativeFromNow } from "@/lib/format";
import { setUserRole, setUserActive } from "@/app/(admin)/actions";

type UserRow = Database["public"]["Tables"]["users"]["Row"];
type UserRole = Database["public"]["Enums"]["user_role"];

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "counter", label: "Counter" },
  { value: "manager", label: "Manager" },
  { value: "admin", label: "Admin" },
];

export default function AdminUsersPage() {
  const isMock = isMockMode();
  const mockUsers = useMockStore((s) => s.users);
  const mockSetUserRole = useMockStore((s) => s.setUserRole);
  const mockSetUserActive = useMockStore((s) => s.setUserActive);

  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(!isMock);

  // Load data
  useEffect(() => {
    if (isMock) {
      setUsers(
        mockUsers.map((u) => ({
          ...u,
          updated_at: u.created_at,
        })) as UserRow[],
      );
      setLoading(false);
      return;
    }

    let cancelled = false;
    const supabase = createClient();
    supabase
      .from("users")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          toast.error("Could not load users");
        } else {
          setUsers((data ?? []) as UserRow[]);
        }
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isMock, mockUsers]);

  const handleRoleChange = useCallback(
    async (userId: string, role: UserRole) => {
      if (isMock) {
        mockSetUserRole(userId, role);
        toast.success("Role updated");
        return;
      }
      const res = await setUserRole(userId, role);
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role } : u)),
        );
        toast.success("Role updated");
      } else {
        toast.error(res.error);
      }
    },
    [isMock, mockSetUserRole],
  );

  const handleActiveChange = useCallback(
    async (userId: string, active: boolean) => {
      if (isMock) {
        mockSetUserActive(userId, active);
        toast.success(active ? "User activated" : "User deactivated");
        return;
      }
      const res = await setUserActive(userId, active);
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, active } : u)),
        );
        toast.success(active ? "User activated" : "User deactivated");
      } else {
        toast.error(res.error);
      }
    },
    [isMock, mockSetUserActive],
  );

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-32 animate-pulse rounded bg-muted" />
        <div className="h-64 animate-pulse rounded bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-body text-muted-foreground">
        Users self-onboard via magic link. Admins set roles and status from
        this page.
      </p>

      <Card className="overflow-hidden bg-card p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>User</TableHead>
                <TableHead className="hidden lg:table-cell">Joined</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Active</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id} className="hover:bg-muted/50">
                  <TableCell>
                    <div className="min-w-0">
                      <p className="text-body font-medium text-foreground">
                        {user.full_name || user.email}
                      </p>
                      <p className="caption mt-0.5 text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    <span className="text-body-sm text-muted-foreground">
                      {relativeFromNow(user.created_at)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={user.role}
                      onValueChange={(v) =>
                        handleRoleChange(user.id, v as UserRole)
                      }
                    >
                      <SelectTrigger className="h-8 w-32 border-border bg-background text-body-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLE_OPTIONS.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-right">
                    <Switch
                      checked={user.active}
                      onCheckedChange={(checked) =>
                        handleActiveChange(user.id, checked)
                      }
                      aria-label={`${user.active ? "Deactivate" : "Activate"} ${user.email}`}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
