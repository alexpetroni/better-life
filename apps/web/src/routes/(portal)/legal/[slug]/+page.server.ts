import { error } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { legal, LEGAL_SLUGS, type LegalSlug } from '$lib/legal'

export const load: PageServerLoad = async ({ params }) => {
  if (!LEGAL_SLUGS.includes(params.slug as LegalSlug)) throw error(404, 'Not found')
  const slug = params.slug as LegalSlug
  return { slug, sections: legal[slug] }
}
