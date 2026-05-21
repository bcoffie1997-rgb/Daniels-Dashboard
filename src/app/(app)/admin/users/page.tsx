"use client";

import { useMockStore } from "@/lib/mock/store";
import { Card } from "@/components/ui/card";
import { relativeFromNow } from "@/lib/format";
import type { Role } from "@/lib/mock/types";

const ROLE_LABEL: Record<Role, string> = {
  counter: "Counter",
  manager: "Manager",
  admin: "Admin",
};

export default function AdminUsersPage() {
  const users = useMockStore((s) => s.users);

  return (
    <>
      <p className="mb-4 text-body text-muted-foreground">
        Users self-onboard via magic link in the real release. Admins set
        roles from this page.
      </p>
      <Card className="overflow-hidden bg-card p-0">
        <ul className="divide-y divide-border">
          {users.map((u) => (
            <li
              key={u.id}
              className="grid grid-cols-[1fr_auto] items-center gap-3 px-4 py-3 lg:grid-cols-[2fr_1fr_1fr_auto]"
            >
              <div className="min-w-0">
                <p className="truncate text-body font-medium text-foreground">
                  {u.full_name}
                </p>
                <p className="caption mt-0.5 text-muted-foreground">
                  {u.email}
                </p>
              </div>
              <span className="hidden caption text-muted-foreground lg:inline">
                Joined {relativeFromNow(u.created_at)}
              </span>
              <span className="hidden caption text-foreground lg:inline">
                {ROLE_LABEL[u.role]}
              </span>
              <span
                className={`caption rounded-md border px-2 py-0.5 text-right ${
                  u.active
                    ? "border-accent/30 bg-accent/10 text-accent"
                    : "border-border text-muted-foreground"
                }`}
              >
                {u.active ? "Active" : "Inactive"}
              </span>
            </li>
          ))}
        </ul>
      </Card>
    </>
  );
}
