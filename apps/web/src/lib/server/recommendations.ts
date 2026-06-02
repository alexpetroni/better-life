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
