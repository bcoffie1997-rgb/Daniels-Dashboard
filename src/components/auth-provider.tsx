"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { isMockMode } from "@/lib/auth/config";
import { useMockStore, selectCurrentUser } from "@/lib/mock/store";
import type { AppUser } from "@/types/database";
import type { User as MockUser } from "@/lib/mock/types";

type AuthUser = AppUser | MockUser;

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  isMock: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function mockToAppUser(mock: MockUser): AuthUser {
  return {
    id: mock.id,
    email: mock.email,
    full_name: mock.full_name,
    role: mock.role,
    active: mock.active,
    created_at: mock.created_at,
    updated_at: mock.created_at,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const mockUser = useMockStore(selectCurrentUser);
  const mockSignOut = useMockStore((s) => s.signOut);
  const isMock = isMockMode() || !isSupabaseConfigured();

  const [liveUser, setLiveUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(!isMock);

  const fetchProfile = useCallback(async () => {
    if (isMock) return;
    const supabase = createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      setLiveUser(null);
      return;
    }

    const { data: profile } = await supabase
      .from("users")
      .select("*")
      .eq("id", authUser.id)
      .maybeSingle();

    const row = profile as AppUser | null;
    setLiveUser(row?.active ? row : null);
  }, [isMock]);

  useEffect(() => {
    if (isMock) {
      setLoading(false);
      return;
    }

    void fetchProfile().finally(() => setLoading(false));

    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void fetchProfile();
    });

    return () => subscription.unsubscribe();
  }, [isMock, fetchProfile]);

  const signOut = useCallback(async () => {
    if (isMock) {
      mockSignOut();
      return;
    }
    const supabase = createClient();
    await supabase.auth.signOut();
    setLiveUser(null);
  }, [isMock, mockSignOut]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: isMock ? (mockUser ? mockToAppUser(mockUser) : null) : liveUser,
      loading: isMock ? false : loading,
      isMock,
      refresh: fetchProfile,
      signOut,
    }),
    [isMock, mockUser, liveUser, loading, fetchProfile, signOut],
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function useAppUser(): AuthUser | null {
  return useAuth().user;
}
