# Mise

Inventory counting Progressive Web App for **Daniel's, A Florida Steakhouse** (Fort Lauderdale). Replaces spreadsheet inventory with a phone-first, offline-capable counting tool with role-based attribution, manager approval, and variance tracking.

The full product spec, sprint prompts, brand guidelines, and locked database schema live in [`../mise-build/`](../mise-build/). Read `../mise-build/START_HERE.md` before changing anything substantive.

## Tech stack

Next.js 14 (App Router) · TypeScript · Tailwind CSS · shadcn/ui · Supabase (Postgres + Auth + Realtime) · Vercel · Serwist (PWA) · Dexie (offline) · Resend · PostHog · Sentry

## Prerequisites

- Node 20+
- pnpm 9+
- [Supabase CLI](https://supabase.com/docs/guides/cli) (`brew install supabase/tap/supabase`)
- [Vercel CLI](https://vercel.com/docs/cli) (`pnpm add -g vercel`)
- A Supabase project, Resend account, PostHog project, and Sentry project

## Setup

```bash
# 1. Install dependencies
pnpm install

# 2. Create local env, then fill values from each service dashboard
cp .env.example .env.local

# 3. Link the local Supabase project to your remote
supabase login
supabase link --project-ref <YOUR_PROJECT_REF>

# 4. Apply the schema
supabase db push --linked

# 5. Generate TypeScript types from the database
supabase gen types typescript --linked > src/types/database.ts

# 6. Run the dev server
pnpm dev
```

Open http://localhost:3000.

## Environment variables

See [`.env.example`](.env.example) for the full list. The non-negotiable values are:

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`, `RESEND_FROM_EMAIL`
- `NEXT_PUBLIC_POSTHOG_KEY`
- `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN`

## Scripts

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Run the dev server on port 3000 |
| `pnpm build` | Production build |
| `pnpm start` | Start the production server |
| `pnpm lint` | Lint with ESLint |

## Project structure

The folder layout follows [`../mise-build/docs/04-development.md`](../mise-build/docs/04-development.md). Most logic lives in **Server Actions** (`src/app/(*)/actions.ts`). API routes are reserved for `/api/health`, `/api/sync`, and `/api/export`.

## Brand

Daniel's brand applied: forest `#004539`, cream `#FFFDFA`, Cormorant Garamond for display, Inter for UI, JetBrains Mono for counts. See [`../mise-build/branding/BRAND_GUIDELINES.md`](../mise-build/branding/BRAND_GUIDELINES.md) — no emoji in UI strings, sentence case for body copy, warm hospitality voice.

## Sprint order

Branch per sprint. Merge to `main` only after acceptance criteria pass.

| # | Branch | Scope |
| --- | --- | --- |
| 0 | `main` | Infrastructure: repo, Supabase, Vercel, schema, env, design tokens |
| 1 | `feat/auth` | Auth + roles + middleware + RLS verification |
| 2 | `feat/admin-catalog` | Admin: stations + items CRUD + drag + bulk import |
| 3 | `feat/count-flow` | Counter: station picker + count + review + submit (online) |
| 4 | `feat/offline-sync` | Offline sync (Dexie + Serwist + sync engine) |
| 5 | `feat/sessions` | Sessions polish + attribution + audit log writes + realtime |
| 6 | `feat/manager-dashboard` | Manager: dashboard + variance + approve/reject |
| 7 | `feat/observability` | CSV export + PostHog + Sentry + PWA polish |
| 8 | `chore/pilot-prep` | Daniel-specific seed + bug bash + pilot runbook |
| 9–20 | Platform sprints | xtraCHEF parity — see `../mise-build/docs/09-platform-roadmap.md` |

## Platform features (Back office)

The **Back office** section (`/back-office`) implements xtraCHEF parity on mock data:

- Vendors, products, invoices + approval workflow
- Recipe costing + plate margins
- Par-driven orders
- AvT / COGS reports
- Toast POS sync status

Schema extension: `supabase/migrations/0002_platform_extensions.sql`

## License

Private. Do not share, redistribute, or commit Daniel-specific inventory data.
