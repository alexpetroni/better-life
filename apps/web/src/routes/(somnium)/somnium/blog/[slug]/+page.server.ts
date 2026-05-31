import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { getArticleBySlug } from '$lib/server/cms'
import { getPillar } from '$lib/server/pillars'

export const load: PageServerLoad = async ({ params, locals }) => {
  const locale = locals.locale ?? 'ro'
  const article = await getArticleBySlug(params.slug, locale)
  if (!article || article.pillarSlug !== 'somnium') throw error(404, 'Article not found')
  const pillar = await getPillar('somnium', locale)
  return { article, pillar }
}
