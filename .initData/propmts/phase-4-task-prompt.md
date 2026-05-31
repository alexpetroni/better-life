# Better Life · Phase 4 Task · Second Pillar and Demo Polish

Read and follow `CLAUDE.md`. This file is only the Phase 4 scope. It assumes Phases 1 to 3 are done.

## Phase 4 goal

Reach a demo-ready functional prototype that proves the architecture, not just Somnium-in-a-box. A second pillar goes genuinely live (content + landing + quiz, no shop), exercising the shared infrastructure. The beneficiary can reconfigure pillars and recompose the homepage in the CMS without a deploy. The whole system is polished enough to demo.

## Decision required before starting

Pick the second pillar to bring live. Candidates: Better Body (adjacent, concrete, easy content), Better Mind (high stakeholder interest, more abstract), Better Action (most behavioural, easiest quiz). This pillar is **content + landing + quiz only**, `has_shop: false`. It proves the multi-pillar pattern, it does not launch a second product.

## What this phase builds

### Second pillar going live
- Flip the chosen pillar's `status` from `coming_soon` to `live`.
- 5-8 articles tagged with that pillar, full editorial workflow.
- Pillar landing page rendering from `hero` + `landing_blocks`.
- Lightweight screening quiz for that pillar, writing to the SAME lead model, tagged with the pillar key.
- Post-quiz email sequence specific to that pillar, reusing the Inngest pattern from Phase 3.

### Cross-pillar identity and discovery
- One lead, multiple quiz tags. Verify and demo end to end.
- Cross-pillar nav: move between live pillars without losing identity.
- Recommendation widgets pulling content from multiple pillars by profile tags.
- Newsletter targetable by pillar interest.

### Portal polish
- Editorial homepage feed surfaces content from both live pillars; the optional featured product and quiz invitation render cleanly.
- How-it-works reflects the real cross-pillar journey (assess, understand, transform).
- About / mission / philosophy pages holding the Better Life narrative without overclaiming.

### Demo-readiness
- Accessibility audit on Somnium and the second pillar, building on the baseline carried since Phase 1; fix remaining issues.
- Performance pass: image optimization, font loading, route preloading, Core Web Vitals green on key pages.
- Mobile reviewed on real devices.
- Error, loading, and empty states polished.
- Umami configured with the demo-relevant events: pillar engagement, quiz completion by pillar, conversion by funnel.

### CMS demo affordances
In the Payload admin, in under a minute and without a deploy, the beneficiary or you can:
- recompose the homepage feed (swap a featured article, change the featured product, change the quiz invitation),
- rename a pillar and see nav and its landing page update,
- change a pillar's accent color,
- flip a pillar's `status` (live / coming_soon / hidden) and see nav and public pages reflect it,
- reorder navigation by changing `order`.
Verify all of this on production, not just dev.

## Explicitly NOT in this phase

- No third pillar going live, no second shop, no English i18n, no multi-currency, no EU/UK shipping, no mobile app, no community, no digital products.

## How to start

Do not write feature code yet. First deliver:

1. The chosen pillar and why (one paragraph).
2. The Phase 4 build-order plan.
3. The content brief for the second pillar's 5-8 articles and its quiz (titles, angles, voice match).
4. The cross-pillar identity test plan: scenarios proving one-lead-multiple-pillars.
5. A list of decisions you need from me before starting.

Then stop for review before implementation.

## Definition of done (functional prototype)

A stakeholder demo can show, in one session:

1. The Better Life homepage as a cross-pillar editorial feed surfacing both live pillars (Somnium + the second), with an optional featured product and a quiz invitation.
2. A full Somnium journey: article to quiz to personalized email to product to checkout to invoice to dashboard.
3. A full second-pillar journey: article to pillar quiz to personalized email tied to that profile.
4. The same person appearing as one lead across both pillars, with both sets of quiz tags.
5. A live CMS edit recomposing the homepage feed, taking effect on production.
6. A live CMS edit changing a pillar (rename, accent, or status) reflected in nav and public pages, then reverted.
7. Analytics showing real events, basic SEO health, accessibility baseline met.

If all seven work without manual intervention or developer hacks during the demo, the prototype is functional.
