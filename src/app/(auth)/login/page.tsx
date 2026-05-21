"use client";

import { useRouter } from "next/navigation";
import { Brandmark } from "@/components/brand/brandmark";
import { Wordmark } from "@/components/brand/wordmark";
import { Button } from "@/components/ui/button";
import { useMockStore } from "@/lib/mock/store";
import type { Role } from "@/lib/mock/types";

export default function LoginPage() {
  const router = useRouter();
  const setRole = useMockStore((s) => s.setCurrentUserByRole);

  const continueAs = (role: Role) => {
    setRole(role);
    if (role === "admin") router.push("/insights");
    else if (role === "manager") router.push("/insights");
    else router.push("/");
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div className="flex w-full max-w-sm flex-col items-center">
        <Brandmark size={64} color="cream" className="mb-5" />
        <Wordmark height={36} color="cream" className="mb-2" />
        <p className="caption text-muted-foreground">A Florida Steakhouse</p>

        <div className="mt-10 w-full rounded-xl border border-border bg-card p-6">
          <h1 className="font-display text-display-lg text-foreground">
            Welcome
          </h1>
          <p className="mt-2 text-body text-muted-foreground">
            Sign in to Mise to begin a count.
          </p>

          <div className="mt-6 flex flex-col gap-3">
            <Button
              size="lg"
              className="h-12 w-full bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={() => continueAs("counter")}
            >
              Continue as counter
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 w-full border-border"
              onClick={() => continueAs("manager")}
            >
              Continue as manager
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 w-full border-border"
              onClick={() => continueAs("admin")}
            >
              Continue as admin
            </Button>
          </div>

          <p className="mt-6 text-body-sm text-muted-foreground">
            Demo preview. The real release uses an emailed magic link.
          </p>
        </div>
      </div>
    </main>
  );
}
