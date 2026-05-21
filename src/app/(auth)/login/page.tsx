"use client";

import { Suspense } from "react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Brandmark } from "@/components/brand/brandmark";
import { Wordmark } from "@/components/brand/wordmark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { isMockMode } from "@/lib/auth/config";
import { useMockStore } from "@/lib/mock/store";
import type { Role } from "@/lib/auth/config";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
});

type FormValues = z.infer<typeof schema>;

function DemoLogin() {
  const router = useRouter();
  const setRole = useMockStore((s) => s.setCurrentUserByRole);

  const continueAs = (role: Role) => {
    setRole(role);
    if (role === "admin" || role === "manager") router.push("/insights");
    else router.push("/");
  };

  return (
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
      <p className="mt-2 text-body-sm text-muted-foreground">
        Demo preview with mock data. Set{" "}
        <code className="font-mono text-xs">NEXT_PUBLIC_USE_MOCK_DATA=false</code>{" "}
        for magic-link auth.
      </p>
    </div>
  );
}

function MagicLinkLogin() {
  const searchParams = useSearchParams();
  const authError = searchParams.get("error") === "auth";
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    setSubmitError(null);
    const supabase = createClient();
    const origin = window.location.origin;
    const { error } = await supabase.auth.signInWithOtp({
      email: values.email,
      options: {
        emailRedirectTo: `${origin}/auth/callback`,
      },
    });

    if (error) {
      setSubmitError(
        "We couldn't send that link. Check the email and try again.",
      );
      return;
    }
    setSentTo(values.email);
  };

  if (sentTo) {
    return (
      <div className="mt-6">
        <h2 className="font-display text-display-md text-foreground">
          Check your email
        </h2>
        <p className="mt-2 text-body text-muted-foreground">
          We sent a link to{" "}
          <span className="text-foreground">{sentTo}</span>.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
      {authError && (
        <p className="text-body-sm text-destructive">
          That sign-in link expired or was already used. Request a new one.
        </p>
      )}
      {submitError && (
        <p className="text-body-sm text-destructive">{submitError}</p>
      )}
      <div className="space-y-2">
        <Label htmlFor="email" className="caption text-muted-foreground">
          Work email
        </Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="you@danielssteak.com"
          className="h-12 border-border bg-background"
          {...register("email")}
        />
        {errors.email && (
          <p className="text-body-sm text-destructive">{errors.email.message}</p>
        )}
      </div>
      <Button
        type="submit"
        size="lg"
        disabled={isSubmitting}
        className="h-12 w-full bg-primary text-primary-foreground hover:bg-primary/90"
      >
        {isSubmitting ? "Sending link…" : "Send magic link"}
      </Button>
    </form>
  );
}

export default function LoginPage() {
  const mock = isMockMode();

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

          {mock ? <DemoLogin /> : (
            <Suspense fallback={<p className="mt-6 text-body-sm text-muted-foreground">Loading…</p>}>
              <MagicLinkLogin />
            </Suspense>
          )}
        </div>
      </div>
    </main>
  );
}
