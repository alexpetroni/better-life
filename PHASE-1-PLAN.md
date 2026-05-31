# Better Life · Phase 1 Plan — Foundation & Content Spine

**Status:** design for review. No feature code written yet. Stop point before implementation.

This document delivers the four artifacts the task asks for before implementation:

1. Monorepo + SvelteKit structure (route groups, module boundaries)
2. Payload `pillars` + quiz-definition schemas, and the app-schema `lead` + quiz-response + consent model (claim-token design, erasure cascade)
3. Migration setup + `/seed` layout + `npm run seed`, plus `docker compose` (Postgres + Redis)
4. A short Phase 1 build-order plan

It records two decisions already made by the stakeholder, and flags the remaining design calls that need a yes/no before build.

---

## 0. Decisions

**Locked (confirmed):**

| Decision | Choice | Consequence |
|---|---|---|
| Screening tool to migrate | **Lightweight (v7-style)** profile matcher | ~5 questions, single page, deterministic `matchProfile()` → one of ~4 named sleep profiles. Source: `/home/alex/work/better-sleep/v7`. Keeps Phase 1 "static template + simple logic." |
| Phase 1 second pillar | **Better Body** (`live`, `has_shop: false`) | Carries a few articles so the cross-pillar feed is real. Phase 4 still decides which pillar goes *fully* live with its own quiz. |

**Confirmed (all locked):**

- **Quiz authoring split.** Quiz *content* (questions, option labels, profile copy, disclaimers) is authored in Payload `quizzes`; the *matcher* (`responses → profileKey`) lives in code keyed by quiz slug. Churn-prone copy → CMS; stable logic → code (avoids the data-driven scoring engine principle #1 forbids).
- **Monorepo manager: npm workspaces** (matches `npm install` / `npm run seed`).
- **Payload 3** (Next.js/React based) runs as its own service — pulls React into the monorepo for the CMS app and React Email rendering; SvelteKit stays Svelte-only and talks to Payload server-side.
- **No Inngest worker in Phase 1.** The profile email is sent synchronously from the SvelteKit BFF (graceful degradation if `RESEND_API_KEY` is absent). The worker enters in Phase 2; the monorepo leaves a slot for it.
- **Redis** is in the Phase 1 `docker-compose.yml` for parity but has no Phase 1 consumer (Medusa + worker use it from Phase 2).
- **Branding** — placeholder tokens, editable in the CMS (brand is config, not code). Portal: "Better Life by Zenyth", warm-neutral palette. Pillars seeded RO-first:
  - **Somnium** — `live`, `hasShop: true`, accent `#4F46E5` (twilight indigo)
  - **Better Body** — `live`, `hasShop: false`, accent `#16A34A` (vital green)
  - **Better Mind** — `coming_soon`, accent `#0D9488` (teal)
  - **Better Action** — `coming_soon`, accent `#D97706` (amber)

  The two `coming_soon` pillars exist in config but stay absent from nav/feed until flipped — proving `status`-gating end to end (and setting up the Phase 4 CMS demo).

---

## 1. Monorepo + SvelteKit structure

One repo, npm workspaces. One SvelteKit app with two route groups; Payload as a sibling service. Clean server-side module boundaries inside the SvelteKit app.

```
better-life/
├─ package.json                  # workspaces + root scripts (migrate, seed, dev, erase-lead)
├─ docker-compose.yml            # postgres + redis (local parity)
├─ .env.example                  # single documented env surface
├─ turbo.json (optional)         # task orchestration; can defer
├─ apps/
│  ├─ web/                       # SvelteKit, Node adapter (SSR + BFF)
│  │  └─ src/
│  │     ├─ routes/
│  │     │  ├─ (portal)/         # Better Life aggregation
│  │     │  │  ├─ +layout.svelte # portal shell: nav from pillar config
│  │     │  │  ├─ +page.svelte   # editorial homepage feed
│  │     │  │  ├─ newsletter/    # standalone signup
│  │     │  │  └─ how-it-works/
│  │     │  ├─ (somnium)/        # sleep product — STANDALONE-CAPABLE
│  │     │  │  ├─ +layout.svelte # somnium shell (never imports from (portal))
│  │     │  │  ├─ blog/[slug]/
│  │     │  │  ├─ screening/     # the quiz + post-quiz capture
│  │     │  │  └─ pillar landing
│  │     │  ├─ sitemap.xml/+server.ts
│  │     │  ├─ robots.txt/+server.ts
│  │     │  └─ claim/+page.svelte # claim-token landing (wired fully in P2)
│  │     ├─ lib/
│  │     │  ├─ server/           # BFF — only caller of Payload; holds secrets
│  │     │  │  ├─ db/            # pg pools: app-pool (tx pooler) + note on direct
│  │     │  │  ├─ cms/           # Payload REST/GraphQL client (pillars, articles, feed, quiz defs)
│  │     │  │  ├─ pillars/       # pillar config → nav, status gating, caching
│  │     │  │  ├─ leads/         # lazy lead create, claim token, UTM, tags
│  │     │  │  ├─ consent/       # record consent (purpose, version, text, ts)
│  │     │  │  ├─ quiz/          # load def from CMS, persist responses, recommend
│  │     │  │  │  └─ matchers/   # somnium-sleep.ts: responses → profileKey (code)
│  │     │  │  └─ email/         # Resend + React Email render; graceful degradation
│  │     │  ├─ components/       # shadcn-svelte design system usage
│  │     │  └─ paraglide/        # generated messages (gitignored)
│  │     └─ hooks.server.ts      # UTM first-touch capture, locale
│  └─ cms/                       # Payload 3 (own service, own Postgres schema)
│     └─ src/collections/        # pillars, articles, quizzes, users
├─ packages/
│  ├─ ui/                        # shared shadcn-svelte primitives + brand tokens
│  ├─ i18n/                      # paraglide project (messages/ro.json first)
│  ├─ emails/                    # React Email templates (profile email)
│  └─ contracts/                 # shared TS types (Pillar, QuizDefinition, Profile…)
├─ supabase/
│  └─ migrations/                # app-schema SQL (Supabase CLI format)
├─ seed/                         # /seed at repo root (see §3)
└─ scripts/
   └─ erase-lead.ts              # documented erasure CLI
```

**Module-boundary rules**
- The browser never holds service keys. `lib/server/cms` is the *only* caller of Payload (CLAUDE.md ops rule).
- **Reverse-decoupling:** `(somnium)` routes and their `+layout` must not import from `(portal)`. Shared UI/content access lives in `packages/*` and `lib/server`, so Somnium runs as a standalone site. A reverse proxy maps domains to route groups (wired in Phase 2; Phase 1 keeps the groups independent).
- Pillars are never hardcoded: nav, landing pages, and feed eligibility all derive from the `pillars` collection; `status` gates public surfacing.

---

## 2. Schemas

### 2a. Payload collections

**`pillars`** — the spine (CLAUDE.md model):

| field | type | notes |
|---|---|---|
| `slug` | text, unique, required | stable handle (seed idempotency key) |
| `name`, `tagline` | text | content (localizable) |
| `icon`, `accentColor`, `order` | text / text / number | nav + theming |
| `status` | select `live\|coming_soon\|hidden` | governs public surfacing |
| `hasShop`, `hasQuiz` | checkbox | `hasShop` true for Somnium (shop is Phase 2); false for Better Body |
| `quizRef` | relationship → `quizzes` | optional |
| `hero` | group (heading, sub, image, ctaLabel, ctaHref) | landing |
| `landingBlocks` | blocks (minimal set) | keep small; not a page builder |

**`articles`** — tagged by pillar, editorial workflow:

`title, slug, excerpt, body (richText), pillar (rel → pillars, required), heroImage, author (rel → users), status (draft\|in_review\|published), publishedAt, profileTags (text[]), seo (group: metaTitle, metaDescription, ogImage)`. Editorial workflow via Payload drafts/versions + the `status` field + role-based access (collaborator = editor role).

**`quizzes`** — quiz *definitions* as authorable content (matcher lives in code, see §0):

`slug (unique), title, hook, disclaimer (richText), pillar (rel → pillars), questions[] {key, text, helpText, type (single-select|multi-select|scale), displayVariant, options[] {value,label}}, profiles[] {key, title, description (richText), tip, recommendations[] {title, body}, ctaLabel, ctaHref}, resultDisclaimer`.

### 2b. App schema (Supabase Postgres, `app` schema, SQL migrations)

Keyed by UUID, never email. Quiz answers treated as sensitive. Server-side access only (RLS optional defense-in-depth).

```sql
-- app.leads — identity before commerce
id                  uuid pk default gen_random_uuid()
email               text          -- OPTIONAL, only after consented capture; never a key/join
email_verified_at   timestamptz
claim_token         uuid not null default gen_random_uuid()  -- post-quiz claim link
claim_token_used_at timestamptz                              -- single-use marker (P2 consumes)
behavioral_tags     text[] not null default '{}'
first_touch_utm     jsonb                                    -- {source,medium,campaign,term,content}
medusa_customer_id  text                                     -- nullable now; linked in P2
created_at, updated_at timestamptz

-- app.quiz_responses — SENSITIVE
id           uuid pk
lead_id      uuid not null references app.leads(id) on delete cascade
quiz_slug    text not null
pillar_slug  text not null          -- tagged by pillar
answers      jsonb not null         -- {question_key: value} (sensitive health-adjacent data)
profile_key  text                   -- computed result
submitted_at timestamptz default now()

-- app.consent_records — one row per purpose
id              uuid pk
lead_id         uuid not null references app.leads(id) on delete cascade
purpose         text not null       -- 'results_delivery' | 'marketing'
granted         boolean not null
consent_text    text not null       -- EXACT text shown
consent_version text not null       -- version of that text
locale          text not null
created_at      timestamptz default now()
```

**Claim-token design.** An anonymous quiz submission lazily creates a lead with a `claim_token` (UUID). The post-quiz profile email links to `/claim?token=…`. The token is single-use (`claim_token_used_at`). Phase 2 consumes it to claim the lead → Medusa customer (email match first, else token). No anonymous traffic is persisted — a lead is created only on quiz submit / newsletter / (P2) purchase.

**Newsletter** reuses this model: a standalone signup lazily creates/updates a lead with `email` + a `marketing` consent record. No separate table.

**Granular consent at capture.** Two separate, unticked opt-ins: `results_delivery` (required to receive the profile email) and `marketing`. Each produces its own `consent_records` row with purpose, timestamp, exact text, version, locale.

**Erasure cascade.** `on delete cascade` from `quiz_responses` and `consent_records` → `leads`. A documented `app.erase_lead(uuid)` SQL function (clears the Medusa link in P2, deletes the lead, FKs cascade the rest) plus `scripts/erase-lead.ts` (`npm run erase-lead -- <id|email>`). A retention-policy note ships alongside.

**Connections (CLAUDE.md).** `.env.example` exposes `DATABASE_URL` (transaction pooler :6543, app-runtime queries only) and `DIRECT_URL` (session/direct :5432, used by migrations + Payload). Migrations and Payload never use the transaction pooler.

---

## 3. Migrations, seed, docker compose

**docker-compose.yml** — Postgres + Redis for local parity. Postgres hosts the three isolated schemas (`app`, `payload`, and `medusa` reserved for P2). Redis is in the fixed set per CLAUDE.md though Phase 1 doesn't yet use it (no worker); it's present so local == prod shape.

**Migrations**
- App schema: SQL files in `supabase/migrations/`, applied with the Supabase CLI against `DIRECT_URL` (works for both the docker Postgres and Supabase cloud). Forward-only in prod; dev resets freely.
- Payload: native migrations (`payload migrate`), committed, run against the `payload` schema. Never schema-push in prod.
- Root `npm run migrate` orchestrates: app-schema migrations → Payload migrations.

**`/seed` + `npm run seed`** — idempotent, environment-aware, phase-aware:

```
seed/
├─ index.ts             # runner: reads SEED_ENV (minimal|demo), runs in dependency order
├─ lib/
│  ├─ payload-client.ts # upsert helpers keyed on stable slug (idempotent re-runs)
│  └─ env.ts
└─ data/
   ├─ pillars.ts        # Somnium (live, hasShop) · Better Body (live, no shop) · Mind/Action (coming_soon)
   ├─ quizzes/
   │  └─ somnium-sleep.ts   # migrated v7-style def: questions + profile copy
   └─ articles/
      ├─ somnium/*          # 15–20 articles
      └─ better-body/*      # a few articles → real cross-pillar feed
```

- **Order:** pillars → quizzes → articles (articles & quiz refs resolve against pillars).
- **Idempotent:** upsert keyed on `slug`/stable handle; safe to re-run.
- **Environment-aware:** `demo` = full content (dev/staging); `minimal` = at least pillar config (prod).
- **Phase-aware:** no products (they enter via the Medusa admin API in Phase 2, keyed on a stable handle). Phase 1 seeds Payload content only; `app`-schema rows are created at runtime by visitors.
- Seeds via Payload's Local API run inside the cms app context.

**Reproducibility target:** `docker compose up` → `npm install` → `npm run migrate` → `npm run seed` → `npm run dev` brings up a working portal + Somnium content with two pillars seeded, zero manual DB work.

---

## 4. Phase 1 build order

Each step is independently reviewable; i18n (paraglide, RO-first) and a11y are honored *from the first line of UI*, not retrofitted.

0. **Scaffolding** — npm workspaces; `apps/web` (SvelteKit + Node adapter + Tailwind + shadcn-svelte); `apps/cms` (Payload); `packages/{ui,i18n,emails,contracts}`; `docker-compose.yml`; `.env.example`; root scripts.
1. **Data layer** — docker Postgres+Redis; app-schema migrations (leads, quiz_responses, consent, `erase_lead`); Payload wired to its schema via `DIRECT_URL`; `npm run migrate`.
2. **Payload collections** — pillars, articles (editorial workflow), quizzes; seed runner + idempotent upserts.
3. **i18n + a11y baseline** — paraglide project, RO messages, lint rule against hardcoded strings; semantic-HTML / focus / contrast / ARIA conventions documented and applied.
4. **Portal shell** — pillar config → nav + status gating; editorial homepage feed with the fixed section types only (`featured_articles`, `featured_product` rendered hidden until P2, `quiz_invitation`).
5. **Somnium content** — blog list + article pages from Payload; standalone-capable route group; SEO basics (Article + BreadcrumbList structured data, OG/Twitter, `sitemap.xml`, `robots.txt`); wellness disclaimers on content.
6. **Lead identity + consent** — lazy lead creation; claim token; first-touch UTM in `hooks.server.ts`; consent recording module.
7. **Screening quiz** — migrate v7-style quiz; render from Payload def; `matchProfile` in code; persist responses (sensitive) keyed to lead UUID + pillar; post-quiz capture with two granular unticked consents; immediate profile + recommendations email via Resend/React Email (graceful degradation if key absent); screening disclaimer.
8. **Newsletter** — standalone signup → lead + its own `marketing` consent record.
9. **Erasure** — `app.erase_lead` + `scripts/erase-lead.ts`; verify cascade to quiz responses + consent.
10. **Seed content** — 15–20 Somnium + a few Better Body articles; pillar config; quiz def.
11. **Branding + disclaimers pass** — brand tokens applied consistently; wellness positioning.
12. **Verify** — clean `clone → install → migrate → seed → run`; full visitor journey (homepage feed → Somnium article → screening → granular consent → profile email → newsletter); erase a lead and confirm cascade; a11y baseline on key pages.

---

## 5. Definition of done (recap)

From a clean clone, `clone → install → migrate → seed → run` brings up portal + Somnium with two pillars seeded. A visitor can: see the cross-pillar editorial homepage; read Somnium articles; complete the screening; give granular consent and submit email; receive an immediate profile + recommendations email; subscribe to the newsletter. A lead can be erased with its quiz responses and consent records. All user-facing text runs through paraglide; the a11y baseline holds on key pages; SEO basics are in place; Somnium routes work independently of the portal. Every step works without manual intervention.

## 6. Open items

All resolved — see §0 "Confirmed." Ready to build on approval, starting at build-order step 0.
