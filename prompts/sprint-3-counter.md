# Sprint 3 — Counter flow (online only)

> Fresh Claude Code session. Branch: `feat/count-flow`.

---

You are in the `mise` repo. Sprint 2 is complete. Admin can manage stations, items, and users.

Reference docs in `../mise-build/`:
- `branding/BRAND_GUIDELINES.md` — voice, touch targets, type
- `docs/03-design.md` — Flow 1 (counter), Count Screen + Review wireframes
- `docs/02-requirements.md` — user stories

## TASK
Build the core counter experience — station picker, active count screen, review & submit. **ONLINE ONLY for this sprint.** Offline comes in Sprint 4.

## DO

1. **Station Picker** (`/` — `src/app/(counter)/page.tsx`):
   - Server component fetches active stations
   - Page title in Cormorant: *"Choose a station"*
   - Vertical list of `StationCard` components (88px tall, 16px gap):
     - Station name (Inter heading-lg, font-medium)
     - Caption below: *"Last counted by {name} · {relative time}"* (use `date-fns` `formatDistanceToNow`)
     - Right chevron (lucide-react)
   - Tap → navigates to `/count/[stationId]`

2. **Active count screen** (`/count/[stationId]`):
   - Server component fetches station + items + previous quantities (latest approved session per item) — this is the n+1 you should solve with one query joining `count_entries` ordered by `entered_at desc` filtered to approved sessions
   - On mount client-side: call `startCountSession` action — creates session if none `in_progress`, else resumes
   - Sticky top:
     - Station name in caption style ("WALK-IN 1 · PROTEINS")
     - Progress "12 / 47" in mono font, tabular numbers
     - `SyncIndicator` placeholder (functional in Sprint 4)
   - Scrollable list of `ItemRow` components in sort_order:
     - Left: name (Inter 500), unit (muted small), "Last: {previous_quantity} {unit}" (caption muted)
     - Right: tap target — current count in mono tabular, or em-dash `—`
     - 3px left border: transparent (uncounted), sage `--accent` (counted), warm gold `--warning` (skipped)
   - Tap a row → opens `NumericInputDrawer` (Drawer from bottom):
     - Item name + unit at top
     - Native number input with `inputmode="decimal"`, autofocus
     - "Same as last" button (only if previous exists) — pre-fills the field
     - "Skip" button — marks skipped, advances to next uncounted item
     - "Save & Next" button — saves entry, opens drawer for next uncounted item
     - "Save & Close" button — saves, returns to list
   - Each save calls `saveCountEntry` server action (debounced 300ms)
   - Sticky bottom bar:
     - "Save & Continue Later" (ghost) — leaves session `in_progress`, navigates to `/`
     - "Review & Submit" (primary forest, full-width when ready) — disabled until at least 1 entry — navigates to review

3. **Review screen** (`/count/[stationId]/review`):
   - Server component fetches session + entries + computes variances using `lib/variance.ts`
   - Summary card with Cormorant headline + Inter stats: items counted, items skipped, time spent (now − started_at, formatted "12m 34s")
   - Variance flags section: items with `|variance_pct| > 20%`, displayed with `VarianceBadge` and a "reason" textarea per row (optional)
   - Notes textarea (session-level, optional)
   - Sticky bottom: "Submit Count" button (full-width, primary forest, large 56px)
   - On submit: call `submitCountSession` action — marks `submitted`, stamps `submitted_at`, persists variances + per-entry reason notes if added, redirects to `/sessions/[id]` with success toast in brand voice (*"Count submitted for review."*)

4. **Counter session history**:
   - `/sessions` — list with date, station, status, total items, variance summary
   - `/sessions/[id]` — read-only detail view of the session and entries

5. **`lib/variance.ts`**:
   - `computeVariance(current: number, previous: number | null): number | null`
   - Returns `null` if previous is null
   - Returns `Infinity`-safe handling when previous = 0 (return literal `null` or a special flag, not infinity — UI shows "+X" instead of percentage)

6. **Server Actions** in `src/app/(counter)/actions.ts`:
   - `startCountSession(stationId)` — idempotent: returns existing `in_progress` session or creates new
   - `saveCountEntry(sessionId, itemId, qty)` — upsert on `(session_id, item_id)`
   - `submitCountSession(sessionId, notes?, entryReasons?)` — transitions to `submitted`, computes variances, persists
   - All write to `audit_log`

7. **Brand voice on all toasts and microcopy** — see `BRAND_GUIDELINES.md`:
   - "Count submitted for review."
   - "Couldn't save. We'll try again."
   - "No counts yet for this station."

## DO NOT

- Build offline support (Sprint 4 — but design code so the action layer can later be intercepted)
- Build manager approval (Sprint 6)
- Build CSV export (Sprint 7)
- Use emoji, exclamation marks, or playful copy

## ACCEPTANCE CRITERIA

- [ ] Counter sees only stations they're allowed to count (only active ones)
- [ ] Starting a count creates exactly one `in_progress` session (idempotent — rapid double-tap doesn't create duplicates)
- [ ] Drawer keyboard behavior: opens with focus, OS keypad appears, decimal works on iOS Safari and Android Chrome
- [ ] "Same as last" pre-fills with previous quantity
- [ ] Progress counter updates as items are counted
- [ ] Skipping flags item warm gold
- [ ] Review screen correctly identifies >20% variance items
- [ ] Submit transitions session to `submitted` and entries persist
- [ ] Counter can resume in-progress session by tapping the same station card
- [ ] Variance computes correctly: `(current - previous) / previous * 100`, with divide-by-zero handled
- [ ] Time-spent formats correctly across hour boundaries
- [ ] All brand voice rules applied — verify no emoji, no `!`, warm tone

## NOTES

- Use Zustand `count-store` for local UI state (current item in drawer, etc.) but **server state is canonical** — use Server Actions + `revalidatePath`
- Test on actual phone, not just devtools simulation
- Time spent = `submitted_at - started_at`, formatted "12m 34s" using `date-fns`
