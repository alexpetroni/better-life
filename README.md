# Better Life by Zenyth — Phase 1 (Foundation & Content Spine)

A multi-vertical wellness platform built around config-driven **pillars**, with
**Somnium** (sleep) as the flagship. Phase 1 delivers the foundation and content
spine: pillar config, a cross-pillar editorial homepage, Somnium content, a
screening quiz, granular GDPR consent, an immediate profile email, and a
newsletter — Romanian-first and accessible. **No commerce** (that's Phase 2).

See `CLAUDE.md` for the engineering constitution and `PHASE-1-PLAN.md` for the
design.

## Stack

- **SvelteKit 2 + Svelte 5** (Node adapter, SSR + BFF), **Tailwind v4**, **paraglide** (i18n, RO first)
- **Payload 3** CMS (pillars, articles, quiz definitions) — its own service
- **Supabase Postgres** (one DB, isolated schemas: `app`, `payload`, `medusa` reserved for Phase 2)
- **Resend + React Email** for the profile email
- **Redis** present for stack parity (no Phase 1 consumer; Medusa + the worker use it from Phase 2)

## Prerequisites

- Node 20+ and npm
- Docker + Docker Compose

## Quick start — clone → install → migrate → seed → run

```bash
cp .env.example .env          # 1. env (works as-is for local dev)
docker compose up -d          # 2. Postgres + Redis
npm install                   # 3. install workspaces (compiles emails + paraglide)
npm run migrate               # 4. apply app-schema migrations
npm run seed                  # 5. seed pillars, quiz, articles (idempotent)
npm run dev                   # 6. start CMS (:3001) + web (:5173)
```

Then open:

- **Portal (Better Life):** http://localhost:5173
- **Somnium:** http://localhost:5173/somnium · **Screening:** http://localhost:5173/screening
- **CMS admin:** http://localhost:3001/admin — dev login `admin@betterlife.ro` / `changeme123`

> First `npm run dev` compiles paraglide and Payload's schema (dev auto-push) on boot.

## Services & ports

| Service | Port | Notes |
|---|---|---|
| Web (SvelteKit) | 5173 | SSR + BFF; the only caller of Payload |
| CMS (Payload/Next) | 3001 | admin + REST/GraphQL API |
| Postgres | 5432 | schemas: `app`, `payload` |
| Redis | 6379 | idle in Phase 1 |

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | CMS + web together |
| `npm run dev:web` / `npm run dev:cms` | one at a time |
| `npm run migrate` | apply `supabase/migrations/*.sql` to the app schema |
| `npm run seed` | seed content (idempotent; `SEED_ENV=minimal` for prod-style) |
| `npm run erase-lead -- <uuid\|email>` | right-to-erasure (cascades quiz responses + consent) |
| `npm run db:reset` | drop volumes, recreate, migrate (dev only) |
| `npm run check` | type-check the web app |

## Architecture

```
apps/web   SvelteKit — routes/(portal) + routes/(somnium); lib/server = BFF
apps/cms   Payload 3 — collections: pillars, articles, quizzes, users
packages/  contracts (shared types), emails (React Email, compiled to dist)
supabase/migrations  app-schema SQL (leads, quiz_responses, consent, erase_lead)
seed/      idempotent, env-aware, phase-aware seed (pillars → quizzes → articles)
```

- **Pillars are config, never code.** Nav, landing pages, and feed eligibility derive
  from the `pillars` collection; `status` (live/coming_soon/hidden) governs public
  surfacing. Two pillars are seeded live (Somnium, Better Body) and two coming_soon
  (Better Mind, Better Action) — the latter prove status-gating (absent from public surfaces).
- **Identity:** leads are keyed by UUID, never email; created lazily (quiz, newsletter).
  Quiz answers are sensitive, stored in the `app` schema, tagged by pillar.
- **Consent:** granular, unticked opt-ins (results delivery vs marketing); each
  consent record stores purpose, timestamp, exact text shown, version, and locale.
- **Quiz:** definition (questions + profile copy) authored in Payload; the matcher
  (answers → profile) lives in code at `apps/web/src/lib/server/quiz/matchers/`.
- **Reverse-decoupling:** the `(somnium)` route group never imports from `(portal)` —
  it's standalone-capable (domain mapping is wired in Phase 2).

## Graceful degradation

Missing credentials never crash the app — they warn and disable only that capability.
Notably, without `RESEND_API_KEY` the profile email is skipped (logged) while the rest
of the flow (consent, on-screen results) works. Set `RESEND_API_KEY` + `EMAIL_FROM` in
`.env` to enable real delivery.

## Phase 1 implementation notes

- **Migrations** live in `supabase/migrations/` (Supabase CLI format) but are applied
  locally by a small dependency-free `pg` runner (`scripts/migrate.mjs`) so the flow
  needs no Supabase CLI / system `psql`. The same files are CLI-managed in production.
- **Env** is a single repo-root `.env`, loaded by each service via dotenv (web, cms,
  seed, migrate all read the same file).
- **i18n** (paraglide) and the **design system** are co-located in `apps/web`
  (smallest abstraction — one consuming app). **React Email** is a separate package
  compiled to `dist` so the SvelteKit Node server consumes plain JS.
- **No worker / Inngest yet** — the profile email is sent synchronously from the BFF.
  The worker and Redis consumers arrive in Phase 2.

## Right to erasure

```bash
npm run erase-lead -- someone@example.com   # or a lead UUID
```

Deletes the lead; `ON DELETE CASCADE` removes its quiz responses and consent records.
The command prints an auditable count of what was deleted.
