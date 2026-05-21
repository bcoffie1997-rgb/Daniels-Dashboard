# 04 — DEVELOPMENT

> Full sprint-by-sprint Claude Code prompts live in `prompts/sprint-0-setup.md` through `prompts/sprint-8-pilot-prep.md`. This doc covers the structural pieces: setup commands, folder layout, sprint plan, server actions inventory.

## Project setup (Sprint 0)

Run these in order on the Mac Mini M4. Requires Node 20+, pnpm, Supabase CLI (`brew install supabase/tap/supabase`), Vercel CLI.

```bash
# 1. Scaffold
pnpm create next-app@latest mise --typescript --tailwind --app --src-dir --import-alias "@/*" --use-pnpm
cd mise

# 2. shadcn/ui
pnpm dlx shadcn@latest init    # New York style, Neutral base, CSS variables = yes

# 3. Core deps
pnpm add @supabase/supabase-js @supabase/ssr
pnpm add zod react-hook-form @hookform/resolvers
pnpm add zustand
pnpm add dexie dexie-react-hooks
pnpm add date-fns
pnpm add posthog-js
pnpm add @sentry/nextjs
pnpm add lucide-react
pnpm add sonner
pnpm add @dnd-kit/core @dnd-kit/sortable

# 4. Dev deps
pnpm add -D @types/node prettier prettier-plugin-tailwindcss
pnpm add -D vitest @testing-library/react @testing-library/jest-dom jsdom
pnpm add -D @playwright/test

# 5. shadcn components used by Mise
pnpm dlx shadcn@latest add button input label card badge dialog drawer dropdown-menu select textarea table tabs toast sheet skeleton separator switch sonner

# 6. Supabase
supabase init
supabase login
supabase link --project-ref <YOUR_PROJECT_REF>

# 7. PWA (Serwist)
pnpm add @serwist/next serwist
pnpm add -D @serwist/sw

# 8. Git
git init && git add . && git commit -m "chore: initial scaffold"
gh repo create mise --private --source=. --remote=origin --push
```

## Folder structure

```
mise/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/page.tsx
│   │   ├── (counter)/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx                  Station picker
│   │   │   ├── count/[stationId]/
│   │   │   │   ├── page.tsx
│   │   │   │   └── review/page.tsx
│   │   │   └── sessions/
│   │   │       ├── page.tsx
│   │   │       └── [id]/page.tsx
│   │   ├── (manager)/
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── [sessionId]/page.tsx
│   │   │   │   └── variance/page.tsx
│   │   │   └── export/page.tsx
│   │   ├── (admin)/
│   │   │   ├── layout.tsx
│   │   │   ├── users/page.tsx
│   │   │   ├── stations/page.tsx
│   │   │   ├── items/page.tsx
│   │   │   └── audit/page.tsx
│   │   ├── api/
│   │   │   ├── sync/route.ts
│   │   │   ├── export/route.ts
│   │   │   └── health/route.ts
│   │   ├── auth/callback/route.ts
│   │   ├── offline/page.tsx
│   │   ├── 403/page.tsx
│   │   ├── settings/page.tsx
│   │   ├── layout.tsx
│   │   ├── providers.tsx
│   │   ├── sw.ts                          Serwist service worker
│   │   └── globals.css
│   ├── components/
│   │   ├── ui/                            shadcn primitives
│   │   ├── brand/
│   │   │   ├── brandmark.tsx              Daniel's D
│   │   │   └── wordmark.tsx
│   │   ├── app-shell.tsx
│   │   ├── tab-bar.tsx
│   │   ├── side-nav.tsx
│   │   ├── sync-indicator.tsx
│   │   ├── count/
│   │   │   ├── item-row.tsx
│   │   │   ├── station-card.tsx
│   │   │   ├── numeric-input-drawer.tsx
│   │   │   └── variance-badge.tsx
│   │   ├── manager/
│   │   │   ├── session-table.tsx
│   │   │   └── stat-card.tsx
│   │   └── admin/
│   │       ├── drag-reorder-list.tsx
│   │       └── bulk-import.tsx
│   ├── lib/
│   │   ├── supabase/{client,server,middleware}.ts
│   │   ├── db/{dexie,sync}.ts
│   │   ├── auth/{roles,guard}.ts
│   │   ├── csv.ts
│   │   ├── variance.ts
│   │   ├── utils.ts
│   │   └── posthog.ts
│   ├── stores/{count-store,sync-store}.ts
│   ├── hooks/{use-online-status,use-current-user,use-sync}.ts
│   ├── types/database.ts                  Generated from Supabase
│   ├── middleware.ts
│   └── instrumentation.ts                 Sentry
├── supabase/
│   ├── migrations/
│   │   └── 0001_initial_schema.sql        Copy from schema/ folder
│   └── seed.sql
├── public/
│   ├── icons/                             PWA icons (192, 512, maskable)
│   ├── brand/                             Copy Daniel's SVGs here
│   └── manifest.json
├── .env.example                           Copy from config/ folder
├── .env.local                             gitignored
├── next.config.mjs                        Wrapped with @serwist/next
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## Sprint plan

| # | Branch | Days | Acceptance |
|---|---|---|---|
| 0 | `main` (initial) | 1 | App boots, dark theme renders, schema applied, /api/health returns 200, Sentry + PostHog wired |
| 1 | `feat/auth` | 2 | Magic link works, role guards enforce, /admin/* requires admin, /403 page works |
| 2 | `feat/admin-catalog` | 2 | Stations + items CRUD, drag reorder, bulk import, audit log writes |
| 3 | `feat/count-flow` | 3 | Counter can run a session end-to-end while online |
| 4 | `feat/offline-sync` | 3 | Airplane-mode end-to-end test passes, sync is idempotent |
| 5 | `feat/sessions` | 2 | Attribution everywhere, audit log complete, realtime notifications |
| 6 | `feat/manager-dashboard` | 3 | Dashboard, variance, approve/reject, live updates |
| 7 | `feat/observability` | 2 | CSV export, PostHog events, Sentry alerts, PWA install prompt |
| 8 | `chore/pilot-prep` | 2 | Daniel-specific seed, bug bash on all device matrix, runbook written |

Build order rule: bottom-up. Primitives → atoms → molecules → organisms → layouts → pages.

## Server actions vs API routes

Most logic lives in **Server Actions** (RSC pattern). API routes are only for:

| Route | Method | Purpose | Auth |
|---|---|---|---|
| `/api/health` | GET | Uptime check | public |
| `/api/sync` | POST | Batch sync offline-queued sessions & entries (idempotent via `client_id`) | authenticated |
| `/api/export` | GET | Streaming CSV export | manager+ |

Server actions (in `src/app/(*)/actions.ts`):

| Action | Role |
|---|---|
| `getStations()` | authenticated |
| `startCountSession(stationId)` | counter+ |
| `saveCountEntry(sessionId, itemId, qty)` | session owner |
| `submitCountSession(sessionId, notes?)` | session owner |
| `approveSession(sessionId, notes?)` | manager+ |
| `rejectSession(sessionId, reason)` | manager+ |
| `createItem` / `updateItem` / `archiveItem` / `reorderItems` / `bulkImportItems` | admin |
| `createStation` / `updateStation` / `archiveStation` / `reorderStations` | admin |
| `setUserRole(userId, role)` / `setUserActive(userId, active)` | admin |

Every mutation writes to `audit_log` with action, entity_type, entity_id, payload (before/after).

## Between-sprint discipline

After each sprint:
1. Review every file diff Claude Code touched
2. Run `pnpm typecheck && pnpm lint && pnpm test`
3. Test acceptance criteria manually on actual mobile device
4. Push to GitHub, verify Vercel preview deploys cleanly
5. Merge to main, deploy to staging
6. **Step away from the keyboard for 30 min.** Come back. Read your own commit. Would you ship this?
7. Then start the next sprint in a fresh Claude Code session
