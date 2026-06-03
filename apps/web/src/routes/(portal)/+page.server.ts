import type { PageServerLoad } from './$types'
import type { Article } from '@better-life/contracts'
import { loadPillars } from '$lib/server/pillars'
import { getArticles, getHomepage } from '$lib/server/cms'
import { getProduct } from '$lib/server/medusa'
import { screeningHref } from '$lib/links'

export const load: PageServerLoad = async ({ locals }) => {
  const locale = locals.locale ?? 'ro'
  const [pillars, articles, homepage] = await Promise.all([
    loadPillars(locale),
    getArticles(locale),
    getHomepage(locale),
  ])

  const live = pillars.filter((p) => p.status === 'live').sort((a, b) => a.order - b.order)
  const liveSlugs = new Set(live.map((p) => p.slug))

  // Homepage feed — editor-curated via the Payload `homepage` global, with a
  // rule-based fallback per slot when the editor leaves it empty.
  //   featured_articles : curated slugs (in order, live pillars only) → else latest from live pillars
  //   featured_product  : curated handle → else none
  //   quiz_invitation   : curated pillar → else the first live pillar with a quiz
  const bySlug = new Map(articles.map((a) => [a.slug, a]))
  const curated = homepage.featuredArticleSlugs
    .map((s) => bySlug.get(s))
    .filter((a): a is Article => !!a && liveSlugs.has(a.pillarSlug))
  const featured = curated.length ? curated : articles.filter((a) => liveSlugs.has(a.pillarSlug)).slice(0, 6)

  const featuredProduct = homepage.featuredProductHandle
    ? await getProduct(homepage.featuredProductHandle)
    : null

  const quizPillar =
    (homepage.quizInvitationPillarSlug
      ? live.find((p) => p.slug === homepage.quizInvitationPillarSlug && p.hasQuiz && p.quizSlug)
      : null) ??
    live.find((p) => p.hasQuiz && p.quizSlug) ??
    null
  const quizHref = quizPillar ? screeningHref(quizPillar) : null

  const accentBySlug: Record<string, string> = {}
  const nameBySlug: Record<string, string> = {}
  for (const p of pillars) {
    accentBySlug[p.slug] = p.accentColor ?? '#4f46e5'
    nameBySlug[p.slug] = p.name
  }

  return { live, featured, quizPillar, quizHref, featuredProduct, accentBySlug, nameBySlug }
}
