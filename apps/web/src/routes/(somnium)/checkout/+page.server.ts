import { fail } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import {
  getCart,
  updateCart,
  listCartShippingOptions,
  addShippingMethod,
  initManualPayment,
  completeCart,
} from '$lib/server/medusa'
import { upsertCustomerByEmail } from '$lib/server/medusa-admin'
import { promoteLeadToCustomer } from '$lib/server/identity'
import { upsertLeadByEmail } from '$lib/server/leads'
import { isEmail } from '$lib/server/validate'
import { emitOrderPlaced, emitCheckoutStarted, stampLastSeen } from '$lib/server/events'

export const load: PageServerLoad = async ({ cookies }) => {
  const cartId = cookies.get('bl_cart')
  const cart = cartId ? await getCart(cartId) : null
  return { cart }
}

export const actions: Actions = {
  // Fired (progressive enhancement) when the shopper enters their email at
  // checkout, before completing. Arms abandoned-cart recovery: the worker waits
  // for order.placed and nudges if it never arrives. No consent is recorded here
  // — recovery still passes the marketing-consent gate, so a shopper with no
  // marketing consent simply isn't nudged.
  identify: async ({ request, cookies }) => {
    const cartId = cookies.get('bl_cart')
    if (!cartId) return { identified: false }
    const email = String((await request.formData()).get('email') ?? '').trim()
    if (!isEmail(email)) return { identified: false }
    try {
      const { id } = await upsertLeadByEmail(email)
      await stampLastSeen(id)
      await emitCheckoutStarted({ cartId, email, leadId: id })
    } catch (err) {
      console.warn('[checkout] identify failed:', (err as Error).message)
    }
    return { identified: true }
  },

  place: async ({ request, cookies, locals }) => {
    const cartId = cookies.get('bl_cart')
    if (!cartId) return fail(400, { error: 'empty' })
    const cart = await getCart(cartId)
    if (!cart || !cart.items?.length) return fail(400, { error: 'empty' })

    const f = await request.formData()
    const email = String(f.get('email') ?? '').trim()
    const first_name = String(f.get('first_name') ?? '')
    const last_name = String(f.get('last_name') ?? '')
    const address_1 = String(f.get('address') ?? '')
    const city = String(f.get('city') ?? '')
    const postal_code = String(f.get('postal') ?? '')
    const phone = String(f.get('phone') ?? '')

    const values = { email, first_name, last_name, address_1, city, postal_code, phone }
    if (!email || !address_1 || !city) return fail(400, { error: 'fields', values })

    const address = { first_name, last_name, address_1, city, postal_code, phone, country_code: 'ro' }

    // 1. email + addresses
    if (!(await updateCart(cartId, { email, shipping_address: address, billing_address: address }))) {
      return fail(500, { error: 'order', values })
    }
    // 2. shipping method (first available)
    const options = await listCartShippingOptions(cartId)
    if (options[0]) await addShippingMethod(cartId, options[0].id)
    // 3. payment session (manual/system provider; real providers in P2-5)
    await initManualPayment(cartId)
    // 4. complete → order
    const result = await completeCart(cartId)
    if (result.type !== 'order' || !result.order) {
      return fail(500, { error: 'order', detail: result.error, values })
    }
    const order = result.order

    // 5. lead → customer promotion (claim token from the post-quiz cookie)
    const customerId = order.customer_id || (await upsertCustomerByEmail(email))
    if (customerId) {
      try {
        await promoteLeadToCustomer({ email, customerId, claimToken: locals.claimToken })
      } catch (err) {
        console.warn('[checkout] lead promotion failed:', (err as Error).message)
      }
    }

    // 6. dispatch order.placed → worker runs the idempotent order effects
    //    (email carried so nurture/cart sequences can match the purchase to a lead)
    await emitOrderPlaced(order.id, 'somnium', order.email)

    // 7. clear the cart
    cookies.delete('bl_cart', { path: '/' })
    return { order: { displayId: order.display_id, email: order.email } }
  },
}
