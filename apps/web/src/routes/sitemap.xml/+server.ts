import { SITE_URL } from '$lib/server/env'
import { loadPillars } from '$lib/server/pillars'
import { getArticles } from '$lib/server/cms'
import { articleHref, pillarHref } from '$lib/links'

export async function GET() {
  const [pillars, articles] = await Promise.all([loadPillars(), getArticles()])
  const live = pillars.filter((p) => p.status === 'live')

  const paths = [
    '/',
    '/articles',
    '/newsletter',
    '/how-it-works',
    '/screening',
    ...live.map(pillarHref),
    ...articles.map((a) => articleHref(a)),
  ]
  const unique = [...new Set(paths)]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${unique.map((p) => `  <url><loc>${SITE_URL}${p}</loc></url>`).join('\n')}
</urlset>
`
  return new Response(xml, { headers: { 'content-type': 'application/xml; charset=utf-8' } })
}
