// URL helpers shared by components and pages.
//
// Somnium is the flagship product and owns a dedicated route group (so it can
// run standalone). Pillars in this set route to their own group; all others use
// the generic portal pillar/article routes. This is STRUCTURAL (which pillars
// have a dedicated group), not pillar content — it doesn't hardcode names,
// order, or colors.
const STANDALONE_PILLARS = new Set(['somnium'])

export function pillarHref(pillar: { slug: string }): string {
  return STANDALONE_PILLARS.has(pillar.slug) ? `/${pillar.slug}` : `/pillars/${pillar.slug}`
}

export function articleHref(article: { slug: string; pillarSlug: string }): string {
  return STANDALONE_PILLARS.has(article.pillarSlug)
    ? `/somnium/blog/${article.slug}`
    : `/articles/${article.slug}`
}

/** Where to take a pillar's screening quiz. Standalone pillars own a top-level
 *  route (Somnium → /screening); others use the generic pillar screening route. */
export function screeningHref(pillar: { slug: string }): string {
  return STANDALONE_PILLARS.has(pillar.slug) ? '/screening' : `/pillars/${pillar.slug}/screening`
}

export function formatPrice(amount: number | null | undefined, currency = 'ron', locale = 'ro'): string {
  if (amount == null) return ''
  try {
    return new Intl.NumberFormat(locale === 'ro' ? 'ro-RO' : 'en-GB', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount)
  } catch {
    return `${amount} ${currency.toUpperCase()}`
  }
}

export function formatDate(iso: string | undefined, locale = 'ro'): string {
  if (!iso) return ''
  try {
    return new Intl.DateTimeFormat(locale === 'ro' ? 'ro-RO' : 'en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(new Date(iso))
  } catch {
    return ''
  }
}
