# Better Life · Phase 3 Plan — Personalization and Depth

**Status:** design for review. No feature code yet. Stop point before implementation.

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

1. **Schema deltas + events foundation** (§3) — wishlist, product_views,
   `leads.last_seen_at`, marketing-unsubscribe token; Payload `reviews` collection;
   article media/related-articles fields. *Everything below depends on this.*
2. **Lifecycle events** — emit `quiz.completed`, `checkout.started`, `order.placed`
   (exists), `newsletter.subscribed`, and `marketing.unsubscribed` from the BFF;
   stamp `last_seen_at`. *Depends on 1.*
3. **Marketing-consent gate** — a worker helper: a lead is mailable only if its
   latest `marketing` consent is `granted` and not unsubscribed. Transactional mail
   bypasses this. *Depends on 1–2.*
4. **Profile nurture sequences** (Inngest) — branch on `profile_key`. *Depends on 2–3.*
5. **Abandoned-cart recovery** (Inngest) — `checkout.started` → wait-for `order.placed`.
   *Depends on 2–3.*
6. **Post-purchase education** (Inngest) — `order.placed` → profile + products bought.
   *Depends on 2–3, recommendations (8) for product picks.*
7. **Dashboard** — profile, orders, addresses, retake screening. *Depends on 1 (link)
   + Medusa customer.*
8. **Recommendations engine** — rule-based: product↔profile tags + purchase-history
   exclusion. *Depends on 1 (product profile tags) + quiz profile.*
9. **Cross-sell** (cart + post-purchase) + **profile-matched "why"** on product pages —
   identified leads/customers only. *Depends on 8.*
10. **Wishlist / save-for-later** — identified only. *Depends on 1.*
11. **Reviews + moderation** — Payload collection + storefront submit/display.
    *Depends on 1; independent of orchestration.*
12. **Content depth** — article media embeds (callout/video/audio) + internal linking.
    *Depends on 1 (Payload fields).*
13. **SEO/CWV** — Search Console verification, structured-data iteration, Core Web
    Vitals fixes. *Independent; needs a live domain.*
14. **Stretch: A/B** — quiz CTA + one product-copy variant. *Last, optional.*

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
