# START HERE

This is the first file Claude Code should read in this folder. It sets context that applies across every sprint.

## What you're building

A Progressive Web App for inventory counting at **Daniel's, A Florida Steakhouse** (Fort Lauderdale). Replaces spreadsheets with a phone-first, offline-capable, role-based counting tool with manager approval and variance tracking.

## Non-negotiable constraints

1. **PWA only** — no native apps. Installable to home screen via Serwist.
2. **Offline-first counting** — must work in walk-in refrigerators with zero signal. Counts queue locally in IndexedDB, sync when online.
3. **Row-Level Security on every table** — RLS is enforced at the database level, not just the UI. Day one.
4. **Mobile-first design** — counters use phones in walk-ins; design at 375px width baseline.
5. **Audit log on every mutation** — every state change writes to `audit_log`.
6. **Brand:** Daniel's branding (see `branding/BRAND_GUIDELINES.md`). Forest green `#004539`, cream `#FFFDFA`, warm refined hospitality aesthetic. **NOT** generic SaaS or cold industrial.

## Sprint order (do not deviate)

| # | Branch | What |
|---|---|---|
| 0 | `main` | Infrastructure: repo, Supabase, Vercel, schema, env, design tokens |
| 1 | `feat/auth` | Auth + roles + middleware + RLS verification |
| 2 | `feat/admin-catalog` | Admin: stations + items CRUD + drag + bulk import |
| 3 | `feat/count-flow` | Counter: station picker + count + review + submit (online only) |
| 4 | `feat/offline-sync` | Offline sync — the hard one |
| 5 | `feat/sessions` | Sessions polish + attribution + audit log writes + realtime |
| 6 | `feat/manager-dashboard` | Manager: dashboard + variance + approve/reject |
| 7 | `feat/observability` | CSV export + PostHog + Sentry + PWA polish |
| 8 | `chore/pilot-prep` | Daniel-specific seed + bug bash + pilot runbook |
| 9–20 | Platform | xtraCHEF parity — vendors, invoices, recipes, Toast, AvT (see `docs/09-platform-roadmap.md`) |

## Platform scope (xtraCHEF parity)

After MVP pilots, Mise expands to match xtraCHEF Pro: vendors, invoice OCR/AP, recipe costing, Toast POS sync, AvT reports, and orders. The counting wedge ships first; platform features layer on without breaking offline counts.

See `docs/09-platform-roadmap.md` and `schema/0002_platform_extensions.sql`.

1. **One sprint per session.** Don't run two in parallel.
2. **Read `branding/BRAND_GUIDELINES.md` before writing any UI.** The aesthetic is specific and not the default for AI-generated apps.
3. **Use the SQL in `schema/0001_initial_schema.sql` verbatim.** Do not modify, "improve," or restructure it. Schema changes go in new migration files.
4. **Reference docs by exact file path** when asking the user clarifying questions (e.g., "see `docs/03-design.md` section X").
5. **Never commit real Daniel inventory data** to a public repo. Use a gitignored `seed-daniel.sql` or a private branch.
6. **Server actions over API routes** wherever possible. API routes only for `/api/sync`, `/api/export`, `/api/health`.
7. **Soft-delete only.** Never `DELETE FROM` on items, stations, or sessions. Use `active = false` to preserve history.
8. **Variance is computed at submit time** and stored on `count_entries.variance_pct`. Don't recompute on read.
9. **Mobile-first.** Build the mobile layout first; desktop is enhancement.

## Where to find what

- **Full requirements:** `docs/02-requirements.md`
- **All sprint prompts:** `prompts/`
- **The schema:** `schema/0001_initial_schema.sql`
- **Brand tokens (paste into `globals.css`):** `branding/colors/tokens.css`
- **Logo files:** `branding/logos/`
- **Env template:** `config/.env.example`
- **Single consolidated spec:** `docs/BUILD_SPEC.md`

## Before Sprint 0

User needs to have ready:
- Supabase project created (note the project ref)
- Vercel account ready
- Resend API key
- PostHog project + key
- Sentry project + DSN
- A domain (or willingness to use a Vercel subdomain for now)
- Node 20+, pnpm, Vercel CLI, Supabase CLI installed locally

Once these are in `config/.env.example` filled out into a real `.env.local`, paste `prompts/sprint-0-setup.md` into Claude Code and start.
