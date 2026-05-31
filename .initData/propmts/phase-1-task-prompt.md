# Better Life · Phase 1 Task · Foundation and Content Spine

Read and follow `CLAUDE.md`. It holds the architecture, stack, identity model, consent rules, and constraints. This file is only the Phase 1 scope.

## Phase 1 goal

Stand up the foundation and the content spine. A real, browsable site with pillar config, the editorial homepage, Somnium content, the screening quiz, and email capture. **No commerce in this phase** (no Medusa, no payments, no inventory, no fiscal automation). Commerce is Phase 2. This split exists to keep each build a coherent, context-sized chunk.

## What this phase builds

### Foundation
- Monorepo, one SvelteKit app (Node adapter), route groups `(portal)` and `(somnium)`, clean module boundaries.
- One Supabase Postgres. App-schema migrations via Supabase CLI in `supabase/migrations/`. ORM/migration connections use direct/session mode, not the transaction pooler. `docker compose` bringing up Postgres + Redis locally.
- `/seed` directory + `npm run seed`, idempotent and environment-aware, seeding pillar config first, then articles and quiz definitions. No products yet (they enter with Medusa in Phase 2).
- `clone → install → migrate → seed → run` must work from a clean checkout. Dev resets freely.

### Quality baseline (from the first commit)
- i18n: every user-facing string through paraglide, Romanian first. No hardcoded text.
- Accessibility: semantic HTML, keyboard focus, contrast, ARIA where needed.

### Pillars and portal
- `pillars` collection in Payload. Nav and pillar landing pages derive from it; `status` governs public surfacing.
- Editorial homepage feed with the fixed section types only: `featured_articles`, optional `featured_product` (renders hidden until Phase 2), `quiz_invitation`.

### Identity and consent
- `lead` model in the app schema: UUID, optional consented email, quiz submissions, behavioral tags, first-touch UTM, claim token. Keyed by UUID, never email. No Medusa yet.
- Granular consent at capture: separate unticked opt-ins for results-delivery vs marketing. Consent record per lead (purpose, timestamp, exact text shown, version).
- Erasure: a documented mechanism that deletes a lead and cascades to quiz responses and consent records.

### Content and quiz
- Payload blog: articles tagged by pillar, editorial workflow for collaborators, 15-20 articles for Somnium.
- One additional pillar with a few articles, so the cross-pillar feed is real, not theoretical.
- Screening tool migrated from `better-sleep-app-v2`; responses saved to the app schema, keyed to the lead UUID and tagged by pillar. Quiz answers treated as sensitive per `CLAUDE.md`.
- Post-quiz email capture with explicit, granular GDPR consent; immediate email with profile + recommendations (static template with simple logic in this iteration) via Resend.
- Standalone newsletter signup (its own marketing consent).

### Basics
- Content SEO: sitemap.xml, robots.txt, structured data (Article, BreadcrumbList), Open Graph, Twitter Cards.
- Wellness positioning with disclaimers on screening and content.
- Branding applied consistently.

## How to start

Do not write feature code yet. First deliver:

1. Monorepo + SvelteKit structure with route groups and module boundaries.
2. The Payload `pillars` and quiz-definition schemas, and the app-schema `lead` + quiz-response + consent model with the claim-token design and the erasure cascade.
3. Migration setup and the `/seed` layout + `npm run seed`, plus `docker compose` for Postgres + Redis.
4. A short Phase 1 build-order plan.

Then stop for review before implementation.

## Definition of done

The project runs from a clean clone: `clone → install → migrate → seed → run` brings up the portal and Somnium content with pillar config and two pillars' content seeded. A visitor can: see the Better Life homepage as a cross-pillar editorial feed; read Somnium articles; complete the screening; give granular consent and submit email; receive an immediate profile + recommendations email; subscribe to the newsletter. A lead can be erased with its quiz responses and consent records. All user-facing text runs through paraglide, and the accessibility baseline holds on key pages. Content SEO basics are in place. The Somnium routes function independently of the portal (standalone-capable; actual domain mapping is wired in Phase 2). Every step works without manual intervention.
