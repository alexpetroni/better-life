# Better Life · Phase 3 Plan — Personalization and Depth

**Status:** ✅ COMPLETE — all items implemented and merged to `master`. Shipped across
four chunks: P3-1 `64cf6d2` (schema + reviews collection + content fields),
P3-2 `fd7a4db` (Inngest nurture orchestration + lifecycle events), P3-3 `e76aab7`
(recommendations + dashboard + cross-sell + wishlist), P3-4 `effbdaf` (reviews UI +
moderation + content depth + SEO). Item 14 (A/B) skipped per locked decision.
Verified end-to-end against the live stack (Medusa/Payload/web/worker + an Inngest
dev runtime) on 2026-06-02 — see §5. Remaining work is environmental only: real
elapsed-time delays, live email sends (`RESEND_API_KEY`), and CWV/GSC on a live domain.

Deepens Somnium (no new pillars): profile-driven nurture orchestration, customer
dashboard, recommendations, wishlist, moderated reviews, cross-sell, richer
content + SEO. Delivers the four artifacts: (1) build-order plan, (2) Inngest
workflow map, (3) app-schema deltas, (4) decisions needed.

## Builds on (Phases 1–2, shipped)

- `app.leads` (email, `behavioral_tags`, `medusa_customer_id`), `app.quiz_responses`
  (`profile_key`, `pillar_slug`), `app.consent_records` (purpose `marketing` /
  `results_delivery`), `app.order_effects`. Somnium quiz profiles: `hyperarousal`,
  `tension`, `behavioral`, `conditioned`.
- Worker (`apps/worker`) with Inngest + `order.placed`; BFF dispatch; `packages/emails`
  (profile + order-confirmation) via Resend. Medusa store (customer, orders,
  addresses, cart). Payload (pillars, articles, quizzes, users).

---

## 1. Build-order plan (dependencies)

1. ✅ **Schema deltas + events foundation** (§3) — wishlist, product_views,
   `leads.last_seen_at`, marketing-unsubscribe token (`0003`); Payload `reviews`
   collection; article media/related-articles fields. *(P3-1)*
2. ✅ **Lifecycle events** — BFF emits `quiz.completed`, `checkout.started`,
   `order.placed`+email, `newsletter.subscribed`, `marketing.unsubscribed` via a
   gated Inngest client (`INNGEST_ENABLED`); stamps `last_seen_at`. *(P3-2)*
3. ✅ **Marketing-consent gate** — worker `isMailable`: latest `marketing` consent
   must be `granted` (unsubscribe writes a revoke row). Transactional mail bypasses. *(P3-2)*
4. ✅ **Profile nurture sequences** (Inngest) — `profile-nurture`, branches on
   `profileKey`; +1d/+3d/+7d with purchase-cancel via `waitForEvent`. *(P3-2)*
5. ✅ **Abandoned-cart recovery** (Inngest) — `abandoned-cart`: `checkout.started`
   → waitForEvent `order.placed` (1h) → reminder, +24h second nudge. *(P3-2)*
6. ✅ **Post-purchase education** (Inngest) — `post-purchase-education`: `order.placed`
   → +1d education (products bought) + +7d review request. *(P3-2)*
7. ✅ **Dashboard** — profile summary, orders, addresses, retake-screening + wishlist
   links, profile-matched recommendations. *(P3-3)*
8. ✅ **Recommendations engine** — rule-based `rankByProfile`: product↔profile tags
   (`metadata.profiles` seed) + purchase-history exclusion; unit-tested. *(P3-3)*
9. ✅ **Cross-sell** (product page + cart) + **profile-matched "why"** on product
   pages — identified leads/customers only. *(P3-3)*
10. ✅ **Wishlist / save-for-later** — identified only; `/wishlist` route + save
    toggle + product-view tracking. *(P3-3)*
11. ✅ **Reviews + moderation** — Payload collection + storefront submit/display;
    verified-purchase gate + moderate-all; BFF service-login writes `pending`. *(P3-4)*
12. ✅ **Content depth** — article callout box + video/audio embeds + "Read next"
    internal linking, in the shared `ArticleView`. *(P3-4)*
13. ✅ **SEO** — GSC verification meta (`PUBLIC_GSC_VERIFICATION`), Article/Breadcrumb
    + Product `aggregateRating` JSON-LD, lazy media. *CWV measurement needs a live domain.* *(P3-4)*
14. ⏭️ **Stretch: A/B** — **SKIPPED** per locked decision (§4).

---

## 2. Inngest workflow map

**Events** (BFF → worker): `quiz.completed {leadId,pillar,profileKey}` ·
`checkout.started {cartId,email,leadId}` · `order.placed {orderId,pillar}` (exists) ·
`order.delivered {orderId}` · `newsletter.subscribed {leadId}` ·
`marketing.unsubscribed {leadId}`.

**Gate:** every *marketing* function first checks the consent gate (§1.3); exits
immediately if not mailable. Transactional effects (P2-4) are unaffected.

**A. Profile nurture** — trigger `quiz.completed`:
- branch on `profileKey` → profile-specific copy (wired-mind/3am-waker/etc. ≈ our
  hyperarousal/conditioned/tension/behavioral).
- `step.waitForEvent('order.placed', { timeout: '14d', match email })` running
  alongside delays; a purchase **cancels** the sequence.
- delays: +1d tip → +3d profile-matched product intro → +7d re-engagement.
- **exits:** purchase, `marketing.unsubscribed`, end of cadence.

**B. Abandoned cart** — trigger `checkout.started`:
- `step.waitForEvent('order.placed', { timeout: '1h', match cartId/email })`.
- on timeout: reminder email (+ cross-sell). Second nudge at +24h (another waitForEvent).
- **exits:** purchase, no email (can't contact), unsubscribe.

**C. Post-purchase education** — trigger `order.placed`:
- +1d: education tied to products bought + `profile_key`.
- +7d: usage tips + **review request** (links to the product review form).

**D. Re-engagement** — Inngest cron (daily): leads with `last_seen_at` older than the
inactivity window + marketing-consented + no recent sequence → one re-engagement email.

Each external action is its own `step.run` (idempotent, retried independently), as in P2-4.

---

## 3. App-schema deltas

**Migration `0003_personalization.sql` (app schema):**
```sql
-- Wishlist (identified only; anonymous stays client-side, never persisted)
app.wishlist_items (id uuid pk, lead_id uuid → leads on delete cascade,
                    product_handle text, created_at, unique(lead_id, product_handle))

-- Viewed products (identified only) — feeds cross-sell
app.product_views (id uuid pk, lead_id uuid → leads on delete cascade,
                   product_handle text, viewed_at, ...)

-- Re-engagement inactivity signal
alter table app.leads add column last_seen_at timestamptz;

-- Marketing unsubscribe (one-click). Unsubscribe = a new marketing consent row
-- with granted=false (we already version consent), plus a single-use token.
alter table app.leads add column unsubscribe_token uuid not null default gen_random_uuid();
```
Erasure already cascades (FKs). Recommendations + dashboard read mostly **derived**
data (quiz profile, Medusa orders/addresses) — no new tables.

**Payload deltas:**
- **`reviews`** collection: `productHandle`, `rating` (1–5), `title`, `body`,
  `authorName`, `leadId`/`email`, `pillar`, `status` (pending|approved|rejected),
  `createdAt`. Public read = approved only; moderation via the status field + admin
  (mirrors the articles workflow). BFF is the only writer (submits as `pending`).
- **`articles`**: add a `blocks` field for media (callout / video-embed / audio) and a
  `relatedArticles` relationship (internal linking).
- **`products` profile tags:** add `metadata.profiles` (which sleep profiles a product
  suits) in the Medusa seed → drives recommendations + the product-page "why".

---

## 4. Decisions

**Locked (confirmed):**
- **Reviews:** verified-purchase only (must have bought the product) + moderate-all
  (every review `pending` until approved in Payload).
- **Recommendations + product "why":** rule-based — tag products with the sleep
  profiles they suit (`metadata.profiles`, seed change); match the lead's quiz
  profile, exclude already-purchased.
- **Abandoned cart:** `checkout.started` (email captured) → `waitForEvent
  order.placed` (1h) → reminder, +24h second nudge; only checkout-reached carts are
  recoverable.
- **Stretch A/B:** skipped.

**Proceeding on these defaults (raise any to change):**
- Nurture cadence per profile: +1d tip / +3d profile-matched product / +7d
  re-engagement; purchase within 14d cancels the sequence.
- Re-engagement inactivity window: 30 days.
- Article media types: callout + video embed + audio.
- SEO/Search Console: implement the verification hook + structured-data iteration +
  CWV fixes now; connect the real GSC account when a live domain exists.
- Unsubscribe: one-click link in marketing emails → records a `marketing` consent
  revoke via `unsubscribe_token`.
- New copy stays Romanian-only (English i18n is out of scope this phase).

*All defaults above were implemented as stated.*

---

## 5. Verification (2026-06-02, end-to-end against the live stack)

Checked against running Medusa/Payload/web/worker plus an Inngest dev runtime.
Unit tests: worker 10/10 (incl. nurture gate/idempotency), web 8/8 (incl. `rankByProfile`).

- **Recommendations:** re-ran the Medusa seed → all 6 SKUs carry `metadata.profiles`;
  product page renders the cross-sell strip.
- **Reviews:** submitted a `pending` review → hidden from anon API + storefront;
  approved → surfaced on both with `din 5` aggregate + `aggregateRating` JSON-LD;
  deleted → reverted. Verified-purchase gate enforced server-side.
- **Content depth:** populated an article → callout, YouTube-nocookie embed, `<audio>`,
  and "Read next" related links all rendered; reverted.
- **SEO:** Article + BreadcrumbList + Product JSON-LD present; `aggregateRating` only
  with approved reviews; GSC meta correctly conditional on the env var.
- **Inngest:** all 5 functions register (valid triggers + daily cron); `quiz.completed`
  spawned a `profile-nurture` run (waiting on its purchase-cancel `waitForEvent`);
  `order.placed` fanned out to `order-effects` (graceful skip) + `post-purchase-education`,
  and its matching email cancelled the in-flight nurture run — purchase-cancel confirmed.

**Environmental-only remaining:** real elapsed-time delays (1d/3d/7d/24h), live email
sends (no `RESEND_API_KEY`), CWV + real GSC on a live domain.
