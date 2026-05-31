import { error, redirect } from '@sveltejs/kit'
import type { PageServerLoad } from './$types'
import { getPillar } from '$lib/server/pillars'
import { getArticles } from '$lib/server/cms'
import { pillarHref } from '$lib/links'

export const load: PageServerLoad = async ({ params, locals }) => {
  const locale = locals.locale ?? 'ro'
  const pillar = await getPillar(params.slug, locale)
  // Non-live pillars are absent from public surfaces.
  if (!pillar || pillar.status !== 'live') throw error(404, 'Pillar not found')

  // Pillars with a dedicated route group (e.g. Somnium) live at their own URL.
  const canonical = pillarHref(pillar)
  if (canonical !== `/pillars/${pillar.slug}`) throw redirect(308, canonical)

  const articles = (await getArticles(locale)).filter((a) => a.pillarSlug === pillar.slug)
  return { pillar, articles }
}
