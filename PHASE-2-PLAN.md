# Better Life · Phase 2 Plan — Commerce

**Status:** design for review. No feature code yet. Stop point before implementation.

Adds commerce on top of the Phase 1 spine: Medusa, shop, checkout, payments
(Stripe + Netopia), Sameday shipping, Romanian fiscal automation (Oblio + ANAF),
identity promotion (lead → customer), host/domain routing, legal/cookie/SEO — all
built to develop and test before any provider contract exists (graceful degradation).

Delivers the four artifacts the task asks for: (1) identity-promotion & claiming
design, (2) Medusa setup, (3) Inngest order-flow map, (4) decisions needed.

## Builds on (Phase 1, shipped)

- `app.leads` already has `medusa_customer_id` (nullable), `claim_token` +
  `claim_token_used_at` (single-use), unique `lower(email)`. `quiz_responses` and
  `consent_records` cascade on lead delete. A minimal merge already runs in the
  quiz capture flow (repoint responses, drop anon lead).
- SvelteKit BFF is the only caller of backing services. Resend/React Email package
  (`packages/emails`) compiled to dist. Redis container present but idle. No worker yet.
- Pillars carry `hasShop` (Somnium `true`); products will be tagged by pillar.

## Versions

Medusa **v2.15.5** (`@medusajs/medusa`, `@medusajs/js-sdk`, `@medusajs/payment-stripe`),
Inngest **4.5.0**. Netopia has no official Medusa module → custom payment provider.

---

## 1. Identity promotion & claiming (lead → customer)

**Owners:** the `lead` owns identity before commerce; the Medusa `customer` owns
commercial identity after. `lead.medusa_customer_id` links them by id. Email is
never the join.

**Claim-token transport.** The post-quiz email links to `/claim?token=…` (Phase 1
stub exists). In Phase 2, arriving with a token sets an httpOnly `bl_claim` cookie
that survives until checkout/registration, where promotion consumes it
(`claim_token_used_at`).

**Promotion triggers (synchronous, in the BFF — must succeed for the order/account):**
- **Account registration** → create Medusa customer, then link/claim a lead.
- **Guest checkout completion** (order placed with an email) → create or reuse the
  Medusa customer, then link/claim a lead.

**Claim resolution order** (find the lead to link):
1. Valid unused `bl_claim` token → that lead.
2. Else `lower(email)` matches an existing lead → that lead.
3. Else create a new lead (lazy) with the email.
Then: `lead.medusa_customer_id = customer.id`, stamp `claim_token_used_at`. Idempotent
— if the lead is already linked to this customer, do nothing.

**Merge ("two emails, one person").** When the token points to lead A but the
checkout email matches a different lead B, one person has two records.
`mergeLeads(survivor, merged)` (a generalization of the Phase 1 merge):
- repoint `quiz_responses` + `consent_records` from merged → survivor,
- union `behavioral_tags`, keep survivor's `first_touch_utm` (earliest), carry the
  non-null `medusa_customer_id`,
- delete the merged lead, in one transaction.
- **Survivor rule (decision #3):** the customer-linked lead wins; if neither is
  linked, the older / quiz-bearing one wins.

**Boundary:** linking is synchronous and idempotent at the moment of customer
creation. Order *side effects* are async (section 3). The app schema keeps only the
link id + email-for-matching; Medusa is the source of truth for customer PII.

---

## 2. Medusa setup

- **New workspace `apps/medusa`** (Medusa v2 app, admin + store API on :9000). The
  SvelteKit BFF calls it server-side via `@medusajs/js-sdk` (store) and admin API
  for seeding. Browser never holds Medusa keys.
- **Shared Postgres, isolated `medusa` schema.** Connect via **DIRECT_URL**
  (session/direct :5432, never the tx pooler — MikroORM needs prepared statements +
  advisory locks). Schema isolation via a dedicated `medusa` schema (connection
  `search_path=medusa`); **decision #2** if Medusa can't cleanly target a non-public
  schema, fall back to a separate logical database on the same instance.
- **Redis gets consumers:** Medusa v2 cache, event bus, and workflow-engine modules
  use `REDIS_URL` (the container that was idle in Phase 1). The Inngest worker also runs.
- **Migrations:** native `medusa db:migrate`, committed, run via CLI against
  DIRECT_URL. Never schema-push in prod. `npm run migrate` orchestrates app-schema →
  Payload → Medusa.
- **Store:** single store, one region (Romania), currency **RON**, one sales channel.
- **Catalog (<50 SKUs to start):** products tagged by pillar via `metadata.pillar`
  (Somnium). Categories **organized by problem solved** (e.g. "Greu de adormit",
  "Treziri nocturne", "Somn neodihnitor"), filters in the user's vocabulary.
- **Seed becomes phase-2-aware:** products seeded via the Medusa **admin API**, keyed
  on a stable `handle`/`external_id` so re-runs don't duplicate (extends the Phase 1
  idempotent seed). Needs real or demo product data (**decision #5**).
- **Storefront in `apps/web`:** product + category pages, internal search, cart,
  checkout, customer accounts (login/register/password reset). One cart spans pillars.
  Customer auth = Medusa JWT held in an httpOnly cookie by the BFF (**decision #8**).

---

## 3. Inngest order-flow map (Node worker)

**New workspace `apps/worker`** hosting Inngest functions (Inngest dev server local).
Events carry a `pillar` tag.

**Trigger:** `order.placed { orderId, pillar }`, emitted by the BFF/Medusa subscriber
once checkout completes (payment authorized/captured).

**Idempotency state lives on the Medusa order metadata** (per CLAUDE.md "skip if
`oblio_invoice_id` is already on the order"); each step reads metadata before acting.
**Decision #4:** optionally mirror to an `app.order_effects` table for ops/querying.

Each effect is an independent `step.run(...)` (Inngest persists + retries per step),
checks before it acts, and degrades on missing credentials:

| # | Step | Idempotency key / skip-if | Missing-credential behavior |
|---|------|---------------------------|------------------------------|
| 1 | **Oblio invoice** | order id; skip if `metadata.oblio_invoice_id` set | warn + skip, record skipped |
| 2 | **ANAF transmission** (separate step) | skip if `metadata.anaf_status = sent`; needs invoice | warn + skip (ANAF outage must not block) |
| 3 | **Sameday AWB** | order id; skip if `metadata.sameday_awb` set | warn + skip |
| 4 | **Order confirmation email** | skip if `metadata.email_confirmation_sent` | (Resend absent → warn + skip, per Phase 1) |

**An Inngest retry never produces a second invoice or AWB** — the check-before-act +
external reference on the order guarantees it.

**Other transactional emails (React Email + Resend):**
- shipping email with AWB → after step 3 (event `shipment.created`),
- delivery confirmed → on Sameday delivery webhook (event `order.delivered`).

**Payments (Medusa providers, graceful):** `@medusajs/payment-stripe` + a **custom
Netopia provider**. A missing key disables only that method at startup; checkout
remains testable with whatever is configured.

**Shipping tariff (synchronous):** Sameday live tariff called in checkout to show
cost — separate from the async AWB. Missing creds → degrade (flat/disabled option).

---

## 4. Monorepo & ops additions

- `apps/medusa` (commerce), `apps/worker` (Inngest functions), Netopia provider
  (in medusa or a package), reverse proxy.
- **Reverse proxy (decision #7):** host-based routing so the `(somnium)` group serves
  at `somnium.ro` and/or `betterlife.ro/somnium`. Propose **Caddy** (simplest) in
  docker-compose; switching brand/domain is a routing rule, not a rebuild.
- **docker-compose** gains Medusa, the worker, and the proxy alongside Postgres + Redis.
- **Legal pages** (terms, privacy, returns 14 days, shipping, contact, ANPC),
  **cookie consent banner** (necessary / analytics / marketing — gates Umami), **Umami**
  self-hosted, product structured data + sitemap shop URLs.

## 5. Testing (part of done)

- **Order flow e2e** (article → quiz → email → product → checkout → confirmation).
- **Idempotency:** a retried `order.placed` produces no duplicate invoice/AWB (assert
  one Oblio id, one AWB).
- **Degradation:** absent Oblio/Sameday/payment keys → warning + skipped capability,
  never a crash.
- Proposed stack (**decision #10**): Vitest (unit/integration on worker steps + merge)
  + Playwright (storefront e2e). Inngest step testing via its test utilities.

## 6. Decisions

**Locked (confirmed):**
- **Catalog:** demo Somnium catalog now (small set, RON prices, problem-solved
  categories), seeded idempotently via the admin API; real products swap in later.
- **Reverse proxy:** **Caddy** in docker-compose (host-based routing, auto HTTPS).
- **Test stack:** **Vitest** (worker steps, mergeLeads, idempotency, degradation) +
  **Playwright** (storefront e2e).
- **Merge survivor rule:** customer-linked lead wins; else oldest/quiz-bearing.

**Proceeding on these defaults (raise any to change):**
- Medusa **v2.15.5**.
- Schema isolation via a dedicated `medusa` schema (search_path); fall back to a
  separate logical DB only if Medusa can't target a non-public schema.
- Idempotency state on **Medusa order metadata** (per CLAUDE.md); optional
  `app.order_effects` mirror deferred unless ops needs it.
- **Custom Netopia** payment provider (no official module); builds without sandbox
  creds via graceful degradation.
- **Customer auth:** Medusa JWT in an httpOnly cookie held by the BFF.
- **Guest checkout** enabled (guest → lead → customer at purchase).
- **Umami** loads only with analytics consent (necessary / analytics / marketing).
