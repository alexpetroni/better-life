import type { PoolClient } from 'pg'
import { tx } from './db'

// Lead → customer promotion and the "two emails, one person" merge.
//
// The lead owns identity before commerce; the Medusa customer owns commercial
// identity after. `lead.medusa_customer_id` links them. Email is never the join.
// The Medusa customer is created by the storefront flow (register / checkout);
// its id is passed in here, and we resolve which lead to link/merge.

export interface LeadRow {
  id: string
  email: string | null
  claim_token: string
  claim_token_used_at: string | null
  medusa_customer_id: string | null
  behavioral_tags: string[]
  first_touch_utm: Record<string, string> | null
  created_at: string
}

const LEAD_COLS =
  'id, email, claim_token, claim_token_used_at, medusa_customer_id, behavioral_tags, first_touch_utm, created_at'

/** Survivor rule (locked): customer-linked wins; else the older lead. */
function pickSurvivor(a: LeadRow, b: LeadRow): [LeadRow, LeadRow] {
  if (a.medusa_customer_id && !b.medusa_customer_id) return [a, b]
  if (b.medusa_customer_id && !a.medusa_customer_id) return [b, a]
  return new Date(a.created_at) <= new Date(b.created_at) ? [a, b] : [b, a]
}

/** Repoint a merged lead's data onto the survivor and delete it (within a tx). */
async function mergeWithin(client: PoolClient, survivor: LeadRow, merged: LeadRow): Promise<void> {
  await client.query('update app.quiz_responses set lead_id = $1 where lead_id = $2', [survivor.id, merged.id])
  await client.query('update app.consent_records set lead_id = $1 where lead_id = $2', [survivor.id, merged.id])
  await client.query(
    `update app.leads
       set behavioral_tags = (select array(select distinct unnest(behavioral_tags || $2::text[]))),
           email = coalesce(email, $3),
           first_touch_utm = coalesce(first_touch_utm, $4),
           medusa_customer_id = coalesce(medusa_customer_id, $5)
     where id = $1`,
    [
      survivor.id,
      merged.behavioral_tags,
      merged.email,
      merged.first_touch_utm ? JSON.stringify(merged.first_touch_utm) : null,
      merged.medusa_customer_id,
    ]
  )
  await client.query('delete from app.leads where id = $1', [merged.id])
}

/** Merge two leads (the two-emails-one-person case). Returns the surviving id. */
export async function mergeLeads(aId: string, bId: string): Promise<{ survivorId: string }> {
  if (aId === bId) return { survivorId: aId }
  return tx(async (client) => {
    const a = (await client.query<LeadRow>(`select ${LEAD_COLS} from app.leads where id = $1`, [aId])).rows[0]
    const b = (await client.query<LeadRow>(`select ${LEAD_COLS} from app.leads where id = $1`, [bId])).rows[0]
    if (!a || !b) throw new Error('mergeLeads: lead not found')
    const [survivor, merged] = pickSurvivor(a, b)
    await mergeWithin(client, survivor, merged)
    return { survivorId: survivor.id }
  })
}

/**
 * Promote at first purchase / account creation: resolve the lead to link to the
 * Medusa customer (claim token → email match → create), merging when the token
 * lead and the email lead differ. Idempotent: re-running for the same customer
 * links once and consumes the token once.
 */
export async function promoteLeadToCustomer(opts: {
  email: string
  customerId: string
  claimToken?: string | null
}): Promise<{ leadId: string; merged: boolean }> {
  const { email, customerId, claimToken } = opts
  return tx(async (client) => {
    const tokenLead = claimToken
      ? ((
          await client.query<LeadRow>(
            `select ${LEAD_COLS} from app.leads where claim_token = $1 and claim_token_used_at is null`,
            [claimToken]
          )
        ).rows[0] ?? null)
      : null
    const emailLead =
      (await client.query<LeadRow>(`select ${LEAD_COLS} from app.leads where lower(email) = lower($1)`, [email]))
        .rows[0] ?? null

    let survivorId: string
    let merged = false

    if (tokenLead && emailLead && tokenLead.id !== emailLead.id) {
      const [survivor, mergedLead] = pickSurvivor(tokenLead, emailLead)
      await mergeWithin(client, survivor, mergedLead)
      survivorId = survivor.id
      merged = true
    } else if (tokenLead) {
      survivorId = tokenLead.id
    } else if (emailLead) {
      survivorId = emailLead.id
    } else {
      survivorId = (
        await client.query<{ id: string }>('insert into app.leads (email) values ($1) returning id', [email])
      ).rows[0].id
    }

    // Link + backfill email + consume the claim token (all idempotent).
    await client.query(
      `update app.leads
         set medusa_customer_id = coalesce(medusa_customer_id, $2),
             email = coalesce(email, $3),
             claim_token_used_at = case
               when claim_token = $4 and claim_token_used_at is null then now()
               else claim_token_used_at end
       where id = $1`,
      [survivorId, customerId, email, claimToken ?? null]
    )

    return { leadId: survivorId, merged }
  })
}

export async function findLeadByCustomerId(customerId: string): Promise<{ id: string } | null> {
  return (
    (await tx(async (client) =>
      client.query<{ id: string }>('select id from app.leads where medusa_customer_id = $1', [customerId])
    )).rows[0] ?? null
  )
}
