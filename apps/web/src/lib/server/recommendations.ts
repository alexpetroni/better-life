import type { Article } from '@better-life/contracts'
import { listProducts, type StoreProduct } from './medusa'

// Rule-based recommendations (P3-3, locked decision): match a lead's quiz profile
// against each product's `profiles` tag and exclude what they already own. No ML,
// no behavioural model — deterministic and explainable. The ranking is pure and
// unit-tested; recommendForProfile wraps it with a Medusa product fetch.

export interface RankOptions {
  /** Product handles to drop (already purchased, current product, cart items). */
  excludeHandles?: string[]
  limit?: number
}

/**
 * Order products for a profile: profile-matched first (stable order preserved),
 * then the rest as fallback so we still surface cross-sell when nothing matches
 * (or the visitor has no profile). Excluded handles are removed up front.
 */
export function rankByProfile(
  products: StoreProduct[],
  profileKey: string | null,
  opts: RankOptions = {}
): StoreProduct[] {
  const exclude = new Set(opts.excludeHandles ?? [])
  const pool = products.filter((p) => !exclude.has(p.handle))
  const matched = profileKey ? pool.filter((p) => p.profiles.includes(profileKey)) : []
  const matchedHandles = new Set(matched.map((p) => p.handle))
  const rest = pool.filter((p) => !matchedHandles.has(p.handle))
  return [...matched, ...rest].slice(0, opts.limit ?? 4)
}

/** Does a product suit this profile? (Drives the product-page "why this fits you" note.) */
export function matchesProfile(product: Pick<StoreProduct, 'profiles'>, profileKey: string | null): boolean {
  return !!profileKey && product.profiles.includes(profileKey)
}

/** Fetch the catalog and rank it for a profile. Empty when the shop is disabled. */
export async function recommendForProfile(
  profileKey: string | null,
  opts: RankOptions = {}
): Promise<StoreProduct[]> {
  const products = await listProducts()
  return rankByProfile(products, profileKey, opts)
}

// ── Cross-pillar content discovery (Phase 4) ─────────────────────────────────
// Rank articles by how many of the lead's profile tags they carry. Because a
// lead can hold profiles from several pillars (and articles can be tagged across
// pillars — the step-2 bridges), this naturally surfaces content from multiple
// pillars. Unlike products, content recs show ONLY tag-matches (relevance over
// filler): no fallback to untagged articles.
export function rankArticlesByProfiles(
  articles: Article[],
  profileKeys: string[],
  opts: { excludeSlugs?: string[]; limit?: number } = {}
): Article[] {
  const keys = new Set(profileKeys)
  if (keys.size === 0) return []
  const exclude = new Set(opts.excludeSlugs ?? [])
  return articles
    .filter((a) => !exclude.has(a.slug))
    .map((a) => ({ a, score: (a.profileTags ?? []).filter((t) => keys.has(t)).length }))
    .filter((s) => s.score > 0)
    .sort((x, y) => y.score - x.score)
    .slice(0, opts.limit ?? 3)
    .map((s) => s.a)
}
