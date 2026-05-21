# 10 — Ease-of-Use Audit

**Project:** Mise · Gioia Hospitality
**Status:** Living doc — refresh after each major surface lands
**Last updated:** May 21, 2026

This audit walks the live routes against the standard a 4-week-old counter would set
on day one: *can I get my job done without asking anyone where to click?*

---

## What the routes are today

| Surface | Path | Primary user | Job |
|---|---|---|---|
| Dashboard | `/r/[slug]` | All | Overview, pending counts, drill into anything |
| Inventory | `/r/[slug]/inventory` | Counter, admin | See full catalog by station |
| Reorder | `/r/[slug]/reorder` | Manager, purchaser | Items short of par |
| Recipes | `/r/[slug]/recipes` | Chef, admin | Menu → BOM mapping |
| Recipe detail | `/r/[slug]/recipes/[id]` | Chef | Edit one recipe |
| Menu | `/r/[slug]/menu` | All | Reference the published menu |
| AvT | `/r/[slug]/avt` | Manager, admin | Waste/shrink (v2 placeholder) |
| Integrations | `/r/[slug]/integrations` | Admin | Connect Toast, OCR, Slack, etc. |
| Changelog | `/r/[slug]/changelog` | Admin | Audit log per restaurant |
| Group changelog | `/admin/changelog` | Admin | Audit log across all 3 restaurants |

---

## Top friction points

### F1 · No primary action on the dashboard 🔴 critical
A counter arrives at the dashboard. The most prominent things are KPI tiles and
NavCards. Nothing says "**Start a count.**" The whole purpose of this app for
counters is to count — that should be the loudest button on the page.

**Fix:** Add a primary CTA card at the top of the dashboard:
> "Start a count" → station picker. Disabled with a tooltip if no station is
> assigned to the user yet.

### F2 · Top nav drops major sections once you leave the dashboard 🔴 critical
Top nav currently shows: **Dashboard · Inventory · Menu**. Once on `/inventory`,
you can't reach `/reorder` or `/recipes` without going back. The dashboard works
as a hub-and-spoke, which is fine on day one but becomes friction as features
multiply.

**Fix:** Expand the top nav to include the major sections (Inventory · Reorder ·
Recipes · Menu · AvT). On mobile, surface them as a bottom tab bar.

### F3 · No search 🟠 important
With 100+ items per restaurant, finding a specific item ("where's the
Margaret River Wagyu?") takes scrolling. The search icon in the top-right is
currently a dead button.

**Fix:** Cmd-K palette wired to: items (name + station), recipes, menu dishes.
Keyboard-driven on desktop; long-press on mobile.

### F4 · Last-count info is buried 🟠 important
The "Last approved count" strip sits below 6 NavCards and 4 KPI tiles. A counter
who just walked into the cooler can't immediately answer "when was THIS station
last counted, and by who?"

**Fix:** Per-station last-count row on the inventory page, above each station's
table. Format: *"Walk-in Cooler — Proteins · last counted 4 hours ago by Andres R."*

### F5 · Counter-mode and admin-mode are the same view 🟠 important
A counter doesn't need Integrations, Recipes, AvT, or Changelog. They need: my
station, my count, submit. Showing every surface to every role is the platform
trap we're trying to avoid (looking at xtraCHEF).

**Fix:** Once auth is wired, branch the dashboard by role.
- **Counter:** big "Start a count" + my recent sessions only
- **Manager:** approvals queue + variances + last counts
- **Admin:** everything as today

Until then, surface a "I'm a counter" / "I'm a manager" toggle as a stand-in.

### F6 · Status badges on inventory rows compete for attention 🟡 minor
Each row can show: 2-person badge + status badge (Below par / Reorder / OK).
On mobile width they wrap awkwardly and reduce scannability.

**Fix:** Combine into a single icon column on mobile. Show full badges only at
md+ widths.

### F7 · The restaurant switcher and the breadcrumb both name the restaurant 🟡 minor
On every per-restaurant page the user sees "Fort Lauderdale" in the switcher
*and* "Fort Lauderdale" in the breadcrumb (when present). Redundant.

**Fix:** Drop the restaurant from the breadcrumb when it equals the switcher's
active value. Already done on `/r/[slug]` itself; needs cleanup on sub-routes.

### F8 · No empty states yet 🟡 minor
When inventory has zero items below par, the Reorder page shows a clean
"All stations at par" celebration. Other surfaces (Recipes with 0 defined,
Sessions with 0 history) don't have the same care.

**Fix:** Audit every list page for an empty state. Use the same pattern.

### F9 · No loading skeletons 🟡 minor
Pages render server-side so this is mostly fast, but client navigations on slow
connections will show a flash of nothing. PWA targets walk-ins — slow signal
is the norm.

**Fix:** Add `loading.tsx` files at each route level with skeleton rows.

### F10 · The "Last count" strip says "Branden M. — Mgr" but the data model says he's an admin 🟢 cosmetic
The mock KPI seed has him as `Mgr`. Should be `Admin`.

**Fix:** Update seed text.

---

## What's done well

- **Cormorant + brass + forest** identity is consistent and not generic SaaS
- **Station-first sort order** in inventory matches how cooks walk a cooler
- **Tabular numerics** on counts and KPIs (good for scanning)
- **Brass divider stripes** under headers give per-location color identity without overwhelming
- **Below-par count chip on the inventory page** is the right kind of cross-link
- **Sticky station jump-nav** on inventory works well; copy that pattern to changelog dates

---

## What we'd add for "easy to use" v2

Beyond fixing the friction above:

1. **Bottom tab bar on mobile** — Dashboard / Inventory / Count / More — standard restaurant-app pattern (Toast, 7shifts)
2. **Per-role landing pages** — counter lands on `/count`, manager lands on `/approvals`
3. **Search palette** — Cmd-K everywhere
4. **Quick filters on inventory** — "Below par only" toggle, "2-person only" toggle, category multi-select
5. **One-tap recount** — From the inventory row, swipe-or-tap to start a count of just that item
6. **In-app onboarding** — First-run dot tour for counters (3 screens max)

---

## Implementing now (this commit)

- F1: Primary "Start a count" CTA on dashboard
- F2: Expand top nav with all major sections (desktop)

Filing the rest as a v2 polish backlog. See `docs/competitive-analysis.xlsx`
→ **Software Landscape** sheet for the broader prioritization picture.
