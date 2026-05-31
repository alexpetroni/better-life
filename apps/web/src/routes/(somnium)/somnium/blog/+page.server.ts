import type { PageServerLoad } from './$types'
import { getPillar } from '$lib/server/pillars'
import { getArticles } from '$lib/server/cms'

export const load: PageServerLoad = async ({ locals }) => {
  const locale = locals.locale ?? 'ro'
  const pillar = await getPillar('somnium', locale)
  const articles = (await getArticles(locale)).filter((a) => a.pillarSlug === 'somnium')
  return { pillar, articles }
}
