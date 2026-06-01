import type { Handle } from '@sveltejs/kit'
import { sequence } from '@sveltejs/kit/hooks'
import { paraglideMiddleware } from '$lib/paraglide/server'

const UTM_COOKIE = 'bl_utm'
const UTM_KEYS = ['source', 'medium', 'campaign', 'term', 'content'] as const

function safeParse(value: string): Record<string, string> | null {
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

/** First-touch attribution: capture utm_* the first time we see them, persist once. */
const handleUtm: Handle = async ({ event, resolve }) => {
  const existing = event.cookies.get(UTM_COOKIE)
  if (existing) {
    event.locals.utm = safeParse(existing)
  } else {
    const sp = event.url.searchParams
    const utm: Record<string, string> = {}
    for (const k of UTM_KEYS) {
      const v = sp.get(`utm_${k}`)
      if (v) utm[k] = v
    }
    if (Object.keys(utm).length > 0) {
      event.cookies.set(UTM_COOKIE, JSON.stringify(utm), {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 180, // 180 days
      })
      event.locals.utm = utm
    } else {
      event.locals.utm = null
    }
  }
  return resolve(event)
}

const CLAIM_COOKIE = 'bl_claim'
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Capture a post-quiz claim token (?claim=…) so it survives until checkout/registration. */
const handleClaim: Handle = async ({ event, resolve }) => {
  const incoming = event.url.searchParams.get('claim')
  if (incoming && UUID_RE.test(incoming)) {
    event.cookies.set(CLAIM_COOKIE, incoming, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 90, // 90 days
    })
    event.locals.claimToken = incoming
  } else {
    event.locals.claimToken = event.cookies.get(CLAIM_COOKIE) ?? null
  }
  return resolve(event)
}

/** Paraglide: resolve locale (cookie → baseLocale) and stamp <html lang>. */
const handleParaglide: Handle = ({ event, resolve }) =>
  paraglideMiddleware(event.request, ({ request, locale }) => {
    event.request = request
    event.locals.locale = locale
    return resolve(event, {
      transformPageChunk: ({ html }) => html.replace('%lang%', locale),
    })
  })

export const handle = sequence(handleUtm, handleClaim, handleParaglide)
