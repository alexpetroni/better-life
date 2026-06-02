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
import { getLeadProfile } from '$lib/server/me'
import { rankByProfile } from '$lib/server/recommendations'
import { listWishlistHandles } from '$lib/server/wishlist'
import { getQuizBySlug } from '$lib/server/cms'
import { isEmail } from '$lib/server/validate'

const COOKIE = 'bl_session'
const QUIZ_SLUG = 'somnium-sleep'

const EMPTY = { customer: null, orders: [], profile: null, addresses: [], recommendations: [], wishlistCount: 0 }

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
  const lead = await findLeadByCustomerId(customer.id)
  let profile: { key: string; title: string } | null = null
  let recommendations: Awaited<ReturnType<typeof listProducts>> = []
  let wishlistCount = 0
  if (lead) {
    const lp = await getLeadProfile(lead.id)
    if (lp) {
      const def = await getQuizBySlug(QUIZ_SLUG, locals.locale ?? 'ro')
      const p = def?.profiles.find((x) => x.key === lp.profileKey)
      profile = { key: lp.profileKey, title: p?.title ?? lp.profileKey }
    }
    const purchased = await getPurchasedHandles(token)
    recommendations = rankByProfile(await listProducts(), profile?.key ?? null, {
      excludeHandles: purchased,
      limit: 3,
    })
    wishlistCount = (await listWishlistHandles(lead.id)).length
  }

  return { customer, orders, profile, addresses: customer.addresses, recommendations, wishlistCount }
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
