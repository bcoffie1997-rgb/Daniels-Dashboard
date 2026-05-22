"use client";

import { useEffect, useState } from "react";
import { ChevronDown, Eye, ShieldCheck, ClipboardList } from "lucide-react";
import { cn } from "@/lib/cn";

type Role = "admin" | "manager" | "counter";

const ROLES: Array<{ key: Role; label: string; sub: string; icon: any }> = [
  { key: "admin", label: "Admin view", sub: "Everything: counts, approvals, integrations, audit log", icon: ShieldCheck },
  { key: "manager", label: "Manager view", sub: "Counts + approvals + variances + reorder", icon: Eye },
  { key: "counter", label: "Counter view", sub: "Just the count flow — no admin surfaces", icon: ClipboardList },
];

const STORAGE_KEY = "mise:role";
const DEFAULT_ROLE: Role = "admin";

function applyRole(role: Role) {
  if (typeof document !== "undefined") {
    document.documentElement.dataset.role = role;
  }
}

export function RoleBoot() {
  useEffect(() => {
    try {
      const r = (localStorage.getItem(STORAGE_KEY) as Role) || DEFAULT_ROLE;
      applyRole(r);
    } catch {
      applyRole(DEFAULT_ROLE);
    }
  }, []);
  return null;
}

export function RoleToggle() {
  const [role, setRole] = useState<Role>(DEFAULT_ROLE);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    try {
      const r = (localStorage.getItem(STORAGE_KEY) as Role) || DEFAULT_ROLE;
      setRole(r);
      applyRole(r);
    } catch {}
  }, []);

  function pick(r: Role) {
    setRole(r);
    try {
      localStorage.setItem(STORAGE_KEY, r);
    } catch {}
    applyRole(r);
    setOpen(false);
  }

  const active = ROLES.find((r) => r.key === role) ?? ROLES[0];
  const ActiveIcon = active.icon;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:border-accent/40 transition-colors"
        title="Preview Mise as a different role"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <ActiveIcon className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{active.label}</span>
        <ChevronDown className={cn("h-3 w-3 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 w-72 rounded-lg border border-border bg-popover p-1.5 shadow-xl">
            <div className="px-3 py-2 micro text-muted-foreground border-b border-border mb-1">
              Preview as
            </div>
            {ROLES.map((r) => {
              const Icon = r.icon;
              const isActive = r.key === role;
              return (
                <button
                  key={r.key}
                  onClick={() => pick(r.key)}
                  className={cn(
                    "w-full flex items-start gap-3 rounded-md px-3 py-2.5 text-left hover:bg-muted transition-colors",
                    isActive && "bg-muted",
                  )}
                >
                  <Icon
                    className={cn(
                      "h-4 w-4 mt-0.5 shrink-0",
                      isActive ? "text-accent" : "text-muted-foreground",
                    )}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium">{r.label}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 leading-snug">
                      {r.sub}
                    </div>
                  </div>
                </button>
              );
            })}
            <div className="px-3 py-2 text-[10px] text-muted-foreground border-t border-border mt-1">
              Preview only. Once auth is wired, your real role determines the view.
            </div>
          </div>
        </>
      )}
    </div>
  );
}
