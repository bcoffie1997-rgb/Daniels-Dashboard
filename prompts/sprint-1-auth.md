# Sprint 1 — Auth, roles, middleware

> Fresh Claude Code session. Branch: `feat/auth`.

---

You are in the `mise` repo. Sprint 0 is complete: Supabase clients wired, schema applied, design tokens in place, brand components ready.

Reference docs in `../mise-build/`:
- `branding/BRAND_GUIDELINES.md` — voice, color, type rules
- `docs/03-design.md` — login screen layout under "Wireframe descriptions"
- `docs/02-requirements.md` — role hierarchy

## TASK
Build email magic-link auth with role-based access, server-side guards, and a working login flow themed per Daniel's brand.

## DO

1. **`/login` page** (`src/app/(auth)/login/page.tsx`):
   - Centered card on `--background`
   - Daniel's brandmark at top (64px, cream variant for dark background)
   - Wordmark below (or text "Daniel's" in Cormorant if wordmark too wide)
   - Tagline in Cormorant `display-md`: *"Welcome"*
   - Body in Inter muted: *"Sign in to Mise to begin a count."*
   - Email input + "Send magic link" button using react-hook-form + zod
   - Submit calls `supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: `${origin}/auth/callback` } })`
   - Success state replaces form: *"Check your email."* with subtext: *"We sent a link to {email}."*
   - Loading + error states per BRAND_GUIDELINES voice (no exclamation marks, warm tone)

2. **`/auth/callback/route.ts`**:
   - Exchanges code for session
   - Redirects to `/` on success
   - Redirects to `/login?error=auth` on failure

3. **`src/lib/auth/roles.ts`**:
   - `getCurrentUser()` — returns user + role from `public.users`, or null
   - `requireRole(role: 'counter' | 'manager' | 'admin')` — server-side guard, redirects to `/login` or `/403`
   - Role hierarchy: admin > manager > counter

4. **Route group layouts:**
   - `src/app/(counter)/layout.tsx` — calls `requireRole('counter')`, renders `AppShell` with `TabBar`
   - `src/app/(manager)/layout.tsx` — `requireRole('manager')`
   - `src/app/(admin)/layout.tsx` — `requireRole('admin')`

5. **`AppShell` component** (`src/components/app-shell.tsx`):
   - Sticky top header
     - Left: small Mise wordmark or "MISE" caption-styled text
     - Center: `SyncIndicator` (placeholder for Sprint 4)
     - Right: profile dropdown
   - Profile dropdown: *"Signed in as {email}"*, role badge (caption style), Settings link, Sign out
   - Bottom `TabBar` mobile (<1024px): Home / My Counts / Settings + Dashboard if manager+ + Admin if admin
   - `SideNav` desktop (≥1024px)

6. **`/settings` page** — read-only display of name, email, role + Sign out button. Use Cormorant for page title, Inter for body. Apply brand voice ("Signed in as ___" not "Hey ___").

7. **`/403` page** — *"You don't have access."* in Cormorant display-lg, with body text and a sign-out link. Apply brand. No emojis.

8. **Middleware** (`src/middleware.ts`):
   - All routes EXCEPT `/login`, `/auth/*`, `/api/health`, `/offline`, and static assets require an active session
   - Without session → redirect to `/login`

9. **Sign out** functionality: clears session, navigates to `/login`.

## DO NOT

- Implement Google OAuth (magic link only for MVP)
- Build station picker or counter screens (Sprint 3)
- Build any admin CRUD (Sprint 2)
- Use emoji in any UI string

## ACCEPTANCE CRITERIA

- [ ] Going to `/` signed out redirects to `/login`
- [ ] Submitting valid email triggers a Resend-delivered magic link
- [ ] Clicking magic link creates session and lands on `/`
- [ ] `/admin/users` when signed in as counter → redirects to `/403`
- [ ] `/admin/users` when signed in as admin → renders empty page with admin layout
- [ ] Sign out clears session and lands on `/login`
- [ ] RLS prevents counter from reading other users' sessions (test in Supabase Studio with role JWT)
- [ ] `AppShell` renders responsively: TabBar on mobile, SideNav on desktop ≥1024px
- [ ] Login screen typography matches Cormorant + Inter mix per brand guidelines
- [ ] Brandmark renders in cream on dark background
- [ ] Voice across `/login`, `/403`, `/settings` matches brand: warm, no exclamations, no emoji

## NOTES

- Add a temporary `/admin/users` placeholder with *"User management — Sprint 2"* text styled per brand
- For first sign-in: after creating your auth user via magic link, manually run in Supabase SQL Editor:
  ```sql
  update public.users set role = 'admin' where email = '<your-email>';
  ```
