import { describe, expect, it } from 'vitest'
import { rankByProfile, matchesProfile, rankArticlesByProfiles } from './recommendations'
import type { StoreProduct } from './medusa'
import type { Article } from '@better-life/contracts'

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

describe('rankArticlesByProfiles (cross-pillar content discovery)', () => {
  const article = (slug: string, pillarSlug: string, profileTags: string[]): Article => ({
    slug,
    title: slug,
    pillarSlug,
    profileTags,
  })
  const articles = [
    article('sleep-a', 'somnium', ['hyperarousal']),
    article('body-bridge', 'better-body', ['sedentary', 'behavioral']), // cross-pillar bridge
    article('body-pure', 'better-body', ['inconsistent']),
    article('untagged', 'somnium', []),
  ]

  it('surfaces content from MULTIPLE pillars by the lead’s profile tags', () => {
    // A lead with a sleep profile + a body profile sees both pillars' matches.
    const recs = rankArticlesByProfiles(articles, ['hyperarousal', 'sedentary'], { limit: 5 })
    const slugs = recs.map((a) => a.slug)
    expect(slugs).toContain('sleep-a') // somnium
    expect(slugs).toContain('body-bridge') // better-body
    expect(slugs).not.toContain('untagged') // no tag match → never shown
  })

  it('ranks by number of matching tags', () => {
    const recs = rankArticlesByProfiles(articles, ['sedentary', 'behavioral'], { limit: 5 })
    expect(recs[0].slug).toBe('body-bridge') // matches 2 tags → first
  })

  it('returns nothing when the lead has no profiles, and respects excludeSlugs', () => {
    expect(rankArticlesByProfiles(articles, [])).toEqual([])
    expect(
      rankArticlesByProfiles(articles, ['hyperarousal'], { excludeSlugs: ['sleep-a'] }).map((a) => a.slug)
    ).not.toContain('sleep-a')
  })
})
