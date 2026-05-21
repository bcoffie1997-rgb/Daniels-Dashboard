# 07 — POST-LAUNCH

## Week 1 monitoring

**Every morning (10 min):**
- Open Sentry → triage anything new
- Open PostHog → check yesterday's session count, sync error count
- Open Supabase logs → scan for unusual query patterns
- Open feedback channel → respond to anything overnight

**Every evening (5 min):**
- Any pending counts that didn't sync? Investigate.
- Did all expected counters submit at least one session today? If not, why — friction or schedule?

**Daily self-standup:**
- What broke today?
- What was confusing today?
- What's one small thing to ship tomorrow that makes this better?

## Feedback collection

Three channels, in order of preference:

1. **In-app feedback button** (build in Week 1 if not already): floating button on every page → opens Sheet → "What's not working?" textarea → submits to a `feedback` table tagged with user, page, timestamp, viewport
2. **Dedicated Slack channel or group iMessage** for pilot users — low friction, async
3. **Weekly 10-min in-person check-ins** during Stages 1 and 2. People say things in conversation they'd never type.

**Anti-pattern:** Surveys. People don't fill them out and you'll over-interpret the few responses.

## Iteration cadence

- **Week 1–2:** 24–48h fix cycles
- **Week 3–4:** Daily releases as needed; group non-critical changes
- **Week 5+:** Weekly release cadence. **Friday deploys banned** — Tuesday or Wednesday only.
- **Month 2+:** 2-week sprints

Each sprint:
- Mon: review last sprint's data + feedback, pick 3 things to ship
- Mon–Thu: build
- Fri: no deploys, just observation
- Following Mon: review and start next sprint

## Metrics dashboard

Build in PostHog or as a simple `/admin/metrics` page. Weekly snapshot.

### Health metrics (lagging — is the app alive?)
- Daily active counters
- Sessions submitted per day
- % of expected sessions that actually happened
- Sync error rate (errors / total syncs)
- Uptime %

### Engagement metrics (leading — is it actually being used well?)
- Avg session duration (target: trending down)
- % of sessions submitted within 24h of starting (target: >90%)
- % of sessions approved without rejection
- Manager approval lag (submit → approve, target: <24h)

### Business metrics (the real test)
- Time-to-decision: from "we need to count" to "we have data we trust" — was 3 days with spreadsheets, target <1 day with Mise
- % of purchasing decisions referencing Mise data (qualitative — ask Chef de Cuisine monthly)
- Inventory variance trends — are chronic outlier items getting addressed?

## V2 backlog (priority order)

1. **POS integration (Toast first)** — pull sales data, compute theoretical vs. actual usage, surface waste. The original vision; you've earned the right to ask now.
2. **Par level alerts** — once you have 4+ weeks of count history, suggest reorder triggers
3. **Photo uploads on counts** — damaged items, ambiguous counts, vendor disputes
4. **Custom numeric keypad** — replace OS keypad if counters complain (they likely will)
5. **Recipe costing** — link items → dishes → menu prices. Heavy lift, high value.
6. **Invoice scanning / OCR** — receive deliveries faster, update on-hand without manual entry
7. **Vendor management** — order history per vendor, lead times, contact info
8. **Multi-location** — Daniel's Miami expansion, then other GHG properties
9. **Native mobile app** — only if PWA limits actually bite
10. **Audit log viewer UX improvements**
11. **Light mode** — managers in daylight offices
12. **Wine cellar deep features** — vintages, bin locations, depletion by SKU (likely needs Daniel Bishop's input)
13. **Bar deep features** — pour cost, spill tracking, bottle-level depletion
14. **Cost data + dollar variance** — variance reports become real money conversations
15. **Two-person count verification** — for high-value items (caviar, truffles, expensive wines), require a second confirming count

## Sunset criteria (decide now, before sunk cost takes over)

Kill or pivot Mise if any of these become true:

- **Adoption fails:** By day 90, fewer than 50% of expected weekly counts happen in the app
- **Trust fails:** Chef stops referencing the data for purchasing decisions for 4 consecutive weeks
- **Builder access lost:** Branden leaves Daniel's without a successor maintainer and no clear second venue interested
- **Cost outweighs value:** Supabase + Vercel + monitoring + Branden's time exceeds the value (case study, pitch credibility, or revenue from SaaS pivot)
- **Competitor ships it better:** xtraCHEF or MarketMan launches a fine-dining-optimized product at 90% of Mise's capability at a price you can't match. Be honest if this happens.

### Pivot triggers (not kills)
- Pilot works but Daniel's won't pay → SaaS for independent fine-dining
- Counters love it, managers don't → re-investigate manager workflow before scaling
- POS integration unlocks 10x value → that becomes the core product, counting becomes a feature
- GHG (Gioia Hospitality Group) wants it at Miami location → expand within group before going external

## First iteration sprint (ships within 14 days of Stage 1)

Three rules:
1. Ship at least one thing that came directly from a pilot user's feedback. **Name them in the changelog.** Goodwill matters.
2. Fix the single biggest friction point observed in Week 1.
3. Resist the urge to add features. **Polish > scope, every time, in the first 30 days.**

Sprint contents will be determined by what you actually observe. But pre-commit to the cadence: first post-launch sprint ships within 14 days of Stage 1 pilot start. **Put it on the calendar now.**
