# 08 — COMPETITIVE ANALYSIS

**Project:** Mise — kitchen-first inventory counting for fine dining  
**Last updated:** May 21, 2026  
**Status:** Living doc — expand as we learn more from demos, pilots, and user interviews

**Daniel's POS:** Toast (confirmed). **Primary competitor = xtraCHEF**, not MarketMan or R365.

---

## Positioning reminder

Mise is **not** trying to be MarketMan or R365. The pitch is:

> **The Linear of restaurant inventory, not the SAP.**  
> Phone-first counting for line cooks in walk-ins — fast, attributed, offline — with manager approval and variance. Everything else is earned after the pilot works.

---

## Competitors researched

| Tier | Tool | Who it's for | Price signal |
|---|---|---|---|
| **Current state** | Spreadsheets | Everyone | Free |
| **Enterprise platform** | MarketMan | Chains, multi-unit ops | $$$, full platform |
| **Enterprise platform** | Restaurant365 (R365) | Mid-to-large groups | $$$, ERP-style |
| **Enterprise platform** | CrunchTime | Chains, franchises | $$$, ops suite |
| **Enterprise platform** | Apicbase | 50–500+ locations, central kitchens | $$$, enterprise |
| **POS-locked** | xtraCHEF (Toast) | Toast customers | Bundled with Toast Pro |
| **Accounting-first** | MarginEdge | Owners/accounting teams | $$, invoice + P&L focus |
| **Bar/beverage heavy** | WISK | Bars, high-volume beverage | $$, scan/scale/POS |
| **Newer / indie** | Rinvy | Independent restaurants | Unknown (new, 2025) |
| **Newer / indie** | Quanty | Small teams | Unknown |
| **Newer / indie** | inventory.app | SMB restaurants | Lower-cost indie |
| **Us** | **Mise** | Fine dining, single-location pilot | Internal tool → SaaS option |

---

## Feature matrix

Legend: ✅ Has · ⚠️ Partial / limited · ❌ No · 🔜 Mise v2+ · — Not applicable

| Feature | Mise (MVP) | Spreadsheets | MarketMan | xtraCHEF | MarginEdge | R365 | CrunchTime | WISK | Rinvy |
|---|---|---|---|---|---|---|---|---|---|
| **Mobile counting** | ✅ PWA | ❌ | ✅ Native app | ✅ Native app | ✅ Native app | ✅ Native app | ✅ Native app | ✅ Native app | ✅ iOS/Android/web |
| **Offline counting (walk-ins)** | ✅ Day-one | ✅ (local file) | ✅ Sync on reconnect | ❌ Not documented | ✅ Poor WiFi | ✅ Explicit walk-in support | ✅ Offline mode | ✅ Low-signal areas | ⚠️ Unclear |
| **Station / area-based counts** | ✅ Core UX | ⚠️ Manual tabs | ✅ Shelf-to-sheet | ✅ Inventory areas | ✅ Custom sheets | ✅ Storage locations | ✅ Sequenced sheets | ✅ Areas | ✅ Categories |
| **Physical walk order** | ✅ sort_order | ⚠️ Manual | ✅ | ⚠️ Sub-areas | ✅ | ✅ Reorder items | ✅ | ⚠️ | ⚠️ |
| **One-handed / fast entry** | ✅ Design goal | ❌ | ⚠️ Feature-rich = slower | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ Scan-heavy | ✅ Simplicity focus |
| **Previous count visible while counting** | ✅ | ⚠️ Manual lookup | ✅ | ✅ Summary views | ✅ | ✅ | ✅ Variance on count | ✅ | ⚠️ |
| **Count sessions + workflow** | ✅ submit → approve/reject | ❌ | ✅ | ✅ | ✅ | ✅ Complete → approve | ✅ | ⚠️ | ⚠️ |
| **User attribution (who counted)** | ✅ + audit log | ❌ | ✅ | ✅ Role-based | ✅ | ✅ Multi-user | ✅ | ⚠️ Activity tracking | ✅ Team |
| **Variance vs. last count** | ✅ At submit | ⚠️ Manual formula | ✅ | ✅ % change summary | ✅ Theoretical usage | ✅ Immediate variance | ✅ | ✅ | ✅ AI anomaly flags |
| **Manager approve / reject counts** | ✅ | ❌ | ✅ | ⚠️ Edit only, no reject flow | ⚠️ | ✅ | ✅ | ⚠️ | ⚠️ |
| **Real-time manager visibility** | ✅ Supabase Realtime | ❌ | ✅ | ✅ Cloud sync | ✅ | ✅ Live progress | ✅ Multi-user sync | ✅ | ✅ Collaborative |
| **CSV export** | ✅ | ✅ Native | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ |
| **Admin: edit catalog without dev** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Bulk import catalog** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ⚠️ |
| **Role-based access (3 tiers)** | ✅ counter/manager/admin | ❌ | ✅ | ✅ Toast roles | ✅ | ✅ | ✅ | ✅ | ⚠️ |
| **DB-level security (RLS)** | ✅ Non-negotiable | ❌ | ⚠️ Platform-level | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | Unknown |
| **Audit log on every mutation** | ✅ | ❌ | ⚠️ | ⚠️ | ⚠️ | ✅ | ⚠️ | ⚠️ | Unknown |
| **PWA / no app store** | ✅ | — | ❌ Native | ❌ Native | ❌ Native | ❌ Native | ❌ Native | ❌ Native | ❌ Native |
| **Barcode scanning** | ❌ Out of scope | ❌ | ✅ | ⚠️ | ✅ | ✅ | ✅ Built-in | ✅ Core feature | ❌ |
| **Invoice scan / OCR** | 🔜 v2 | ❌ | ✅ | ✅ Core | ✅ Core | ✅ | ✅ | ✅ | ❌ |
| **POS integration** | 🔜 v2 (Toast) | ❌ | ✅ | ✅ Toast-native | ✅ | ✅ | ✅ | ✅ 60+ POS | ❌ |
| **Recipe costing** | 🔜 v2 | ⚠️ Manual | ✅ | ✅ | ⚠️ | ✅ | ✅ | ✅ | ❌ |
| **Theoretical vs. actual usage** | 🔜 v2 | ❌ | ✅ Perpetual inv. | ✅ | ✅ | ✅ | ✅ | ✅ Pour analysis | ❌ |
| **Par level alerts / reorder** | 🔜 v2 (field exists) | ⚠️ Manual | ✅ | ✅ Below Par | ✅ | ✅ | ✅ Suggested qty | ✅ | ✅ AI suggestions |
| **Vendor / PO management** | 🔜 v2 | ⚠️ Manual | ✅ Core | ✅ | ✅ Order guides | ✅ | ✅ Order placement | ✅ | ❌ |
| **Multi-location** | 🔜 v3 | ⚠️ Separate files | ✅ | ✅ | ✅ | ✅ Core | ✅ | ✅ | ⚠️ |
| **Cost / dollar variance** | 🔜 v2 | ⚠️ Manual | ✅ | ✅ | ✅ Core | ✅ | ✅ | ✅ | ⚠️ |
| **Photo on counts** | 🔜 v2 | ❌ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ❌ |
| **Wine cellar deep (vintage, bins)** | 🔜 v2 | ⚠️ Custom | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ✅ Beverage focus | ❌ |
| **Bar pour cost / bottle depletion** | 🔜 v2 | ❌ | ⚠️ | ⚠️ | ✅ Freepour | ⚠️ | ⚠️ | ✅ Core | ❌ |
| **Voice counting** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ✅ AI voice (2025) | ❌ | ❌ |
| **Bluetooth scale / bottle weighing** | ❌ | ❌ | ⚠️ | ❌ | ✅ Freepour | ⚠️ | ⚠️ | ✅ Core | ❌ |
| **AI anomaly detection** | ❌ (variance only) | ❌ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ✅ Post-count health check |
| **Two-person count verification** | 🔜 v2 | ❌ | ⚠️ | ❌ | ❌ | ⚠️ | ⚠️ | ⚠️ | ❌ |
| **Built for fine-dining UX** | ✅ Explicit goal | ⚠️ | ❌ Chain UX | ❌ Fast-casual | ❌ Accounting UX | ❌ Enterprise UX | ❌ Chain UX | ❌ Bar-first | ⚠️ Generic |
| **Operator-built / kitchen credibility** | ✅ Branden's edge | — | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ⚠️ |

---

## xtraCHEF vs. Mise — the buy vs. build question

Daniel's already on Toast, so leadership will ask: *"Why not just use xtraCHEF?"*  
This is the conversation to be ready for.

### What xtraCHEF is

Toast's back-office suite. Two tiers that matter:

| Tier | ~Price | What you get |
|---|---|---|
| **Essentials** | ~$149/mo | Invoice OCR, price tracking, AP workflow |
| **Pro** | ~$349/mo | Everything above **plus inventory, recipe costing, AvT analytics** |

**Inventory counting requires Pro.** If Daniel's only has Essentials (or nothing), turning on xtraCHEF inventory is a ~$349/mo decision — not "free because we already have Toast."

### Side-by-side: counting experience

| | **Mise** | **xtraCHEF** |
|---|---|---|
| **Built for** | Line cooks counting in walk-ins | Owners/AP teams + inventory as add-on |
| **Setup** | Admin configures stations in-app; walk order by drag | Inventory Areas + Count Lists set up in **web browser first** |
| **Count flow** | Pick station → items in physical order → tap qty → submit | Calendar-scheduled counts → areas → UOM entry → submit |
| **Offline in walk-ins** | ✅ Core requirement (Sprint 4) | ❌ Not documented in Toast support docs |
| **Previous count while counting** | ✅ Per item | ⚠️ Summary views after submit, not counter-first |
| **Manager approval of counts** | ✅ Explicit approve/reject + rejection reason | ⚠️ Submit + edit later; approvals are for **invoices**, not count sessions |
| **Who counted** | ✅ Every row + audit log | ✅ Role-based, less granular |
| **Variance** | ✅ Unit variance at submit | ✅ Beginning/ending value + % change + Below Par |
| **POS integration** | 🔜 v2 (Toast API) | ✅ Native — already connected |
| **Invoice OCR** | 🔜 v2 | ✅ Core feature (Essentials+) |
| **Recipe costing / AvT** | 🔜 v2 | ✅ Pro tier |
| **Cost / dollar variance** | 🔜 v2 | ✅ Tied to invoice pricing |
| **UX fit for fine dining** | ✅ Designed for Daniel's workflow | ❌ Fast-casual / accounting-first (per our strategy) |
| **Cost to Daniel's** | Internal build (~$0 SaaS during pilot) | ~$349/mo for inventory features |

### Where xtraCHEF wins (be honest)

1. **Already in the Toast ecosystem** — one vendor, one login, POS data flows without building an integration.
2. **Invoice OCR + AP** — photograph invoices, auto-extract line items. Owners love this; Mise doesn't have it until v2+.
3. **Actual vs. theoretical (AvT)** — once recipes are mapped, xtraCHEF shows waste/theft/shrinkage vs. what POS says you sold. This is the long-term platform play.
4. **Dollar-denominated reports** — counts tie to invoice prices → COGS, GL codes, P&L. Chef may not care; GM and accounting do.
5. **Toast support + sales relationship** — if something breaks, there's a phone number. Mise has Branden.

### Where Mise wins (the pitch)

1. **Counters will actually use it** — xtraCHEF inventory is an end-of-day accounting activity. Mise is a 10-minute walk-in task designed for gloves-on, one-handed phone use.
2. **Offline is non-negotiable at Daniel's** — walk-ins kill signal. xtraCHEF mobile docs don't promise offline sync. Mise is built around it.
3. **Physical walk order** — items appear in the order you walk the cooler, not a generic area list configured from a desktop.
4. **Count approval workflow** — Chef approves or rejects a session with a reason. xtraCHEF lets you edit a submitted count; it doesn't gate trust the way Daniel's controlled counting process needs.
5. **No $349/mo to try** — pilot cost is hosting (~$25/mo Supabase/Vercel), not a Pro tier upgrade.
6. **Coexists, doesn't replace** — CSV export means chefs keep existing workflows. xtraCHEF wants to own the whole back office.
7. **v2 Toast integration is the bridge** — if Mise counting works and leadership wants AvT, Mise pulls Toast sales data next. You earn the integration after proving counters adopt.

### The one-liner for leadership

> **xtraCHEF is what accounting uses. Mise is what cooks use.**  
> We're not replacing Toast — we're replacing the spreadsheet the line already hates. If the pilot works, we connect to Toast in v2 and get the best of both.

### Questions to ask Daniel's GM / Chef de Cuisine

These determine whether xtraCHEF is already in play:

- [ ] Do we have xtraCHEF at all? Essentials, Pro, or nothing?
- [ ] If Pro — is anyone actually doing inventory counts in it, or still on spreadsheets?
- [ ] Who set up the inventory areas? Was walk order ever configured?
- [ ] Have counters tried the mobile app in a walk-in? What broke?
- [ ] Does accounting use xtraCHEF for invoices separately from kitchen counts?

**Current status:** Unknown — use the discovery guide below.

**If they have Pro and nobody counts in it** → strongest Mise argument (adoption failure, not feature failure).  
**If they don't have xtraCHEF at all** → Mise vs. $349/mo + setup time.  
**If counters use xtraCHEF and like it** → hard pivot; learn what's working before building.

### How to find out (5–10 min, no meeting required)

You don't need permission to *look* — just ask the right person one casual question.

#### Who to ask (in order)

| Person | Ask them | Why they know |
|---|---|---|
| **Office manager / bookkeeper** | "Do we use xtraCHEF for invoices?" | They'd scan/upload vendor invoices if Essentials+ is active |
| **GM** | "Do we pay for xtraCHEF Pro, or just Toast POS?" | Signs the checks, knows the software stack |
| **Chef de Cuisine** | "Does anyone count inventory in xtraCHEF, or still on the spreadsheet?" | Knows what kitchen actually uses |
| **Purchasing / steward** | "Ever used the xtraCHEF app on your phone in the walk-in?" | Ground truth on adoption |

#### Clues you can spot without asking

| If you see this… | Likely means… |
|---|---|
| Vendor invoices photographed or emailed to a system (not filed in a folder) | xtraCHEF Essentials or Pro (invoice OCR) |
| Someone has the **xtraCHEF app** on their phone | At least Essentials |
| **Inventory** tab visible in xtraCHEF web or mobile app | Pro tier |
| Inventory areas named (Walk-In, Dry Storage, Bar) configured in xtraCHEF | Pro, and someone set it up |
| Everyone still counts on **paper/spreadsheet** | Either no xtraCHEF, or Pro exists but kitchen doesn't use it |
| QuickBooks sync mentioned in office | Often paired with xtraCHEF Essentials |

#### How to check yourself (if you have Toast back-office access)

1. Log into **Toast Web** (toasttab.com) with your staff account
2. Look for **xtraCHEF** in the left nav, apps menu, or Toast Central
3. If you can open xtraCHEF: check for an **Inventory** tab — if it exists, you have **Pro**. If only invoices/vendors/reports, you have **Essentials**
4. No xtraCHEF anywhere → **nothing** (POS only)

If your Toast login doesn't show xtraCHEF, that doesn't mean it doesn't exist — accounting may have a separate login. Ask the bookkeeper.

#### The one question that gets you 80% of the answer

> *"When you get a Sysco invoice, does it go into xtraCHEF or just get filed?"*

- **"What's xtraCHEF?"** → Nothing. Strongest Mise case.
- **"Yeah, office scans them"** → At least Essentials. Ask follow-up: *"Does anyone count inventory in there too?"*
- **"We tried inventory in xtraCHEF but still use the spreadsheet"** → Pro exists, adoption failed. This is your pitch in one sentence.

#### What to write down when you find out

```
Daniel's xtraCHEF status (as of ______):
[ ] None — Toast POS only
[ ] Essentials (~$149/mo) — invoices only
[ ] Pro (~$349/mo) — inventory enabled
[ ] Unknown — asked ______, waiting

Kitchen actually counts in xtraCHEF?  [ ] Yes  [ ] No  [ ] Never tried
Who would know for sure: ________________
Notes:
```

Update this section once you have an answer — it changes the pitch script.

---

## What competitors have that Mise does NOT (yet)

These are the biggest gaps to know about — not all are MVP blockers.

### Platform breadth (expected — we chose not to build these)
- **POS sync + theoretical usage** — xtraCHEF already has this at Daniel's (Pro tier). MarketMan, MarginEdge, R365, WISK too. Mise v2 Toast integration closes this gap — and is easier to justify after pilot adoption.
- **Invoice OCR / AP automation** — MarginEdge and xtraCHEF lead here. Chefs don't love these UIs but owners do.
- **Recipe costing + menu engineering** — MarketMan, Apicbase, R365. Heavy, high value, post-pilot.
- **Vendor management + auto POs** — Every enterprise tool. Mise exports CSV and slots into existing workflows instead.
- **Multi-location / commissary** — R365, MarginEdge, Apicbase. Mise is single-location MVP by design.

### Counting mechanics (some competitors lead here)
- **Barcode scanning** — R365, CrunchTime, WISK, MarginEdge. Mise explicitly skips this (fine-dining items rarely barcoded).
- **Bluetooth scale / bottle weighing** — WISK, MarginEdge Freepour. Solves bar accuracy; overkill for protein walk-ins.
- **Voice counting** — CrunchTime (2025). Hands-free in cold storage. Worth watching; not MVP.
- **AI post-count anomaly flags** — Rinvy markets this. Mise has variance % but no ML layer.

### Distribution & trust
- **Native apps in App Store** — All major competitors. Mise is PWA-only (installable, but no store presence).
- **Established sales / support** — Enterprise vendors have onboarding teams. Mise has Branden in the kitchen.
- **Integrations marketplace** — 50–60+ POS/accounting integrations (WISK, Apicbase). Mise has CSV export.

### Reporting depth
- **Dollar-denominated variance** — MarginEdge, xtraCHEF tie counts to invoice prices. Mise MVP is unit variance only; cost data is v2.
- **Food usage / P&L dashboards** — MarginEdge, R365. Accounting-first views chefs find clunky but GMs love.

---

## What Mise has that competitors DON'T (differentiators)

### Core differentiators (MVP)
1. **Kitchen-first, not accounting-first** — Built by someone who works the line, for walk-in counting speed. Competitors optimize for owners, AP, or chains.
2. **Physical walk order as first-class UX** — `sort_order` per station mirrors how Daniel's actually walks the cooler. Enterprise tools have "shelf to sheet" but it's often configured by consultants, not line cooks.
3. **Offline-first PWA, no app store friction** — Install from browser, works in dead zones. No IT approval for App Store apps. Unique among serious competitors (most are native-only).
4. **Count approval workflow built for trust** — Sessions with explicit submit → approve/reject and rejection reasons. xtraCHEF approvals are for invoices, not counts. Spreadsheets have nothing.
5. **Audit log on every mutation + RLS at DB level** — Security model designed for sensitive food-cost data from day one. Most competitors rely on app-layer permissions.
6. **CSV export as coexistence strategy** — Doesn't force a rip-and-replace of chef/purchasing workflows on day one. Enterprise tools want to own the whole stack.
7. **Fine-dining positioning** — Daniel's brand, Michelin-recommended case study, no barcode assumption, wine as flat items for MVP (deep features later with Daniel Bishop).

### Strategic differentiators (not features, but pitch material)
- **Unfair access** — Built inside the kitchen being served, not from a SaaS sales demo.
- **Scope discipline** — 7 locked MVP features vs. 40-feature platforms that overwhelm counters.
- **Portfolio path** — GHG expansion story without building multi-tenant on day one.

---

## Closest competitors to watch

These overlap most with Mise's *counting* wedge, not the full platform play.

| App | Why watch them | Mise advantage | Their advantage |
|---|---|---|---|
| **xtraCHEF (Toast)** | Daniel's POS vendor; "why not just use this?" | Offline, walk order, count approval, counter UX, free pilot | POS native, invoice OCR, AvT, recipe costing, Toast support |
| **Spreadsheets** | The real incumbent today | Accountability, mobile UX, real-time variance, audit trail | Free, infinitely flexible, zero adoption friction |
| **Rinvy** | New, mobile-first, team counting, simplicity narrative | Approval workflow, offline-first, audit/RLS, fine-dining focus | Native apps, AI health checks, already in market |
| **CrunchTime Inventory app** | New unified app (March 2025), offline, multi-user, voice counting | Simpler UX, not chain-priced, operator-built | Voice counting, barcode, invoice scan, enterprise sales |
| **R365 Mobile** | Explicit walk-in/wine cellar offline support | Lighter weight, no ERP baggage, faster to deploy | Full ops platform, barcode, multi-location |

---

## Table stakes (must match or beat)

If Mise fails here, nothing else matters:

| Must-have | Mise status | Notes |
|---|---|---|
| Works offline in walk-ins | ✅ Sprint 4 | Test in actual walk-ins before merge |
| Faster than spreadsheet per station | 🎯 40% reduction goal | Needs stopwatch baseline (see strategy doc) |
| Counter can finish a station without training | 🎯 Design goal | Station picker → count → submit in <3 taps per item |
| Manager sees variance same day | ✅ Realtime dashboard | Approval lag target <24h |
| Admin can update catalog seasonally | ✅ Sprint 2 | Menu changes are a real risk |
| Data doesn't get lost on sync failure | ✅ Idempotency + client_id | Sentry alerts on sync errors |

---

## Research to do next

- [ ] **Confirm xtraCHEF tier at Daniel's:** Essentials vs. Pro vs. none — ask GM (see questions above)
- [ ] **If Pro exists:** Ask 2–3 counters whether they've ever opened xtraCHEF mobile in a walk-in
- [ ] **Demo or trial:** xtraCHEF mobile count flow (if access), Rinvy, CrunchTime Inventory app
- [ ] **Pricing research:** MarketMan, MarginEdge, R365 per-location cost (secondary — xtraCHEF is primary)
- [ ] **Stopwatch baseline:** Time 3 stations on spreadsheets vs. Mise prototype (pitch deck data)
- [ ] **Interview:** Daniel Bishop on wine cellar needs (informs v2 vs. WISK comparison)
- [ ] **Ask pilot users:** "Have you used MarketMan / xtraCHEF / MarginEdge before? What sucked?"

---

## Sources

- Mise spec: `docs/01-strategy.md`, `docs/02-requirements.md`, `docs/BUILD_SPEC.md`, `docs/07-post-launch.md`
- [MarketMan — Perpetual Inventory](https://www.marketman.com/page/perpetual-inventory)
- [xtraCHEF — Mobile Inventory (Toast Support)](https://support.toasttab.com/en/article/xtraCHEF-Mobile-Inventory)
- [xtraCHEF — Inventory Counts](https://support.toasttab.com/en/article/xtraCHEF-Inventory-Counts)
- [xtraCHEF — Inventory Getting Started](https://support.toasttab.com/en/article/xtraCHEF-Inventory-Getting-Started)
- [xtraCHEF — Approvals (invoices, not counts)](https://support.toasttab.com/en/article/xtraCHEF-Approvals)
- [Toast — xtraCHEF product page](https://pos.toasttab.com/products/xtrachef)
- [MarginEdge — Inventory Management](https://www.marginedge.com/inventory-management)
- [Restaurant365 — Mobile Inventory Counts](https://docs.restaurant365.com/docs/mobile-inventory-counts-overview)
- [CrunchTime — New Inventory App (March 2025)](https://www.crunchtime.com/blog/discover-crunchtimes-new-inventory-app)
- [WISK — Restaurant & Bar Inventory](https://www.wisk.ai/features/restaurant-bar-inventory-management-software)
- [Rinvy](https://rinvy.app/)
- [Apicbase — Restaurant Inventory](https://get.apicbase.com/restaurant-inventory-management-software/)
