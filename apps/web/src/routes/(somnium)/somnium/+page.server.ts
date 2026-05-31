import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { getPillar } from '$lib/server/pillars'
import { getArticles } from '$lib/server/cms'

export const load: PageServerLoad = async ({ locals }) => {
  const locale = locals.locale ?? 'ro'
  const pillar = await getPillar('somnium', locale)
  if (!pillar || pillar.status !== 'live') throw error(404, 'Not found')
  const articles = (await getArticles(locale)).filter((a) => a.pillarSlug === 'somnium').slice(0, 6)
  return { pillar, articles }
}
