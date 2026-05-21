# 09 — PLATFORM ROADMAP (xtraCHEF parity)

**Goal:** Match and beat xtraCHEF for Daniel's — kitchen-first UX with full back-office capability.  
**Strategy:** Ship MVP first (Sprints 0–8), then layer platform features without breaking counting.

Daniel's uses **Toast POS**. Toast integration is the bridge that makes AvT and recipe costing possible.

---

## Build phases

| Phase | Sprints | Outcome | xtraCHEF equivalent |
|---|---|---|---|
| **A — Counting wedge** | 0–8 | Phone-first counting pilots at Daniel's | Inventory (Pro) — but better UX |
| **B — Products & vendors** | 9–10 | Catalog with costs, vendor hub | Products + Vendor Hub |
| **C — Invoices & AP** | 11–12 | Upload/scan invoices, approve, price updates | Essentials + Approvals |
| **D — Recipes & costing** | 13–14 | Recipes linked to menu, plate costs | Recipe Costing (Pro) |
| **E — Toast & AvT** | 15–16 | Sales sync, theoretical vs. actual | Inventory Analytics (Pro) |
| **F — Orders & alerts** | 17–18 | Par alerts, order guides, need-to-order | Order Management (Pro) |
| **G — Reporting** | 19–20 | COGS, dollar variance, depletion reports | Reporting + AvT dashboards |

**Realistic calendar:** Phase A ~5–6 weeks. Full parity ~4–5 months after MVP ships.

---

## Feature parity checklist

### Essentials tier (~$149/mo xtraCHEF)

| Feature | Mise sprint | Status |
|---|---|---|
| Vendor hub (contacts, account #) | 9 | Planned |
| Invoice upload (photo/PDF) | 11 | Planned |
| Invoice OCR / line extraction | 11–12 | Planned (start manual + AI assist) |
| Invoice approval workflow | 12 | Planned |
| Price tracking from invoices | 11 | Planned |
| Accounting export (CSV → QB) | 20 | Planned (CSV first) |

### Pro tier (~$349/mo xtraCHEF)

| Feature | Mise sprint | Status |
|---|---|---|
| Mobile inventory counting | 0–8 | MVP |
| Inventory areas / stations | 2 | MVP |
| Par levels | 2 (field), 17 (alerts) | Partial |
| Scheduled count lists | 5 | MVP (sessions) |
| Recipe costing | 13–14 | Planned |
| Plate cost / margin | 14 | Planned |
| Actual vs. theoretical (AvT) | 15–16 | Planned |
| Inventory depletion analytics | 16 | Planned |
| Waste / shrinkage flags | 16 | Planned |
| Order management | 17–18 | Planned |
| COGS / GL-style reports | 19–20 | Planned |
| Toast POS native sync | 15 | Planned |

### Where Mise stays different (don't copy xtraCHEF)

- Offline-first walk-in counting (Sprint 4)
- Count session approve/reject (Sprint 6) — not just invoice approval
- Physical walk order (Sprint 2)
- PWA, no app store
- Daniel's brand + operator-built UX

---

## Extended data model (Sprint 9+)

See `schema/0002_platform_extensions.sql`. New entities:

```
locations          (future multi-tenant; single row for Daniel's FT L)
vendors            (Sysco, US Foods, …)
products           (purchasable SKU — ties invoices to count items)
product_vendors    (vendor SKU, pack size, last price)
items.product_id   (optional link: count item → product for $ variance)

invoices           (upload, OCR status, approval)
invoice_lines      (extracted line items → products)
invoice_approvals  (approve/reject/assign — mirrors xtraCHEF AP flow)

recipes            (name, yield, linked Toast menu item)
recipe_lines       (product/item + qty per recipe)

menu_items         (Toast GUID sync)
sales_daily        (menu_item_id, date, qty_sold — from Toast API)

orders             (vendor PO draft/submitted)
order_lines        (product, qty, par-driven suggestions)
```

MVP tables (`users`, `stations`, `items`, `count_sessions`, `count_entries`, `audit_log`) are **unchanged** in 0001.

---

## Sprint detail (platform)

### Sprint 9 — Products & vendors
- Admin: vendor CRUD
- Products table + link items to products
- Last-known cost from manual entry (before invoices)
- **Acceptance:** Admin can add Sysco as vendor, create "NY Strip 16oz" product, link to walk-in count item

### Sprint 10 — Vendor products & pricing
- `product_vendors`: pack sizes, SKU, unit conversion
- Price history table
- **Acceptance:** One product, two vendors, different pack/price; count item shows last cost

### Sprint 11 — Invoice intake
- Upload PDF/image to Supabase Storage
- Manual line entry UI (OCR stub/API hook for later)
- Invoice status: `draft → pending_review → approved → rejected`
- **Acceptance:** Bookkeeper uploads Sysco invoice, maps lines to products, prices update

### Sprint 12 — Invoice approvals
- Approval rules (amount threshold, vendor)
- Manager/mobile approve reject (like xtraCHEF Approvals tab)
- Email notification via Resend
- **Acceptance:** Invoice >$5k requires manager approval before prices apply

### Sprint 13 — Recipes
- Recipe CRUD, link ingredients to products
- Yield, prep loss %
- **Acceptance:** Admin builds "Filet Mignon" recipe with butter, protein, sauce components

### Sprint 14 — Recipe costing
- Plate cost from product prices
- Menu price → margin %
- Link recipe to `menu_items`
- **Acceptance:** Chef sees plate cost update when invoice prices change

### Sprint 15 — Toast integration
- Toast API: pull menu items + daily sales
- OAuth or API key (Daniel's Toast admin required)
- Nightly sync job (Vercel cron)
- **Acceptance:** Yesterday's filet sales appear in Mise

### Sprint 16 — Actual vs. theoretical
- Theoretical usage = recipes × sales
- Actual = count delta + purchases − waste
- Variance report by product/category
- **Acceptance:** "Filet: sold 42, theoretical 38 lbs used, counted 35 — 3 lb variance"

### Sprint 17 — Par levels & alerts
- Par alerts from count history (4+ weeks)
- Below-par flags on count submit
- **Acceptance:** Manager sees "12 items below par" after count

### Sprint 18 — Order management
- Order guide from par + on-hand
- Draft PO per vendor
- Export CSV or email to vendor (no EDI v1)
- **Acceptance:** Steward generates Sysco order from count session

### Sprint 19 — COGS reporting
- Beginning / ending inventory $ 
- Purchases from approved invoices
- COGS by category, period
- **Acceptance:** Monthly COGS report matches spreadsheet within 5%

### Sprint 20 — Dashboard & accounting export
- Manager P&L-style dashboard
- GL code mapping on products (optional)
- QuickBooks CSV export
- **Acceptance:** Accountant imports Mise export into QB

---

## Third-party additions (platform phase)

| Service | Purpose | Sprint |
|---|---|---|
| **Toast API** | Menu + sales sync | 15 |
| **Supabase Storage** | Invoice PDFs/images | 11 |
| **OpenAI / Anthropic vision** | Invoice OCR (optional) | 11–12 |
| **Vercel Cron** | Nightly Toast sync | 15 |
| **Resend** | Invoice approval emails | 12 |

---

## Risk: scope creep

**Rule:** Phase A (Sprints 0–8) ships and pilots **before** Phase B starts. Counting adoption is the gate — same as original strategy.

If leadership asks "why not xtraCHEF?" during Phase A:
> Mise counting works offline and cooks actually use it. Platform features land in Phase B–G; Toast sync in Sprint 15 closes the AvT gap.

---

## Updated sunset / pivot (platform)

**New pivot trigger:** Phase A succeeds → invest in Phase B–G instead of paying xtraCHEF Pro ($349/mo).

**New kill trigger:** Phase B invoice OCR takes >6 weeks with no bookkeeper adoption → keep counting-only product.
