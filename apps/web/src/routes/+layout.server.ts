import type { LayoutServerLoad } from './$types'
import { loadNav } from '$lib/server/pillars'

// Nav derives from pillar config (live pillars only) and is available to every
// route group's layout.
export const load: LayoutServerLoad = async ({ locals }) => {
  const locale = locals.locale ?? 'ro'
  const nav = await loadNav(locale)
  return { nav, locale }
}
