import type { Cookies } from '@sveltejs/kit'
import { queryOne } from './db'
import { findLeadByCustomerId } from './identity'
import { getCustomerMe } from './medusa'

// Resolve "who is this visitor" for personalization (dashboard, wishlist,
// recommendations, product-page "why"). Identified-only features key off the
// lead UUID — never the email. Two identity sources, in priority order:
//   1. a logged-in Medusa customer (bl_session) linked to a lead, or
//   2. a post-quiz claim token (bl_claim) carried by an anonymous-but-known lead.

const SESSION_COOKIE = 'bl_session'

export interface Viewer {
  leadId: string | null
  /** Medusa session token when logged in (lets callers fetch orders/addresses). */
  customerToken: string | null
}

export async function resolveViewer(cookies: Cookies, claimToken: string | null): Promise<Viewer> {
  const token = cookies.get(SESSION_COOKIE)
  if (token) {
    const customer = await getCustomerMe(token)
    if (customer) {
      const lead = await findLeadByCustomerId(customer.id)
      if (lead) return { leadId: lead.id, customerToken: token }
      return { leadId: null, customerToken: token }
    }
  }
  if (claimToken) {
    const lead = await queryOne<{ id: string }>('select id from app.leads where claim_token = $1', [claimToken])
    if (lead) return { leadId: lead.id, customerToken: null }
  }
  return { leadId: null, customerToken: null }
}

export interface LeadProfile {
  profileKey: string
  pillarSlug: string
}

/** The lead's most recent quiz profile, if they've taken a quiz. */
export async function getLeadProfile(leadId: string): Promise<LeadProfile | null> {
  return queryOne<LeadProfile>(
    `select profile_key as "profileKey", pillar_slug as "pillarSlug"
       from app.quiz_responses
      where lead_id = $1 and profile_key is not null
      order by submitted_at desc limit 1`,
    [leadId]
  )
}
