import { describe, expect, it } from 'vitest'
import { rankByProfile, matchesProfile } from './recommendations'
import type { StoreProduct } from './medusa'

function product(handle: string, profiles: string[]): StoreProduct {
  return { id: handle, handle, title: handle, variantId: 'v', amount: 1, currency: 'ron', profiles }
}

const catalog = [
  product('somneo', ['hyperarousal', 'conditioned']),
  product('masca', ['tension', 'conditioned']),
  product('ceai', ['hyperarousal', 'tension']),
  product('lampa', ['behavioral']),
]

describe('rankByProfile', () => {
  it('puts profile-matched products first, keeping the rest as fallback', () => {
    const ranked = rankByProfile(catalog, 'hyperarousal', { limit: 4 })
    // somneo + ceai match hyperarousal → first; masca + lampa follow.
    expect(ranked.slice(0, 2).map((p) => p.handle).sort()).toEqual(['ceai', 'somneo'])
    expect(ranked).toHaveLength(4)
  })

  it('excludes the given handles (already purchased / current product)', () => {
    const ranked = rankByProfile(catalog, 'hyperarousal', { excludeHandles: ['somneo'], limit: 4 })
    expect(ranked.map((p) => p.handle)).not.toContain('somneo')
  })

  it('respects the limit', () => {
    expect(rankByProfile(catalog, 'tension', { limit: 2 })).toHaveLength(2)
  })

  it('falls back to the catalog when the profile is null or matches nothing', () => {
    expect(rankByProfile(catalog, null, { limit: 3 })).toHaveLength(3)
    const noMatch = rankByProfile(catalog, 'nonexistent', { limit: 4 })
    expect(noMatch).toHaveLength(4) // none matched → all returned as fallback
  })
})

describe('matchesProfile', () => {
  it('is true only when the product carries the profile tag', () => {
    expect(matchesProfile(product('x', ['tension']), 'tension')).toBe(true)
    expect(matchesProfile(product('x', ['tension']), 'behavioral')).toBe(false)
    expect(matchesProfile(product('x', ['tension']), null)).toBe(false)
  })
})
