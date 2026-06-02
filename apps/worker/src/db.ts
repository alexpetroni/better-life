import pg from 'pg'
import { DATABASE_URL } from './env'

let pool: pg.Pool | null = null
function getPool(): pg.Pool {
  if (!pool) pool = new pg.Pool({ connectionString: DATABASE_URL, max: 4 })
  return pool
}

export async function query<T = Record<string, unknown>>(text: string, params: unknown[] = []): Promise<T[]> {
  const res = await getPool().query(text, params)
  return res.rows as T[]
}

export interface OrderEffectsRow {
  order_id: string
  pillar: string | null
  oblio_invoice_id: string | null
  anaf_status: string | null
  sameday_awb: string | null
  confirmation_email_sent_at: string | null
}

/** Ensure the idempotency row exists; returns the current state. */
export async function ensureEffectsRow(orderId: string, pillar: string): Promise<OrderEffectsRow> {
  const rows = await query<OrderEffectsRow>(
    `insert into app.order_effects (order_id, pillar) values ($1, $2)
     on conflict (order_id) do update set pillar = coalesce(app.order_effects.pillar, $2)
     returning *`,
    [orderId, pillar]
  )
  return rows[0]
}

export async function getEffectsRow(orderId: string): Promise<OrderEffectsRow | null> {
  return (await query<OrderEffectsRow>('select * from app.order_effects where order_id = $1', [orderId]))[0] ?? null
}

export async function setEffect(orderId: string, patch: Record<string, unknown>): Promise<void> {
  const keys = Object.keys(patch)
  if (!keys.length) return
  const sets = keys.map((k, i) => `${k} = $${i + 2}`).join(', ')
  await query(`update app.order_effects set ${sets} where order_id = $1`, [orderId, ...keys.map((k) => patch[k])])
}

// ── Lead / consent helpers for the marketing nurture sequences ────────────────

export interface LeadForEmail {
  id: string
  email: string | null
  unsubscribe_token: string
  profile_key: string | null
}

/** Lead contact + its most recent quiz profile (drives profile-matched copy). */
export async function getLeadForEmail(leadId: string): Promise<LeadForEmail | null> {
  return (
    await query<LeadForEmail>(
      `select l.id, l.email, l.unsubscribe_token,
              (select qr.profile_key from app.quiz_responses qr
                where qr.lead_id = l.id and qr.profile_key is not null
                order by qr.submitted_at desc limit 1) as profile_key
         from app.leads l where l.id = $1`,
      [leadId]
    )
  )[0] ?? null
}

/** Resolve a lead by email (used by post-purchase, which keys off the order email). */
export async function getLeadIdByEmail(email: string): Promise<string | null> {
  const row = (await query<{ id: string }>('select id from app.leads where lower(email) = lower($1)', [email]))[0]
  return row?.id ?? null
}

/**
 * Marketing-consent gate: a lead is mailable only if its LATEST `marketing`
 * consent record is `granted` (and an email exists). An unsubscribe writes a new
 * `granted = false` row, so this flips off without deleting consent history.
 */
export async function isMailable(leadId: string): Promise<boolean> {
  const row = (
    await query<{ granted: boolean }>(
      `select granted from app.consent_records
        where lead_id = $1 and purpose = 'marketing'
        order by created_at desc limit 1`,
      [leadId]
    )
  )[0]
  return row?.granted === true
}

/** Record a marketing email actually sent (idempotency + re-engagement cooldown). */
export async function recordMarketingEmail(leadId: string, kind: string): Promise<void> {
  await query('insert into app.marketing_emails (lead_id, kind) values ($1, $2)', [leadId, kind])
}

/** Has this lead been sent any marketing email within the last `days`? */
export async function hasRecentMarketingEmail(leadId: string, days: number): Promise<boolean> {
  const row = (
    await query<{ exists: boolean }>(
      `select exists(
         select 1 from app.marketing_emails
          where lead_id = $1 and sent_at > now() - ($2 || ' days')::interval
       ) as exists`,
      [leadId, String(days)]
    )
  )[0]
  return row?.exists === true
}

export interface ReengageCandidate {
  id: string
  profile_key: string | null
}

/**
 * Leads eligible for a re-engagement nudge: inactive longer than `inactiveDays`,
 * still marketing-consented, reachable (email present), and not emailed by any
 * sequence within `inactiveDays` (the "no recent sequence" rule). Capped so a
 * single cron tick can't fan out unbounded.
 */
export async function findReengageableLeads(inactiveDays: number, limit = 200): Promise<ReengageCandidate[]> {
  return query<ReengageCandidate>(
    `select l.id,
            (select qr.profile_key from app.quiz_responses qr
              where qr.lead_id = l.id and qr.profile_key is not null
              order by qr.submitted_at desc limit 1) as profile_key
       from app.leads l
      where l.email is not null
        and l.last_seen_at is not null
        and l.last_seen_at < now() - ($1 || ' days')::interval
        and (select c.granted from app.consent_records c
               where c.lead_id = l.id and c.purpose = 'marketing'
               order by c.created_at desc limit 1) is true
        and not exists (
          select 1 from app.marketing_emails me
           where me.lead_id = l.id and me.sent_at > now() - ($1 || ' days')::interval
        )
      order by l.last_seen_at asc
      limit $2`,
    [String(inactiveDays), limit]
  )
}
