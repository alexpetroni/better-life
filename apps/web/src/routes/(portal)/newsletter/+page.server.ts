import { fail } from '@sveltejs/kit'
import type { Actions } from './$types'
import { isEmail } from '$lib/server/validate'
import { upsertLeadByEmail } from '$lib/server/leads'
import { recordConsents, CONSENT_VERSION } from '$lib/server/consent'
import { emitNewsletterSubscribed, stampLastSeen } from '$lib/server/events'
import * as m from '$lib/paraglide/messages'

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const locale = locals.locale ?? 'ro'
    const form = await request.formData()
    const email = String(form.get('email') ?? '').trim()
    const consent = form.get('consent') === 'on'

    if (!isEmail(email)) return fail(400, { error: 'email', email })
    if (!consent) return fail(400, { error: 'consent', email })

    const { id } = await upsertLeadByEmail(email, { utm: locals.utm, tags: ['newsletter'] })
    await recordConsents(id, [
      {
        purpose: 'marketing',
        granted: true,
        consentText: m.newsletter_consent(),
        consentVersion: CONSENT_VERSION,
        locale,
      },
    ])

    await stampLastSeen(id)
    await emitNewsletterSubscribed(id)

    return { success: true }
  },
}
