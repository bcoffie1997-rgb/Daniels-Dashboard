# Sprint 0 — Setup & infrastructure

> Paste this entire file into Claude Code as a single prompt. Run in a fresh session.

---

You are working in the `mise` repo, a Next.js 14 App Router PWA with TypeScript, Tailwind, shadcn/ui, and Supabase. The project is freshly scaffolded.

Read these files in the parent `mise-build/` folder before starting:
- `START_HERE.md`
- `branding/BRAND_GUIDELINES.md`
- `docs/02-requirements.md`
- `docs/04-development.md`
- `schema/0001_initial_schema.sql`
- `branding/colors/tokens.css`
- `config/.env.example`

## TASK
Wire up the foundational infrastructure for Mise.

## DO

1. **Supabase clients** in `src/lib/supabase/`:
   - `client.ts` — browser client using `@supabase/ssr` `createBrowserClient`
   - `server.ts` — server client using `createServerClient` with `cookies()`
   - `middleware.ts` — session refresh helper

2. **`src/middleware.ts`** that calls the session refresh on every non-static request.

3. **Apply the SQL migration** at `mise-build/schema/0001_initial_schema.sql`:
   - Copy it to `supabase/migrations/0001_initial_schema.sql`
   - Apply with `supabase db push --linked`
   - **Do not modify the SQL.** Read it but do not change it.

4. **Generate TypeScript types** from the Supabase schema into `src/types/database.ts`:
   ```bash
   supabase gen types typescript --linked > src/types/database.ts
   ```

5. **Sentry** via `@sentry/nextjs`:
   - Create `src/instrumentation.ts` and the standard `sentry.{server,client,edge}.config.ts`
   - DSN from env

6. **PostHog provider**:
   - `src/lib/posthog.ts` — browser init
   - Wrap app in `PostHogProvider` client component in `src/app/providers.tsx`

7. **Serwist for PWA**:
   - Wrap `next.config.mjs` with `@serwist/next`
   - `src/app/sw.ts` — basic NetworkFirst for app shell, CacheFirst for static
   - `public/manifest.json`: `{ "name": "Mise — Daniel's Inventory", "short_name": "Mise", "theme_color": "#004539", "background_color": "#0E1B17", "display": "standalone", icons referencing `/icons/192.png`, `/icons/512.png` (placeholders are fine — user will add real ones later) }`

8. **Brand assets**:
   - Copy SVGs from `mise-build/branding/logos/` into `public/brand/`
   - Create `src/components/brand/brandmark.tsx` — React component rendering the Daniel's brandmark SVG inline, accepting `size`, `className`, and `color` props (default forest `#004539`, but accept `cream` for dark backgrounds)
   - Create `src/components/brand/wordmark.tsx` — same pattern for the wordmark

9. **Dark theme by default**: set `<html lang="en" className="dark">` in `app/layout.tsx`. Tailwind dark mode = "class".

10. **`globals.css`**: copy the contents of `mise-build/branding/colors/tokens.css` into `src/app/globals.css` under the `@tailwind` directives.

11. **`tailwind.config.ts`**: add the `extend` block from the comment at the bottom of `tokens.css`:
    - `colors.daniels.forest`, `colors.daniels.cream`
    - `fontFamily.display`, `fontFamily.sans`, `fontFamily.mono`
    - `fontSize.display-*` scale

12. **Fonts** via `next/font/google` in `app/layout.tsx`:
    - **Cormorant Garamond** (weights 400, 600) as `--font-cormorant` / `font-display`
    - **Inter** (weights 400, 500, 600) as `--font-inter` / `font-sans` (default)
    - **JetBrains Mono** (weights 400, 500) as `--font-jetbrains-mono` / `font-mono`

13. **`/api/health` route** returning `{ ok: true, time: <iso> }` for uptime checks.

14. **Root page** `app/page.tsx` (temporary): render a centered brandmark + Cormorant headline "Mise" + body text "Coming soon" — proves brand, fonts, and tokens all work end-to-end. This will be replaced in Sprint 1.

15. **README.md**:
    - Project description (one paragraph)
    - Prerequisites (Node 20+, pnpm, Supabase CLI, Vercel CLI)
    - Setup commands
    - Env vars list (point to `.env.example`)
    - Reference to `../mise-build/` for full spec

## DO NOT

- Build any pages beyond `/`, `/api/health`, and `app/layout.tsx`
- Build auth UI (Sprint 1)
- Touch the SQL migration after copying it

## ACCEPTANCE CRITERIA

- [ ] `pnpm dev` runs without errors
- [ ] `pnpm build` succeeds
- [ ] `/api/health` returns 200 with JSON
- [ ] Sentry DSN loaded from env; deliberate test error in dev hits Sentry
- [ ] PostHog identify call fires once on app load (Network tab)
- [ ] Dark theme renders by default — page background is `#0E1B17`
- [ ] Brandmark renders correctly on root page (forest on dark background = needs to be cream variant)
- [ ] Cormorant Garamond renders for "Mise" headline
- [ ] `/manifest.json` served at production URL
- [ ] Supabase generated types compile
- [ ] All migrations applied — verify in Supabase Studio that tables exist with RLS enabled

## ASK BEFORE PROCEEDING IF

- Supabase project ref isn't in `.env.local`
- Any npm package conflicts
- Serwist setup specifics are unclear
- You're tempted to "improve" the SQL — don't; ask first

## NOTES

- After Sprint 0, **manually promote yourself to admin** in Supabase Studio:
  ```sql
  update public.users set role = 'admin' where email = '<your-email>';
  ```
  (You'll have a row after the first time you sign in via magic link in Sprint 1.)
