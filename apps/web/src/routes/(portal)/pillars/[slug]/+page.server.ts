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

  const allArticles = await getArticles(locale)
  const articles = allArticles.filter((a) => a.pillarSlug === pillar.slug)

  // Resolve articleList blocks to actual articles (by this pillar, or by profile
  // tag for cross-pillar surfacing). Other blocks pass through unchanged.
  const blocks = (pillar.landingBlocks ?? []).map((b) => {
    if (b.type === 'articleList') {
      const pool =
        b.source === 'tag' && b.tag
          ? allArticles.filter((a) => a.profileTags?.includes(b.tag!))
          : articles
      return { ...b, articles: pool.slice(0, b.limit) }
    }
    return b
  })

  const quizHref = pillar.hasQuiz ? `/pillars/${pillar.slug}/screening` : null
  return { pillar, articles, blocks, quizHref }
}
