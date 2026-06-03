# Better Life — Content & Operations Guide

How to run the site's content day-to-day: pillars, articles, quizzes, products, reviews,
the homepage, and narrative pages. Most of this is editing in an admin UI — **no deploy
needed**. The few parts that require a developer (a new quiz's matching logic, footer links)
are called out explicitly.

## Where things live

| What | Where you edit it | Tool |
|---|---|---|
| Pillars, articles, quizzes, reviews, pages, homepage feed | **Payload admin** → http://localhost:3001/admin | CMS |
| Products, prices, inventory, orders, customers | **Medusa admin** → http://localhost:9000/app | Commerce |
| Quiz *matching logic* (answers → profile) | `apps/web/src/lib/server/quiz/matchers/` | Code (developer) |
| Footer links, route structure | `apps/web` | Code (developer) |

Dev CMS login: `admin@betterlife.ro` / `changeme123`. Everything is **Romanian-first**;
localized fields have a per-locale toggle (English is optional and falls back to Romanian).

> **Published vs draft:** articles, pages, and reviews have a `status`. The public site only
> ever shows `published` (articles/pages) or `approved` (reviews). You can stage freely.

---

## 1. Pillars — the spine

A pillar is a wellness vertical (Somnium, Better Body, …). **Nav, landing pages, the homepage
feed, accent color, and order all derive from the `pillars` collection** — never from code.

Fields:

- **slug** — stable handle (e.g. `better-body`); used in URLs and as the seed key. Don't change it.
- **name, tagline, icon** (lucide name), **accentColor** (hex), **order** (nav/sort order).
- **status** — `live` (public), `coming_soon` (listed as "soon", no content), `hidden` (absent).
- **hasShop** / **hasQuiz** — capability flags. **quiz** — relationship to the pillar's quiz.
- **hero** — heading / subheading / optional CTA label+href on the landing.
- **landingBlocks** — the composable landing (see §6).

**Recipes**

- *Bring a pillar live:* set `status = live`. It appears in nav and gets a public landing immediately.
- *Rename / recolor / reorder:* edit `name` / `accentColor` / `order` — reflected within ~15s (BFF cache).
- *Take it down:* `status = hidden` (gone) or `coming_soon` (teaser).

> **Accent contrast:** the accent is used as text and as button background, so pick a color with
> **≥4.5:1 contrast on white** (e.g. Somnium `#4F46E5`, Better Body `#15803D`). Lighter colors fail
> accessibility checks.
>
> **Standalone pillars (developer note):** Somnium has its own top-level routes (`/somnium`,
> `/screening`) — that's a structural code decision (`STANDALONE_PILLARS` in `apps/web/src/lib/links.ts`).
> Every other pillar lives at `/pillars/<slug>` and `/pillars/<slug>/screening` automatically.

---

## 2. Articles

Blog content, tagged to a pillar. Fields: **title, slug, excerpt, pillar, author, heroImageUrl,
publishedAt, status** (`draft` → `in_review` → `published`), **body** (rich text), and:

- **profileTags** — quiz profile keys this article suits (e.g. `hyperarousal`, `sedentary`). Drives
  recommendations and the dashboard's "reading for you". **Cross-pillar bridge:** an article may
  carry tags from *another* pillar's quiz (e.g. a Better Body article tagged `behavioral`) so it
  surfaces to that pillar's profiles too.
- **videoUrl / audioUrl** — optional YouTube/Vimeo embed + audio player.
- **callout** — a highlighted box rendered above the body.
- **relatedArticles** — internal links shown as "Read next".
- **seo** — metaTitle / metaDescription / ogImageUrl.

**Recipe — publish an article:** create it, fill body + `profileTags`, set `status = published` and
`publishedAt`. It appears in the pillar landing, the cross-pillar homepage feed, and the sitemap.

---

## 3. Quizzes

A quiz has **two halves**:

1. **The definition (CMS)** — questions, options, and result copy. Fully editable here.
2. **The matcher (code)** — the function that turns answers into a profile, at
   `apps/web/src/lib/server/quiz/matchers/<slug>.ts`. Matching logic is intentionally in code
   (deterministic, reviewable), not a generic CMS scoring engine.

### Definition fields (Payload `quizzes`)

- **slug** (stable; links the definition to its matcher), **title**, **hook**, **pillar**.
- **disclaimer** (shown before) / **resultDisclaimer** (shown with results).
- **questions[]** — each has **key** (stable id used by the matcher), **text**, optional **helpText**,
  **type** (`single-select` / `multi-select` / `scale` — current matchers use single-select),
  **displayVariant** (`card` / `list`), optional **columns**, and **options[]** of **value** + **label**.
- **profiles[]** — each has **key** (must match what the matcher returns), **title**, **description**,
  **tip**, **recommendations[]** (title + body), and an optional **ctaLabel** + **ctaHref**.

### How a result is produced

The visitor answers → the matcher (keyed by `slug`) reads the answer `value`s by question `key` and
returns a profile `key` → the storefront shows that profile's title/description/tip/recommendations
and emails it. The quiz writes to the shared lead model, tagged with the pillar.

**Recipe — edit quiz copy (no code):** change any question text, option label, profile description,
tip, or recommendation in Payload. Safe anytime. Keep question `key`s and option `value`s stable —
the matcher references them.

**Recipe — add a NEW quiz (needs a developer for one file):**

1. **CMS:** create a `quizzes` doc — set `slug`, `pillar`, questions (with stable `key`s + option
   `value`s), and one `profiles` entry per outcome (stable `key`s).
2. **Code:** add `apps/web/src/lib/server/quiz/matchers/<slug>.ts` exporting a matcher
   (answers → one of your profile keys) and register it in `matchers/index.ts`.
3. **CMS:** on the pillar, set `hasQuiz = true` and link `quiz`.
4. The quiz is now takeable at `/pillars/<slug>/screening` (or `/screening` for Somnium).

> Profile `key`s in the definition **must** equal the matcher's return values, or results won't resolve.

---

## 4. Products (Medusa)

Products live in **Medusa** (admin at `:9000/app`), not the CMS. Only pillars with `hasShop` sell;
today that's **Somnium**.

Core fields: **title, handle** (stable, used in URLs), **description**, **category**, a **variant**
with **price** (RON) and **inventory**, and a **sales channel**. Plus two **metadata** keys that the
storefront reads:

- **metadata.pillar** — which pillar's shop the product belongs to (e.g. `somnium`).
- **metadata.profiles** — an array of quiz profile keys the product suits (e.g.
  `["hyperarousal","conditioned"]`). **This drives recommendations and the product page's
  "why this fits you" note.** Leave empty and the product still sells but won't be profile-matched.

**Recipe — add a product (admin):** Medusa admin → Products → Create. Set title/handle/description,
add a variant with a RON price, assign the sales channel + inventory, then under **Metadata** add
`pillar` and `profiles` (profiles as a JSON array of profile keys). It appears in `/somnium/shop`.

**Recipe — add a product (seed, idempotent):** add an entry (with `profiles`) to the `products` array
in `apps/medusa/src/scripts/seed.ts` and run `npm run seed`. Re-runs reuse the handle and refresh the
profile tags.

---

## 5. Reviews & moderation

Reviews are **verified-purchase only** (the storefront only lets a logged-in buyer who purchased the
product submit one) and **moderate-all** — every review arrives `pending`.

**Recipe — moderate:** Payload → Reviews → open the pending review → set `status` to `approved`
(goes live, counts toward the product's star average + `aggregateRating` SEO) or `rejected`. The
public only ever sees `approved`.

---

## 6. Homepage feed & pillar landings (recompose without deploy)

**Homepage feed** — the Payload **`homepage` global** (Globals → Homepage):

- **featuredArticles** — curated, in order. *Empty →* latest from live pillars.
- **featuredProductHandle** — a Somnium product handle to feature. *Empty →* no product slot.
- **quizInvitationPillar** — whose quiz the invitation points to. *Empty →* first live pillar with a quiz.

Change any slot and the homepage reflects it on the next load.

**Pillar landing** — composed from the pillar's **hero** + **landingBlocks**. Block types:

- **richText** — a formatted text section.
- **articleList** — a grid of articles, sourced by `pillar` or by `tag` (a profile tag), with a `limit`.
- **quizCta** — heading/body + a button to the pillar's quiz.
- **stat** — a big number + label. **quote** — a pull-quote + attribution.

Add/reorder blocks in the pillar's `landingBlocks`. With no blocks, the landing falls back to a simple
list of the pillar's articles.

---

## 7. Narrative pages

Free-form pages (About, Mission, Philosophy, …) live in the Payload **`pages`** collection: **slug**
(→ URL `/<slug>`), **title**, **body** (rich text), **status**, **seo**. Set `status = published` and
it's live at `/<slug>`.

> Adding a page makes it reachable by URL immediately. Putting it in the site **footer/nav** is a
> code change (`apps/web/src/lib/components/SiteFooter.svelte`).

---

## 8. Newsletter, consent & who receives emails

- **Consent is purpose-specific.** A lead gets **marketing** emails (nurture sequences, newsletter)
  only if their latest *marketing* consent is granted. Transactional email (order confirmation) is
  separate and always sent.
- **Pillar interest:** the newsletter signup and each quiz capture stamp an `interest:<pillar>` tag on
  the lead, so the list is segmentable by pillar.
- **Nurture sequences** (handled by the worker) start from events — completing a quiz starts a
  profile-matched sequence; reaching checkout without ordering arms cart recovery; an order starts
  post-purchase education. A purchase cancels the nurture. Unsubscribe is one-click in every marketing
  email. These run only when the Inngest worker + `INNGEST_ENABLED=true` are active.

You don't "edit" these in an admin — they're driven by consent + behavior. The lever you control is
content (article/quiz copy) and the marketing-consent gate.

---

## 9. Recommendations & wishlist (automatic)

- **Product recommendations** (dashboard, cart cross-sell, product page) come from matching the lead's
  quiz profile against each product's `metadata.profiles`, excluding already-purchased items.
- **The product-page "why this fits you"** shows when the product's `profiles` include the visitor's profile.
- **Cross-pillar reading** (dashboard) ranks articles by the lead's profile tags across all pillars.
- **Wishlist** is for identified visitors (logged-in or post-quiz). Nothing to edit — these derive from
  your `profiles` tags on products and articles. **The single biggest lever is tagging products and
  articles with the right profile keys.**

---

## Cheat sheet

| Task | Where | Needs a developer? |
|---|---|---|
| Bring a pillar live / rename / recolor / reorder | Payload → Pillars | No |
| Publish an article (+ profile tags, media, related) | Payload → Articles | No |
| Edit quiz questions / options / result copy | Payload → Quizzes | No |
| **Add a brand-new quiz** (new matching logic) | Payload + `matchers/` | Yes (one file) |
| Add / edit a product (+ `metadata.profiles`) | Medusa admin | No |
| Approve / reject a review | Payload → Reviews | No |
| Recompose the homepage feed | Payload → Globals → Homepage | No |
| Compose a pillar landing (blocks) | Payload → Pillars → landingBlocks | No |
| Add a narrative page | Payload → Pages | No (footer link: yes) |
