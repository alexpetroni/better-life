import { error, fail } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { getProduct, createCart, addToCart } from '$lib/server/medusa'

export const load: PageServerLoad = async ({ params }) => {
  const product = await getProduct(params.handle)
  if (!product) throw error(404, 'Product not found')
  return { product }
}

export const actions: Actions = {
  add: async ({ request, cookies }) => {
    const form = await request.formData()
    const variantId = String(form.get('variantId') ?? '')
    if (!variantId) return fail(400, { error: true })

    let cartId = cookies.get('bl_cart')
    if (!cartId) {
      cartId = (await createCart()) ?? undefined
      if (cartId) {
        cookies.set('bl_cart', cartId, { path: '/', httpOnly: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 30 })
      }
    }
    if (!cartId) return fail(500, { error: true })

    const cart = await addToCart(cartId, variantId, 1)
    if (!cart) return fail(500, { error: true })
    return { added: true }
  },
}
