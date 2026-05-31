import type { PageServerLoad } from './$types'
import { queryOne } from '$lib/server/db'

// Phase 1: acknowledge a valid post-quiz claim token (does not consume it; the
// full lead→customer claim happens in Phase 2).
export const load: PageServerLoad = async ({ url }) => {
  const token = url.searchParams.get('token')
  if (!token) return { valid: false }
  const lead = await queryOne<{ id: string }>(
    'select id from app.leads where claim_token = $1',
    [token]
  )
  return { valid: !!lead }
}
