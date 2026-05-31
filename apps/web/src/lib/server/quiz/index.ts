import type { ConsentInput, QuizDefinition } from '@better-life/contracts'
import { query, queryOne, tx } from '../db'
import { getMatcher } from './matchers'

export interface SubmitResult {
  leadId: string
  claimToken: string
  profileKey: string
}

/**
 * Anonymous quiz submission: lazily creates a lead (no email) with a claim
 * token, computes the profile via the code matcher, and saves the (sensitive)
 * quiz response keyed to the lead UUID and tagged by pillar.
 */
export async function submitQuiz(opts: {
  quizSlug: string
  pillarSlug: string
  answers: Record<string, string | string[]>
  utm: Record<string, string> | null
  def: QuizDefinition
}): Promise<SubmitResult> {
  const matcher = getMatcher(opts.quizSlug)
  const profileKey = matcher ? matcher(opts.answers) : (opts.def.profiles[0]?.key ?? '')

  const lead = await queryOne<{ id: string; claim_token: string }>(
    `insert into app.leads (first_touch_utm, behavioral_tags)
     values ($1, $2) returning id, claim_token`,
    [opts.utm ? JSON.stringify(opts.utm) : null, [`quiz:${opts.pillarSlug}`, `profile:${profileKey}`]]
  )

  await query(
    `insert into app.quiz_responses (lead_id, quiz_slug, pillar_slug, answers, profile_key)
     values ($1, $2, $3, $4, $5)`,
    [lead!.id, opts.quizSlug, opts.pillarSlug, JSON.stringify(opts.answers), profileKey]
  )

  return { leadId: lead!.id, claimToken: lead!.claim_token, profileKey }
}

/**
 * Attach a consented email to the lead and record granular consent. If the email
 * already belongs to another lead, perform a minimal Phase-1 merge (repoint this
 * submission's quiz response to the existing lead, drop the anonymous one). The
 * fuller "two emails, one person" merge is Phase 2.
 */
export async function captureEmail(opts: {
  leadId: string
  email: string
  consents: ConsentInput[]
  tags?: string[]
}): Promise<{ leadId: string }> {
  return tx(async (client) => {
    let leadId = opts.leadId

    const existing = await client.query<{ id: string }>(
      'select id from app.leads where lower(email) = lower($1)',
      [opts.email]
    )

    if (existing.rows.length > 0 && existing.rows[0].id !== leadId) {
      const target = existing.rows[0].id
      await client.query('update app.quiz_responses set lead_id = $1 where lead_id = $2', [target, leadId])
      await client.query('delete from app.leads where id = $1', [leadId])
      leadId = target
    } else {
      await client.query('update app.leads set email = $2 where id = $1', [leadId, opts.email])
    }

    for (const c of opts.consents) {
      await client.query(
        `insert into app.consent_records (lead_id, purpose, granted, consent_text, consent_version, locale)
         values ($1, $2, $3, $4, $5, $6)`,
        [leadId, c.purpose, c.granted, c.consentText, c.consentVersion, c.locale]
      )
    }

    if (opts.tags?.length) {
      await client.query(
        `update app.leads
           set behavioral_tags = (select array(select distinct unnest(behavioral_tags || $2::text[])))
         where id = $1`,
        [leadId, opts.tags]
      )
    }

    return { leadId }
  })
}
