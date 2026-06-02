import { fail } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { listProducts, createCart, addToCart, type StoreProduct } from '$lib/server/medusa'
import { resolveViewer } from '$lib/server/me'
import { listWishlistHandles, removeWishlist } from '$lib/server/wishlist'

export const load: PageServerLoad = async ({ cookies, locals }) => {
  const viewer = await resolveViewer(cookies, locals.claimToken)
  if (!viewer.leadId) return { identified: false, products: [] as StoreProduct[] }

  const handles = await listWishlistHandles(viewer.leadId)
  const all = await listProducts()
  const byHandle = new Map(all.map((p) => [p.handle, p]))
  // Preserve wishlist order (most-recent first); drop any product no longer sold.
  const products = handles.map((h) => byHandle.get(h)).filter(Boolean) as StoreProduct[]
  return { identified: true, products }
}

export const actions: Actions = {
  remove: async ({ request, cookies, locals }) => {
    const viewer = await resolveViewer(cookies, locals.claimToken)
    if (!viewer.leadId) return fail(401, { error: true })
    await removeWishlist(viewer.leadId, String((await request.formData()).get('handle') ?? ''))
    return { ok: true }
  },

  add: async ({ request, cookies }) => {
    const variantId = String((await request.formData()).get('variantId') ?? '')
    if (!variantId) return fail(400, { error: true })
    let cartId = cookies.get('bl_cart')
    if (!cartId) {
      cartId = (await createCart()) ?? undefined
      if (cartId) cookies.set('bl_cart', cartId, { path: '/', httpOnly: true, sameSite: 'lax', maxAge: 60 * 60 * 24 * 30 })
    }
    if (!cartId || !(await addToCart(cartId, variantId, 1))) return fail(500, { error: true })
    return { added: true }
  },
}
