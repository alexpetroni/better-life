import type { LayoutServerLoad } from './$types'
import { loadNav } from '$lib/server/pillars'
import { UMAMI_SRC, UMAMI_WEBSITE_ID } from '$lib/server/env'

// Nav derives from pillar config (live pillars only) and is available to every
// route group's layout.
export const load: LayoutServerLoad = async ({ locals }) => {
  const locale = locals.locale ?? 'ro'
  const nav = await loadNav(locale)
  return { nav, locale, umami: { src: UMAMI_SRC, websiteId: UMAMI_WEBSITE_ID } }
}
