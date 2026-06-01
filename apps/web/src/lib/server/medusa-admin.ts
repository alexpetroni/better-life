import { MEDUSA_URL, MEDUSA_ADMIN_EMAIL, MEDUSA_ADMIN_PASSWORD } from './env'

// Server-side admin access, used only to upsert a Medusa customer at guest
// checkout (for lead→customer promotion). Token is cached and refreshed.
let token: string | null = null
let tokenAt = 0
const TTL = 10 * 60 * 1000

async function adminToken(): Promise<string | null> {
  if (!MEDUSA_ADMIN_EMAIL || !MEDUSA_ADMIN_PASSWORD) return null
  if (token && Date.now() - tokenAt < TTL) return token
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

/** Find-or-create a Medusa customer by email; returns the customer id (or null). */
export async function upsertCustomerByEmail(email: string): Promise<string | null> {
  const t = await adminToken()
  if (!t) return null
  const headers = { authorization: `Bearer ${t}`, 'content-type': 'application/json' }
  try {
    const found = await fetch(`${MEDUSA_URL}/admin/customers?email=${encodeURIComponent(email)}`, { headers })
    if (found.ok) {
      const data = await found.json()
      const existing = (data.customers ?? []).find(
        (c: any) => c.email?.toLowerCase() === email.toLowerCase()
      )
      if (existing) return existing.id
    }
    const created = await fetch(`${MEDUSA_URL}/admin/customers`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ email }),
    })
    if (created.ok) return (await created.json()).customer?.id ?? null
  } catch {
    /* graceful */
  }
  return null
}
