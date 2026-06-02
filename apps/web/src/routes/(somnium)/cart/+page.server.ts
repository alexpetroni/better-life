import { fail } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { getCart, updateLineItem, removeLineItem, listProducts } from '$lib/server/medusa'
import { resolveViewer, getLeadProfile } from '$lib/server/me'
import { rankByProfile } from '$lib/server/recommendations'

export const load: PageServerLoad = async ({ cookies, locals }) => {
  const cartId = cookies.get('bl_cart')
  const cart = cartId ? await getCart(cartId) : null

  // Profile-matched cross-sell, excluding what's already in the cart. Identified
  // visitors get profile ranking; everyone else gets a generic fallback list.
  let profileKey: string | null = null
  const viewer = await resolveViewer(cookies, locals.claimToken)
  if (viewer.leadId) profileKey = (await getLeadProfile(viewer.leadId))?.profileKey ?? null
  const inCart = (cart?.items ?? []).map((i: any) => i.product_handle).filter(Boolean)
  const crossSell = cart?.items?.length
    ? rankByProfile(await listProducts(), profileKey, { excludeHandles: inCart, limit: 3 })
    : []

  return { cart, crossSell }
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
