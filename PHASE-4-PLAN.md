# Better Life · Phase 4 Plan — Second Pillar and Demo Polish

**Status:** ✅ COMPLETE — all 10 build-order steps implemented and merged to `master`, then
verified end-to-end against the live stack (2026-06-03). See the Verification section. Remaining work is
runtime/manual only: axe/Lighthouse a11y audit, Core Web Vitals, real-device mobile,
and pointing `PUBLIC_UMAMI_SRC` at a live Umami instance.

Phase 4 goal: a demo-ready functional prototype that proves the architecture, not
Somnium-in-a-box. A second pillar goes genuinely live (content + landing + quiz, **no
shop**), exercising the shared infrastructure; the beneficiary can reconfigure pillars
and recompose the homepage in the CMS without a deploy; the system is polished enough
to demo. Delivers the five artifacts requested: (1) chosen pillar + why, (2) build-order
plan, (3) content brief, (4) cross-pillar identity test plan, (5) decisions needed.

## Builds on (Phases 1–3, shipped)

- Pillar spine is already CMS-driven: nav (`loadNav`), pillar landing (`getPillar` →
  `hero`), accent/status/order all read from Payload at request time — so rename /
  accent / status-flip / reorder **already reflect live without a deploy**.
- `better-body` is **already `status: live`** in the seed (accent `#16A34A`, `activity`
  icon, hero, order 2) with a handful of articles, but `hasShop:false`, `hasQuiz:false`,
  no `quizSlug`. `better-mind` + `better-action` stay `coming_soon` (status-gating proof).
- Lead model is pillar-agnostic (UUID; `quiz_responses.pillar_slug`; `behavioral_tags`
  carry `quiz:<pillar>` + `profile:<key>`). Identity cookies (`bl_claim`, `bl_session`)
  are path `/`, so identity already survives moving between route groups.
- Quiz = CMS-authored content + a code matcher in a registry (`getMatcher`). Inngest
  nurture (P3-2) triggers on `quiz.completed {leadId,pillar,profileKey,email}` and
  branches on `profileKey`; the consent gate + send log already exist.

---

## 1. Chosen pillar — Better Body (recommendation)

**Better Body**, for four reasons. (a) It is already scaffolded — live status, accent,
hero, and ~4 articles exist — so effort concentrates on the *actual* Phase-4 goal
(proving the cross-pillar pattern + demo polish), not on standing a pillar up from
zero. (b) Its content is concrete and non-sensitive — movement, recovery, energy,
fuelling — which is easy to author well in Romanian and keeps the screening quiz
concrete, unlike Better Mind's more abstract, more health-adjacent territory. (c) It is
genuinely *adjacent* to Somnium (sleep ↔ recovery ↔ daytime energy), so cross-pillar
recommendation widgets and a one-lead-two-profiles story are meaningful, not contrived.
(d) Lowest content/clinical risk of the three candidates → the most reliable demo.
This pillar is **content + landing + quiz only, `has_shop:false`**: it proves the
multi-pillar pattern, it does not launch a second product. **Confirmed (§8).**

---

## 2. Build-order plan (dependencies)

1. **CMS spine deltas** (§5) — add a `Homepage` Payload global (editor-curated feed) and
   a `landingBlocks` blocks field on `Pillars`. *Everything CMS-composable depends on this.*
2. **Better Body content** — seed/author 5–8 published articles (§3), reconciling the
   existing ones; tag `pillar=better-body`; full editorial workflow (draft→review→published).
3. **Better Body quiz** — CMS quiz definition `better-body-movement` + a code matcher in
   the registry; flip the pillar `hasQuiz:true` + `quizSlug`. Writes to the SAME lead
   model, tagged `pillar=better-body`. *Depends on the quiz/matcher pattern (exists).*
4. **Pillar nurture sequence** — reuse the P3-2 Inngest `profile-nurture` pattern,
   branched by Better Body `profileKey` + Romanian copy; gated by the same marketing
   consent. *Depends on 3.* (Make profile copy pillar-aware rather than fork the function.)
5. **Pillar landing from `hero` + `landingBlocks`** — render the composable blocks on the
   pillar landing page. *Depends on 1.*
6. **CMS-driven homepage feed** — the portal homepage reads the `Homepage` global
   (featured article(s), featured product handle, quiz-invitation pillar) with the
   current rule-based behaviour as the fallback when unset. *Depends on 1.*
7. **Cross-pillar discovery** — recommendation widgets pulling content across live
   pillars by `profileTags`; cross-pillar nav already works (verify). *Depends on 2.*
8. **Newsletter targetable by pillar interest** — capture a pillar-interest tag on
   signup; store as a `behavioral_tag` / consent dimension. *Depends on lead model (exists).*
9. **Portal narrative pages** — How-it-works reframed as the cross-pillar journey
   (assess → understand → transform); About / mission / philosophy. *Independent.*
10. **Demo-readiness** — accessibility audit (Somnium + Better Body), performance pass
    (images/fonts/preload/CWV), polished error/loading/empty states, Umami demo events,
    mobile review. *Last; depends on the surfaces above existing.*

---

## 3. Content brief — Better Body

**Voice (match Somnium):** evidence-based but plain-spoken, calm, practical, Romanian,
second-person, wellness-not-medical (no diagnoses, no cures, no overclaiming). Each
article: a clear hook, 600–1000 words, one actionable takeaway, `profileTags` set, an
optional callout, internal links to 1–2 related articles (incl. one Somnium cross-link
where natural — e.g. recovery ↔ sleep).

**Articles (target 6–7; reconcile the ~4 existing `better-body` ones, add the rest):**
1. *Mișcarea de care ai nevoie de fapt* — movement minimums vs. "no-pain-no-gain"; profile `sedentary`.
2. *Recuperarea nu e lene* (exists) — sleep + rest days as part of training; cross-link Somnium; `overreached`.
3. *Bazele unei alimentații care îți dă energie* (exists) — fuelling for steady energy; `depleted`.
4. *Postura și energia zilnică* (exists) — desk-bound posture + micro-movement; `sedentary`.
5. *De ce te plafonezi: consecvența bate intensitatea* — habit/consistency over heroics; `inconsistent`.
6. *Energie după-amiaza fără cofeină în plus* — energy dips, light, food timing; cross-link Somnium; `depleted`.
7. *(optional)* *Cum să începi după o pauză lungă* — restart-after-a-break; `inconsistent`.

**Quiz — `better-body-movement`** (lightweight screening, ~5–6 questions, mirrors the
Somnium pattern: single-select questions → one of four profiles via a deterministic
code matcher). Proposed profiles (RO titles, code keys):
- `sedentary` — *Sedentarul* — long sitting, little daily movement.
- `depleted` — *Fără combustibil* — low/erratic energy, under-fuelled or skipping meals.
- `overreached` — *Prea mult, prea repede* — trains hard, under-recovers.
- `inconsistent` — *Pornit-oprit* — motivated in bursts, no durable routine.
Each profile: description + one practical tip + 2–3 recommendations + a CTA into the
Better Body articles (no shop CTA). Disclaimer + result-disclaimer mirror Somnium's.

---

## 4. Cross-pillar identity test plan

Goal: prove **one lead, multiple pillar tags**, end to end, with no email-as-identity.

- **S1 — Two quizzes, one lead (anonymous→identified):** take the Somnium quiz
  (anonymous lead + `bl_claim`), then the Better Body quiz in the same browser. Assert:
  exactly **one** `app.leads` row; **two** `app.quiz_responses` rows (`somnium`,
  `better-body`) with the right `profile_key`; `behavioral_tags` contains both
  `profile:*` tags. Capture email once → both responses stay on the one lead.
- **S2 — Merge across pillars:** quiz on pillar A under email X, quiz on pillar B under
  the same email X from a fresh session → the P1/P2 merge collapses to one survivor lead
  holding both responses (reuse the `identity.test.ts` harness, extended for two pillars).
- **S3 — Cross-pillar nav keeps identity:** with `bl_claim`/`bl_session` set, navigate
  Somnium → portal → Better Body; assert the dashboard/recommendations still resolve the
  same `leadId` (cookies are path `/`).
- **S4 — Cross-pillar recommendations:** a lead with a Somnium profile sees Better Body
  content surfaced by `profileTags` (and vice-versa) on the dashboard / feed.
- **S5 — Two nurture sequences:** `quiz.completed` for each pillar starts the correct
  profile-branched sequence; both gated by the single marketing consent; a purchase still
  cancels only what the P3-2 rules say.
- **S6 — Newsletter by pillar interest:** signup with a pillar-interest selection writes
  the interest tag to the one lead; assert targetability.
Unit/integration tests for S1–S2 (DB-backed, like existing suites); S3–S6 demoed against
the live stack and captured in a verification section at phase end.

---

## 5. Schema / CMS deltas

- **Payload `Homepage` global** (new) — editor-curated feed, with code fallback to the
  current rule-based behaviour when a slot is empty:
  - `featuredArticles` (relationship → articles, hasMany, ordered),
  - `featuredProductHandle` (text; a Somnium SKU — Better Body has no shop),
  - `quizInvitationPillar` (relationship → pillars; defaults to first live pillar with a quiz).
- **`Pillars.landingBlocks`** (new blocks field) — composable landing: block types
  `richText`, `articleList` (by pillar/tag), `quizCta`, `stat`/`quote`. Landing renders
  `hero` + these blocks. *(Confirm block set in §8.)*
- **Quiz** `better-body-movement` definition (seed) + matcher `better-body-movement.ts`
  registered in `getMatcher`. Flip `better-body` → `hasQuiz:true`, `quizSlug`.
- **No app-schema migration expected** — cross-pillar identity, newsletter interest, and
  quiz tagging all reuse existing tables (`leads.behavioral_tags`, `quiz_responses.pillar_slug`,
  `consent_records`). Pillar-interest is a `behavioral_tag` (e.g. `interest:better-body`).
- **Analytics (Umami) events:** `pillar_view {pillar}`, `quiz_start {pillar}`,
  `quiz_complete {pillar,profile}`, `newsletter_signup {pillar?}`, plus the existing
  funnel (`add_to_cart`, `checkout`, `order`). Fired client-side only after analytics consent.

---

## 6. Demo-readiness

- **Accessibility audit** (Somnium + Better Body), building on the Phase-1 baseline:
  axe/Lighthouse pass on landing, article, quiz, shop, dashboard; fix focus order,
  labels, contrast, landmarks. Not introducing a11y — auditing + closing gaps.
- **Performance:** responsive/lazy images, font preload + `font-display`, route
  preloading (already `data-sveltekit-preload-data`), CWV green (LCP/CLS/INP) on
  homepage, a pillar landing, an article, a product page.
- **States:** polished error / loading / empty across the key routes.
- **Mobile:** reviewed on real devices.

---

## 7. CMS demo affordances (must work on production, in <1 min, no deploy)

Already working (CMS-driven since P1–P3): rename a pillar → nav + landing update; change
accent; flip `status` (live/coming_soon/hidden) → nav + public pages reflect it; reorder
via `order`. **Phase 4 adds:** recompose the homepage feed (swap featured article, change
featured product, change quiz invitation) via the `Homepage` global, and compose a pillar
landing via `landingBlocks`. All verified on the production build, then reverted.

---

## 8. Decisions — LOCKED (approved 2026-06-02: "go with recommendations")

1. **Second pillar = Better Body.** ✅
2. **Body quiz** = slug `better-body-movement`, four profiles `sedentary` / `depleted` /
   `overreached` / `inconsistent`. ✅
3. **Homepage feed** = CMS `Homepage` global (editor-curated, rule-based fallback per slot). ✅
4. **Default featured product** = `somneo-supliment` (the flagship Somnium SKU); the slot
   is editable and may be emptied. ✅
5. **`landingBlocks` set** = `richText / articleList / quizCta / stat|quote`. ✅
6. **Newsletter targeting** = single marketing consent + per-pillar `interest:*` tags. ✅
7. **About / mission / philosophy** = CMS-authored pages (so the beneficiary can edit the
   narrative without a deploy), calm/no-overclaim voice. ✅
8. **Article count** = 6 published Better Body articles (reconcile the ~4 existing, add the rest). ✅

---

## Explicitly NOT in this phase

No third pillar going live, no second shop, no English i18n, no multi-currency, no EU/UK
shipping, no mobile app, no community, no digital products.

---

## Definition of done (functional prototype)

A stakeholder demo shows, in one session, without manual intervention or dev hacks:
1. Homepage as a cross-pillar editorial feed (both live pillars) + optional featured
   product + quiz invitation.
2. Full Somnium journey: article → quiz → personalized email → product → checkout →
   invoice → dashboard.
3. Full Better Body journey: article → pillar quiz → personalized email tied to that profile.
4. The same person as **one lead** across both pillars, with both sets of quiz tags.
5. A live CMS edit recomposing the homepage feed, in effect on production.
6. A live CMS edit changing a pillar (rename / accent / status) reflected in nav + public
   pages, then reverted.
7. Analytics showing real events; basic SEO health; accessibility baseline met.

---

## Verification (2026-06-03, end-to-end against the live stack)

Shipped across 10 commits (`fca0deb` … `1811e13`) + a checkpoint fix (`0d25c41`); merged to
`master`. Live re-seed applied (Better Body quiz, 6 articles, landingBlocks, Homepage
global default, About/Mission/Philosophy). Unit tests: web 17/17, worker 12/12.

- **DoD 1 — homepage cross-pillar feed:** ✅ both live pillars (Somnium + Better Body),
  curated featured product (Supliment Somneo), quiz invitation — all render.
- **DoD 2 — Somnium journey:** ✅ (article→quiz→email→product→checkout→invoice→dashboard
  verified across Phases 2–3 + this checkpoint; Somnium quiz live).
- **DoD 3 — Better Body journey:** ✅ landing renders the composed blocks (quizCta +
  articleList + quote); `/pillars/better-body/screening` loads the quiz; capture sends the
  pillar-branded profile email (Resend env-gated) and arms the pillar nurture sequence.
- **DoD 4 — one lead, both pillars:** ✅ verified via the real BFF flow — two quizzes under
  one email → a single lead with both `quiz_responses` (somnium + better-body) AND both
  `profile:*` / `quiz:*` / `interest:*` behavioral tags (after the `0d25c41` tag-union fix).
- **DoD 5 — live homepage recompose:** ✅ changed the `homepage` global's featured product
  via Payload → storefront reflected immediately, no deploy; reverted.
- **DoD 6 — live pillar edit:** ✅ renamed Better Body via Payload → reflected on public
  pages within the 15s BFF cache; reverted. (Pillar accent/status/order CMS-driven since P1–P3.)
- **DoD 7 — analytics / SEO / a11y:** Umami demo events wired (`pillar_view`, `quiz_start`,
  `quiz_complete{pillar,profile}`, `newsletter_signup`, `add_to_cart`, `order`); Article /
  Breadcrumb / Product+aggregateRating JSON-LD (P3-4); `svelte-check` 0 a11y warnings.

**Runtime/manual remainder:** axe/Lighthouse audit, Core Web Vitals, real-device mobile,
and a live `PUBLIC_UMAMI_SRC` to confirm events land.
