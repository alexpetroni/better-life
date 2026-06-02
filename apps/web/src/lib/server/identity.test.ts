import { afterAll, beforeEach, describe, expect, it } from 'vitest'
import { promoteLeadToCustomer } from './identity'
import { query, queryOne } from './db'

async function cleanup() {
  await query("delete from app.leads where lower(email) like '%@vitest.test' or behavioral_tags @> array['vitest']")
}

beforeEach(cleanup)
afterAll(cleanup)

describe('identity promotion + merge', () => {
  it('promotes an anonymous quiz lead: links the customer, consumes the token', async () => {
    const lead = await queryOne<{ id: string; claim_token: string }>(
      "insert into app.leads (behavioral_tags) values (array['vitest']) returning id, claim_token"
    )
    await query(
      "insert into app.quiz_responses (lead_id, quiz_slug, pillar_slug, answers) values ($1,'somnium-sleep','somnium','{}')",
      [lead!.id]
    )
    const res = await promoteLeadToCustomer({ email: 'solo@vitest.test', customerId: 'cus_v_A', claimToken: lead!.claim_token })
    expect(res.leadId).toBe(lead!.id)
    expect(res.merged).toBe(false)

    const row = await queryOne<{ email: string; medusa_customer_id: string; claim_token_used_at: string | null }>(
      'select email, medusa_customer_id, claim_token_used_at from app.leads where id = $1',
      [lead!.id]
    )
    expect(row!.medusa_customer_id).toBe('cus_v_A')
    expect(row!.email).toBe('solo@vitest.test')
    expect(row!.claim_token_used_at).toBeTruthy()
  })

  it('merges two-emails-one-person: the customer-linked lead survives, quiz repointed', async () => {
    const tokenLead = await queryOne<{ id: string; claim_token: string }>(
      "insert into app.leads (email, behavioral_tags) values ('quiz@vitest.test', array['vitest']) returning id, claim_token"
    )
    await query(
      "insert into app.quiz_responses (lead_id, quiz_slug, pillar_slug, answers) values ($1,'somnium-sleep','somnium','{}')",
      [tokenLead!.id]
    )
    const emailLead = await queryOne<{ id: string }>(
      "insert into app.leads (email, medusa_customer_id, behavioral_tags) values ('buyer@vitest.test','cus_v_PRE',array['vitest']) returning id"
    )

    const res = await promoteLeadToCustomer({ email: 'buyer@vitest.test', customerId: 'cus_v_PRE', claimToken: tokenLead!.claim_token })
    expect(res.merged).toBe(true)
    expect(res.leadId).toBe(emailLead!.id) // customer-linked survives

    expect(await queryOne('select id from app.leads where id = $1', [tokenLead!.id])).toBeNull() // merged away
    const qr = await query('select id from app.quiz_responses where lead_id = $1', [emailLead!.id])
    expect(qr.length).toBe(1) // quiz response repointed onto the survivor
  })

  it('is idempotent: re-promoting the same email links exactly once', async () => {
    const r1 = await promoteLeadToCustomer({ email: 'idem@vitest.test', customerId: 'cus_v_D' })
    const r2 = await promoteLeadToCustomer({ email: 'idem@vitest.test', customerId: 'cus_v_D' })
    expect(r1.leadId).toBe(r2.leadId)
    const linked = await query("select id from app.leads where medusa_customer_id = 'cus_v_D'")
    expect(linked.length).toBe(1)
  })
})
