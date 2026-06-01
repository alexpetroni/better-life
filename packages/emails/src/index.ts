import { render } from '@react-email/render'
import * as React from 'react'
import { ProfileEmail, type ProfileEmailProps } from './profile-email.js'
import { OrderConfirmation, type OrderConfirmationProps } from './order-confirmation.js'

export type { ProfileEmailProps, OrderConfirmationProps }

/**
 * Render the post-quiz profile email to HTML + plain text. All user-facing
 * strings are passed in by the caller (from the web app's paraglide messages),
 * so nothing is hardcoded here.
 */
export async function renderProfileEmail(
  props: ProfileEmailProps
): Promise<{ html: string; text: string }> {
  const element = React.createElement(ProfileEmail, props)
  const html = await render(element, { pretty: true })
  const text = await render(element, { plainText: true })
  return { html, text }
}

/** Render the order-confirmation email (transactional). */
export async function renderOrderConfirmationEmail(
  props: OrderConfirmationProps
): Promise<{ html: string; text: string }> {
  const element = React.createElement(OrderConfirmation, props)
  const html = await render(element, { pretty: true })
  const text = await render(element, { plainText: true })
  return { html, text }
}
