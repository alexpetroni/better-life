import { WORKER_URL } from './env'
import { sendEvent, inngestEnabled } from './inngest'
import { query } from './db'

// Lifecycle events emitted by the BFF. The durable, time-based sequences (profile
// nurture, abandoned cart, post-purchase, re-engagement) live in the worker and
// are driven by these events through Inngest. Every emit is fire-and-forget and
// graceful: a missing/offline worker never blocks the user's request.

/**
 * order.placed — runs the idempotent order effects (Oblio → ANAF → Sameday →
 * confirmation) and feeds post-purchase education. Prefers Inngest (durable, and
 * the only path that triggers the post-purchase sequence); falls back to the
 * direct worker HTTP shim in dev so the critical effects still run without an
 * Inngest dev server. `email` is carried so the nurture sequences can match a
 * purchase to a lead.
 */
export async function emitOrderPlaced(orderId: string, pillar = 'somnium', email?: string): Promise<void> {
  if (inngestEnabled && (await sendEvent({ name: 'order.placed', data: { orderId, pillar, email } }))) return
  try {
    await fetch(`${WORKER_URL}/run-effects/${orderId}?pillar=${pillar}`, { method: 'POST' })
  } catch (err) {
    console.warn('[events] order.placed dispatch failed (worker offline?):', (err as Error).message)
  }
}

/** quiz.completed — starts the profile nurture sequence. Carries the pillar's
 *  brand + accent (CMS spine config) so the worker doesn't hardcode pillar copy. */
export async function emitQuizCompleted(opts: {
  leadId: string
  email: string
  pillar: string
  profileKey: string
  brand: string
  accent: string
}): Promise<void> {
  await sendEvent({ name: 'quiz.completed', data: opts })
}

/** checkout.started — arms abandoned-cart recovery (email captured, order pending). */
export async function emitCheckoutStarted(opts: {
  cartId: string
  email: string
  leadId: string
}): Promise<void> {
  await sendEvent({ name: 'checkout.started', data: opts })
}

/** newsletter.subscribed — a standalone signup (no quiz). */
export async function emitNewsletterSubscribed(leadId: string): Promise<void> {
  await sendEvent({ name: 'newsletter.subscribed', data: { leadId } })
}

/** marketing.unsubscribed — cancels any in-flight marketing sequence for the lead. */
export async function emitMarketingUnsubscribed(leadId: string): Promise<void> {
  await sendEvent({ name: 'marketing.unsubscribed', data: { leadId } })
}

/** Stamp lead activity (feeds the re-engagement inactivity window). Best-effort. */
export async function stampLastSeen(leadId: string): Promise<void> {
  try {
    await query('update app.leads set last_seen_at = now() where id = $1', [leadId])
  } catch (err) {
    console.warn('[events] last_seen_at stamp failed:', (err as Error).message)
  }
}
