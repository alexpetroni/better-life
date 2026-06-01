import { fail } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { getCart, updateLineItem, removeLineItem } from '$lib/server/medusa'

export const load: PageServerLoad = async ({ cookies }) => {
  const cartId = cookies.get('bl_cart')
  const cart = cartId ? await getCart(cartId) : null
  return { cart }
}

export const actions: Actions = {
  update: async ({ request, cookies }) => {
    const cartId = cookies.get('bl_cart')
    if (!cartId) return fail(400, { error: true })
    const form = await request.formData()
    await updateLineItem(cartId, String(form.get('lineId') ?? ''), Number(form.get('quantity') ?? 1))
    return { ok: true }
  },
  remove: async ({ request, cookies }) => {
    const cartId = cookies.get('bl_cart')
    if (!cartId) return fail(400, { error: true })
    const form = await request.formData()
    await removeLineItem(cartId, String(form.get('lineId') ?? ''))
    return { ok: true }
  },
}
