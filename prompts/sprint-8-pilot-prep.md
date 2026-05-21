# Sprint 8 — Daniel's pilot prep

> Fresh Claude Code session. Branch: `chore/pilot-prep`.

---

You are in the `mise` repo. Sprint 7 is complete. App is feature-complete.

Reference docs in `../mise-build/`:
- `docs/05-qa.md` — full critical-path checklist
- `docs/06-launch.md` — launch sequence

## TASK
Seed real data, run a bug bash, prepare the pilot. Get the app ready for Stage 0 dogfood and Stage 1 trusted pilot.

## DO

1. **Daniel's seed data** in `supabase/seed-daniel.sql`:
   - **IMPORTANT:** Add `supabase/seed-daniel.sql` to `.gitignore` BEFORE creating the file. This contains proprietary data.
   - Create the file with real station list specific to Daniel's Fort Lauderdale operation:
     - Walk-in 1 — Proteins
     - Walk-in 2 — Produce
     - Walk-in 3 — Dairy
     - Dry Storage
     - Bar — Spirits
     - Bar — Beer & Mixers
     - Wine Cellar
     - (Branden adds more based on actual Daniel's layout — leave placeholder INSERT statements with TODO comments)
   - Each station has items with correct units and sort_order matching physical walk path
   - Use realistic Daniel's items: prime steaks, hog snapper, Florida Key West pink shrimp, Skipper Sweet oysters, etc. (per `branding/BRAND_GUIDELINES.md` brand context). **Branden will populate the exact list at the host venue.**
   - Add a comment block at the top:
     ```
     -- DANIEL'S — REAL INVENTORY SEED
     -- This file is gitignored. Do NOT commit to public repo.
     -- Branden: fill in actual items observed in walk-throughs.
     -- Run against staging first. Validate before applying to prod.
     ```

2. **Demo mode** in `/settings` (admin only):
   - Toggle: "Demo mode"
   - When enabled for the current user, all sessions created are tagged `notes` prefixed with `[DEMO]` AND excluded from `/dashboard/variance` and CSV export by default (filter out via `notes ILIKE '[DEMO]%'`)
   - Lets Branden do live demos without polluting real data
   - This is a lightweight implementation — full schema-level demo isolation is v2

3. **Bug bash checklist** at `docs/bug-bash-checklist.md` (create new):
   - Use the full QA critical-path checklist from `mise-build/docs/05-qa.md`
   - Run it on each device in the matrix:
     - iPhone Safari (current iOS + previous version)
     - Android Chrome (Pixel + Samsung)
     - Desktop Chrome
     - Desktop Safari
     - **In an actual walk-in at Daniel's** (cold, gloves, no signal — this is the test that matters)
   - Track results in a table: device · test · pass/fail · notes

4. **"How to count with Mise" printable cheat sheet** at `docs/cheat-sheet.html`:
   - Single-page printable HTML (one PDF page when printed)
   - Daniel's branded — forest + cream, brandmark at top
   - Steps:
     1. Open Mise on your phone
     2. Tap the station you're counting
     3. Tap each item and enter the quantity
     4. If you don't know an item, tap "Skip"
     5. Tap "Same as last" if it hasn't changed
     6. When done, tap "Review & Submit"
     7. If the app is offline (gold dot), keep counting — it syncs automatically when you're back in range
   - Include Branden's contact info at bottom for help
   - Print 5 copies, post in kitchen, walk-ins, and bar

5. **Pilot runbook** at `docs/pilot-runbook.md`:
   - **Who's piloting:** specific names (Branden + 2 chosen pilots)
   - **Stage 1 schedule:**
     - Week 1: parallel-run with spreadsheets, daily check-in at end of shift
     - Week 2: continue parallel, weekly summary of issues
   - **What to do day 1:**
     - Each pilot user gets magic-link email
     - First sign-in establishes their account
     - Branden manually promotes manager pilot to manager role
     - 15-min walkthrough of the app per pilot user
     - First count done together
   - **Success criteria by week:**
     - Week 1: Each pilot completes ≥3 counts successfully, no data loss incidents
     - Week 2: Pilots prefer Mise over spreadsheets
     - Week 4 (Stage 2 entry): Chef de Cuisine sign-off received
   - **How to get help:** Branden's phone + email + Slack handle
   - **How to roll back to spreadsheets** if needed: just stop using Mise; existing spreadsheets remain authoritative for now
   - **Escalation:** what to do if data is missing or wrong (don't panic, take screenshot, message Branden, count on paper as backup)

6. **Final pre-pilot sanity:**
   - Run the full QA checklist one more time
   - Verify all 9 sprints' acceptance criteria pass
   - Smoke-test in production with the seeded Daniel's data
   - Confirm Sentry, PostHog, uptime monitoring all wired and receiving events
   - Take a manual `pg_dump` of production before pilot day 1

## DO NOT

- **Push `seed-daniel.sql` to the GitHub repo.** It's gitignored — verify before every commit
- Promise pilots more than the app actually does
- Skip the actual walk-in test on Sprint 4's offline sync just because it was tested in Sprint 4

## ACCEPTANCE CRITERIA

- [ ] Seed script runs cleanly against a fresh Supabase staging project (test this first)
- [ ] Demo mode isolates data from variance/export reports
- [ ] All bug-bash checklist items pass on all devices
- [ ] Cheat sheet PDF prints cleanly on a standard letter page
- [ ] Pilot runbook is complete with named pilots, schedule, and success criteria
- [ ] Production smoke test passes end-to-end
- [ ] `seed-daniel.sql` is in `.gitignore` and NOT in any commit

## NOTES

- **Before piloting**: get explicit verbal approval from your direct chef. Show them the cheat sheet, walk through the manager dashboard, explain what data is collected and where it's stored.
- The cheat sheet is also useful as the founding-story artifact later — "here's the one-pager I posted in the Daniel's kitchen on pilot day 1."
- Day 1 of the pilot: start with ONE counter (Branden), not all three at once. Add one more on day 3 if day 1–2 are clean.
- After Sprint 8, the next phase is **Stage 0 dogfood** (Branden counts daily for a week solo), then Stage 1 trusted pilot.
