import { SITE_URL } from '$lib/server/env'
import { loadPillars } from '$lib/server/pillars'
import { getArticles } from '$lib/server/cms'
import { listProducts } from '$lib/server/medusa'
import { articleHref, pillarHref } from '$lib/links'

export async function GET() {
  const [pillars, articles, products] = await Promise.all([loadPillars(), getArticles(), listProducts()])
  const live = pillars.filter((p) => p.status === 'live')

  const paths = [
    '/',
    '/articles',
    '/newsletter',
    '/how-it-works',
    '/screening',
    '/somnium/shop',
    ...live.map(pillarHref),
    ...articles.map((a) => articleHref(a)),
    ...products.map((p) => `/somnium/shop/${p.handle}`),
  ]
  const unique = [...new Set(paths)]

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${unique.map((p) => `  <url><loc>${SITE_URL}${p}</loc></url>`).join('\n')}
</urlset>
`
  return new Response(xml, { headers: { 'content-type': 'application/xml; charset=utf-8' } })
}
