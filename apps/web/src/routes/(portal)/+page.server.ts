import type { PageServerLoad } from './$types'
import { loadPillars } from '$lib/server/pillars'
import { getArticles } from '$lib/server/cms'

export const load: PageServerLoad = async ({ locals }) => {
  const locale = locals.locale ?? 'ro'
  const [pillars, articles] = await Promise.all([loadPillars(locale), getArticles(locale)])

  const live = pillars.filter((p) => p.status === 'live').sort((a, b) => a.order - b.order)
  const liveSlugs = new Set(live.map((p) => p.slug))

  // Homepage feed — fixed section types only:
  //   featured_articles : rule "latest from live pillars"
  //   featured_product  : Phase 2 (rendered hidden — none exists yet)
  //   quiz_invitation   : from the first live pillar that has a quiz
  const featured = articles.filter((a) => liveSlugs.has(a.pillarSlug)).slice(0, 6)
  const quizPillar = live.find((p) => p.hasQuiz && p.quizSlug) ?? null

  const accentBySlug: Record<string, string> = {}
  const nameBySlug: Record<string, string> = {}
  for (const p of pillars) {
    accentBySlug[p.slug] = p.accentColor ?? '#4f46e5'
    nameBySlug[p.slug] = p.name
  }

  return {
    live,
    featured,
    quizPillar,
    featuredProduct: null, // Phase 2
    accentBySlug,
    nameBySlug,
  }
}
