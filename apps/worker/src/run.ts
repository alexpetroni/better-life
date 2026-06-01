import { ensureEffectsRow, getEffectsRow, setEffect } from './db'
import { defaultProviders, type OrderInfo, type Providers } from './providers'

export interface EffectResult {
  effect: 'oblio' | 'anaf' | 'sameday' | 'confirmation_email'
  status: 'done' | 'skipped'
  reason?: string
  ref?: string
}

export interface OrderEffectsInput {
  orderId: string
  pillar: string
  order: OrderInfo
}

// ── Effect 1: Oblio invoice ─────────────────────────────────────────────────--
// Idempotency: skip if an invoice id is already recorded. Degrade: warn + skip
// when Oblio credentials are absent.
async function oblioInvoice(input: OrderEffectsInput, p: Providers): Promise<EffectResult> {
  const row = await getEffectsRow(input.orderId)
  if (row?.oblio_invoice_id) return { effect: 'oblio', status: 'skipped', reason: 'already_done', ref: row.oblio_invoice_id }
  if (!p.oblio.isConfigured()) {
    console.warn(`[oblio] no credentials — skipping invoice for order ${input.orderId}`)
    await setEffect(input.orderId, { oblio_skipped_reason: 'no_credentials' })
    return { effect: 'oblio', status: 'skipped', reason: 'no_credentials' }
  }
  const invoice = await p.oblio.createInvoice(input.order)
  await setEffect(input.orderId, { oblio_invoice_id: invoice.id, oblio_skipped_reason: null })
  return { effect: 'oblio', status: 'done', ref: invoice.id }
}

// ── Effect 2: ANAF transmission (separate step) ──────────────────────────────
async function anafTransmit(input: OrderEffectsInput, p: Providers): Promise<EffectResult> {
  const row = await getEffectsRow(input.orderId)
  if (row?.anaf_status === 'sent') return { effect: 'anaf', status: 'skipped', reason: 'already_done' }
  if (!row?.oblio_invoice_id) return { effect: 'anaf', status: 'skipped', reason: 'no_invoice' }
  if (!p.anaf.isConfigured()) {
    console.warn(`[anaf] no credentials — skipping transmission for order ${input.orderId}`)
    await setEffect(input.orderId, { anaf_skipped_reason: 'no_credentials' })
    return { effect: 'anaf', status: 'skipped', reason: 'no_credentials' }
  }
  await p.anaf.transmit(row.oblio_invoice_id)
  await setEffect(input.orderId, { anaf_status: 'sent', anaf_skipped_reason: null })
  return { effect: 'anaf', status: 'done' }
}

// ── Effect 3: Sameday AWB ────────────────────────────────────────────────────
async function samedayAwb(input: OrderEffectsInput, p: Providers): Promise<EffectResult> {
  const row = await getEffectsRow(input.orderId)
  if (row?.sameday_awb) return { effect: 'sameday', status: 'skipped', reason: 'already_done', ref: row.sameday_awb }
  if (!p.sameday.isConfigured()) {
    console.warn(`[sameday] no credentials — skipping AWB for order ${input.orderId}`)
    await setEffect(input.orderId, { sameday_skipped_reason: 'no_credentials' })
    return { effect: 'sameday', status: 'skipped', reason: 'no_credentials' }
  }
  const { awb } = await p.sameday.createAwb(input.order)
  await setEffect(input.orderId, { sameday_awb: awb, sameday_skipped_reason: null })
  return { effect: 'sameday', status: 'done', ref: awb }
}

// ── Effect 4: confirmation email ─────────────────────────────────────────────
async function confirmationEmail(input: OrderEffectsInput, p: Providers): Promise<EffectResult> {
  const row = await getEffectsRow(input.orderId)
  if (row?.confirmation_email_sent_at) return { effect: 'confirmation_email', status: 'skipped', reason: 'already_done' }
  if (!p.email.isConfigured()) {
    console.warn(`[email] no RESEND key — skipping confirmation for order ${input.orderId}`)
    await setEffect(input.orderId, { confirmation_skipped_reason: 'no_credentials' })
    return { effect: 'confirmation_email', status: 'skipped', reason: 'no_credentials' }
  }
  await p.email.sendConfirmation(input.order)
  await setEffect(input.orderId, { confirmation_email_sent_at: new Date(), confirmation_skipped_reason: null })
  return { effect: 'confirmation_email', status: 'done' }
}

/**
 * Run all order side effects. Each is independent and idempotent (checks the
 * app.order_effects row before acting) and degrades gracefully on missing
 * credentials. Used by the Inngest function (one step.run per effect) and by
 * the debug CLI/endpoint. Providers are injected so tests can mock them.
 */
export async function runOrderEffects(
  input: OrderEffectsInput,
  providers: Providers = defaultProviders
): Promise<EffectResult[]> {
  await ensureEffectsRow(input.orderId, input.pillar)
  return [
    await oblioInvoice(input, providers),
    await anafTransmit(input, providers),
    await samedayAwb(input, providers),
    await confirmationEmail(input, providers),
  ]
}

export const effects = { oblioInvoice, anafTransmit, samedayAwb, confirmationEmail }
