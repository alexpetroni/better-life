# Better Life by Zenyth · Engineering Constitution

This file defines how this project is built. It holds the durable decisions. They do not change when the stakeholder reshuffles pillars, names, colors, or branding. If a request conflicts with these principles, flag it before complying.

## What this is

Better Life by Zenyth is a multi-vertical wellness platform that aggregates "pillars" (Better Sleep, Better Body, Better Mind, and others). The first and central pillar is **Somnium**, a complete sleep product with educational content, a screening quiz, and an e-commerce shop. Other pillars go live over time.

Operating reality: the stakeholder is indecisive. Pillar count, names, order, colors, status, and the Somnium / Better Life brand relationship change repeatedly. The architecture absorbs this as configuration and data, never as code rewrites. Flexibility under churn is the primary design goal, on the pillar, content, and brand axis. It is deliberately not built for changes to the identity or commerce model (see "What this does not flex").

## Non-negotiable principles

1. **Simple, clear, extensible, in that order.** Flexibility comes from the smallest abstraction that does the job, never from generic machinery. The `pillar` concept is the ONE abstraction that earns its keep; resist adding others. Prefer boring, readable code over clever indirection. If a config-driven approach makes a feature meaningfully harder to read, hardcode it and revisit only when a second real case appears. Extensibility means "easy to add the next pillar," not "anticipates every imaginable future."
2. **Pillar is a first-class, config-driven entity.** Pillar count, names, order, icons, colors, and status live in the CMS, never hardcoded. Adding, removing, reordering, renaming, recoloring a pillar, or flipping its status, is data entry, never a deploy.
3. **One product, one configurable portal.** Somnium is a complete product. The portal is a thin shell that renders from pillar config. A pillar's `status` governs whether it surfaces publicly (nav, landing page, feed eligibility); non-live pillars are simply absent from public surfaces. No pillar is ever hardcoded into the portal.
4. **Shared infrastructure, cut by a single `pillar` dimension.** Content, commerce, identity, and events all carry a `pillar` key. New pillars reuse the same systems filtered by that key. Never spin up parallel stacks per pillar.
5. **One monorepo, minimal fixed services, none per pillar.** One SvelteKit app with route groups and clean internal module boundaries, plus a small fixed set of backing services (see Stack), including one background worker. Never a new service per pillar. Keep extraction cheap for later; do not do it now.
6. **Reverse-decoupling.** Somnium must be fully coherent as a standalone site with its own domain. Better Life is a layer on top that aggregates pillars. Somnium must never depend on the portal to function. Either can be the public face via config.
7. **Brand and domain mapping at the edge.** A reverse proxy (host-based routing) decides whether the Somnium route group is served at `somnium.ro`, `betterlife.ro/somnium`, or under a "BetterSleep by Zenyth" brand. Switching is a routing rule, not a rebuild.
8. **Graceful degradation on missing credentials.** Every external integration (payments, invoicing, shipping, email) must start, build, and run with its credentials absent. A missing key logs a clear startup warning and disables only that capability; it never crashes the app or blocks local/dev work. This lets the full flow be built and tested before any provider contract exists.

## Fixed stack

SvelteKit with the **Node adapter** (SSR for SEO, plus BFF) + Tailwind + shadcn-svelte. paraglide-js for i18n, **Romanian first**, English later. Medusa.js for commerce (products, customers, orders, fulfillment, tax). Payload for CMS (articles, pillar config, quiz definitions, feed, editorial workflow). Supabase as the single managed Postgres for the whole system (see Data). Resend + React Email for email. Inngest for event orchestration, hosted in a separate Node worker. Oblio for invoicing + ANAF SPV. Stripe + Netopia for payments. Sameday for shipping. Umami self-hosted for product analytics.

Everything runs on a Node host (e.g. Railway). No edge or Workers runtime: the BFF and the worker call Node-centric SDKs (Medusa client, Oblio, React Email rendering) that do not run on workerd.

Running services: SvelteKit (Node, SSR + BFF), Medusa, Payload, a Node worker (Inngest functions + fiscal and commerce orchestration), one Postgres (Supabase), one Redis. That is the whole set.

## Pillar data model (Payload)

The `pillars` collection is the spine of the system:

```
pillar {
  slug, name, tagline,
  icon, accent_color, order,
  status: live | coming_soon | hidden,
  has_shop: bool,
  has_quiz: bool,
  quiz_ref, hero, landing_blocks
}
```

Navigation and pillar landing pages derive from this collection, and `status` governs what surfaces publicly. Articles reference a pillar. Quiz definitions reference a pillar.

## Identity model: lead-then-customer

One owner per stage, one explicit handoff. **Email is never a primary key or identity join.**

- Before commerce, a person is a `lead` in the app schema with its own UUID, an optional consented email, quiz submissions, behavioral tags, and first-touch UTM. An anonymous quiz creates a lead with a claim token, keyed by UUID, not email.
- At first purchase, Medusa creates a `customer`, the owner of commercial identity. `lead.medusa_customer_id` links the two by id.
- Claiming on signup or purchase: match by email if present, otherwise by the claim token from the post-quiz link. A dedicated merge function handles the "two emails, one person" case.
- The lead is the source of truth about a person before commerce; the Medusa customer is the source of truth for commercial identity after. Quiz and profile data always hang off the lead UUID, so they survive email changes.

## Consent and sensitive data

Quiz answers can reveal health information, so they are treated as sensitive regardless of the wellness positioning of the site. Positioning and disclaimers address medical-claims and liability; they do not change data-protection obligations.

- Consent is granular and purpose-specific, captured at the point of collection. Separate, unticked opt-ins: one for delivering the person's own results (required to receive the profile email), one explicitly for marketing and tips. Marketing sequences (Phase 3) may target only leads that gave marketing consent.
- A consent record stores, per lead: purpose, timestamp, the exact text shown, and its version.
- Right to erasure: deleting a lead cascades to quiz responses, consent records, and the link to the Medusa customer. A documented retention policy applies.
- Email is never used for a purpose the person did not consent to at capture.

## Layer responsibilities (each tagged by pillar)

- **Payload**: articles tagged by pillar; per-pillar landing pages; nav generated from the `pillars` collection; quiz definitions. The portal homepage is a curated editorial feed with a fixed, enumerable set of section types only: `featured_articles` (manual picks or the rule "latest from live pillars"), an optional `featured_product`, and a `quiz_invitation`. This is not a general-purpose page builder.
- **Medusa**: single instance and a single store, on the shared Supabase Postgres in its own schema. Products are tagged by pillar; `has_shop` per pillar controls whether a pillar sells. Somnium has the shop first; a later pillar with `has_shop: true` gets product collections tagged with its key in the same store, never a second store. One cart and one checkout span pillars; the pillar tag drives filtering, analytics, and recommendations.
- **Supabase**: the single managed Postgres for everything, in isolated schemas (Medusa, Payload, and the app schema for leads, quiz responses, consent, tags). Used as plain Postgres. All access is server-side through the SvelteKit BFF; RLS is optional defense-in-depth, not the primary access control. Lazy lead creation (quiz, newsletter, purchase), never for anonymous traffic.
- **Inngest**: hosted in the Node worker. Events carry a pillar tag, e.g. `quiz.completed { pillar }`. The order flow is governed by "Side effects and idempotency" below.

## Repo and routing structure

Monorepo, one SvelteKit app. Route groups: `(portal)` for Better Life aggregation pages (cross-pillar editorial homepage, how-it-works, cross-pillar content, community) and `(somnium)` for the sleep product (blog, screening, shop, checkout, account). Shared design system. A reverse proxy resolves which brand or domain maps to which route group.

## Data, migrations, and seeding

One Supabase Postgres hosts the whole system in isolated schemas: Medusa, Payload, and the app schema (leads, quiz responses, consent, tags).

All schema changes are migrations as code: committed, forward-only, runnable against a clean database with zero manual steps. No schema change is ever made by clicking in a dashboard.
- App schema: SQL migrations via the Supabase CLI in `supabase/migrations/`.
- Medusa and Payload: their native migrations, committed and run via CLI against the same Postgres. Never auto-sync or schema-push in production.
- Connections: the ORMs (Medusa, Payload) and all migrations use the direct or session-mode connection, never the transaction pooler (which breaks prepared statements and advisory locks). App-schema queries from the SvelteKit server may use the transaction pooler. Pool sizes are tuned per service to stay within the Postgres connection ceiling.
- Local parity: the full stack comes up via `docker compose` (Postgres + Redis + services), so portability is proven locally, not assumed. Dev databases reset freely (drop, migrate, seed); forward-only applies to production.

Seed data lives in one predefined directory at the repo root: `/seed`. A single command (`npm run seed`) initializes a fresh database from it, in dependency order: pillar config first, then articles, quiz definitions, products, demo fixtures. Seeding is idempotent (keyed on stable external handles, safe to re-run) and environment-aware: a rich demo seed for dev and staging, a minimal seed for production that at least populates the pillar config. Seeding is also phase-aware: before Medusa exists (Phase 1) the seed covers pillars, articles, and quiz definitions; product seeding via the Medusa admin API enters with Phase 2, keyed on a stable external handle so re-runs do not duplicate.

**Reproducibility target**: `clone → install → migrate → seed → run` brings any environment to a working state with no manual database work, and makes the demo resettable on demand.

## Side effects and idempotency

External side effects, especially fiscal ones, must be safe under retries. The order flow is decomposed into independent, individually idempotent effects, each recording its external reference and retried on its own:
- Oblio invoice (idempotency key derived from the order id; skip if `oblio_invoice_id` is already on the order),
- ANAF transmission (a step separate from invoice generation, because ANAF outages must not block the rest),
- Sameday AWB (idempotent on the order id; skip if an AWB exists),
- confirmation email.

Every effect checks before it acts. An Inngest retry must never produce a second real invoice or AWB.

## Quality baseline (from Phase 1)

- Internationalization from the first commit: every user-facing string goes through paraglide. No hardcoded text. Romanian first, English added later with no retrofit.
- Accessibility from Phase 1: semantic HTML, keyboard focus, sufficient contrast, ARIA where needed. Phase 4 audits and polishes; it does not introduce accessibility for the first time.

## Ops, testing, observability

- Service-to-service: SvelteKit (server) is the only caller of Medusa and Payload; the browser never holds service keys.
- Secrets via env, governed by the graceful-degradation rule above; a single documented `.env.example`.
- Tests required at least on the order flow and every fiscal effect (idempotency and missing-credential degradation). These are part of the Phase 2 acceptance criteria, not optional.
- Observability: structured logs plus error tracking. Umami is product analytics, not ops monitoring.

## Roadmap (four build phases, sized for context)

Phases are sized so each is a coherent build chunk that fits an agent's working context, not just product logic.

1. **Foundation and content spine**: monorepo, one Supabase Postgres, migrations + seed, pillar model, lead identity + granular consent, Payload content + quiz definitions + feed, portal + Somnium content, screening quiz, email capture + profile email, i18n and accessibility baseline. No commerce.
2. **Commerce**: Medusa, shop, checkout, payments (graceful key degradation), Sameday, Oblio + ANAF (idempotent effects, with tests), transactional email, host/domain routing, legal, cookie, SEO. Identity promotes lead to customer.
3. **Personalization and depth**: nurture sequences (marketing-consented leads only), dashboard, reviews, cross-sell, abandoned cart.
4. **Second pillar and demo polish**: a second pillar fully live, cross-pillar identity, CMS demo affordances, accessibility audit and performance.

The split between phase 1 and phase 2 is a build-context decision, not a product gate. The initial product is Somnium with its shop.

## Hard constraints (never)

- Never hardcode the number of pillars, or any pillar's name, order, or color.
- Never build separate apps or services per pillar.
- Never add an abstraction or config layer for a case that does not exist yet. The `pillar` abstraction is the only exception.
- Never make Somnium depend on the Better Life portal to run.
- Never use email as a primary key or identity join. Use the lead UUID and explicit links.
- Never use a person's email for a purpose they did not consent to at capture.
- Never let a missing external credential crash the app; warn and degrade.
- Never let an order side effect run without an idempotency guard.
- Never persist anonymous visitors as identities.
- Never hardcode a user-facing string; route it through paraglide.

## What this does not flex

Optimized for pillar, content, and brand churn: pillars, content types, the homepage feed, and landing composition are all extensible the normal way through Payload. What is deliberately frozen is the identity model and the commerce model. Changes there (third-party marketplace, subscriptions, B2B pivot, dropping the shop, replacing lead-then-customer) are new projects, not configuration.
