import { MEDUSA_URL, MEDUSA_PUBLISHABLE_KEY } from './env'

// Storefront BFF client for Medusa. The browser never holds the key. Graceful
// degradation: without a publishable key the shop returns empty/null and the
// rest of the site is unaffected.

export interface StoreProduct {
  id: string
  handle: string
  title: string
  description?: string
  thumbnail?: string
  variantId: string
  amount: number | null
  currency: string
}

export interface StoreCategory {
  id: string
  name: string
  handle: string
}

let warned = false
function keyMissing(): boolean {
  if (!MEDUSA_PUBLISHABLE_KEY) {
    if (!warned) {
      console.warn('[medusa] MEDUSA_PUBLISHABLE_KEY missing — shop disabled (graceful degradation).')
      warned = true
    }
    return true
  }
  return false
}

async function medusaFetch<T = any>(
  path: string,
  init?: RequestInit & { rawHeaders?: Record<string, string> }
): Promise<T | null> {
  if (keyMissing()) return null
  try {
    const res = await fetch(`${MEDUSA_URL}${path}`, {
      ...init,
      headers: {
        'x-publishable-api-key': MEDUSA_PUBLISHABLE_KEY,
        'content-type': 'application/json',
        accept: 'application/json',
        ...init?.rawHeaders,
      },
    })
    if (!res.ok) {
      console.warn(`[medusa] ${init?.method ?? 'GET'} ${path} → HTTP ${res.status}`)
      return null
    }
    return (await res.json()) as T
  } catch (err) {
    console.warn(`[medusa] fetch failed for ${path}:`, (err as Error).message)
    return null
  }
}

let cachedRegionId: string | null = null
export async function getRegionId(): Promise<string | null> {
  if (cachedRegionId) return cachedRegionId
  const data = await medusaFetch<{ regions: { id: string }[] }>('/store/regions')
  cachedRegionId = data?.regions?.[0]?.id ?? null
  return cachedRegionId
}

function mapProduct(p: any): StoreProduct {
  const variant = p.variants?.[0]
  const price = variant?.calculated_price
  return {
    id: p.id,
    handle: p.handle,
    title: p.title,
    description: p.description ?? undefined,
    thumbnail: p.thumbnail ?? undefined,
    variantId: variant?.id ?? '',
    amount: price?.calculated_amount ?? null,
    currency: price?.currency_code ?? 'ron',
  }
}

const PRODUCT_FIELDS = 'fields=id,title,handle,description,thumbnail,*variants.calculated_price'

export async function listProducts(opts: { categoryId?: string; q?: string } = {}): Promise<StoreProduct[]> {
  const regionId = await getRegionId()
  if (!regionId) return []
  const params = new URLSearchParams({ limit: '50', region_id: regionId })
  if (opts.categoryId) params.set('category_id[]', opts.categoryId)
  if (opts.q) params.set('q', opts.q)
  const data = await medusaFetch<{ products: any[] }>(`/store/products?${params}&${PRODUCT_FIELDS}`)
  return (data?.products ?? []).map(mapProduct)
}

export async function getProduct(handle: string): Promise<StoreProduct | null> {
  const regionId = await getRegionId()
  if (!regionId) return null
  const data = await medusaFetch<{ products: any[] }>(
    `/store/products?handle=${encodeURIComponent(handle)}&region_id=${regionId}&${PRODUCT_FIELDS}`
  )
  const p = data?.products?.[0]
  return p ? mapProduct(p) : null
}

export async function listCategories(): Promise<StoreCategory[]> {
  const data = await medusaFetch<{ product_categories: any[] }>(
    '/store/product-categories?fields=id,name,handle&limit=50'
  )
  return (data?.product_categories ?? []).map((c) => ({ id: c.id, name: c.name, handle: c.handle }))
}

// ── Cart ───────────────────────────────────────────────────────────────────--
export async function createCart(): Promise<string | null> {
  const regionId = await getRegionId()
  if (!regionId) return null
  const data = await medusaFetch<{ cart: { id: string } }>('/store/carts', {
    method: 'POST',
    body: JSON.stringify({ region_id: regionId }),
  })
  return data?.cart?.id ?? null
}

export async function getCart(cartId: string): Promise<any | null> {
  const data = await medusaFetch<{ cart: any }>(`/store/carts/${cartId}`)
  return data?.cart ?? null
}

export async function addToCart(cartId: string, variantId: string, quantity = 1): Promise<any | null> {
  const data = await medusaFetch<{ cart: any }>(`/store/carts/${cartId}/line-items`, {
    method: 'POST',
    body: JSON.stringify({ variant_id: variantId, quantity }),
  })
  return data?.cart ?? null
}

export async function updateLineItem(cartId: string, lineId: string, quantity: number): Promise<any | null> {
  if (quantity <= 0) return removeLineItem(cartId, lineId)
  const data = await medusaFetch<{ cart: any }>(`/store/carts/${cartId}/line-items/${lineId}`, {
    method: 'POST',
    body: JSON.stringify({ quantity }),
  })
  return data?.cart ?? null
}

export async function removeLineItem(cartId: string, lineId: string): Promise<any | null> {
  const data = await medusaFetch<{ parent: any }>(`/store/carts/${cartId}/line-items/${lineId}`, {
    method: 'DELETE',
  })
  return data?.parent ?? (await getCart(cartId))
}
