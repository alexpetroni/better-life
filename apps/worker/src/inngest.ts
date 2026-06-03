import { Inngest } from 'inngest'
import { ensureEffectsRow, findReengageableLeads } from './db'
import { getOrderInfo } from './medusa'
import { effects } from './run'
import { defaultProviders } from './providers'
import { sendMarketingEmail, profileNurtureContent, sendPostPurchase } from './nurture'
import { copy } from './nurture-copy'

export const inngest = new Inngest({ id: 'better-life-worker' })

// order.placed { orderId, pillar, email } — emitted by the BFF after checkout.
// Each effect is its own step.run so Inngest persists results and retries each
// independently. Effects check app.order_effects before acting (idempotent) and
// skip gracefully when credentials are absent. `email` is carried so the nurture
// sequences below can match a purchase to a lead via `match: 'data.email'`.
export const orderEffects = inngest.createFunction(
  { id: 'order-effects', retries: 3, triggers: [{ event: 'order.placed' }] },
  async ({ event, step }) => {
    const { orderId, pillar = 'somnium' } = event.data as { orderId: string; pillar?: string }

    await step.run('ensure-effects-row', () => ensureEffectsRow(orderId, pillar))
    const order = await step.run('load-order', () => getOrderInfo(orderId))
    if (!order) return { skipped: 'order_not_found' }

    const input = { orderId, pillar, order }
    const oblio = await step.run('oblio-invoice', () => effects.oblioInvoice(input, defaultProviders))
    const anaf = await step.run('anaf-transmit', () => effects.anafTransmit(input, defaultProviders))
    const sameday = await step.run('sameday-awb', () => effects.samedayAwb(input, defaultProviders))
    const confirmation = await step.run('confirmation-email', () =>
      effects.confirmationEmail(input, defaultProviders)
    )
    return { results: [oblio, anaf, sameday, confirmation] }
  }
)

// ── A. Profile nurture (trigger: quiz.completed) ─────────────────────────────--
// +1d tip → +3d profile-matched product → +7d re-engagement. Each delay is a
// waitForEvent on order.placed (matched by email): a purchase short-circuits the
// rest of the cadence. An unsubscribe cancels the whole run; the consent gate in
// sendMarketingEmail is the belt-and-suspenders check on each send.
export const profileNurture = inngest.createFunction(
  {
    id: 'profile-nurture',
    triggers: [{ event: 'quiz.completed' }],
    cancelOn: [{ event: 'marketing.unsubscribed', match: 'data.leadId' }],
  },
  async ({ event, step }) => {
    const {
      leadId,
      profileKey = null,
      pillar = 'somnium',
      brand,
      accent,
    } = event.data as {
      leadId: string
      profileKey?: string | null
      pillar?: string
      brand?: string
      accent?: string
    }
    // Pillar branding comes from the event (CMS spine), not hardcoded here.
    const branding = { brand: brand || 'Somnium', accent: accent || '#4F46E5' }
    const sequence = [
      { kind: 'nurture_tip', delay: '1d' },
      { kind: 'nurture_product', delay: '2d' }, // +3d cumulative
      { kind: 'nurture_reengage', delay: '4d' }, // +7d cumulative
    ]
    for (const s of sequence) {
      const purchased = await step.waitForEvent(`await-purchase-${s.kind}`, {
        event: 'order.placed',
        timeout: s.delay,
        match: 'data.email',
      })
      if (purchased) return { stopped: 'purchased', after: s.kind }
      const res = await step.run(`send-${s.kind}`, () =>
        sendMarketingEmail(leadId, s.kind, profileNurtureContent(pillar, s.kind, profileKey), defaultProviders, branding)
      )
      if (res.status === 'skipped' && res.reason === 'not_mailable')
        return { stopped: 'not_mailable', after: s.kind }
    }
    return { done: true }
  }
)

// ── B. Abandoned cart (trigger: checkout.started) ────────────────────────────--
// waitForEvent order.placed (1h) → reminder; second nudge after a further 24h.
// A purchase at either window cancels the sequence.
export const abandonedCart = inngest.createFunction(
  {
    id: 'abandoned-cart',
    triggers: [{ event: 'checkout.started' }],
    cancelOn: [{ event: 'marketing.unsubscribed', match: 'data.leadId' }],
  },
  async ({ event, step }) => {
    const { leadId } = event.data as { leadId: string }

    const p1 = await step.waitForEvent('await-purchase-1h', {
      event: 'order.placed',
      timeout: '1h',
      match: 'data.email',
    })
    if (p1) return { stopped: 'purchased', stage: 1 }

    const r1 = await step.run('cart-recovery-1', () =>
      sendMarketingEmail(leadId, 'cart_recovery_1', copy.cartRecovery1())
    )
    if (r1.status === 'skipped' && r1.reason === 'not_mailable') return { stopped: 'not_mailable' }

    const p2 = await step.waitForEvent('await-purchase-24h', {
      event: 'order.placed',
      timeout: '24h',
      match: 'data.email',
    })
    if (p2) return { stopped: 'purchased', stage: 2 }

    await step.run('cart-recovery-2', () => sendMarketingEmail(leadId, 'cart_recovery_2', copy.cartRecovery2()))
    return { done: true }
  }
)

// ── C. Post-purchase education (trigger: order.placed) ───────────────────────--
// +1d education tied to products bought → +7d usage tips + review request. The
// lead is resolved from the order email inside sendPostPurchase, which also runs
// the consent gate (so a non-marketing-consented buyer is not emailed).
export const postPurchaseEducation = inngest.createFunction(
  { id: 'post-purchase-education', triggers: [{ event: 'order.placed' }] },
  async ({ event, step }) => {
    const { orderId } = event.data as { orderId: string }
    await step.sleep('wait-1d', '1d')
    const education = await step.run('education', () => sendPostPurchase(orderId, 'postpurchase_education'))
    await step.sleep('wait-6d', '6d')
    const review = await step.run('review-request', () => sendPostPurchase(orderId, 'postpurchase_review'))
    return { results: [education, review] }
  }
)

// ── D. Re-engagement (daily cron) ────────────────────────────────────────────-
// Leads inactive > 30d, still marketing-consented, with no marketing email in
// the last 30d, get one nudge. The candidate query enforces the cooldown; the
// per-send log entry prevents a repeat on the next day's tick.
export const reEngagement = inngest.createFunction(
  { id: 're-engagement', triggers: [{ cron: 'TZ=Europe/Bucharest 0 9 * * *' }] },
  async ({ step }) => {
    const candidates = await step.run('find-candidates', () => findReengageableLeads(30))
    let sent = 0
    for (const lead of candidates) {
      const res = await step.run(`reengage-${lead.id}`, () =>
        sendMarketingEmail(lead.id, 'reengagement', copy.reengagement())
      )
      if (res.status === 'sent') sent++
    }
    return { candidates: candidates.length, sent }
  }
)

export const functions = [
  orderEffects,
  profileNurture,
  abandonedCart,
  postPurchaseEducation,
  reEngagement,
]
