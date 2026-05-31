# Better Life · Phase 3 Task · Personalization and Depth

Read and follow `CLAUDE.md`. This file is only the Phase 3 scope. It assumes Phases 1 and 2 are done (Somnium is a working product with commerce).

## Phase 3 goal

Make Somnium feel like a mature product: full personalization, a real customer dashboard, trust and conversion features. This phase does NOT add new pillars; it deepens the one live product.

## What this phase builds

### Personalized orchestration (Inngest, in the Node worker)
- Nurture sequences with branch logic on the quiz profile (different paths for different sleep profiles, e.g. wired-mind, 3am-waker, exhausted-but-restless). Marketing sequences target only leads that gave marketing consent in Phase 1; transactional messages are unaffected.
- Conditional delays, wait-for-event flows, re-engagement on inactivity.
- Abandoned cart recovery.
- Post-purchase education tied to the products bought + the quiz profile.
- All content via React Email, all sending via Resend.

### Customer experience
- Dashboard: quiz profile visible, order history, addresses, option to retake the screening.
- Recommendations area driven by current profile + purchase history.
- Wishlist / save-for-later.

### Conversion and trust
- Reviews with a moderation workflow in Payload.
- Cross-sell on cart and post-purchase, driven by profile + viewed products. For identified leads/customers only; anonymous viewing stays ephemeral client-side state, never persisted as identity.
- Profile-matched explanation on product pages of why an item is recommended.

### Content depth and SEO
- Article media embeds (audio, video, callouts) where the editorial pipeline supports it; stronger internal linking.
- Search Console wired up; iterate structured data and metadata on real query data; fix crawl/indexing/Core Web Vitals issues.

### Stretch (only if time)
- A/B test on the quiz CTA and one product-page copy variant.

## Explicitly NOT in this phase

- No new pillars going live, no English i18n, no multi-currency, no extra couriers, no mobile app, no community, no digital products.

## How to start

Do not write feature code yet. First deliver:

1. A Phase 3 build-order plan with dependencies between items.
2. The Inngest workflow map: events, branches, delays, exits.
3. The app-schema deltas for reviews, wishlist, and dashboard data.
4. A list of decisions you need from me before starting.

Then stop for review before implementation.

## Definition of done

A new visitor can: arrive via SEO, read articles, take the screening, receive a personalized profile email, enter a profile-specific nurture sequence, abandon a cart and be recovered, complete a purchase, receive invoice and AWB, log into the dashboard, see the quiz profile and order history, leave a moderated review, and receive post-purchase education tied to what was bought. Every step works without manual intervention.
