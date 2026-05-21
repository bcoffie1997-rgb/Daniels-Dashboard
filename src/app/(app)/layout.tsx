"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { useAuth } from "@/components/auth-provider";
import { isMockMode } from "@/lib/auth/config";

export default function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!mounted || loading) return;
    if (!user && isMockMode()) router.replace("/login");
  }, [mounted, loading, user, router]);

  if (!mounted || loading) return null;
  if (!user && isMockMode()) return null;

  return <AppShell>{children}</AppShell>;
}
