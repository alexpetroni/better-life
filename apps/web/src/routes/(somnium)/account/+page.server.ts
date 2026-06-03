import { fail } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import {
  registerCustomer,
  loginCustomer,
  getCustomerMe,
  listCustomerOrders,
  getPurchasedHandles,
  listProducts,
} from '$lib/server/medusa'
import { promoteLeadToCustomer, findLeadByCustomerId } from '$lib/server/identity'
import { getLeadProfile, getLeadProfileKeys } from '$lib/server/me'
import { rankByProfile, rankArticlesByProfiles } from '$lib/server/recommendations'
import { listWishlistHandles } from '$lib/server/wishlist'
import { getQuizBySlug, getArticles } from '$lib/server/cms'
import { loadPillars } from '$lib/server/pillars'
import { isEmail } from '$lib/server/validate'

const COOKIE = 'bl_session'
const QUIZ_SLUG = 'somnium-sleep'

const EMPTY = {
  customer: null,
  orders: [],
  profile: null,
  addresses: [],
  recommendations: [],
  wishlistCount: 0,
  articleRecs: [],
  accentBySlug: {},
  nameBySlug: {},
}

export const load: PageServerLoad = async ({ cookies, locals }) => {
  const token = cookies.get(COOKIE)
  if (!token) return EMPTY
  const customer = await getCustomerMe(token)
  if (!customer) {
    cookies.delete(COOKIE, { path: '/' })
    return EMPTY
  }
  const orders = await listCustomerOrders(token)

  // Personalization: profile summary, profile-matched recommendations (excluding
  // already-purchased), and a wishlist count. All best-effort.
  const locale = locals.locale ?? 'ro'
  const lead = await findLeadByCustomerId(customer.id)
  let profile: { key: string; title: string } | null = null
  let recommendations: Awaited<ReturnType<typeof listProducts>> = []
  let wishlistCount = 0
  let articleRecs: Awaited<ReturnType<typeof getArticles>> = []
  const accentBySlug: Record<string, string> = {}
  const nameBySlug: Record<string, string> = {}
  if (lead) {
    const lp = await getLeadProfile(lead.id)
    if (lp) {
      const def = await getQuizBySlug(QUIZ_SLUG, locale)
      const p = def?.profiles.find((x) => x.key === lp.profileKey)
      profile = { key: lp.profileKey, title: p?.title ?? lp.profileKey }
    }
    const purchased = await getPurchasedHandles(token)
    recommendations = rankByProfile(await listProducts(), profile?.key ?? null, {
      excludeHandles: purchased,
      limit: 3,
    })
    wishlistCount = (await listWishlistHandles(lead.id)).length

    // Cross-pillar content discovery: articles (from any live pillar) matching
    // this lead's profile tags across all the quizzes they've taken.
    const profileKeys = await getLeadProfileKeys(lead.id)
    if (profileKeys.length) {
      const [pillars, articles] = await Promise.all([loadPillars(locale), getArticles(locale)])
      const liveSlugs = new Set(pillars.filter((pl) => pl.status === 'live').map((pl) => pl.slug))
      for (const pl of pillars) {
        accentBySlug[pl.slug] = pl.accentColor ?? '#4f46e5'
        nameBySlug[pl.slug] = pl.name
      }
      articleRecs = rankArticlesByProfiles(
        articles.filter((a) => liveSlugs.has(a.pillarSlug)),
        profileKeys,
        { limit: 3 }
      )
    }
  }

  return {
    customer,
    orders,
    profile,
    addresses: customer.addresses,
    recommendations,
    wishlistCount,
    articleRecs,
    accentBySlug,
    nameBySlug,
  }
}

export const actions: Actions = {
  register: async ({ request, cookies, locals }) => {
    const f = await request.formData()
    const email = String(f.get('email') ?? '').trim()
    const password = String(f.get('password') ?? '')
    if (!isEmail(email) || password.length < 8) return fail(400, { mode: 'register', error: true, email })

    const result = await registerCustomer(email, password)
    if (!result) return fail(400, { mode: 'register', error: true, email })

    cookies.set(COOKIE, result.token, { path: '/', httpOnly: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 30 })
    // Promotion at account creation (claim token from the post-quiz cookie).
    try {
      await promoteLeadToCustomer({ email, customerId: result.customerId, claimToken: locals.claimToken })
    } catch (err) {
      console.warn('[account] promotion failed:', (err as Error).message)
    }
    return { ok: true }
  },

  login: async ({ request, cookies }) => {
    const f = await request.formData()
    const email = String(f.get('email') ?? '').trim()
    const password = String(f.get('password') ?? '')
    const token = await loginCustomer(email, password)
    if (!token) return fail(400, { mode: 'login', error: true, email })
    cookies.set(COOKIE, token, { path: '/', httpOnly: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 30 })
    return { ok: true }
  },

  logout: async ({ cookies }) => {
    cookies.delete(COOKIE, { path: '/' })
    return { ok: true }
  },
}
