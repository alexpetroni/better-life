import { Inngest } from 'inngest'
import { INNGEST_ENABLED, INNGEST_EVENT_KEY } from './env'

// BFF-side Inngest client: the BFF only SENDS events; the worker hosts the
// functions. Gated by INNGEST_ENABLED so dev (no Inngest dev server) keeps the
// existing direct-to-worker HTTP path for order effects and simply skips the
// time-based sequences. Always graceful — a send failure never blocks a request.

const client =
  INNGEST_ENABLED ? new Inngest({ id: 'better-life-bff', eventKey: INNGEST_EVENT_KEY || undefined }) : null

export interface InngestEvent {
  name: string
  data: Record<string, unknown>
}

/** Send an event to Inngest. Returns false when disabled or on failure (caller may fall back). */
export async function sendEvent(event: InngestEvent): Promise<boolean> {
  if (!client) return false
  try {
    await client.send(event)
    return true
  } catch (err) {
    console.warn(`[inngest] send '${event.name}' failed:`, (err as Error).message)
    return false
  }
}

export const inngestEnabled = INNGEST_ENABLED
