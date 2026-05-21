# Sprint 4 — Offline sync

> Fresh Claude Code session. Branch: `feat/offline-sync`.
>
> **This is the hardest sprint. Move carefully. The app's core promise depends on this working in walk-ins with zero signal.**

---

You are in the `mise` repo. Sprint 3 is complete — counter flow works online.

Reference docs in `../mise-build/`:
- `branding/BRAND_GUIDELINES.md`
- `docs/05-qa.md` — the "Counter flow (offline)" section is the acceptance test for this sprint
- `docs/02-requirements.md` — the non-negotiable offline-first constraint

## TASK
Add robust offline support. Counters must be able to count in a walk-in with zero signal and not lose data.

## DO

1. **Dexie database** in `src/lib/db/dexie.ts`:
   - Tables:
     - `stations_cache` — mirrors `public.stations`
     - `items_cache` — mirrors `public.items`
     - `previous_counts_cache` — `item_id` → latest approved quantity (fetched eagerly on app load)
     - `pending_sessions` — offline-started sessions awaiting server: `(client_id, station_id, status, started_at, submitted_at?, notes?, synced)`
     - `pending_entries` — `(client_id, session_client_id, item_id, quantity, entered_at, synced)`
   - Use `client_id` (UUID generated client-side using `crypto.randomUUID()`) as the idempotency key

2. **Update Serwist service worker** (`src/app/sw.ts`):
   - Precache app shell routes
   - NetworkFirst for `/`, `/count/*`, `/sessions/*`
   - CacheFirst for static assets
   - Background sync queue for failed POSTs to `/api/sync` (use `BackgroundSyncPlugin`)

3. **`src/lib/db/sync.ts` — the sync engine:**
   - On `online` event: drain `pending_sessions` and `pending_entries` via `POST /api/sync`
   - Periodic retry every 30s while online if anything is unsynced
   - On sync success: mark `synced=true` in Dexie (don't delete until next app load — keep for debugging)
   - On 4xx: log to Sentry, surface toast, do NOT retry that record (data issue, not transient)
   - On 5xx / network error: leave queued, retry next online or 30s tick

4. **`POST /api/sync`** route:
   - Body: `{ sessions: [...], entries: [...] }`
   - Upserts sessions by `client_id` — insert if not exists, no-op if exists (idempotent)
   - Upserts entries by `(session_id from client_id resolution, item_id)`
   - Returns server IDs mapped back to client_ids: `{ sessions: { [client_id]: server_id }, entries: { [client_id]: server_id } }`
   - Validates: user is authenticated, sessions belong to authenticated user, entries belong to those sessions
   - Writes to `audit_log`

5. **Refactor counter flow to be offline-first:**
   - Station picker reads from `stations_cache`; refreshes in background when online
   - Items list reads from `items_cache` + `previous_counts_cache`
   - `startCountSession` writes to `pending_sessions` immediately, returns local `client_id`
   - `saveCountEntry` writes to `pending_entries` immediately; only triggers `/api/sync` if online
   - `submitCountSession` marks status `submitted` locally, enqueues for sync

6. **`src/hooks/use-online-status.ts`** using `navigator.onLine` + window `online`/`offline` events.

7. **`src/hooks/use-sync.ts`** exposing `{ status: 'idle' | 'syncing' | 'error', pendingCount, lastSyncAt }`.

8. **Update `SyncIndicator`** component:
   - Sage check icon: synced, online
   - Sage dot: offline (warm gold dot — actually use warm gold to signal "attention" without alarming)
   - Spinner: syncing
   - Terracotta + count: sync errors — tap to retry
   - Use brand tokens; no emoji

9. **Persistent banner** at top of count screen when `pendingCount > 0`:
   - Background: subtle warning-bg
   - Text: *"3 counts pending sync"* (no exclamation)
   - Manual "Retry" button on the right

10. **On app boot when online**: pull latest stations + items + previous_counts into Dexie. Show a non-blocking refresh indicator.

## DO NOT

- Try to make conflict resolution clever — server is source of truth on conflict, but for MVP conflicts shouldn't exist (counter is the only writer for their session)
- Try to sync mid-walk-in via Bluetooth, BLE, or anything exotic
- Hard-delete pending records after sync — keep until next app load for debug

## ACCEPTANCE CRITERIA — THE CRITICAL TESTS

- [ ] **Airplane mode test:** Enable airplane mode → start a count → enter 10 items → submit → disable airplane → within 30s all data syncs to Supabase
- [ ] **Force-close + reopen test:** Enter 5 counts offline → kill the PWA → reopen → counts still present locally → go online → syncs
- [ ] **Idempotency test:** Trigger `/api/sync` twice with same payload → no duplicate rows in Supabase
- [ ] `SyncIndicator` accurately reflects state
- [ ] Pending banner shows correct count
- [ ] Service worker caches app shell — opening `/` while offline (after first visit) does NOT show the browser offline page
- [ ] Sentry receives any sync errors with full payload context

## THE REAL ACCEPTANCE TEST

**Before merging this sprint to main:** Go into an actual walk-in at Daniel's (or any large refrigerator at home or elsewhere). Do a fake count of at least 10 items. Walk out, verify sync. If it doesn't work there, it doesn't work.

## NOTES

- DevTools simulation is necessary but NOT sufficient. Chrome DevTools → Application → Service Workers → Offline AND Network → Offline (they're different)
- Test on actual phone with airplane mode
- The `client_id` strategy means sessions created offline have no server `id` until first sync — your code must handle "local-only" sessions in the UI gracefully (referencing them by `client_id` throughout)
- Variance computation for offline counts: use cached `previous_counts_cache` value; recompute server-side at submit to canonical value
