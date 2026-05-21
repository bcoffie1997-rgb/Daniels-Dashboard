"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { useMockStore, selectCurrentUser } from "@/lib/mock/store";

export default function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Render nothing on the server. The demo's seed data is keyed off
  // `Date.now()` so SSR and client diverge — gating on mount sidesteps
  // every hydration mismatch in the (app) tree.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const user = useMockStore(selectCurrentUser);
  const router = useRouter();

  useEffect(() => {
    if (mounted && !user) router.replace("/login");
  }, [mounted, user, router]);

  if (!mounted) return null;
  if (!user) return null;
  return <AppShell>{children}</AppShell>;
}
