"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { useMockStore, selectCurrentUser } from "@/lib/mock/store";

export default function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useMockStore(selectCurrentUser);
  const router = useRouter();

  useEffect(() => {
    if (!user) router.replace("/login");
  }, [user, router]);

  if (!user) return null;
  return <AppShell>{children}</AppShell>;
}
