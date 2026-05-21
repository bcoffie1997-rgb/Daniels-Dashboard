"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/components/auth-provider";
import { useMockStore } from "@/lib/mock/store";
import { ROLE_LABEL, type Role } from "@/lib/auth/config";

export default function SettingsPage() {
  const router = useRouter();
  const { user, isMock, signOut } = useAuth();
  const setRole = useMockStore((s) => s.setCurrentUserByRole);

  if (!user) {
    return (
      <div className="px-4 py-8 lg:px-8">
        <p className="text-body text-muted-foreground">
          You&apos;re signed out. Return to{" "}
          <a href="/login" className="text-accent underline">
            sign in
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8 lg:px-8">
      <header className="mb-8">
        <h1 className="font-display text-display-lg text-foreground">
          Settings
        </h1>
        <p className="mt-2 text-body text-muted-foreground">
          Your profile{isMock ? " and demo controls" : ""}.
        </p>
      </header>

      <Card className="mb-6 bg-card p-6">
        <p className="caption text-muted-foreground">Signed in as</p>
        <p className="mt-1 text-heading text-foreground">
          {user.full_name ?? user.email}
        </p>
        <p className="text-body-sm text-muted-foreground">{user.email}</p>
        <Separator className="my-4 bg-border" />
        <p className="caption text-muted-foreground">Role</p>
        <p className="mt-1 text-body text-foreground">
          {ROLE_LABEL[user.role]}
        </p>
      </Card>

      {isMock && (
        <Card className="mb-6 bg-card p-6">
          <h2 className="font-display text-display-md text-foreground">
            Demo controls
          </h2>
          <p className="mt-2 text-body-sm text-muted-foreground">
            Switch roles to walk through the app from each perspective.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {(["counter", "manager", "admin"] as Role[]).map((r) => (
              <Button
                key={r}
                variant={user.role === r ? "default" : "outline"}
                size="sm"
                onClick={() => setRole(r)}
                className={user.role === r ? "bg-primary" : "border-border"}
              >
                {ROLE_LABEL[r]}
              </Button>
            ))}
          </div>
        </Card>
      )}

      <Button
        variant="outline"
        onClick={async () => {
          await signOut();
          router.push("/login");
          router.refresh();
        }}
        className="border-destructive/40 text-destructive hover:bg-destructive/10"
      >
        Sign out
      </Button>
    </div>
  );
}
