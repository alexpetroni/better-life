import {
  getLeadForEmail,
  getLeadIdByEmail,
  isMailable,
  recordMarketingEmail,
} from './db'
import { getOrderInfo } from './medusa'
import { defaultProviders, type Providers } from './providers'
import { SITE_URL } from './env'
import { ACCENT, BRAND, copy } from './nurture-copy'

// Marketing nurture sends. Every send passes through ONE gated, idempotent path
// (sendMarketingEmail): it checks the marketing-consent gate, skips gracefully
// when the lead is unreachable / not mailable / email is unconfigured, and logs
// every actual send to app.marketing_emails. The Inngest sequences (inngest.ts)
// orchestrate the timing; this module owns "should we and how we send one email".

export interface NurtureContent {
  heading: string
  paragraphs: string[]
  cta?: { label: string; path: string }
}

export interface SendResult {
  kind: string
  status: 'sent' | 'skipped'
  reason?: string
}

/**
 * Send one marketing email to a lead, gated by consent and gracefully degrading.
 * Skips (never throws for control flow) when: the lead has no email, is not
 * mailable (latest marketing consent not granted → covers unsubscribe), or email
 * is unconfigured. Only a real send is logged, so an unconfigured run can be
 * retried later without a phantom log entry.
 */
export async function sendMarketingEmail(
  leadId: string,
  kind: string,
  content: NurtureContent,
  providers: Providers = defaultProviders
): Promise<SendResult> {
  const lead = await getLeadForEmail(leadId)
  if (!lead?.email) return { kind, status: 'skipped', reason: 'no_email' }
  if (!(await isMailable(leadId))) return { kind, status: 'skipped', reason: 'not_mailable' }
  if (!providers.email.isConfigured()) {
    console.warn(`[nurture] no RESEND key — skipping ${kind} for lead ${leadId}`)
    return { kind, status: 'skipped', reason: 'no_credentials' }
  }

  await providers.email.sendMarketing({
    to: lead.email,
    subject: content.heading,
    props: {
      brand: BRAND,
      accentColor: ACCENT,
      heading: content.heading,
      greeting: copy.greeting,
      paragraphs: content.paragraphs,
      cta: content.cta ? { label: content.cta.label, url: SITE_URL + content.cta.path } : undefined,
      footer: copy.footer,
      unsubscribeLabel: copy.unsubscribeLabel,
      unsubscribeUrl: `${SITE_URL}/unsubscribe?token=${lead.unsubscribe_token}`,
    },
  })
  await recordMarketingEmail(leadId, kind)
  return { kind, status: 'sent' }
}

// ── Sequence-step builders (called from one step.run each in inngest.ts) ──────

/** A. Profile nurture — one step keyed by `kind`, branching copy on profileKey. */
export function profileNurtureContent(kind: string, profileKey: string | null): NurtureContent {
  switch (kind) {
    case 'nurture_tip':
      return copy.nurtureTip(profileKey)
    case 'nurture_product':
      return copy.nurtureProduct()
    default:
      return copy.nurtureReengage()
  }
}

/** C. Post-purchase — resolve the lead + products from the order, then send. */
export async function sendPostPurchase(
  orderId: string,
  kind: 'postpurchase_education' | 'postpurchase_review',
  providers: Providers = defaultProviders
): Promise<SendResult> {
  const order = await getOrderInfo(orderId)
  if (!order?.email) return { kind, status: 'skipped', reason: 'order_not_found' }
  const leadId = await getLeadIdByEmail(order.email)
  if (!leadId) return { kind, status: 'skipped', reason: 'no_lead' }

  const products = [...new Set(order.items.map((i) => i.title).filter(Boolean))]
  const content =
    kind === 'postpurchase_education'
      ? copy.postPurchaseEducation(products)
      : copy.postPurchaseReview(products)
  return sendMarketingEmail(leadId, kind, content, providers)
}
