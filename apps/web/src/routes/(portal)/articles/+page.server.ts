import type { PageServerLoad } from './$types'
import { loadPillars } from '$lib/server/pillars'
import { getArticles } from '$lib/server/cms'

export const load: PageServerLoad = async ({ locals }) => {
  const locale = locals.locale ?? 'ro'
  const [pillars, articles] = await Promise.all([loadPillars(locale), getArticles(locale)])
  const liveSlugs = new Set(pillars.filter((p) => p.status === 'live').map((p) => p.slug))

  const accentBySlug: Record<string, string> = {}
  const nameBySlug: Record<string, string> = {}
  for (const p of pillars) {
    accentBySlug[p.slug] = p.accentColor ?? '#4f46e5'
    nameBySlug[p.slug] = p.name
  }

  return {
    articles: articles.filter((a) => liveSlugs.has(a.pillarSlug)),
    accentBySlug,
    nameBySlug,
  }
}
