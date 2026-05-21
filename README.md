# Mise — Inventory App for Daniel's Steakhouse

> **For Claude Code:** This folder is your complete handoff package. Read `START_HERE.md` first, then work through the sprint prompts in order.

## What this is

**Mise** is a mobile-first inventory counting Progressive Web App built for **Daniel's, A Florida Steakhouse** (Fort Lauderdale, FL), part of Gioia Hospitality Group. Michelin-recommended. Currently uses spreadsheets for inventory — slow, error-prone, no accountability.

This app replaces that with a fast, phone-first, offline-capable counting tool where every count is attributed to who did it, managers see real-time variance against prior counts, and the data exports cleanly to whatever existing workflows still need it.

## Folder contents

```
mise-build/
├── README.md                     ← you are here
├── START_HERE.md                 ← read this first
├── docs/
│   ├── 01-strategy.md            ← problem, user, value prop, success metrics
│   ├── 02-requirements.md        ← MVP features, data model, scope boundaries
│   ├── 03-design.md              ← flows, screens, visual direction
│   ├── 04-development.md         ← sprint plan, setup, structure
│   ├── 05-qa.md                  ← test checklists, edge cases, security
│   ├── 06-launch.md              ← deploy steps, launch sequence, rollback
│   ├── 07-post-launch.md         ← monitoring, iteration, V2 backlog, sunset criteria
│   └── BUILD_SPEC.md             ← consolidated spec — single source of truth
├── branding/
│   ├── BRAND_GUIDELINES.md       ← Daniel's brand applied to Mise
│   ├── logos/                    ← official Daniel's SVG assets
│   └── colors/
│       └── tokens.css            ← copy-paste CSS variables
├── prompts/
│   ├── sprint-0-setup.md
│   ├── sprint-1-auth.md
│   ├── sprint-2-admin.md
│   ├── sprint-3-counter.md
│   ├── sprint-4-offline.md
│   ├── sprint-5-sessions.md
│   ├── sprint-6-manager.md
│   ├── sprint-7-observability.md
│   └── sprint-8-pilot-prep.md
├── schema/
│   └── 0001_initial_schema.sql   ← Supabase migration (locked)
└── config/
    └── .env.example              ← all env vars needed
```

## How to use this with Claude Code

1. **Open Claude Code in this folder.** It can read every file here.
2. **Start a fresh Claude Code session per sprint.** Don't run two in parallel.
3. **Paste the sprint prompt** from `prompts/sprint-N-*.md` into Claude Code.
4. **Reference the docs** when Claude Code asks clarifying questions — point it to the relevant section.
5. **Commit between sprints.** Branch per sprint, merge to main when acceptance criteria pass.

## Tech stack

Next.js 14 (App Router) · TypeScript · Tailwind · shadcn/ui · Supabase · Vercel · Serwist (PWA) · Dexie (offline) · Resend · PostHog · Sentry

## Codename

**Mise** — from *mise en place*, the kitchen principle of having everything in its proper place before service. Kitchen-native, short, unclaimed. Can be renamed at launch if needed.

## Owner

Branden — builder, owner, pilot lead. Works at Daniel's. Has direct line-level access — unfair advantage vs. typical restaurant-tech founders.
