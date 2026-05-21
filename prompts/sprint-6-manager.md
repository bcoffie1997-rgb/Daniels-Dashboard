# Sprint 6 — Manager dashboard

> Fresh Claude Code session. Branch: `feat/manager-dashboard`.

---

You are in the `mise` repo. Sprint 5 is complete.

Reference docs in `../mise-build/`:
- `branding/BRAND_GUIDELINES.md`
- `docs/03-design.md` — Manager Dashboard + Session Detail wireframes

## TASK
Build the manager experience — see all sessions, drill into variance, approve / reject.

## DO

1. **`/dashboard` page:**
   - Top: filter row
     - Date range (default "Last 7 days")
     - Station multi-select
     - Counter multi-select
     - Status multi-select
     - Persist filters in URL query params
   - Right rail on desktop (≥1024px): "Today" `StatCard`s — sessions today, items counted, flagged items count, avg session duration. Cards use brand-styled `Card` with caption-label + Cormorant display number.
   - Main: `SessionTable`
     - Columns: Submitted at · Station · Counter · # items · Flagged (badge count) · Status · Action
     - Default sort: submitted_at desc
     - Tap row → `/dashboard/[sessionId]`
     - On mobile (<768px): collapses to cards
   - Use brand tokens for badges (variance gold for flagged counts, sage for low-flag sessions)

2. **`/dashboard/[sessionId]`:**
   - Header: station, counter, started_at, submitted_at, `StatusBadge`
   - Summary `StatCard`s: items counted, items skipped, items flagged (>20% variance), duration
   - Entries table:
     - Item · Counted · Previous · Variance % (`VarianceBadge`) · Reason (counter's note if any)
     - Default sort: `|variance_pct|` desc
     - Click item → small `Dialog` with last 5 counts of that item (sparkline + values, using a tiny in-house SVG sparkline — no recharts dependency)
   - Manager notes textarea (separate from counter's notes; auto-saves on blur)
   - Sticky footer:
     - "Approve" (primary forest) — runs `approveSession` action
     - "Reject" (destructive outline) — opens `Dialog` with required `rejection_reason` textarea → runs `rejectSession` action
   - Both actions write to `audit_log` and trigger the counter's realtime notification from Sprint 5

3. **`/dashboard/variance` (variance report):**
   - Date range picker (default Last 30 days)
   - Table: Item · Station · # counts · Avg variance % · Max variance % · Last counted
   - Sortable; defaults to avg variance % desc — surfaces chronic outliers for purchasing decisions
   - This is the "why is X always off?" report

4. **Realtime:**
   - Subscribe to all sessions (manager+ scope)
   - Push new submissions to the top of the table live
   - Subtle "New" badge on row for 5 seconds after it appears
   - Honor `NEXT_PUBLIC_ENABLE_REALTIME` flag

5. **Server Actions** in `src/app/(manager)/actions.ts`:
   - `approveSession(sessionId, managerNotes?)` — sets approved_at, approved_by, status='approved'
   - `rejectSession(sessionId, reason)` — sets status='rejected', rejection_reason; reason is required
   - Both write to `audit_log`
   - Both call `revalidatePath` and trigger realtime

## DO NOT

- Build CSV export (Sprint 7)
- Add cost data / dollar variance (out of scope)
- **Allow editing individual entries** — managers approve or reject the whole session, not entries individually. This protects accountability and the audit trail.
- Use exclamation marks or emoji

## ACCEPTANCE CRITERIA

- [ ] Filters work and persist in URL — refresh keeps state
- [ ] Approve transitions session to `approved` with `approved_by` and `approved_at` stamped
- [ ] Reject requires a reason; button disabled when textarea empty
- [ ] Counter sees rejection notification from Sprint 5 realtime
- [ ] Variance report identifies chronic outlier items correctly
- [ ] Live updates: submitting a session in another browser appears in manager dashboard within 5s
- [ ] Mobile view of `/dashboard` is usable (cards, not cramped table) on 375px viewport
- [ ] Approve / Reject buttons use correct brand colors (forest / terracotta-outline)
- [ ] Voice throughout is brand-appropriate — manager-facing is slightly more formal

## NOTES

- "Today" StatCards respect venue local time: **America/New_York** for Daniel's Fort Lauderdale (US Eastern, observes DST)
- The sparkline for the per-item count history should be simple SVG — no chart library. 5 data points, line from oldest to newest, dot on latest.
- Approve action should NOT lock the session — admins can still see and amend rejection if needed via audit log review (don't build amend UI; the audit log is the record)
