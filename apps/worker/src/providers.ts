import { OBLIO_EMAIL, OBLIO_SECRET, OBLIO_CIF, SAMEDAY_USER, SAMEDAY_PASSWORD, RESEND_API_KEY } from './env'

// Provider interfaces. Real API calls land in P2-5; these check configuration so
// the effects degrade gracefully (warn + skip) when credentials are absent.
// Effects accept providers by injection so tests (P2-7) can supply mocks that
// return references and exercise idempotency.

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

export const oblio: OblioProvider = {
  isConfigured: () => Boolean(OBLIO_EMAIL && OBLIO_SECRET && OBLIO_CIF),
  async createInvoice() {
    throw new Error('oblio.createInvoice not implemented yet (P2-5)')
  },
}

// ANAF SPV transmission goes through Oblio, so it shares Oblio's credentials but
// is a SEPARATE step (an ANAF outage must not block invoice generation).
export const anaf: AnafProvider = {
  isConfigured: () => oblio.isConfigured(),
  async transmit() {
    throw new Error('anaf.transmit not implemented yet (P2-5)')
  },
}

export const sameday: SamedayProvider = {
  isConfigured: () => Boolean(SAMEDAY_USER && SAMEDAY_PASSWORD),
  async createAwb() {
    throw new Error('sameday.createAwb not implemented yet (P2-5)')
  },
}

export const email: EmailProvider = {
  isConfigured: () => Boolean(RESEND_API_KEY),
  async sendConfirmation() {
    throw new Error('email.sendConfirmation not implemented yet (P2-5)')
  },
}

export interface Providers {
  oblio: OblioProvider
  anaf: AnafProvider
  sameday: SamedayProvider
  email: EmailProvider
}

export const defaultProviders: Providers = { oblio, anaf, sameday, email }
