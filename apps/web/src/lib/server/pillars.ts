import type { Pillar } from '@better-life/contracts'
import { getPillars } from './cms'

// Short in-memory cache so nav (read on every page) doesn't hit Payload each request.
let cache: { at: number; locale: string; data: Pillar[] } | null = null
const TTL_MS = 15_000

export async function loadPillars(locale = 'ro'): Promise<Pillar[]> {
  if (cache && cache.locale === locale && Date.now() - cache.at < TTL_MS) {
    return cache.data
  }
  const data = await getPillars(locale)
  cache = { at: Date.now(), locale, data }
  return data
}

/** Nav derives from pillar config; only `live` pillars surface publicly. */
export async function loadNav(locale = 'ro'): Promise<Pillar[]> {
  const pillars = await loadPillars(locale)
  return pillars.filter((p) => p.status === 'live').sort((a, b) => a.order - b.order)
}

export async function getPillar(slug: string, locale = 'ro'): Promise<Pillar | null> {
  return (await loadPillars(locale)).find((p) => p.slug === slug) ?? null
}
