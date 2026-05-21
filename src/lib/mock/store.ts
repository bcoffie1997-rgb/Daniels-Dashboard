"use client";

import { create } from "zustand";
import {
  seedEntries,
  seedItems,
  seedSessions,
  seedStations,
  seedUsers,
} from "./seed";
import type {
  CountEntry,
  CountSession,
  Item,
  Role,
  SessionStatus,
  Station,
  User,
} from "./types";

// All state is in-memory. Refreshing resets to seed — intentional for the
// demo shell.

interface MockState {
  currentUserId: string;
  users: User[];
  stations: Station[];
  items: Item[];
  sessions: CountSession[];
  entries: CountEntry[];

  setCurrentUserByRole: (role: Role) => void;
  signOut: () => void;

  startOrResumeSession: (stationId: string) => CountSession;
  saveEntry: (sessionId: string, itemId: string, quantity: number) => void;
  setEntryReason: (sessionId: string, itemId: string, reason: string) => void;
  setSessionNotes: (sessionId: string, notes: string) => void;
  submitSession: (sessionId: string) => void;

  approveSession: (sessionId: string, managerNotes?: string) => void;
  rejectSession: (sessionId: string, reason: string) => void;
  setManagerNotes: (sessionId: string, notes: string) => void;
}

const uid = (prefix: string) =>
  `${prefix}-${Math.random().toString(36).slice(2, 10)}`;

const computeVariance = (
  current: number,
  previous: number | null,
): number | null => {
  if (previous === null || previous === 0) return null;
  return Number((((current - previous) / previous) * 100).toFixed(2));
};

export const useMockStore = create<MockState>((set, get) => ({
  currentUserId: "u-admin",
  users: seedUsers,
  stations: seedStations,
  items: seedItems,
  sessions: seedSessions,
  entries: seedEntries,

  setCurrentUserByRole: (role) => {
    const user = get().users.find((u) => u.role === role && u.active);
    if (user) set({ currentUserId: user.id });
  },

  signOut: () => set({ currentUserId: "" }),

  startOrResumeSession: (stationId) => {
    const { sessions, currentUserId } = get();
    const existing = sessions.find(
      (s) =>
        s.station_id === stationId &&
        s.user_id === currentUserId &&
        s.status === "in_progress",
    );
    if (existing) return existing;

    const newSession: CountSession = {
      id: uid("sess"),
      user_id: currentUserId,
      station_id: stationId,
      status: "in_progress",
      started_at: new Date().toISOString(),
      submitted_at: null,
      approved_at: null,
      approved_by: null,
      rejection_reason: null,
      manager_notes: null,
      notes: null,
    };
    set({ sessions: [newSession, ...sessions] });
    return newSession;
  },

  saveEntry: (sessionId, itemId, quantity) => {
    const { entries, sessions, items } = get();
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    const station_id = sessions.find((s) => s.id === sessionId)?.station_id;
    const prior = sessions
      .filter(
        (s) =>
          s.station_id === station_id &&
          s.id !== sessionId &&
          (s.status === "approved" || s.status === "submitted"),
      )
      .sort(
        (a, b) =>
          new Date(b.submitted_at ?? b.started_at).getTime() -
          new Date(a.submitted_at ?? a.started_at).getTime(),
      );
    let previous_quantity: number | null = null;
    for (const sess of prior) {
      const match = entries.find(
        (e) => e.session_id === sess.id && e.item_id === itemId,
      );
      if (match) {
        previous_quantity = match.quantity;
        break;
      }
    }

    const variance_pct = computeVariance(quantity, previous_quantity);

    const existing = entries.find(
      (e) => e.session_id === sessionId && e.item_id === itemId,
    );

    if (existing) {
      set({
        entries: entries.map((e) =>
          e.id === existing.id
            ? {
                ...e,
                quantity,
                previous_quantity,
                variance_pct,
                entered_at: new Date().toISOString(),
              }
            : e,
        ),
      });
    } else {
      const next: CountEntry = {
        id: `${sessionId}-${itemId}`,
        session_id: sessionId,
        item_id: itemId,
        quantity,
        previous_quantity,
        variance_pct,
        entered_at: new Date().toISOString(),
      };
      set({ entries: [...entries, next] });
    }
  },

  setEntryReason: (sessionId, itemId, reason) => {
    set({
      entries: get().entries.map((e) =>
        e.session_id === sessionId && e.item_id === itemId
          ? { ...e, reason }
          : e,
      ),
    });
  },

  setSessionNotes: (sessionId, notes) => {
    set({
      sessions: get().sessions.map((s) =>
        s.id === sessionId ? { ...s, notes } : s,
      ),
    });
  },

  submitSession: (sessionId) => {
    set({
      sessions: get().sessions.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              status: "submitted" as SessionStatus,
              submitted_at: new Date().toISOString(),
            }
          : s,
      ),
    });
  },

  approveSession: (sessionId, managerNotes) => {
    const { currentUserId } = get();
    set({
      sessions: get().sessions.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              status: "approved" as SessionStatus,
              approved_at: new Date().toISOString(),
              approved_by: currentUserId,
              manager_notes: managerNotes ?? s.manager_notes,
            }
          : s,
      ),
    });
  },

  rejectSession: (sessionId, reason) => {
    set({
      sessions: get().sessions.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              status: "rejected" as SessionStatus,
              rejection_reason: reason,
            }
          : s,
      ),
    });
  },

  setManagerNotes: (sessionId, notes) => {
    set({
      sessions: get().sessions.map((s) =>
        s.id === sessionId ? { ...s, manager_notes: notes } : s,
      ),
    });
  },
}));

// ----- Stable-reference selectors safe to pass to useMockStore directly -----
// These return primitives or stable refs from state (Array.prototype.find
// returns the same object reference across renders as long as the array is
// unchanged), so the default Object.is equality check inside Zustand keeps
// the subscription stable.
export const selectCurrentUser = (s: MockState): User | null =>
  s.users.find((u) => u.id === s.currentUserId) ?? null;

// ----- Pure helpers (NOT Zustand selectors) for derived data -----
// Use these inside `useMemo` in callers, with primitive store slices as deps.
export const computeItemsByStation = (items: Item[], stationId: string) =>
  items
    .filter((i) => i.station_id === stationId && i.active)
    .sort((a, b) => a.sort_order - b.sort_order);

export const computeEntriesForSession = (
  entries: CountEntry[],
  sessionId: string,
) => entries.filter((e) => e.session_id === sessionId);

export const computeLastCounted = (
  sessions: CountSession[],
  users: User[],
  stationId: string,
) => {
  const sess = sessions
    .filter(
      (x) =>
        x.station_id === stationId &&
        (x.status === "approved" || x.status === "submitted"),
    )
    .sort(
      (a, b) =>
        new Date(b.submitted_at ?? b.started_at).getTime() -
        new Date(a.submitted_at ?? a.started_at).getTime(),
    )[0];
  if (!sess) return null;
  const user = users.find((u) => u.id === sess.user_id);
  return { session: sess, user: user ?? null };
};

export const sortByStringField = <T>(arr: T[], key: keyof T): T[] =>
  [...arr].sort((a, b) =>
    String(a[key]).localeCompare(String(b[key])),
  );
