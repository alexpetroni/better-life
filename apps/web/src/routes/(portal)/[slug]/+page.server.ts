import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { getPage } from '$lib/server/cms'

// CMS-authored narrative pages at a top-level slug (/about, /mission, …). Static
// portal routes (articles, newsletter, …) take precedence; anything else falls
// through here and 404s when no published page matches.
export const load: PageServerLoad = async ({ params, locals }) => {
  const page = await getPage(params.slug, locals.locale ?? 'ro')
  if (!page) throw error(404, 'Not found')
  return { page }
}
