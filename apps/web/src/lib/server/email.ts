import { Resend } from 'resend'
import { renderProfileEmail, type ProfileEmailProps } from '@better-life/emails'
import { RESEND_API_KEY, EMAIL_FROM } from './env'

let warned = false

/**
 * Send the post-quiz profile email. Graceful degradation: if RESEND_API_KEY is
 * absent, log once and return { sent: false } — the rest of the flow (consent,
 * on-screen results) is unaffected and the app never crashes.
 */
export async function sendProfileEmail(opts: {
  to: string
  subject: string
  props: ProfileEmailProps
}): Promise<{ sent: boolean; reason?: string }> {
  if (!RESEND_API_KEY) {
    if (!warned) {
      console.warn('[email] RESEND_API_KEY missing — profile email disabled (graceful degradation).')
      warned = true
    }
    return { sent: false, reason: 'no_api_key' }
  }

  try {
    const { html, text } = await renderProfileEmail(opts.props)
    const resend = new Resend(RESEND_API_KEY)
    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: opts.to,
      subject: opts.subject,
      html,
      text,
    })
    if (error) {
      console.warn('[email] send failed:', error)
      return { sent: false, reason: 'send_error' }
    }
    return { sent: true }
  } catch (err) {
    console.warn('[email] send threw:', (err as Error).message)
    return { sent: false, reason: 'exception' }
  }
}
