# Sprint 7 — CSV export, observability, PWA polish

> Fresh Claude Code session. Branch: `feat/observability`.

---

You are in the `mise` repo. Sprint 6 is complete.

Reference docs in `../mise-build/`:
- `branding/BRAND_GUIDELINES.md` — install prompt and PWA icon styling
- `docs/05-qa.md` — performance targets
- `docs/06-launch.md` — monitoring setup

## TASK
Wire observability, ship export, polish PWA install. This is the "prepare for production" sprint.

## DO

1. **CSV export** — `/export` page + `GET /api/export`:
   - UI:
     - Date range picker
     - Station multi-select
     - Counter multi-select
     - Status multi-select
     - "Include entries" toggle (sessions-only summary vs. full row-per-entry detail)
     - Big primary "Download CSV" button
   - Generate CSV server-side, stream as download with filename: `mise-export-{YYYY-MM-DD}-{YYYY-MM-DD}.csv`
   - Columns (detail mode): `session_id, submitted_at, approved_at, station, counter, item, unit, quantity, previous_quantity, variance_pct, status, session_notes, rejection_reason`
   - Proper CSV escaping — quote fields containing commas, newlines, or quotes. Use a tested library (`papaparse`) or hand-roll with care
   - Manager+ only (RLS + role guard)
   - Empty result set still returns a valid header-only CSV, not an error

2. **PostHog events** — typed event helper in `src/lib/posthog.ts`:
   - `session_started` — `{ station_id, station_name }`
   - `session_submitted` — `{ station_id, duration_seconds, items_counted, items_skipped, items_flagged }`
   - `session_approved` / `session_rejected` — `{ session_id }`
   - `entry_saved` — sampled at 10% (use `Math.random() < 0.1`) to avoid event volume noise
   - `offline_count_started`, `sync_completed` (with `entries_synced` count), `sync_failed` (with error type)
   - `csv_exported` — `{ row_count, has_filters }`
   - **Identify users on login** with `{ role, active }` — never email or name (no PII in PostHog person properties)

3. **Sentry:**
   - Capture all sync failures with full payload context
   - Capture server action errors
   - User context: `id` only, no email or name
   - Set up release tracking — every Vercel deploy creates a Sentry release via the official Sentry Next.js plugin
   - Add a deliberate test error path (e.g., `/api/sentry-test` accessible only in dev) to verify configuration

4. **PWA polish:**
   - Add real PWA icons: 192x192, 512x512, plus maskable variants (192 and 512)
   - These can be generated from `branding/logos/daniels-favicon.svg` — render the Daniel's brandmark on a cream `#FFFDFA` rounded-square background for app icons
   - Add `apple-touch-icon` meta tag
   - Splash screen images for iOS (multiple sizes) using brandmark on cream background
   - **PWA install prompt component** — shows after second successful session submit:
     - Bottom sheet, brand-styled
     - Cormorant headline: *"Install Mise"*
     - Body: *"Add Mise to your home screen for faster access and offline counts."*
     - "Install" (primary forest) + "Not now" (ghost)
     - Dismissible; doesn't re-prompt for 7 days after dismiss
     - Uses `beforeinstallprompt` event on Android; iOS shows custom instructions (since iOS doesn't support the API)

5. **Lighthouse audit:**
   - Run Lighthouse on production preview deploy
   - Aim for ≥90 on Performance, Accessibility, Best Practices, SEO, PWA (per QA targets)
   - Fix what's broken — common issues: image sizing, color contrast, missing aria labels, blocking scripts

6. **`/admin/audit` viewer:**
   - Filter by user, action, entity_type, date range
   - Table view, paginated (50 rows per page)
   - Read-only — admins cannot modify audit log
   - Apply brand styling

## ACCEPTANCE CRITERIA

- [ ] CSV exports correctly with proper escaping (commas in notes don't break columns, opens cleanly in Excel + Google Sheets)
- [ ] PostHog dashboard shows all events firing — verify each event type appears at least once
- [ ] Sentry catches a deliberately thrown server action error with correct user context
- [ ] Lighthouse PWA score ≥ 90 on production-like deploy
- [ ] Lighthouse Accessibility ≥ 95
- [ ] Install prompt appears after 2nd submit on a fresh browser
- [ ] Install prompt does NOT re-prompt within 7 days of dismiss
- [ ] PWA icons render correctly on iOS home screen, Android home screen, and as browser favicon
- [ ] Audit log viewer is queryable by admin with filters working

## NOTES

- Use `papaparse` for CSV — already in dependencies — it handles edge cases
- iOS PWA install can't be triggered programmatically — show a static instruction set: *"Tap the Share button, then 'Add to Home Screen'."* with iOS-style icons
- Test export with realistic volume — 30 days × 5 stations × 50 items × 1 count per day = 7,500 entries. Make sure it streams without timeout.
