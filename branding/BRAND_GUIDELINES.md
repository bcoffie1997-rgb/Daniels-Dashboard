# MISE — BRAND GUIDELINES

These guidelines adapt **Daniel's, A Florida Steakhouse** brand identity for the Mise inventory app. The app is an internal tool, but it lives inside Daniel's operation — staff opening Mise on their phones should immediately recognize it as belonging to the restaurant.

This overrides any prior "dark industrial / electric green" direction from earlier in the spec. The brand is **warm, refined, Florida-rooted hospitality** — not Silicon Valley industrial.

---

## Source

All brand assets and tokens pulled from `https://www.danielssteak.com/fort-lauderdale/`. Verified against:
- The Daniel's wordmark (cream on dark backgrounds)
- The Daniel's brandmark — the iconic "D" with the Florida flourish
- Site visual identity, ornaments, and tone

---

## Color palette

### Primary — Daniel's brand colors

| Token | Hex | Use |
|---|---|---|
| `--daniels-forest` | `#004539` | Primary brand color — deep forest green. Used in the Daniel's brandmark and favicon. This is the *signature* color. |
| `--daniels-cream` | `#FFFDFA` | Cream / warm off-white. Used as the wordmark color. NEVER use pure white (`#FFFFFF`) — always this warm cream. |

### Extended palette (derived for app UI)

| Token | Hex | Use |
|---|---|---|
| `--background` | `#0E1B17` | App background — a deep, near-black green that complements forest. Warmer than pure black. |
| `--surface` | `#15241F` | Cards, drawers, sheets. |
| `--surface-elevated` | `#1C2E27` | Modals, popovers. |
| `--border` | `#2A3D35` | Subtle dividers, input borders. |
| `--border-strong` | `#3F564B` | Emphasized borders, focused inputs. |
| `--foreground` | `#FFFDFA` | Primary text — the Daniel's cream. |
| `--foreground-muted` | `#A8B5AE` | Secondary text, captions, timestamps. |
| `--foreground-subtle` | `#7A8780` | Tertiary, placeholders. |
| `--primary` | `#004539` | Primary action backgrounds (filled buttons, key UI). |
| `--primary-foreground` | `#FFFDFA` | Text on primary. |
| `--primary-hover` | `#005A4A` | Hover state — slightly brightened forest. |
| `--accent` | `#7BA890` | A lighter sage for highlights, badges, focus rings. Complements forest without competing. |
| `--accent-muted` | `#3D5A4D` | Quiet accent for inactive states. |
| `--warning` | `#D4A24A` | Variance amber — warm gold instead of harsh orange. Matches Florida warmth. |
| `--warning-bg` | `#3A2F1A` | Warning row background tint. |
| `--destructive` | `#C85A4E` | Variance red — muted terracotta, not fire-engine red. Refined. |
| `--destructive-bg` | `#3A1F1B` | Destructive row background tint. |
| `--success` | `#7BA890` | Sync confirmed, approved — same as accent. |

### Color rationale

Daniel's signature is **forest green + cream**. The app's dark theme uses a deep forest-tinted background instead of pure black — it reads as "kitchen lighting at night" rather than "developer terminal." The accents (warm gold, terracotta, sage) are Florida-warm, hospitality-warm. They share DNA with the upscale-country-club aesthetic Time Out described.

**Avoid:**
- Pure black (`#000`) backgrounds — too harsh, doesn't match the warmth
- Pure white (`#FFFFFF`) text — always use the Daniel's cream `#FFFDFA`
- Bright neon greens, electric colors, or anything that reads "tech startup"
- Hot-pink red errors — use the muted terracotta
- Cool grays — all neutrals are very subtly green-warm

---

## Typography

### Fonts

| Use | Font | Notes |
|---|---|---|
| Display / Headlines | **Cormorant Garamond** (Google Fonts) | Elegant serif. Matches Daniel's editorial feel. Use for screen titles, empty states, splash. Weight 400 and 600. |
| UI / Body | **Inter** (Google Fonts) | Workhorse for forms, tables, buttons, navigation. Weights 400, 500, 600. |
| Numbers | **JetBrains Mono** OR Inter with `font-variant-numeric: tabular-nums` | Counts and variance percentages MUST align in columns. Non-negotiable for a counting app. |

Load all three via `next/font/google` in `app/layout.tsx`. Self-hosted, no Google CDN at runtime.

### Type scale

```
display-2xl    44 / 52   Cormorant Garamond  600
display-xl     36 / 44   Cormorant Garamond  600
display-lg     28 / 36   Cormorant Garamond  600
display-md     24 / 32   Cormorant Garamond  400
heading-lg     20 / 28   Inter               600
heading        18 / 26   Inter               600
body-lg        17 / 26   Inter               400
body           16 / 24   Inter               400
body-sm        14 / 20   Inter               400
caption        13 / 18   Inter               500    uppercase, tracking 0.06em
micro          11 / 14   Inter               500    uppercase, tracking 0.08em
mono-lg        18 / 26   JetBrains Mono      500
mono           15 / 22   JetBrains Mono      500
```

### Type usage rules

- **Screen titles** use Cormorant Garamond — gives the app a hospitality feel from the first millisecond
- **Section labels** (e.g., "WHO WE ARE" on the Daniel's site) use the `caption` style — uppercase, slight tracking. Echo this for app section labels like "TODAY'S COUNTS," "FLAGGED ITEMS."
- **All numbers** in tables, count entries, and variance displays use tabular figures so columns align
- **Never** mix Cormorant with body copy mid-sentence — display fonts for display, Inter for everything functional

---

## Logo & brandmark usage

The official Daniel's assets are in `branding/logos/`:

| File | Use in Mise |
|---|---|
| `daniels-brandmark.svg` | The "D" flourish — use as Mise's primary icon. Place in login screen, app shell header, and as PWA icon source. |
| `daniels-wordmark.svg` | Full "Daniel's" wordmark — use on login screen above the email input. |
| `daniels-ft-lauderdale-logo.svg` | Location-specific lockup — use in footer or settings page only. |
| `daniels-favicon.svg` | Browser favicon — drop into `app/favicon.ico` equivalent and `public/`. |
| `daniels-quote-ornament.svg` | Decorative ornament — use sparingly, e.g., empty state on dashboards. |

### Naming convention in the app

- App name in UI: **Mise**
- App tagline / subtitle (login screen): **"Inventory for Daniel's"**
- PWA manifest name: **"Mise — Daniel's Inventory"**
- PWA short_name: **"Mise"**

### Brandmark color rules

- On dark backgrounds: brandmark in cream `#FFFDFA`
- On light/cream backgrounds: brandmark in forest `#004539` (its native color)
- Never apply effects, shadows, gradients, or rotation to the brandmark
- Minimum size: 24px square. Below that, use favicon variant.
- Clear space: at least 0.5x the brandmark width on all sides

---

## Layout & spacing

- Base unit: **4px**. Spacing scale: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80
- Container max width: 1280px desktop; full-bleed mobile with 16px horizontal padding
- Touch targets: **48px minimum, 56px preferred** — counters wear gloves and have cold hands
- Row heights for counting: 72–88px — generous, easy to tap
- Border radius: 8px default; 12px for cards; 16px for sheets; pill (full) for badges only

---

## Motion

Subtle, restrained, refined — not playful.

- Standard transition: `150ms cubic-bezier(0.4, 0, 0.2, 1)` for hover/focus
- Drawer / sheet entry: `220ms ease-out`
- Count entry confirmation: 100ms subtle background pulse (forest fade-in/out) + light haptic on mobile
- No bouncy springs, no slide-in-from-distance, no rotation effects
- Reduced motion preference must be honored — disable all non-essential animation

---

## Voice & microcopy

The brand voice from danielssteak.com: *"Refined home cooking. From our family to yours."* Warm, hospitable, never corporate, never jokey.

### Apply to app strings

| Bad | Good |
|---|---|
| "🎉 Count submitted successfully!" | "Count submitted for review." |
| "Oops! Something went wrong." | "We couldn't save that. We'll try again when you're back online." |
| "Awesome! You crushed that count." | "Count submitted. Thank you." |
| "Crunching the numbers..." | "Calculating variance" |
| "Hey there!" | "Welcome." |
| "Sign in to your account" | "Sign in to Mise" |
| "No data yet" | "No counts yet for this station." |

### Rules

- No emoji in UI strings (the brand doesn't use them)
- No exclamation marks except in true error/blocker states
- Title case for screen titles ("Station Picker"), sentence case for everything else
- Numbers: always include the unit ("12 lb" not just "12")
- Timestamps: human-relative ("2 hours ago," "Yesterday at 8:42 PM") not raw ISO
- Pluralize correctly ("1 item" / "12 items")
- Manager-facing copy can be slightly more formal than counter-facing copy
- Avoid jargon ("RLS," "Server Action," "session_id") in any user-facing string

---

## Ornaments

The Daniel's site uses decorative ornamental flourishes — spiral borders, quote marks, the brandmark glyph. These add the hospitality feel.

Use ornaments in Mise **sparingly** and in **functional contexts only**:

- Login screen: brandmark above the wordmark, subtle quote ornament below tagline (optional)
- Empty states: brandmark centered above empty-state text (e.g., "No counts yet")
- Submitted-success screen: a subtle quote ornament above the confirmation message
- Print/PDF outputs (export receipts): brandmark in header

**Do not** scatter ornaments through utility screens like the active count screen, dashboard tables, or admin forms. Function first, ornament second. The kitchen is moving fast; ornament where it elevates, hide where it slows.

---

## Imagery

Mise is utilitarian — no marketing photography is needed inside the app. But when imagery IS used (login screen optional, marketing pages later):

- Use **Daniel's own photography** where possible (kitchen, dishes, ingredients, farm)
- Never use stock photos of restaurant scenes
- Never use AI-generated food imagery
- If a placeholder is needed, use a flat color background in `--surface` rather than a stock image

---

## Accessibility

- All text on `--background` must hit WCAG AA contrast (`#FFFDFA` on `#0E1B17` = 18.9:1 — excellent)
- Forest green on cream (`#004539` on `#FFFDFA` = 11.6:1) for any light surfaces
- Focus rings: 2px solid `--accent` with 2px offset
- Never rely on color alone for state — variance badges include a text percentage AND color
- Honor `prefers-reduced-motion` and `prefers-color-scheme` (Mise is dark-default, but document intent)
- All form inputs labeled, never placeholder-only

---

## Sample component patterns

### Login screen
```
[Cream background OR dark forest gradient]
        
        [Daniels brandmark — 64px, forest]
        
              D A N I E L ' S
        ── A Florida Steakhouse ──
        
              [Cormorant display]
                 Welcome
              [Inter body, muted]
              Sign in to Mise to begin a count.
              
              [Email input — large, cream-bordered]
              [Send magic link — primary button, forest]
```

### Active count screen header
```
┌─────────────────────────────────────┐
│  WALK-IN 1 · PROTEINS              ⊕│  ← caption, tracked
│  ──────────────────────────────────  │
│  12 of 47 counted          [● sync] │  ← mono numbers
└─────────────────────────────────────┘
```

### Variance badge
```
Forest border-left, mono number, caption "%"
+12%   green
−8%    foreground-muted (small variance, no flag)
+47%   warning amber background
−72%   destructive terracotta background
```

---

## What this is NOT

- Not a Silicon Valley dark-mode SaaS — no electric greens, no Vercel-clone aesthetic
- Not Toast's product — no orange, no fast-casual energy
- Not a generic restaurant tech product — every detail should feel like Daniel's specifically
- Not playful — no emoji-driven success states, no game-y celebration
- Not loud — restraint, white space, considered typography

The test: a sous chef at Daniel's opens Mise for the first time and thinks *"this feels like it belongs here."* If it doesn't pass that test, the brand work isn't done.
