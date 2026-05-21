"use client";

import { PostHogProvider } from "posthog-js/react";
import { initPostHog, posthog } from "@/lib/posthog";
import { AuthProvider } from "@/components/auth-provider";
import { useEffect } from "react";

export function Providers({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    initPostHog();
  }, []);

  return (
    <PostHogProvider client={posthog}>
      <AuthProvider>{children}</AuthProvider>
    </PostHogProvider>
  );
}
