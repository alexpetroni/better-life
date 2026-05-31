import { query, queryOne } from './db'

// Leads are created lazily (quiz submit, newsletter) — never for anonymous
// traffic. Keyed by UUID; email is optional and never an identity join.

export async function findLeadByEmail(email: string): Promise<{ id: string } | null> {
  return queryOne<{ id: string }>('select id from app.leads where lower(email) = lower($1)', [email])
}

export async function addTags(leadId: string, tags: string[]): Promise<void> {
  if (!tags.length) return
  await query(
    `update app.leads
       set behavioral_tags = (select array(select distinct unnest(behavioral_tags || $2::text[])))
     where id = $1`,
    [leadId, tags]
  )
}

/** Create or reuse a lead by email (used by the standalone newsletter signup). */
export async function upsertLeadByEmail(
  email: string,
  opts: { utm?: Record<string, string> | null; tags?: string[] } = {}
): Promise<{ id: string; created: boolean }> {
  const existing = await findLeadByEmail(email)
  if (existing) {
    if (opts.tags?.length) await addTags(existing.id, opts.tags)
    return { id: existing.id, created: false }
  }
  const row = await queryOne<{ id: string }>(
    `insert into app.leads (email, first_touch_utm, behavioral_tags)
     values ($1, $2, $3) returning id`,
    [email, opts.utm ? JSON.stringify(opts.utm) : null, opts.tags ?? []]
  )
  return { id: row!.id, created: true }
}
