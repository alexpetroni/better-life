import { fail } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import {
  registerCustomer,
  loginCustomer,
  getCustomerMe,
  listCustomerOrders,
} from '$lib/server/medusa'
import { promoteLeadToCustomer } from '$lib/server/identity'
import { isEmail } from '$lib/server/validate'

const COOKIE = 'bl_session'

export const load: PageServerLoad = async ({ cookies }) => {
  const token = cookies.get(COOKIE)
  if (!token) return { customer: null, orders: [] }
  const customer = await getCustomerMe(token)
  if (!customer) {
    cookies.delete(COOKIE, { path: '/' })
    return { customer: null, orders: [] }
  }
  const orders = await listCustomerOrders(token)
  return { customer, orders }
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
