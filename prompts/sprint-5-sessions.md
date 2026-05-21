# Sprint 5 — Sessions, attribution, audit polish

> Fresh Claude Code session. Branch: `feat/sessions`.

---

You are in the `mise` repo. Sprint 4 is complete — offline sync works.

Reference docs in `../mise-build/`:
- `branding/BRAND_GUIDELINES.md`
- `docs/03-design.md` — Flow 3 (manager), session detail wireframe

## TASK
Finalize session lifecycle, attribution display, and audit log writes across the app. Add realtime notifications.

## DO

1. **Audit log coverage** — verify every mutation writes a row:
   - Start session, save entry, submit
   - Approve, reject (Sprint 6 will use these — stub action layer now)
   - Item/station CRUD (already from Sprint 2)
   - Role change (already from Sprint 2)
   - Add tests/spot-checks via SQL

2. **`/sessions` page** (counter's own history):
   - Filter by station, date range
   - `StatusBadge` per row using brand colors:
     - in_progress: muted
     - submitted: accent sage
     - approved: success sage
     - rejected: destructive terracotta
   - Sortable by submitted_at, station, status
   - Card layout on mobile

3. **`/sessions/[id]` detail** (counter view, read-only):
   - Header: station, your name, status, timestamps (Cormorant title, Inter body)
   - Variance summary card
   - Entries table: Item · Counted · Previous · Variance % (`VarianceBadge`) · Reason
   - Sortable by `|variance_pct|` desc
   - **If rejected:** prominent banner at top with `rejection_reason` — destructive-bg background, terracotta border, voice example: *"This count was rejected. Reason: '{reason}'. Please re-count and submit again."*
   - **If approved:** subtle banner — accent-muted bg, voice example: *"Approved by {name} on {date}."*

4. **Attribution everywhere:**
   - Station card: *"Last counted by {name} · {relative time}"*
   - Item row in count screen: long-press OR info icon on previous count opens a small popover with *"Last counted by {name} on {date}: {qty} {unit}"*
   - Apply brand voice — no exclamations

5. **Session-level notes UX:**
   - On review screen, the textarea persists on blur (auto-save)
   - Display in detail views in a quoted style using the `daniels-quote-ornament.svg` as a subtle decorative mark above the notes

6. **Realtime via Supabase Realtime:**
   - Subscribe to `count_sessions` changes for the current user
   - When their session is approved/rejected by a manager, fire a toast:
     - Approved: *"Your count of {station} was approved."* (subtle, sage)
     - Rejected: *"Your count of {station} was sent back. Tap to see why."* (terracotta, links to session detail)
   - Only when `NEXT_PUBLIC_ENABLE_REALTIME=true`; else fall back to polling every 60s on relevant screens

## DO NOT

- Build the manager dashboard yet (Sprint 6)
- Build CSV export (Sprint 7)
- Use exclamation marks or emoji in any notification copy

## ACCEPTANCE CRITERIA

- [ ] Every mutation writes `audit_log` — verify via SQL: `SELECT action, entity_type, count(*) FROM audit_log GROUP BY 1, 2 ORDER BY 1, 2`
- [ ] Counter sees their own session history with filter, sort, badges per brand
- [ ] Rejected sessions show reason clearly with brand-voice copy
- [ ] Approval notification arrives in <5s in another tab (toggle realtime flag to test fallback works too)
- [ ] Long-press / info icon shows last-counter attribution
- [ ] Toast copy applies brand voice throughout
- [ ] Quote ornament displayed tastefully on notes block — not over-applied

## NOTES

- Audit log payload: store before/after JSON for updates. For inserts, just the inserted row. For role changes, store `{ from: 'counter', to: 'manager' }`.
- The quote ornament is decorative — use it ONCE on the notes section, not repeated. See `BRAND_GUIDELINES.md` ornaments section.
