# Better Life by Zenyth

A multi-vertical wellness platform built around config-driven **pillars**, with
**Somnium** (sleep) as the flagship shop and **Better Body** as a live content pillar.
Each pillar can carry evidence-based content, a screening quiz that profiles the visitor,
and personalized follow-up — all reconfigurable in the CMS without a deploy.

**Status: Phases 1–4 complete.**

1. **Foundation & content spine** — pillar config, cross-pillar editorial homepage, Somnium
   content, screening quiz, granular GDPR consent, immediate profile email, newsletter.
2. **Commerce** — Medusa shop + cart + checkout, payments (Stripe/Netopia), Sameday shipping,
   Oblio invoicing + ANAF e-Factura, transactional email, legal/cookie/SEO, lead→customer promotion.
3. **Personalization & depth** — Inngest nurture/cart-recovery/post-purchase/re-engagement
   (marketing-consented only), customer dashboard, rule-based recommendations, wishlist,
   verified-purchase moderated reviews, cross-sell.
4. **Second pillar & demo polish** — Better Body live (content + landing + quiz, no shop),
   cross-pillar identity + discovery, CMS-recomposable homepage + composable pillar landings,
   CMS-authored narrative pages, accessibility + Core Web Vitals pass.

See `CLAUDE.md` for the engineering constitution and `PHASE-{1,2,3,4}-PLAN.md` for each phase's design.

## Stack

- **SvelteKit 2 + Svelte 5** (Node adapter, SSR + BFF), **Tailwind v4**, **paraglide** (i18n, RO first)
- **Payload 3** CMS — pillars, articles, quizzes, reviews, pages, a homepage global (its own service)
- **Medusa 2** — products, customers, orders, cart, fulfillment (its own service)
- **Supabase Postgres** — one DB, isolated schemas: `app`, `payload`, and `public` (Medusa)
- **Inngest** worker (separate Node service) for event orchestration; **Redis** for Medusa + worker
- **Resend + React Email** (transactional + marketing), **Oblio + ANAF**, **Sameday**, **Stripe/Netopia**
- **Umami** (self-hosted) for product analytics, loaded only after analytics consent

> **Medusa schema note:** Medusa owns the `public` schema (Medusa v2 doesn't reliably isolate
> into a non-public schema); `app` + `payload` stay isolated. See `PHASE-2-PLAN.md`.

## Prerequisites

- Node 20+ and npm
- Docker + Docker Compose

## Quick start — clone → install → migrate → seed → run

```bash
cp .env.example .env          # 1. env (works as-is for local dev; integrations degrade w/o keys)
docker compose up -d          # 2. Postgres + Redis
npm install                   # 3. install workspaces (compiles emails + paraglide)
npm run migrate               # 4. app-schema migrations + Medusa migrations
npm run seed                  # 5. seed pillars, quizzes, articles, pages, homepage + Medusa catalog
npm run dev                   # 6. start CMS (:3001) + web (:5173)
```

Commerce and orchestration run as separate services (start as needed):

```bash
npm run dev -w @better-life/medusa     # Medusa (:9000) — shop, cart, checkout
npm run dev -w @better-life/worker     # Inngest worker (:3002) — order effects + nurture
npx inngest-cli@latest dev -u http://localhost:3002/api/inngest   # optional: drives the time-based sequences
```

Then open:

- **Portal (Better Life):** http://localhost:5173 · **About/Mission/Philosophy:** `/about` `/mission` `/philosophy`
- **Somnium:** `/somnium` · **Shop:** `/somnium/shop` · **Screening:** `/screening`
- **Better Body:** `/pillars/better-body` · **Its quiz:** `/pillars/better-body/screening`
- **CMS admin:** http://localhost:3001/admin — dev login `admin@betterlife.ro` / `changeme123`

> First `npm run dev` compiles paraglide and Payload's schema (dev auto-push) on boot.

## Services & ports

| Service | Port | Notes |
|---|---|---|
| Web (SvelteKit) | 5173 | SSR + BFF; the only caller of Payload + Medusa |
| CMS (Payload/Next) | 3001 | admin + REST/GraphQL API |
| Medusa | 9000 | store + admin API (Phase 2) |
| Inngest worker | 3002 | order effects + marketing nurture (Phase 2–3) |
| Postgres | 5432 | schemas: `app`, `payload`, `public` (Medusa) |
| Redis | 6379 | Medusa + worker |
| Inngest dev server | 8288 | optional, local; drives durable time-based sequences |

## Commands

| Command | What it does |
|---|---|
| `npm run dev` | CMS + web together |
| `npm run dev -w @better-life/{medusa,worker}` | Medusa / Inngest worker |
| `npm run migrate` | app-schema SQL + Medusa migrations (stop `medusa develop` first) |
| `npm run seed` | content + Medusa catalog (idempotent; `SEED_ENV=minimal` for prod-style) |
| `npm run test` | worker + web test suites (Vitest) |
| `npm run check` | type-check the web app (`svelte-check`) |
| `npm run erase-lead -- <uuid\|email>` | right-to-erasure (cascades quiz responses + consent) |
| `npm run db:reset` | drop volumes, recreate, migrate (dev only) |

## Architecture

```
apps/web     SvelteKit — routes/(portal) + routes/(somnium); lib/server = BFF
apps/cms     Payload 3 — collections: pillars, articles, quizzes, reviews, pages, users; global: homepage
apps/medusa  Medusa 2 — catalog (profile-tagged products), cart, checkout, custom Netopia provider
apps/worker  Inngest worker — idempotent order effects + marketing nurture sequences
packages/    contracts (shared types), emails (React Email → dist)
supabase/migrations  0001 app schema · 0002 order_effects · 0003 personalization · 0004 marketing_log
seed/        idempotent, env/phase-aware: pillars → quizzes → articles → pages → homepage (+ Medusa catalog)
```

## Key concepts

- **Pillars are config, never code.** Nav, landing pages, feed eligibility, accent, and order all
  derive from the `pillars` collection; `status` (live/coming_soon/hidden) governs public surfacing.
  Two pillars are seeded live (Somnium, Better Body); two coming_soon (Better Mind, Better Action).
- **Composable surfaces (CMS, no deploy):** the homepage feed (featured articles/product/quiz) reads
  the `homepage` global with a rule-based fallback per slot; pillar landings render `hero` +
  `landingBlocks` (richText / articleList / quizCta / stat / quote); narrative pages live in `pages`.
- **Identity:** leads are keyed by UUID, never email; created lazily (quiz, newsletter, checkout).
  One lead spans pillars — `quiz_responses` are pillar-tagged and `interest:<pillar>` tags accrue from
  any entry point. Lead → Medusa customer promotion happens at first purchase/registration.
- **Consent:** granular, unticked opt-ins (results delivery vs marketing), versioned with exact text.
  Marketing nurture only ever targets leads whose latest `marketing` consent is granted.
- **Quiz:** definition (questions + profile copy) authored in Payload; the matcher (answers → profile)
  lives in code at `apps/web/src/lib/server/quiz/matchers/`. A shared `QuizFlow` + generic
  `/pillars/[slug]/screening` route serve every pillar.
- **Commerce effects are idempotent + degrade gracefully:** Oblio invoice → ANAF → Sameday AWB →
  confirmation email each run once (guarded in `app.order_effects`), retried independently by Inngest.
- **Orchestration:** the BFF emits lifecycle events (`quiz.completed`, `checkout.started`,
  `order.placed`, …); the worker hosts the durable sequences (profile nurture branched by pillar +
  profile, abandoned cart, post-purchase, daily re-engagement). A purchase cancels the nurture.
- **Reverse-decoupling:** the `(somnium)` route group never imports from `(portal)` — standalone-capable.

## Graceful degradation

Missing credentials never crash the app — they warn and disable only that capability. Without
`RESEND_API_KEY` emails are skipped; without `MEDUSA_PUBLISHABLE_KEY` the shop is hidden; without
`INNGEST_ENABLED=true` the time-based sequences stay dormant (order effects fall back to a direct
worker HTTP call); without payment/fiscal/shipping keys those steps skip. All verified by tests.

## Quality & demo-readiness

- **Tests:** `npm run test` — worker (order-effect idempotency + degradation, nurture consent gate)
  and web (recommendations, quiz matchers, identity merge).
- **Accessibility:** semantic HTML + `svelte-check` a11y from Phase 1; Phase 4 axe-core audit → 0 WCAG
  2.0/2.1 A+AA violations across 12 pages.
- **Performance:** Lighthouse (production build, mobile lab) — perf 98–99, a11y/best-practices/SEO 100,
  Core Web Vitals all green (system font stack, SSR + minimal JS, no layout shift).
- **SEO:** per-page meta + canonical, Article/Breadcrumb/Product JSON-LD (incl. review `aggregateRating`),
  sitemap + robots, Google Search Console verification hook (`PUBLIC_GSC_VERIFICATION`).

## Right to erasure

```bash
npm run erase-lead -- someone@example.com   # or a lead UUID
```

Deletes the lead; `ON DELETE CASCADE` removes its quiz responses, consent records, wishlist,
product views, and marketing-email log. The command prints an auditable count of what was deleted.
