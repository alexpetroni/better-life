import { error, fail } from '@sveltejs/kit'
import type { Actions, PageServerLoad } from './$types'
import { getQuizBySlug } from '$lib/server/cms'
import { getPillar } from '$lib/server/pillars'
import { submitQuiz, captureEmail } from '$lib/server/quiz'
import { isEmail } from '$lib/server/validate'
import { sendProfileEmail } from '$lib/server/email'
import { emitQuizCompleted, stampLastSeen } from '$lib/server/events'
import { CONSENT_VERSION } from '$lib/server/consent'
import { SITE_URL } from '$lib/server/env'
import * as m from '$lib/paraglide/messages'

const QUIZ_SLUG = 'somnium-sleep'

export const load: PageServerLoad = async ({ locals }) => {
  const locale = locals.locale ?? 'ro'
  const def = await getQuizBySlug(QUIZ_SLUG, locale)
  if (!def) throw error(404, 'Quiz not found')
  const pillar = await getPillar(def.pillarSlug, locale)
  return { def, accent: pillar?.accentColor ?? '#4f46e5' }
}

export const actions: Actions = {
  // Step 1 — compute profile, lazily create an anonymous lead + save the response.
  submit: async ({ request, locals }) => {
    const locale = locals.locale ?? 'ro'
    const def = await getQuizBySlug(QUIZ_SLUG, locale)
    if (!def) return fail(400, { step: 'quiz', error: 'no_quiz' })

    const form = await request.formData()
    const answers: Record<string, string> = {}
    for (const q of def.questions) {
      const v = form.get(q.key)
      if (typeof v === 'string' && v) answers[q.key] = v
    }

    const missing = def.questions.filter((q) => !answers[q.key]).map((q) => q.key)
    if (missing.length) return fail(400, { step: 'quiz', error: 'incomplete', missing, answers })

    const res = await submitQuiz({
      quizSlug: QUIZ_SLUG,
      pillarSlug: def.pillarSlug,
      answers,
      utm: locals.utm,
      def,
    })
    return { step: 'result', leadId: res.leadId, profileKey: res.profileKey }
  },

  // Step 2 — attach consented email, record granular consent, send profile email.
  capture: async ({ request, locals }) => {
    const locale = locals.locale ?? 'ro'
    const def = await getQuizBySlug(QUIZ_SLUG, locale)
    if (!def) return fail(400, { step: 'quiz' })

    const form = await request.formData()
    const leadId = String(form.get('leadId') ?? '')
    const profileKey = String(form.get('profileKey') ?? '')
    const email = String(form.get('email') ?? '').trim()
    const consentResults = form.get('consent_results') === 'on'
    const consentMarketing = form.get('consent_marketing') === 'on'

    if (!leadId) return fail(400, { step: 'result', profileKey, error: 'state' })
    if (!isEmail(email)) return fail(400, { step: 'result', leadId, profileKey, email, error: 'email' })
    if (!consentResults)
      return fail(400, { step: 'result', leadId, profileKey, email, error: 'consent' })

    const captured = await captureEmail({
      leadId,
      email,
      consents: [
        {
          purpose: 'results_delivery',
          granted: true,
          consentText: m.capture_consent_results(),
          consentVersion: CONSENT_VERSION,
          locale,
        },
        {
          purpose: 'marketing',
          granted: consentMarketing,
          consentText: m.capture_consent_marketing(),
          consentVersion: CONSENT_VERSION,
          locale,
        },
      ],
      tags: consentMarketing ? ['marketing', `interest:${def.pillarSlug}`] : [`interest:${def.pillarSlug}`],
    })

    await stampLastSeen(captured.leadId)
    const pillar = await getPillar(def.pillarSlug, locale)
    // Start the profile nurture sequence only for marketing-consented leads.
    if (consentMarketing) {
      await emitQuizCompleted({
        leadId: captured.leadId,
        email,
        pillar: def.pillarSlug,
        profileKey,
        brand: pillar?.name ?? 'Somnium',
        accent: pillar?.accentColor ?? '#4f46e5',
      })
    }

    const profile = def.profiles.find((p) => p.key === profileKey) ?? def.profiles[0]
    let sent = false
    if (profile) {
      const r = await sendProfileEmail({
        to: email,
        subject: m.email_profile_subject(),
        props: {
          greeting: m.email_profile_greeting(),
          intro: m.email_profile_intro(),
          profileTitle: profile.title,
          profileDescription: profile.description,
          tipTitle: m.email_profile_tip_title(),
          tip: profile.tip,
          recommendationsTitle: m.email_profile_recommendations_title(),
          recommendations: profile.recommendations,
          footer: m.email_profile_footer(),
          brand: m.brand_somnium(),
          accentColor: pillar?.accentColor ?? '#4f46e5',
          ctaLabel: profile.ctaLabel,
          ctaUrl: profile.ctaHref ? SITE_URL + profile.ctaHref : undefined,
        },
      })
      sent = r.sent
    }

    return { step: 'captured', profileKey, sent }
  },
}
