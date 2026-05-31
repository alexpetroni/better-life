import type { Article, Pillar, QuizDefinition } from '@better-life/contracts'
import { PAYLOAD_URL } from './env'
import { renderLexical } from './lexical'

// The SvelteKit BFF is the only caller of Payload. If the CMS is unreachable,
// these helpers warn and return empty/null so the site degrades rather than crashes.

async function cmsFetch<T = any>(path: string, locale = 'ro'): Promise<T | null> {
  try {
    const sep = path.includes('?') ? '&' : '?'
    const res = await fetch(`${PAYLOAD_URL}/api${path}${sep}locale=${locale}`, {
      headers: { accept: 'application/json' },
    })
    if (!res.ok) {
      console.warn(`[cms] ${path} → HTTP ${res.status}`)
      return null
    }
    return (await res.json()) as T
  } catch (err) {
    console.warn(`[cms] fetch failed for ${path}:`, (err as Error).message)
    return null
  }
}

function relSlug(rel: unknown): string {
  if (rel && typeof rel === 'object' && 'slug' in rel) return (rel as { slug: string }).slug
  return ''
}

function mapPillar(doc: any): Pillar {
  return {
    slug: doc.slug,
    name: doc.name,
    tagline: doc.tagline ?? undefined,
    icon: doc.icon ?? undefined,
    accentColor: doc.accentColor ?? undefined,
    order: doc.order ?? 0,
    status: doc.status,
    hasShop: !!doc.hasShop,
    hasQuiz: !!doc.hasQuiz,
    quizSlug: doc.quiz ? relSlug(doc.quiz) || null : null,
    hero: doc.hero
      ? {
          heading: doc.hero.heading ?? undefined,
          subheading: doc.hero.subheading ?? undefined,
          ctaLabel: doc.hero.ctaLabel ?? undefined,
          ctaHref: doc.hero.ctaHref ?? undefined,
        }
      : undefined,
  }
}

function mapArticle(doc: any, withBody = false): Article {
  return {
    slug: doc.slug,
    title: doc.title,
    excerpt: doc.excerpt ?? undefined,
    bodyHtml: withBody ? renderLexical(doc.body) : undefined,
    pillarSlug: relSlug(doc.pillar),
    heroImageUrl: doc.heroImageUrl ?? undefined,
    author: doc.author ?? undefined,
    publishedAt: doc.publishedAt ?? undefined,
    profileTags: Array.isArray(doc.profileTags) ? doc.profileTags : undefined,
    seo: doc.seo
      ? {
          metaTitle: doc.seo.metaTitle ?? undefined,
          metaDescription: doc.seo.metaDescription ?? undefined,
          ogImageUrl: doc.seo.ogImageUrl ?? undefined,
        }
      : undefined,
  }
}

export async function getPillars(locale = 'ro'): Promise<Pillar[]> {
  const data = await cmsFetch<{ docs: any[] }>('/pillars?limit=100&depth=1&sort=order', locale)
  return (data?.docs ?? []).map(mapPillar)
}

export async function getArticles(locale = 'ro'): Promise<Article[]> {
  const data = await cmsFetch<{ docs: any[] }>(
    '/articles?limit=100&depth=1&sort=-publishedAt&where[status][equals]=published',
    locale
  )
  return (data?.docs ?? []).map((d) => mapArticle(d, false))
}

export async function getArticleBySlug(slug: string, locale = 'ro'): Promise<Article | null> {
  const data = await cmsFetch<{ docs: any[] }>(
    `/articles?where[slug][equals]=${encodeURIComponent(slug)}&depth=1&limit=1`,
    locale
  )
  const doc = data?.docs?.[0]
  if (!doc || doc.status !== 'published') return null
  return mapArticle(doc, true)
}

export async function getQuizBySlug(slug: string, locale = 'ro'): Promise<QuizDefinition | null> {
  const data = await cmsFetch<{ docs: any[] }>(
    `/quizzes?where[slug][equals]=${encodeURIComponent(slug)}&depth=1&limit=1`,
    locale
  )
  const doc = data?.docs?.[0]
  if (!doc) return null
  return {
    slug: doc.slug,
    title: doc.title,
    hook: doc.hook ?? undefined,
    pillarSlug: relSlug(doc.pillar),
    disclaimer: doc.disclaimer ?? undefined,
    resultDisclaimer: doc.resultDisclaimer ?? undefined,
    questions: (doc.questions ?? []).map((q: any) => ({
      key: q.key,
      text: q.text,
      helpText: q.helpText ?? undefined,
      type: q.type,
      displayVariant: q.displayVariant ?? undefined,
      columns: q.columns ?? undefined,
      options: (q.options ?? []).map((o: any) => ({ value: o.value, label: o.label })),
    })),
    profiles: (doc.profiles ?? []).map((p: any) => ({
      key: p.key,
      title: p.title,
      description: p.description,
      tip: p.tip ?? '',
      recommendations: (p.recommendations ?? []).map((r: any) => ({ title: r.title, body: r.body })),
      ctaLabel: p.ctaLabel ?? undefined,
      ctaHref: p.ctaHref ?? undefined,
    })),
  }
}
