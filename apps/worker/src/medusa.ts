import { MEDUSA_URL, MEDUSA_ADMIN_EMAIL, MEDUSA_ADMIN_PASSWORD } from './env'
import type { OrderInfo } from './providers'

let token: string | null = null
let tokenAt = 0

async function adminToken(): Promise<string | null> {
  if (!MEDUSA_ADMIN_EMAIL || !MEDUSA_ADMIN_PASSWORD) return null
  if (token && Date.now() - tokenAt < 10 * 60 * 1000) return token
  try {
    const res = await fetch(`${MEDUSA_URL}/auth/user/emailpass`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: MEDUSA_ADMIN_EMAIL, password: MEDUSA_ADMIN_PASSWORD }),
    })
    if (!res.ok) return null
    token = (await res.json()).token
    tokenAt = Date.now()
    return token
  } catch {
    return null
  }
}

/** Fetch an order from Medusa and map it to the shape the effects need. */
export async function getOrderInfo(orderId: string): Promise<OrderInfo | null> {
  const t = await adminToken()
  if (!t) return null
  try {
    const res = await fetch(
      `${MEDUSA_URL}/admin/orders/${orderId}?fields=id,display_id,email,total,currency_code,*items`,
      { headers: { authorization: `Bearer ${t}` } }
    )
    if (!res.ok) return null
    const o = (await res.json()).order
    return {
      id: o.id,
      displayId: o.display_id,
      email: o.email,
      total: o.total,
      currency: o.currency_code,
      items: (o.items ?? []).map((i: any) => ({ title: i.product_title ?? i.title, quantity: i.quantity })),
    }
  } catch {
    return null
  }
}
