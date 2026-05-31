import type { ConsentInput } from '@better-life/contracts'
import { query } from './db'

// Bump when the wording of any consent text changes. Stored on every record so
// we always know exactly what the person agreed to, and which version.
export const CONSENT_VERSION = '2026-05-31'

/** Insert one consent record per purpose (non-transactional; used by newsletter). */
export async function recordConsents(leadId: string, inputs: ConsentInput[]): Promise<void> {
  for (const c of inputs) {
    await query(
      `insert into app.consent_records (lead_id, purpose, granted, consent_text, consent_version, locale)
       values ($1, $2, $3, $4, $5, $6)`,
      [leadId, c.purpose, c.granted, c.consentText, c.consentVersion, c.locale]
    )
  }
}
