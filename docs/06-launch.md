# 06 — LAUNCH

## Pre-launch checklist

### Vercel
- [ ] Production project linked to `main` branch
- [ ] Custom domain configured with SSL (e.g. `mise.<your-domain>.com`)
- [ ] All env vars set in Vercel (production scope) — verify `vercel env ls`
- [ ] Preview deployments configured for PR branches
- [ ] Deploy protection on previews if desired
- [ ] Vercel Analytics enabled

### Supabase
- [ ] Production project SEPARATE from staging (do NOT share)
- [ ] All migrations applied: `supabase db push --linked`
- [ ] RLS re-verified on production
- [ ] Daily backups enabled (Pro plan, $25/mo — pay for it)
- [ ] Point-in-time recovery if available on plan
- [ ] Email templates customized: branded subject, from `noreply@<domain>`
- [ ] SMTP via Resend (Supabase default is rate-limited — Resend gives reliability + deliverability)
- [ ] Auth redirect URLs allowlist includes production domain
- [ ] Service role key only in Vercel server env

### Domain + DNS
- [ ] Domain purchased
- [ ] DNS pointing to Vercel
- [ ] HTTPS works, no mixed content warnings
- [ ] `/manifest.json` serves correctly
- [ ] PWA installable on iOS Safari + Android Chrome from production URL

### Monitoring
- [ ] Sentry production project (separate from dev)
- [ ] Release tracking — every deploy creates a Sentry release
- [ ] Sentry alerts: any new error type, error rate > X/min
- [ ] PostHog production project
- [ ] PostHog dashboard: daily active counters, sessions/day, avg session duration, sync error rate
- [ ] Uptime monitoring on `/api/health` (UptimeRobot free tier or BetterStack)
- [ ] Optional: status page (BetterStack free tier)

### Legal + admin
- [ ] Privacy policy page — required for employee data
- [ ] Terms of use page — minimal, acceptable use, no warranty, internal tool disclaimer
- [ ] Decision documented: pre-pilot, Branden is data controller; post-formal-adoption, that flips to Daniel's. Get written agreement before that handover.

### Code + repo
- [ ] All Sprint 0–8 acceptance criteria passed
- [ ] No `TODO` / `FIXME` in critical-path code
- [ ] README updated with production setup
- [ ] LICENSE file (proprietary / all rights reserved for now)
- [ ] `.env.example` matches actual env vars
- [ ] Production build runs locally clean

## Deploy steps

```bash
# 1. Final pre-deploy sanity
pnpm typecheck && pnpm lint && pnpm test
pnpm build

# 2. Verify env vars
vercel env ls production

# 3. Apply pending migrations to production Supabase
supabase db push --linked   # confirm project_ref is production

# 4. Deploy via merge to main
git checkout main && git pull
git merge --no-ff feat/<last-feature>
git push origin main
# Vercel auto-deploys

# 5. Verify
curl https://<prod-domain>/api/health   # expect {"ok":true,"time":"..."}

# 6. Smoke test in production
# - Sign in as test admin
# - Create test station + items
# - Run one full count cycle
# - Approve it
# - Export CSV
# - Sign out
```

## Launch sequence

### Stage 0 — Solo dogfood (Week 0)
- Only Branden has access
- Count one section daily for one week
- Goal: feel every friction point; fix before showing anyone
- **Success:** A real count is faster in Mise than on paper or spreadsheet

### Stage 1 — Trusted pilot (Week 1–2)
- 2–3 people you've already informally discussed this with
- Ideal: Branden + one sous chef curious about tech + one steward
- **Count both ways for two weeks** (parallel-run with spreadsheets)
- Daily check-in
- 24–48h fix cycles
- **Success:** Pilot users prefer the app over old method by end of week 2

### Stage 2 — Section pilot (Week 3–4)
- Roll out to one full section (e.g., entire walk-in 1 operation)
- **Leadership informed before this stage starts.** Bring printed reports comparing app data vs spreadsheets as evidence.
- Continue parallel-running spreadsheets as backup
- **Success:** Section operates fully on app, no data loss incidents, chef references Mise data in ≥1 purchasing decision

### Stage 3 — Full rollout (Week 5+)
- Whole kitchen migrates
- Spreadsheets retired as primary, archived monthly
- **This is when you formalize:** Daniel's free internal tool? License? Pitch to GHG for Miami location? Pitch to other restaurants?

**Gates between stages:** All Blocker + High-severity bugs from prior stage closed before advancing.

## Monitoring

### Daily (5 min, automated where possible)
- Vercel deploy status — any failed overnight?
- Sentry new issues count
- PostHog: sessions submitted yesterday — if zero, something's broken
- Supabase row counts on count_sessions, count_entries (should grow during pilot)
- Uptime monitor: incidents in last 24h?

### Weekly (15 min)
- Sync error rate — should trend down
- Avg session duration — should trend down (people get faster)
- Active counters — match expected pilot population?
- Sentry triage — close noise, file real issues
- Supabase storage + bandwidth (early warning for cost surprises)

### Alerts
- Any new error type fires once → email + (optional) SMS
- Error rate spike > 10/min → SMS
- `/api/health` down > 2 min → SMS
- Supabase usage approaching plan limits → email

## Backup + rollback

### Database backups
- Supabase Pro daily backups, retained 7 days minimum
- Weekly manual `pg_dump` to encrypted local storage (Mac Mini + iCloud or Backblaze)
- Before any schema migration: take a manual backup first

### Rollback procedure

```bash
# Vercel instant rollback to previous deploy
# Via dashboard: Deployments → previous successful → "Promote to Production"
# Or CLI:
vercel rollback <deployment-url>
```

Database rollback (much riskier):
1. **First instinct: don't.** Forward-fix is almost always safer once real data exists.
2. If you must: restore from latest backup to a *new* project, verify data, then swap connection strings.
3. **Never restore over a live production database** without a maintenance window.

### Outage communication plan
- Status page banner: "Mise is experiencing issues. Counts started before X:XX are safe locally on your device. Sync will resume when service is restored."
- Direct message to active pilot users
- Honest postmortem after resolution — even for an internal tool. Sets the tone for scale.
