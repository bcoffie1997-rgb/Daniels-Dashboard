# 02 — REQUIREMENTS

## MVP feature list (locked — 7 features)

1. **Auth + roles** — Email magic-link login. Three roles: Counter, Manager, Admin. Hierarchy: admin > manager > counter (admin satisfies all checks).
2. **Item catalog** — Pre-loaded list of inventory items organized by station (Walk-in 1, Walk-in 2, Dry Storage, Bar, Wine Cellar, etc.) with unit of measure.
3. **Mobile-first count flow** — Pick station → see items in physical walk order → tap to enter quantity. One-handed, fast, offline-capable.
4. **Count attribution + history** — Every count row stamped with user, timestamp, station, device. Full audit log.
5. **Count sessions** — A session groups one person's counts of one station at one time. Status: in_progress → submitted → approved / rejected.
6. **Manager dashboard** — All sessions, variance from previous count, who counted what, flag anomalies, approve/reject.
7. **CSV export** — One-click export of any session or date range. Slots into existing spreadsheet workflows during transition.

## User stories

**Counter:**
- *I want to open the app at a station and see only the items at that station in physical-walk order, so I can count without scrolling or thinking.*
- *I want my count to save even if the walk-in has bad signal, so I never lose work.*
- *I want to see what the previous count was for each item, so I can sanity-check my number before submitting.*

**Manager:**
- *I want to see who counted what and when, so I can follow up on outliers.*
- *I want to see variance vs. last count, so I can spot waste, theft, or miscounts immediately.*

**Admin:**
- *I want to add/edit items and stations without a developer, so the catalog stays current as menus change seasonally.*

**Anyone:**
- *I want to export to CSV, so existing chef/purchasing workflows aren't disrupted on day one.*

## Out of scope (do NOT build for MVP)

- POS / Toast integration (v2 — earned access after pilot succeeds)
- Invoice scanning / OCR
- Automatic purchase order generation
- Recipe costing / theoretical vs. actual
- Vendor management
- Par level alerts (v2 — needs 4+ weeks of count history first)
- Multi-location (Daniel's Fort Lauderdale only; Miami location is v3+)
- Barcode scanning (fine-dining inventory is rarely barcoded)
- Photo uploads on counts
- Native iOS/Android apps — PWA only
- Wine cellar deep features (vintages, bin locations, depletion) — wine is flat items for MVP
- Bar pour-cost tracking

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI components | shadcn/ui (New York style, Neutral base — to be themed per brand guidelines) |
| Backend | Supabase (Postgres + Auth + Storage + Realtime) |
| Auth | Supabase magic link via Resend SMTP |
| Hosting | Vercel |
| Email | Resend (via Supabase SMTP config) |
| PWA | Serwist (modern next-pwa successor) |
| Offline DB | Dexie (IndexedDB wrapper) |
| State | Zustand + React Server Components |
| Forms | react-hook-form + zod |
| Analytics | PostHog |
| Errors | Sentry |
| Drag/drop | @dnd-kit |
| Repo | GitHub (private) |

**Non-negotiable flags:**
- PWA only, no native
- Offline support day one
- RLS at DB level on every table
- OS numeric keypad (not custom) for v1
- Dark theme default, applying Daniel's brand (forest + cream — see `branding/BRAND_GUIDELINES.md`)

## Data model

```
users          (id, email, full_name, role, active, created_at, updated_at)
                  role ∈ {counter, manager, admin}

stations       (id, name, sort_order, active, created_at, updated_at)
                  e.g., "Walk-in 1 - Proteins", "Bar - Spirits"

items          (id, station_id, name, unit, sort_order, par_level, active)
                  unit ∈ {lb, oz, each, bottle, case, gal, qt, l, ml, kg, g}
                  sort_order = physical walk order at the station

count_sessions (id, user_id, station_id, status, started_at, submitted_at,
                approved_at, approved_by, rejection_reason, notes, client_id)
                  status ∈ {in_progress, submitted, approved, rejected}
                  client_id = idempotency key from client (UUID)

count_entries  (id, session_id, item_id, quantity, previous_quantity,
                variance_pct, entered_at, device_id)
                  unique(session_id, item_id)

audit_log      (id, user_id, action, entity_type, entity_id, payload, created_at)
```

Full SQL with RLS policies in `schema/0001_initial_schema.sql`.

**Variance is computed at submit time** and stored on `count_entries.variance_pct`. Historical reports do not drift if pars change later.

## Third-party services

- **Supabase** — Postgres, Auth, Storage, Realtime (for manager dashboard live updates)
- **Vercel** — hosting + analytics + log drain
- **Resend** — magic-link email + manager notifications
- **PostHog** — count time per station, drop-off, errors
- **Sentry** — error monitoring (critical because users are in walk-ins; visible failures matter)

## Timeline

| Sprint | Scope | Build days |
|---|---|---|
| 0 | Setup, env, Supabase, schema, Vercel | 1 |
| 1 | Auth + roles + middleware + RLS verification | 2 |
| 2 | Admin: stations + items CRUD + drag + bulk import | 2 |
| 3 | Counter flow online: picker + count + review + submit | 3 |
| 4 | Offline sync (Dexie + Serwist + sync engine) | 3 |
| 5 | Sessions, attribution, audit log writes, realtime | 2 |
| 6 | Manager dashboard + variance + approve/reject | 3 |
| 7 | CSV export + PostHog + Sentry + PWA polish | 2 |
| 8 | Daniel-specific seed + bug bash + pilot runbook | 2 |
| **Total** | | **~20 build days** |

Realistic calendar: 5–6 weeks at evenings/weekends. 2–3 weeks heads-down full-time.

## Risk flags

1. **Offline sync is the hardest piece.** Walk-ins kill signal. Sprint 4 must be tested in actual walk-ins before merging.
2. **Political risk at Daniel's.** Counting is a controlled process. Tell direct chef early — frame as personal project to offer, not impose. Goodwill matters more than the code.
3. **Catalog drift.** Daniel's menu changes seasonally; items appear and disappear. Admin UX for adding items must be genuinely easy.
4. **Data sensitivity.** Inventory data reveals food costs, purchasing patterns, possibly waste. Confidential from day one. RLS, no payload logging, no public screenshots.
5. **Builder access loss.** Build assuming Branden could lose Daniel's access tomorrow — no hardcoding, clean export.
6. **Gioia Hospitality Group context.** Daniel's is part of GHG. If Mise gains traction at the Fort Lauderdale location, GHG (and the Miami location) may want it. Build the data model with multi-location in mind even though MVP is single-location — at minimum, don't make station/item names globally unique in a way that blocks future multi-tenancy.
