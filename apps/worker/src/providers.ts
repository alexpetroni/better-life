import { Resend } from 'resend'
import { renderOrderConfirmationEmail } from '@better-life/emails'
import {
  OBLIO_EMAIL,
  OBLIO_SECRET,
  OBLIO_CIF,
  SAMEDAY_USER,
  SAMEDAY_PASSWORD,
  RESEND_API_KEY,
  EMAIL_FROM,
} from './env'
import { ro } from './email-copy'

// Provider interfaces + real, credential-guarded implementations. Effects call
// these only when isConfigured() is true (else they skip — graceful degradation).
// Real API calls run once credentials exist; tests (P2-7) inject mocks to prove
// idempotency without hitting external services.

export interface OrderInfo {
  id: string
  displayId: number
  email: string
  total: number
  currency: string
  items: { title: string; quantity: number }[]
}

export interface OblioProvider {
  isConfigured(): boolean
  createInvoice(order: OrderInfo): Promise<{ id: string }>
}
export interface AnafProvider {
  isConfigured(): boolean
  transmit(invoiceId: string): Promise<{ status: string }>
}
export interface SamedayProvider {
  isConfigured(): boolean
  createAwb(order: OrderInfo): Promise<{ awb: string }>
}
export interface EmailProvider {
  isConfigured(): boolean
  sendConfirmation(order: OrderInfo): Promise<void>
}

function formatRon(amount: number): string {
  try {
    return new Intl.NumberFormat('ro-RO', { style: 'currency', currency: 'RON' }).format(amount)
  } catch {
    return `${amount} RON`
  }
}

// ── Oblio (invoicing) ────────────────────────────────────────────────────────
let oblioToken: { value: string; at: number } | null = null
async function oblioAuth(): Promise<string> {
  if (oblioToken && Date.now() - oblioToken.at < 50 * 60 * 1000) return oblioToken.value
  const res = await fetch('https://www.oblio.eu/api/authorize/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ client_id: OBLIO_EMAIL, client_secret: OBLIO_SECRET }),
  })
  if (!res.ok) throw new Error(`Oblio auth failed (${res.status})`)
  const token = (await res.json()).access_token as string
  oblioToken = { value: token, at: Date.now() }
  return token
}

export const oblio: OblioProvider = {
  isConfigured: () => Boolean(OBLIO_EMAIL && OBLIO_SECRET && OBLIO_CIF),
  async createInvoice(order) {
    const token = await oblioAuth()
    const res = await fetch('https://www.oblio.eu/api/docs/invoice', {
      method: 'POST',
      headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json' },
      body: JSON.stringify({
        cif: OBLIO_CIF,
        client: { email: order.email, name: order.email },
        products: order.items.map((i) => ({ name: i.title, quantity: i.quantity, price: 0 })),
        internalNote: `order:${order.id}`, // support/debug hint; effect guard prevents re-creation
      }),
    })
    if (!res.ok) throw new Error(`Oblio invoice failed (${res.status})`)
    const data = (await res.json()).data
    return { id: `${data.seriesName}/${data.number}` } // invoice ref "SERIES/NUMBER"
  },
}

// ── ANAF SPV transmission (separate step; via Oblio e-Factura) ───────────────
export const anaf: AnafProvider = {
  isConfigured: () => oblio.isConfigured(),
  async transmit(invoiceId) {
    const [seriesName, number] = invoiceId.split('/')
    const token = await oblioAuth()
    const res = await fetch(
      `https://www.oblio.eu/api/docs/einvoice?cif=${encodeURIComponent(OBLIO_CIF)}&seriesName=${encodeURIComponent(
        seriesName
      )}&number=${encodeURIComponent(number)}`,
      { method: 'POST', headers: { authorization: `Bearer ${token}` } }
    )
    if (!res.ok) throw new Error(`ANAF (Oblio e-Factura) transmission failed (${res.status})`)
    return { status: 'sent' }
  },
}

// ── Sameday (shipping AWB) ───────────────────────────────────────────────────
const SAMEDAY_BASE =
  process.env.SAMEDAY_SANDBOX === 'false' ? 'https://api.sameday.ro' : 'https://sameday-api.demo.zitec.com'
let samedayToken: { value: string; at: number } | null = null
async function samedayAuth(): Promise<string> {
  if (samedayToken && Date.now() - samedayToken.at < 50 * 60 * 1000) return samedayToken.value
  const res = await fetch(`${SAMEDAY_BASE}/api/authenticate`, {
    method: 'POST',
    headers: { 'X-Auth-Username': SAMEDAY_USER, 'X-Auth-Password': SAMEDAY_PASSWORD },
  })
  if (!res.ok) throw new Error(`Sameday auth failed (${res.status})`)
  const token = (await res.json()).token as string
  samedayToken = { value: token, at: Date.now() }
  return token
}

export const sameday: SamedayProvider = {
  isConfigured: () => Boolean(SAMEDAY_USER && SAMEDAY_PASSWORD),
  async createAwb(order) {
    const token = await samedayAuth()
    const res = await fetch(`${SAMEDAY_BASE}/api/awb`, {
      method: 'POST',
      headers: { 'X-Auth-Token': token, 'content-type': 'application/json' },
      body: JSON.stringify({ awbReference: order.id, awbPayment: 1, cashOnDelivery: 0 }),
    })
    if (!res.ok) throw new Error(`Sameday AWB failed (${res.status})`)
    const data = await res.json()
    return { awb: data.awbNumber ?? data.awb_number ?? order.id }
  },
}

// ── Order-confirmation email (Resend + React Email) ─────────────────────────--
export const email: EmailProvider = {
  isConfigured: () => Boolean(RESEND_API_KEY),
  async sendConfirmation(order) {
    const copy = ro.orderConfirmation
    const { html, text } = await renderOrderConfirmationEmail({
      heading: copy.heading,
      greeting: copy.greeting,
      intro: copy.intro,
      orderLabel: copy.orderLabel,
      orderNumber: order.displayId,
      itemsLabel: copy.itemsLabel,
      items: order.items.map((i) => ({ title: i.title, quantity: i.quantity, price: '' })),
      totalLabel: copy.totalLabel,
      total: formatRon(order.total),
      footer: copy.footer,
      brand: copy.brand,
      accentColor: '#4F46E5',
    })
    const resend = new Resend(RESEND_API_KEY)
    const { error } = await resend.emails.send({
      from: EMAIL_FROM,
      to: order.email,
      subject: copy.subject(order.displayId),
      html,
      text,
    })
    if (error) throw new Error(`Resend confirmation failed: ${JSON.stringify(error)}`)
  },
}

export interface Providers {
  oblio: OblioProvider
  anaf: AnafProvider
  sameday: SamedayProvider
  email: EmailProvider
}

export const defaultProviders: Providers = { oblio, anaf, sameday, email }
