import type { PageServerLoad } from './$types'
import { queryOne } from '$lib/server/db'
import { recordConsents, CONSENT_VERSION } from '$lib/server/consent'
import { emitMarketingUnsubscribed } from '$lib/server/events'

// One-click unsubscribe (the link in every marketing email). Resolving the
// single-use-style token to a lead, we record a NEW marketing consent row with
// granted=false — consent is versioned, never deleted — which flips the worker's
// mailability gate off, and we cancel any in-flight sequence. Idempotent: a
// repeat click just records another revoke and still shows success.
export const load: PageServerLoad = async ({ url, locals }) => {
  const locale = locals.locale ?? 'ro'
  const token = url.searchParams.get('token')?.trim()
  if (!token) return { ok: false }

  const lead = await queryOne<{ id: string }>('select id from app.leads where unsubscribe_token = $1', [token])
  if (!lead) return { ok: false }

  await recordConsents(lead.id, [
    {
      purpose: 'marketing',
      granted: false,
      consentText: 'Dezabonare de la comunicările de marketing (un clic, din email).',
      consentVersion: CONSENT_VERSION,
      locale,
    },
  ])
  await emitMarketingUnsubscribed(lead.id)

  return { ok: true }
}
