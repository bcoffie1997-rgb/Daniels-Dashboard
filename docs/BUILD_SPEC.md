# MISE — BUILD SPEC (consolidated)

**Project:** Mise — inventory app for Daniel's, A Florida Steakhouse (Fort Lauderdale, FL)
**Owner:** Branden
**Restaurant:** Part of Gioia Hospitality Group, founded by Thomas P. Angelo. Michelin-recommended.
**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind · shadcn/ui · Supabase · Vercel · PWA (Serwist)
**Status:** Spec locked. Ready for Sprint 0.

> This document is the consolidated reference. For full detail on any section, see the matching numbered doc in this folder (`docs/01-strategy.md` etc.) and the sprint prompts in `prompts/`.

---

## 1. Strategy

**Problem:** Inventory at Daniel's is done in spreadsheets — slow, error-prone, no accountability, data stale by the time decisions are made.

**Target user:** Counters (line cooks, sous chefs, stewards) on phones in walk-ins. Managers (CdC, GM) on phones + laptops in offices.

**Value:** *Count inventory on your phone in half the time, with every count attributed and visible in real time.*

**Success in 90 days:** 80% of weekly counts in-app · 40% time reduction · Chef references app data in ≥1 purchasing decision/week.

**Competitive niche:** Kitchen-first, phone-first, fast counting tool — the "Linear" not the "SAP" of restaurant inventory. Fine-dining and upscale-independent are the underserved segment.

**Strategic fit:** Standalone play with portfolio upside. Even Daniel's-only is a credentialed Michelin-recommended case study. Natural expansion: independent fine dining, then GHG portfolio.

→ Full detail: `docs/01-strategy.md`

---

## 2. Requirements

**MVP features (7, locked):**
1. Auth + roles (counter / manager / admin)
2. Item catalog organized by station with units
3. Mobile-first count flow (one-handed, fast, offline)
4. Count attribution + history
5. Count sessions (in_progress → submitted → approved/rejected)
6. Manager dashboard with variance + approve/reject
7. CSV export

**Out of scope:** POS integration · Invoice OCR · Auto-purchase orders · Recipe costing · Vendor management · Par alerts · Multi-location · Barcode scanning · Photo uploads · Native apps · Wine deep features

**Non-negotiable:** PWA only · Offline support day-one · RLS at DB level · Mobile-first · Audit log on every mutation · Daniel's brand applied (NOT generic SaaS)

**Data model (full SQL in `schema/0001_initial_schema.sql`):**
```
users · stations · items · count_sessions · count_entries · audit_log
```

**Timeline:** ~20 build days across 9 sprints. 5–6 calendar weeks at evening pace, 2–3 weeks heads-down.

**Risk flags:** Offline sync is hardest · Political risk at Daniel's · Catalog drift · Data sensitivity · Builder access loss · Multi-location consideration for GHG context.

→ Full detail: `docs/02-requirements.md`

---

## 3. Design

**Five user flows:**
1. Counter does a count (critical path)
2. Counter loses signal mid-count → offline-then-sync
3. Manager reviews + approves
4. Admin manages catalog
5. CSV export

**Screen inventory:** `/login`, `/`, `/count/[id]`, `/count/[id]/review`, `/sessions`, `/sessions/[id]`, `/dashboard`, `/dashboard/[id]`, `/dashboard/variance`, `/export`, `/admin/users`, `/admin/stations`, `/admin/items`, `/admin/audit`, `/settings`, `/403`, `/offline`

**Visual direction:** Daniel's brand applied. Forest green `#004539` + cream `#FFFDFA` + dark forest-tinted background `#0E1B17`. Cormorant Garamond (display) + Inter (UI) + JetBrains Mono (numbers). Refined, warm, hospitality-first — NOT industrial, NOT generic SaaS. "Upscale country club with operational clarity."

**Mobile-first:** 375px baseline · 48px touch targets minimum · OS numeric keypad · PWA install prompt after 2nd submit · portrait-locked count screens.

→ Full detail: `docs/03-design.md` and `branding/BRAND_GUIDELINES.md`

---

## 4. Development

**Sprint plan:**

| # | Branch | Days |
|---|---|---|
| 0 | `main` initial | 1 |
| 1 | `feat/auth` | 2 |
| 2 | `feat/admin-catalog` | 2 |
| 3 | `feat/count-flow` | 3 |
| 4 | `feat/offline-sync` | 3 |
| 5 | `feat/sessions` | 2 |
| 6 | `feat/manager-dashboard` | 3 |
| 7 | `feat/observability` | 2 |
| 8 | `chore/pilot-prep` | 2 |

**Build order rule:** Bottom-up. Primitives → atoms → molecules → organisms → layouts → pages.

**Server actions over API routes** wherever possible. API routes only for `/api/sync`, `/api/export`, `/api/health`.

**Soft delete only** — never `DELETE FROM` on items, stations, or sessions. Use `active = false` to preserve history.

**Variance computed at submit time** and stored on `count_entries.variance_pct`. Don't recompute on read.

→ Full detail: `docs/04-development.md`. Sprint prompts: `prompts/sprint-0-setup.md` through `prompts/sprint-8-pilot-prep.md`.

---

## 5. QA

**Critical path checklists** for auth, admin catalog, counter online flow, counter offline flow, manager review, CSV export — must pass on iPhone Safari + Android Chrome.

**Edge cases:** Archived-mid-count items · Two devices same session · Zero-entry submit · Divide-by-zero variance · Mid-session demotion · DST · Stale service workers · Large export volumes.

**Performance targets:** Lighthouse Performance ≥85 mobile · Accessibility ≥95 · PWA ≥90 · LCP <2.5s · Drawer open <150ms · Sync 10 entries <5s.

**Security:** RLS on every table verified · Role checked server-side on every mutation · No service role key in client · Zod on every input · Sentry PII redaction · Branch protection on `main`.

**Device matrix:** iPhone Safari (13+, SE), Android Chrome (Pixel, Samsung), MacBook Chrome/Safari required. iPad and older Android nice-to-have.

→ Full detail: `docs/05-qa.md`

---

## 6. Launch

**Pre-launch:** Vercel prod project + domain + env vars + analytics · Supabase prod project (separate) + migrations + RLS + daily backups + Resend SMTP · Sentry + PostHog + uptime monitoring · Privacy policy + terms · Repo: README + LICENSE + branch protection.

**Launch sequence:**
- Stage 0 (Wk 0): Solo dogfood — Branden counts daily
- Stage 1 (Wk 1–2): 2–3 trusted pilots, parallel-run with spreadsheets, 24–48h fix cycles
- Stage 2 (Wk 3–4): Full section — chef/GM sign-off required, parallel-run continues
- Stage 3 (Wk 5+): Full kitchen — spreadsheets archived, formalize ownership

**Gates:** All Blocker + High bugs closed between stages.

**Rollback:** Vercel instant rollback to previous deploy. Database: forward-fix preferred. Restore-to-new-project before swapping connection strings.

→ Full detail: `docs/06-launch.md`

---

## 7. Post-launch

**Week 1 monitoring:** Morning (10 min) Sentry/PostHog/Supabase/feedback. Evening (5 min) sync check + expected vs actual submitters.

**Feedback:** In-app button → feedback table · Pilot Slack/iMessage · Weekly 10-min in-person check-ins. **No surveys.**

**Iteration cadence:** Wk 1–2 24–48h cycles · Wk 3–4 daily as needed · Wk 5+ weekly Tue/Wed (Fri deploys banned) · Month 2+ 2-week sprints.

**Metrics:**
- Health: DAU counters, sessions/day, sync error rate, uptime
- Engagement: avg duration (↓), submit-within-24h % (>90%), approval lag (<24h)
- Business: time-to-decision, % purchasing decisions using app data, variance trends

**V2 backlog priority:** POS integration first (Toast), then par alerts → photos → custom keypad → recipe costing → invoice OCR → vendor management → multi-location (Daniel's Miami → GHG portfolio) → native → light mode → wine/bar deep features → cost data → two-person verification.

**Sunset criteria (decide now):**
- Adoption <50% by day 90 → kill
- Chef stops using data for 4 consecutive weeks → kill
- Builder loses access + no second venue interested → decide
- Cost > value → kill
- Competitor ships fine-dining product better at unmatched price → honest reassessment

**Pivot triggers:**
- Daniel's won't pay → SaaS for independent fine dining
- Counters love, managers don't → rework manager workflow
- POS unlocks 10x → integration becomes core, counting becomes a feature
- GHG wants it at Miami → expand within group first

**First iteration sprint ships within 14 days of Stage 1.** Three rules: include feedback from pilot user (name them), fix biggest friction, no new features — polish only.

→ Full detail: `docs/07-post-launch.md`

---

## Appendix

### A. Database schema
See `schema/0001_initial_schema.sql`. Full schema with RLS policies, triggers, security definer functions. Copy verbatim into `supabase/migrations/0001_initial_schema.sql`. **Do not modify** — schema changes go in new migration files.

### B. Environment variables
See `config/.env.example`. Includes Supabase, Resend, PostHog, Sentry, feature flags.

### C. Sprint prompts
See `prompts/sprint-0-setup.md` through `prompts/sprint-8-pilot-prep.md`. Each is ready to paste into Claude Code as a single session.

### D. Brand
See `branding/BRAND_GUIDELINES.md` for full brand application. `branding/colors/tokens.css` for paste-ready CSS variables. `branding/logos/` for Daniel's official SVG assets.

---

## What happens next

1. **Fill out `config/.env.example`** with real values into `.env.local` — Supabase project ref, Resend key, PostHog key, Sentry DSN
2. **Open Claude Code in this folder** and paste `prompts/sprint-0-setup.md`
3. **Tell your direct chef** about the project before Sprint 3 ships — frame as personal project to offer, not impose
4. **Time the current process** at Daniel's this week — bring a stopwatch, document spreadsheet pain
5. **Set a kill date** — Day 90 from Stage 1 pilot. If sunset criteria are tripped, walking away cleanly is a win.
6. **Start documenting** — photos of walk-ins, current spreadsheets (with permission), friction journal

**The hardest sprint is Sprint 4 (offline sync). The most important conversation is with your chef. Everything else is execution.**
