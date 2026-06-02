import { error, fail } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import {
  getProduct,
  createCart,
  addToCart,
  getPurchasedHandles,
  listProducts,
  getCustomerMe,
} from '$lib/server/medusa'
import { resolveViewer, getLeadProfile } from '$lib/server/me'
import { rankByProfile, matchesProfile } from '$lib/server/recommendations'
import { addWishlist, removeWishlist, isWishlisted, recordProductView } from '$lib/server/wishlist'
import { listApprovedReviews, submitReview } from '$lib/server/cms'

export const load: PageServerLoad = async ({ params, cookies, locals }) => {
  const product = await getProduct(params.handle)
  if (!product) throw error(404, 'Product not found')

  // Personalization (identified visitors only). All best-effort — a failure here
  // must never break the product page.
  const viewer = await resolveViewer(cookies, locals.claimToken)
  let profileKey: string | null = null
  let saved = false
  if (viewer.leadId) {
    recordProductView(viewer.leadId, product.handle).catch(() => {})
    const [profile, isSaved] = await Promise.all([
      getLeadProfile(viewer.leadId),
      isWishlisted(viewer.leadId, product.handle),
    ])
    profileKey = profile?.profileKey ?? null
    saved = isSaved
  }

  const purchased = viewer.customerToken ? await getPurchasedHandles(viewer.customerToken) : []
  const [crossSellPool, reviews] = await Promise.all([listProducts(), listApprovedReviews(product.handle)])
  const crossSell = rankByProfile(crossSellPool, profileKey, {
    excludeHandles: [product.handle, ...purchased],
    limit: 3,
  })

  return {
    product,
    why: matchesProfile(product, profileKey),
    crossSell,
    canSave: !!viewer.leadId,
    saved,
    reviews,
    // Verified-purchase gate (locked decision): only logged-in buyers may review.
    canReview: !!viewer.customerToken && purchased.includes(product.handle),
  }
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

  // Toggle wishlist (identified visitors only). Anonymous → no-op fail.
  save: async ({ request, cookies, locals, params }) => {
    const viewer = await resolveViewer(cookies, locals.claimToken)
    if (!viewer.leadId) return fail(401, { saveError: true })
    const remove = String((await request.formData()).get('remove') ?? '') === 'true'
    if (remove) await removeWishlist(viewer.leadId, params.handle)
    else await addWishlist(viewer.leadId, params.handle)
    return { saved: !remove }
  },

  // Submit a review. Re-checks the verified-purchase gate server-side, then writes
  // it as `pending` for moderation. Never trusts the client's canReview flag.
  review: async ({ request, cookies, locals, params }) => {
    const viewer = await resolveViewer(cookies, locals.claimToken)
    if (!viewer.customerToken) return fail(401, { reviewError: 'auth' })
    const purchased = await getPurchasedHandles(viewer.customerToken)
    if (!purchased.includes(params.handle)) return fail(403, { reviewError: 'not_verified' })

    const f = await request.formData()
    const rating = Number(f.get('rating') ?? 0)
    const body = String(f.get('body') ?? '').trim()
    const title = String(f.get('title') ?? '').trim()
    const authorName = String(f.get('authorName') ?? '').trim()
    if (!(rating >= 1 && rating <= 5) || !body) return fail(400, { reviewError: 'fields' })

    const me = await getCustomerMe(viewer.customerToken)
    const ok = await submitReview({
      productHandle: params.handle,
      rating,
      title: title || undefined,
      body,
      authorName: authorName || undefined,
      email: me?.email ?? '',
      pillar: 'somnium',
    })
    if (!ok) return fail(500, { reviewError: 'submit' })
    return { reviewSubmitted: true }
  },
}
