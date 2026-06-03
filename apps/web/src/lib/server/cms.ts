import type {
  Article,
  Pillar,
  PillarLandingBlock,
  HomepageConfig,
  QuizDefinition,
  RelatedArticle,
} from '@better-life/contracts'
import { PAYLOAD_URL, PAYLOAD_ADMIN_EMAIL, PAYLOAD_ADMIN_PASSWORD } from './env'
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

function mapLandingBlock(b: any): PillarLandingBlock | null {
  switch (b?.blockType) {
    case 'richText':
      return { type: 'richText', html: renderLexical(b.content) }
    case 'articleList':
      return {
        type: 'articleList',
        heading: b.heading ?? undefined,
        source: b.source === 'tag' ? 'tag' : 'pillar',
        tag: b.tag ?? undefined,
        limit: typeof b.limit === 'number' ? b.limit : 3,
      }
    case 'quizCta':
      return { type: 'quizCta', heading: b.heading ?? undefined, body: b.body ?? undefined, ctaLabel: b.ctaLabel ?? undefined }
    case 'stat':
      return { type: 'stat', value: b.value, label: b.label ?? undefined }
    case 'quote':
      return { type: 'quote', text: b.text, attribution: b.attribution ?? undefined }
    default:
      return null
  }
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
    landingBlocks: Array.isArray(doc.landingBlocks)
      ? (doc.landingBlocks.map(mapLandingBlock).filter(Boolean) as PillarLandingBlock[])
      : undefined,
  }
}

function mapRelated(rel: unknown): RelatedArticle | null {
  // Populated (depth>=1) related articles only; skip unresolved ids and drafts.
  if (!rel || typeof rel !== 'object' || !('slug' in rel)) return null
  const d = rel as any
  if (d.status && d.status !== 'published') return null
  return { slug: d.slug, title: d.title, excerpt: d.excerpt ?? undefined, pillarSlug: relSlug(d.pillar) }
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
    videoUrl: doc.videoUrl ?? undefined,
    audioUrl: doc.audioUrl ?? undefined,
    callout: doc.callout ?? undefined,
    relatedArticles: Array.isArray(doc.relatedArticles)
      ? (doc.relatedArticles.map(mapRelated).filter(Boolean) as RelatedArticle[])
      : undefined,
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

/**
 * Editor-curated homepage feed (Payload `homepage` global). Resolves relationships
 * to plain slugs/handles; every slot may be empty, in which case the homepage
 * loader applies its rule-based fallback. Degrades to all-empty if the CMS is down.
 */
export async function getHomepage(locale = 'ro'): Promise<HomepageConfig> {
  const doc = await cmsFetch<any>('/globals/homepage?depth=1', locale)
  const featured = Array.isArray(doc?.featuredArticles) ? doc.featuredArticles : []
  return {
    featuredArticleSlugs: featured
      .map((a: unknown) => (a && typeof a === 'object' && 'slug' in a ? (a as { slug: string }).slug : null))
      .filter(Boolean) as string[],
    featuredProductHandle: doc?.featuredProductHandle || null,
    quizInvitationPillarSlug:
      doc?.quizInvitationPillar && typeof doc.quizInvitationPillar === 'object'
        ? (doc.quizInvitationPillar.slug ?? null)
        : null,
  }
}

export interface CmsPage {
  slug: string
  title: string
  bodyHtml: string
  seo?: { metaTitle?: string; metaDescription?: string }
}

/** A free-form narrative page (About/mission/philosophy). Published-only for the public. */
export async function getPage(slug: string, locale = 'ro'): Promise<CmsPage | null> {
  const data = await cmsFetch<{ docs: any[] }>(
    `/pages?where[slug][equals]=${encodeURIComponent(slug)}&limit=1`,
    locale
  )
  const doc = data?.docs?.[0]
  if (!doc || doc.status !== 'published') return null
  return {
    slug: doc.slug,
    title: doc.title,
    bodyHtml: renderLexical(doc.body),
    seo: doc.seo
      ? { metaTitle: doc.seo.metaTitle ?? undefined, metaDescription: doc.seo.metaDescription ?? undefined }
      : undefined,
  }
}

export async function getArticles(locale = 'ro'): Promise<Article[]> {
  const data = await cmsFetch<{ docs: any[] }>(
    '/articles?limit=100&depth=1&sort=-publishedAt&where[status][equals]=published',
    locale
  )
  return (data?.docs ?? []).map((d) => mapArticle(d, false))
}

export async function getArticleBySlug(slug: string, locale = 'ro'): Promise<Article | null> {
  // depth=2 so relatedArticles (and their pillar slug, for correct hrefs) populate.
  const data = await cmsFetch<{ docs: any[] }>(
    `/articles?where[slug][equals]=${encodeURIComponent(slug)}&depth=2&limit=1`,
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

// ── Reviews (P3-4) ───────────────────────────────────────────────────────────
// Public reads are anonymous (Payload returns approved-only via access control).
// Writes require an authenticated Payload user, so the BFF logs in with a service
// admin and caches the JWT. Verified-purchase + moderation rules are enforced by
// the BFF (it only ever submits status='pending'); a missing credential degrades
// gracefully (submission disabled, reads unaffected).

export interface ReviewItem {
  rating: number
  title?: string
  body: string
  authorName?: string
  createdAt: string
}

export interface ReviewSummary {
  items: ReviewItem[]
  count: number
  /** Mean rating rounded to one decimal, or null when there are no reviews. */
  average: number | null
}

let payloadToken: { value: string; at: number } | null = null
async function payloadLogin(): Promise<string | null> {
  if (!PAYLOAD_ADMIN_EMAIL || !PAYLOAD_ADMIN_PASSWORD) return null
  if (payloadToken && Date.now() - payloadToken.at < 50 * 60 * 1000) return payloadToken.value
  try {
    const res = await fetch(`${PAYLOAD_URL}/api/users/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: PAYLOAD_ADMIN_EMAIL, password: PAYLOAD_ADMIN_PASSWORD }),
    })
    if (!res.ok) return null
    const token = (await res.json()).token as string
    payloadToken = { value: token, at: Date.now() }
    return token
  } catch {
    return null
  }
}

export async function listApprovedReviews(productHandle: string): Promise<ReviewSummary> {
  const data = await cmsFetch<{ docs: any[] }>(
    `/reviews?where[productHandle][equals]=${encodeURIComponent(productHandle)}` +
      `&where[status][equals]=approved&sort=-createdAt&limit=100`
  )
  const items: ReviewItem[] = (data?.docs ?? []).map((d) => ({
    rating: d.rating,
    title: d.title ?? undefined,
    body: d.body,
    authorName: d.authorName ?? undefined,
    createdAt: d.createdAt,
  }))
  const count = items.length
  const average = count ? Math.round((items.reduce((s, r) => s + r.rating, 0) / count) * 10) / 10 : null
  return { items, count, average }
}

/** Submit a review as `pending` (moderation). Returns false if the CMS write is unavailable. */
export async function submitReview(input: {
  productHandle: string
  rating: number
  title?: string
  body: string
  authorName?: string
  email: string
  pillar?: string
}): Promise<boolean> {
  const token = await payloadLogin()
  if (!token) {
    console.warn('[cms] no Payload admin credentials — review submission disabled (graceful degradation).')
    return false
  }
  try {
    const res = await fetch(`${PAYLOAD_URL}/api/reviews`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', authorization: `JWT ${token}` },
      body: JSON.stringify({ ...input, pillar: input.pillar ?? 'somnium', status: 'pending' }),
    })
    return res.ok
  } catch (err) {
    console.warn('[cms] review submit failed:', (err as Error).message)
    return false
  }
}
