import { WORKER_URL } from './env'

// Dispatch the order.placed event to the worker, which runs the idempotent order
// effects (Oblio invoice → ANAF → Sameday AWB → confirmation email). Fire-and-
// forget + graceful: if the worker is offline the order still completes; effects
// can be re-run later (they're idempotent). In production this is an Inngest event.
export async function emitOrderPlaced(orderId: string, pillar = 'somnium'): Promise<void> {
  try {
    await fetch(`${WORKER_URL}/run-effects/${orderId}?pillar=${pillar}`, { method: 'POST' })
  } catch (err) {
    console.warn('[events] order.placed dispatch failed (worker offline?):', (err as Error).message)
  }
}
