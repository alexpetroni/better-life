import { query } from './db'

// Wishlist + product-view tracking. Identified-only (lead-keyed): anonymous
// visitors get neither — their activity is never persisted as identity (P3-1
// schema). Tables: app.wishlist_items, app.product_views (migration 0003).

export async function listWishlistHandles(leadId: string): Promise<string[]> {
  const rows = await query<{ product_handle: string }>(
    'select product_handle from app.wishlist_items where lead_id = $1 order by created_at desc',
    [leadId]
  )
  return rows.map((r) => r.product_handle)
}

export async function isWishlisted(leadId: string, handle: string): Promise<boolean> {
  const rows = await query(
    'select 1 from app.wishlist_items where lead_id = $1 and product_handle = $2',
    [leadId, handle]
  )
  return rows.length > 0
}

export async function addWishlist(leadId: string, handle: string): Promise<void> {
  await query(
    `insert into app.wishlist_items (lead_id, product_handle) values ($1, $2)
     on conflict (lead_id, product_handle) do nothing`,
    [leadId, handle]
  )
}

export async function removeWishlist(leadId: string, handle: string): Promise<void> {
  await query('delete from app.wishlist_items where lead_id = $1 and product_handle = $2', [leadId, handle])
}

/** Record a product view (feeds cross-sell). Best-effort, append-only. */
export async function recordProductView(leadId: string, handle: string): Promise<void> {
  await query('insert into app.product_views (lead_id, product_handle) values ($1, $2)', [leadId, handle])
}
