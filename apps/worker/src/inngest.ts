import { Inngest } from 'inngest'
import { ensureEffectsRow } from './db'
import { getOrderInfo } from './medusa'
import { effects } from './run'
import { defaultProviders } from './providers'

export const inngest = new Inngest({ id: 'better-life-worker' })

// order.placed { orderId, pillar } — emitted by the BFF after checkout completes.
// Each effect is its own step.run so Inngest persists results and retries each
// independently. Effects check app.order_effects before acting (idempotent) and
// skip gracefully when credentials are absent.
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

export const functions = [orderEffects]
