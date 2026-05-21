# 03 — DESIGN

> All visual choices in this doc must align with `branding/BRAND_GUIDELINES.md`. That file is the source of truth for color, type, voice, and visual feel. This doc covers flows, screens, and information architecture.

## Use context

Counters use Mise **standing in a walk-in, holding a phone in one hand, with cold fingers, possibly gloves, in low ambient light**. Every design decision flows from that constraint: big tap targets, high contrast, no hover states, no tiny text, no precious typography in functional areas, no toy interactions.

Managers use Mise on phone AND laptop — admin and dashboard work happens in offices, sometimes at the host stand.

## User flows

### Flow 1 — Counter does a count (critical path)
1. Counter opens PWA → biometric/passcode unlock if returning
2. Lands on **Station Picker** — list of stations they're authorized for
3. Taps a station → "Resume in-progress count" or "Start new count"
4. **Count screen** loads with items in physical walk order
5. Taps an item → OS numeric keypad rises → enters quantity → auto-advances to next item
6. Can swipe back, edit, or skip any item; skipped items flagged warm gold
7. Bottom shows progress ("12 of 47")
8. "Previous: 14 lb" inline under each item for sanity check
9. When done → **Review & Submit** → variance summary, items flagged at >20% swing
10. Submits → confirmation screen → option to start another station or sign out

### Flow 2 — Counter loses signal mid-count
1. Counter walks into walk-in, signal drops
2. UI shows small offline indicator (top right, sage dot)
3. Counts continue normally — saved to IndexedDB
4. Counter walks out, signal returns
5. Sync runs automatically in background; indicator flips to checkmark briefly
6. If sync fails, persistent banner: "3 counts pending sync — tap to retry"

### Flow 3 — Manager reviews + approves
1. Manager logs in → lands on **Dashboard**
2. Sees list of recent sessions, newest first, with status badges
3. Taps a submitted session → full count with variance column highlighted
4. Items with >20% variance shown in warm gold; >50% in terracotta
5. Can tap any item to see count history (last 5 counts)
6. Adds notes, then **Approve** or **Reject with reason**
7. Counter gets email notification if rejected

### Flow 4 — Admin manages catalog
1. Admin → **Settings** → **Stations** or **Items**
2. Add, edit, archive, reorder (drag handle for sort_order = physical walk order)
3. Items screen filters by station, supports bulk import via CSV paste
4. Archive (not delete) — preserves history

### Flow 5 — Export
1. Manager → Dashboard → **Export**
2. Pick date range + stations
3. Get CSV with all count data, attribution, variances

## Page / screen list

```
PUBLIC
/login                          Magic link login (Daniel's brandmark + wordmark)
/auth/callback                  Magic link exchange
/offline                        Offline fallback page
/403                            Insufficient permissions

COUNTER (role: counter, manager, admin)
/                               Station picker (home)
/count/[stationId]              Active count screen
/count/[stationId]/review       Review + submit
/sessions                       My count history
/sessions/[id]                  View past session (read-only)

MANAGER (role: manager, admin)
/dashboard                      All sessions, filterable
/dashboard/[sessionId]          Session detail + approve/reject
/dashboard/variance             Variance report across date range
/export                         CSV export tool

ADMIN (role: admin only)
/admin/users                    User management + role assignment
/admin/stations                 Stations CRUD + reorder
/admin/items                    Items CRUD + bulk import + reorder
/admin/audit                    Audit log viewer

SHARED
/settings                       Profile, notification prefs, sign out
```

## Wireframe descriptions

### Login (`/login`)
- Centered Daniel's brandmark (64px, forest) above the wordmark
- Tagline: *"Inventory for Daniel's"* (Cormorant Garamond, muted)
- Email input + "Send magic link" button (primary forest)
- Cream surface with subtle ornament below tagline
- No clutter

### Station Picker (`/`)
- **Top bar:** Mise wordmark left (small), SyncIndicator center, profile icon right
- **Above the fold:** "Choose a station" headline (Cormorant Garamond display-lg)
- Below: vertical list of StationCards (full-width, ~88px tall):
  - Station name (Inter heading)
  - Caption: "Last counted by [name] · [relative time]" (uppercase tracked)
  - Right chevron
- **Footer:** Tab bar — Home / My Counts / Settings (+ Dashboard if manager+, + Admin if admin)

### Count Screen (`/count/[stationId]`)
- **Sticky header:** Station name in caption style, progress "12 / 47" in mono, SyncIndicator
- **Body:** Vertical list of ItemRow:
  - Left: Item name (Inter 500) + unit (muted) + "Last: 14 lb" (caption muted)
  - Right: tap target — current count in mono, or "—" if uncounted
  - 3px left border: transparent (uncounted), sage (counted), warm gold (skipped)
- **Numeric input drawer:** Slides up; uses OS numeric keypad with `inputmode="decimal"`. Has "Same as last" pre-fill button.
- **Sticky bottom bar:** "Save & Continue Later" (ghost) | "Review & Submit" (primary forest, full-width when enabled)

### Review & Submit (`/count/[stationId]/review`)
- Summary card: items counted, items skipped, time spent (Cormorant display-md headline + Inter body)
- Variance flags section: items >20% off prior count with reason textarea per row
- Notes textarea (session-level, optional)
- Sticky bottom: "Submit Count" (full-width, primary forest, large)

### Manager Dashboard (`/dashboard`)
- **Top:** Filters row — date range, station, counter, status (URL-persisted)
- **Body:** Table on desktop (≥1024px), cards on mobile
  - Columns: Submitted at · Station · Counter · # items · Flagged · Status
  - Default sort: submitted_at desc
  - Row tap → session detail
- **Right rail (desktop only):** "Today" StatCards — sessions today, items counted, flagged items count, avg duration

### Session Detail (`/dashboard/[sessionId]`)
- Header: station, counter, started_at, submitted_at, status badge
- Summary StatCards: items counted, skipped, flagged (>20% variance), duration
- Items table:
  - Item · Counted · Previous · Variance % (VarianceBadge) · Reason
  - Default sort: |variance_pct| desc
  - Tap item → modal with last 5 counts (sparkline + values)
- Manager notes textarea
- Sticky footer: **Approve** (primary forest) | **Reject** (destructive outline, opens dialog requiring reason)

### Admin pages
- Clean tables with shadcn `Table` component, themed per tokens
- Edit/Add uses `Sheet` (slide-over), not modal
- Drag handles on left of rows for sort_order management
- Bulk import: textarea → preview table → confirm

## Visual direction

**See `branding/BRAND_GUIDELINES.md` for full detail.** Summary:

- **Palette:** Daniel's forest `#004539` + cream `#FFFDFA` + dark forest-tinted background `#0E1B17`
- **Type:** Cormorant Garamond (display) + Inter (UI) + JetBrains Mono (numbers)
- **Aesthetic:** Refined, warm hospitality. NOT industrial, NOT generic SaaS. "Upscale country club" with operational clarity.
- **Ornaments:** Use sparingly — login, empty states, success confirmations only

## Component inventory

```
Layout
- AppShell                  Header + tab bar + content
- PageHeader                Title (Cormorant), action slot, optional breadcrumb
- TabBar                    Mobile bottom nav (role-aware)
- SideNav                   Desktop side nav (≥1024px)
- SyncIndicator             Offline / syncing / synced states

Forms
- TextField, TextArea, Select, MultiSelect
- DateRangePicker
- NumericInputDrawer        Drawer wrapper around OS keypad input

Data
- StationCard               Station picker tile
- ItemRow                   Count screen row
- SessionCard / SessionRow  Dashboard list item (responsive)
- VarianceBadge             Forest/gold/terracotta with % in mono
- StatusBadge               in_progress, submitted, approved, rejected
- StatCard                  Dashboard tiles

Feedback
- Toast (sonner)
- ConfirmDialog
- EmptyState                Brandmark + Cormorant headline + body
- Skeleton

Tables
- DataTable                 Sortable, filterable, mobile→card
- DragReorderList           Admin reorder

Admin
- BulkImportPaste           Textarea → preview → confirm
- RoleSelect                Inline role assignment
```

All built on shadcn/ui primitives. Customize tokens, don't fight the library.

## Mobile-first considerations

- Design at **375px width** baseline (iPhone SE / mini)
- Bottom tab bar mobile, side nav desktop (≥1024px)
- Thumb-zone awareness: primary actions in bottom 40% of viewport
- All text inputs use `inputmode="decimal"` for numeric
- Pull-to-refresh on dashboard / sessions list
- Sticky headers wherever counting happens
- Manager dashboard table collapses to vertical cards under 768px
- PWA install prompt after second successful count
- Lock orientation to portrait for counting screens; allow landscape on dashboard
- Touch targets 48px min, 56px preferred — cold fingers, possibly gloves
