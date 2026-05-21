"use client";

import { useRouter } from "next/navigation";
import { ChevronDown, LogOut, UserCircle2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMockStore, selectCurrentUser } from "@/lib/mock/store";
import type { Role } from "@/lib/mock/types";
import { Button } from "@/components/ui/button";

const ROLE_LABEL: Record<Role, string> = {
  counter: "Counter",
  manager: "Manager",
  admin: "Admin",
};

export function ProfileMenu() {
  const router = useRouter();
  const user = useMockStore(selectCurrentUser);
  const setRole = useMockStore((s) => s.setCurrentUserByRole);
  const signOut = useMockStore((s) => s.signOut);

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-10 gap-2 px-2 hover:bg-card"
        >
          <UserCircle2 className="h-5 w-5 text-muted-foreground" />
          <span className="caption hidden sm:inline">
            {ROLE_LABEL[user.role]}
          </span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel className="px-2 py-2">
          <div className="text-body font-medium text-foreground">
            {user.full_name}
          </div>
          <div className="text-body-sm text-muted-foreground">
            {user.email}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="caption text-muted-foreground">
          Demo: switch role
        </DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={user.role}
          onValueChange={(v) => setRole(v as Role)}
        >
          <DropdownMenuRadioItem value="counter">Counter</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="manager">Manager</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="admin">Admin</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => router.push("/settings")}
          className="cursor-pointer"
        >
          Settings
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            signOut();
            router.push("/login");
          }}
          className="cursor-pointer text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
