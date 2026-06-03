import { fail } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { isEmail } from '$lib/server/validate'
import { upsertLeadByEmail } from '$lib/server/leads'
import { recordConsents, CONSENT_VERSION } from '$lib/server/consent'
import { emitNewsletterSubscribed, stampLastSeen } from '$lib/server/events'
import { loadNav } from '$lib/server/pillars'
import * as m from '$lib/paraglide/messages'

// The signup offers the live pillars as interest options; the rest of the system
// stays generic (live pillars drive the choices).
export const load: PageServerLoad = async ({ locals }) => {
  const pillars = await loadNav(locals.locale ?? 'ro')
  return { pillars: pillars.map((p) => ({ slug: p.slug, name: p.name })) }
}

export const actions: Actions = {
  default: async ({ request, locals }) => {
    const locale = locals.locale ?? 'ro'
    const form = await request.formData()
    const email = String(form.get('email') ?? '').trim()
    const consent = form.get('consent') === 'on'

    if (!isEmail(email)) return fail(400, { error: 'email', email })
    if (!consent) return fail(400, { error: 'consent', email })

    // Pillar-interest tags make the list targetable. Only live pillars are valid.
    const liveSlugs = new Set((await loadNav(locale)).map((p) => p.slug))
    const interests = form.getAll('interest').map(String).filter((s) => liveSlugs.has(s))
    const tags = ['newsletter', ...interests.map((s) => `interest:${s}`)]

    const { id } = await upsertLeadByEmail(email, { utm: locals.utm, tags })
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
