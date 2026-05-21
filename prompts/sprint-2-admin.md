# Sprint 2 — Admin: stations & items CRUD

> Fresh Claude Code session. Branch: `feat/admin-catalog`.

---

You are in the `mise` repo. Sprint 1 is complete: auth, roles, and middleware work.

Reference docs in `../mise-build/`:
- `branding/BRAND_GUIDELINES.md`
- `docs/03-design.md` — admin pages wireframe section
- `docs/04-development.md` — server actions inventory

## TASK
Build admin catalog management — stations, items, users. This is what lets you seed Daniel's actual inventory before pilot.

## DO

1. **`/admin/stations` page:**
   - Table of stations: name, sort_order, active status, last updated, actions
   - "Add station" button opens a `Sheet` (slide-over) with form: name (required), sort_order (auto-suggested as max+1)
   - Edit, archive (soft delete via `active=false`), and reorder via `@dnd-kit` drag handles
   - Drag reorder updates `sort_order` via one Server Action that batch-updates

2. **`/admin/items` page:**
   - Tabs per station across the top (dropdown filter on mobile)
   - Table per station: name, unit, sort_order, par_level (nullable), active, actions
   - "Add item" `Sheet` with form: station (default current), name, unit (select from enum), par_level (optional number), sort_order (auto)
   - Edit / archive / drag-reorder (within station only)
   - **"Bulk import" button** opens a `Sheet`:
     - Textarea where admin pastes CSV: `name,unit,par_level`
     - "Preview" button parses + validates, shows table of what will be inserted, errors highlighted (warm gold)
     - "Import" button inserts all valid rows for the currently selected station

3. **`/admin/users` page:**
   - Table: email, full_name, role, active, created_at
   - Inline `RoleSelect` per row (counter / manager / admin) — Server Action `setUserRole`
   - Toggle active/inactive
   - No "create user" — users self-onboard via magic link, admin promotes them

4. **Server Actions** in `src/app/(admin)/actions.ts`:
   - `createStation`, `updateStation`, `archiveStation`, `reorderStations`
   - `createItem`, `updateItem`, `archiveItem`, `reorderItems`, `bulkImportItems`
   - `setUserRole`, `setUserActive`

5. **Every mutation** writes a row to `audit_log` with action, entity_type, entity_id, payload (before/after where applicable).

6. **All actions** call `revalidatePath` on relevant paths after mutation.

7. **Sort order management:** after any drag-reorder operation, recompute sort_order values as 10, 20, 30, ... to leave gaps for future inserts without renumbering everything.

8. **Forms:** zod validation, inline errors, brand voice ("Required" not "This field is required!", no exclamation marks).

## DO NOT

- Build the audit log viewer (Sprint 7 — it's just writing for now)
- Add anything to the counter flow
- Hard-delete anything

## ACCEPTANCE CRITERIA

- [ ] Admin can create, edit, archive, reorder stations
- [ ] Admin can create, edit, archive, reorder items (within a station)
- [ ] Bulk import accepts pasted CSV, previews, validates, and inserts only valid rows
- [ ] Role change reflects immediately and is enforced — demote yourself, refresh, lose admin access
- [ ] All mutations log to `audit_log` (verify with `SELECT * FROM audit_log ORDER BY created_at DESC LIMIT 10`)
- [ ] Counter or manager visiting `/admin/*` → `/403`
- [ ] Drag reorder feels smooth on mobile (test on actual phone)
- [ ] Admin pages styled per brand: Cormorant page titles, Inter body, no emoji, no exclamation marks

## NOTES

- Soft delete only — never `DELETE FROM`. Historical sessions reference items via `restrict` on foreign key, so deletes would break.
- Test with realistic data volumes — paste 50 items via bulk import and confirm it stays responsive
- When demoting yourself: have a second admin account or be ready to re-promote via Supabase SQL Editor
