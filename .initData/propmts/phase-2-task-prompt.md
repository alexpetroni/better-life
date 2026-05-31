# Better Life · Phase 2 Task · Commerce

Read and follow `CLAUDE.md`. This file is only the Phase 2 scope. It assumes Phase 1 (foundation + content spine + lead identity + consent) is done.

## Phase 2 goal

Turn Somnium into a real product: add commerce on top of the Phase 1 spine. Medusa, shop, checkout, payments, shipping, and Romanian fiscal automation, all built so they can be developed and tested before any provider contract exists.

## What this phase builds

### Commerce backend and identity promotion
- Medusa on the shared Supabase Postgres, own schema, native migrations committed, connecting via direct/session mode.
- Identity promotion: at first purchase or account creation, create the Medusa customer and link `lead.medusa_customer_id`. Implement claiming (email match or post-quiz claim token) and the merge function for the two-emails case.

### Catalog and storefront
- Medusa catalog, single store. Products tagged by pillar (Somnium `has_shop: true`). Start smaller than 50 SKUs, validate, then extend. Product + category pages, internal search.
- Categories organized by problem solved, not only product type. Filters in the user's vocabulary.
- Cart, checkout, customer accounts (login, register, password reset). One cart spans pillars.

### Payments, shipping, fiscal (all with graceful degradation)
- Stripe + Netopia at checkout. A missing key warns at startup and disables only that method; checkout remains testable with whatever is configured.
- Sameday: live tariff at checkout + automatic AWB on confirmation. Missing credentials warn and degrade.
- Order side effects as independent, idempotent Inngest steps in the Node worker, per `CLAUDE.md`: Oblio invoice, ANAF transmission (separate step), Sameday AWB, confirmation email. Each checks before acting. Missing Oblio/Sameday credentials warn and skip rather than crash.
- Transactional email: order confirmation, shipping with AWB, delivery confirmed.

### Routing, compliance, SEO
- Host/domain routing via the reverse proxy: Somnium resolves as a standalone domain and/or under the portal, by config.
- Legal pages: terms, privacy, returns (14 days), shipping, contact, ANPC.
- Cookie consent banner with categories (necessary / analytics / marketing).
- Umami configured. Product structured data, sitemap updates for shop URLs.

## Explicitly NOT in this phase

- No personalized nurture sequences beyond the immediate transactional emails (Phase 3).
- No dashboard enrichment, reviews, wishlist, cross-sell (Phase 3).
- No new pillars going live, no English, no multi-currency, no extra couriers.

## How to start

Do not write feature code yet. First deliver:

1. The identity-promotion and claiming design (lead to customer, merge logic).
2. Medusa setup on the shared Postgres (schema isolation, connection mode, migrations).
3. The Inngest order-flow map: every effect, its idempotency key, its degradation behavior when credentials are missing.
4. A list of decisions you need from me before starting.

Then stop for review before implementation.

## Definition of done

A visitor can go article to quiz to profile email to product to checkout, pay with Stripe or Netopia, and receive an order confirmation, an Oblio invoice transmitted to ANAF SPV, a Sameday AWB, and the transactional emails. The lead is promoted to a Medusa customer with correct linking. Missing a payment, shipping, or fiscal credential produces a clear warning and a degraded-but-running app, never a crash. Somnium resolves as a standalone domain via the reverse proxy.

Automated tests are part of done, not optional:
- the order flow is covered end to end;
- each fiscal effect (Oblio, ANAF, Sameday AWB) is proven idempotent: a retried order produces no duplicate invoice or AWB;
- missing-credential degradation is proven: absent Oblio/Sameday/payment keys produce a warning and a skipped capability, not a crash.

Every step works without manual intervention.
