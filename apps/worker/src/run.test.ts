import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { runOrderEffects } from './run'
import type { OrderInfo, Providers } from './providers'
import { query } from './db'

const orderId = 'order_test_effects'
const order: OrderInfo = {
  id: orderId,
  displayId: 9001,
  email: 'tester@idemp.test',
  total: 79,
  currency: 'ron',
  items: [{ title: 'Supliment Somneo', quantity: 1 }],
}

function mockProviders(configured: boolean) {
  const createInvoice = vi.fn(async () => ({ id: 'inv_TEST_1' }))
  const transmit = vi.fn(async () => ({ status: 'sent' }))
  const createAwb = vi.fn(async () => ({ awb: 'AWB_TEST_1' }))
  const sendConfirmation = vi.fn(async () => {})
  const providers: Providers = {
    oblio: { isConfigured: () => configured, createInvoice },
    anaf: { isConfigured: () => configured, transmit },
    sameday: { isConfigured: () => configured, createAwb },
    email: { isConfigured: () => configured, sendConfirmation },
  }
  return { providers, spies: { createInvoice, transmit, createAwb, sendConfirmation } }
}

beforeEach(async () => {
  await query("delete from app.order_effects where order_id like 'order_test%'")
})
afterAll(async () => {
  await query("delete from app.order_effects where order_id like 'order_test%'")
})

describe('order effects', () => {
  it('runs every effect once when providers are configured', async () => {
    const { providers, spies } = mockProviders(true)
    const results = await runOrderEffects({ orderId, pillar: 'somnium', order }, providers)
    expect(results.map((r) => r.status)).toEqual(['done', 'done', 'done', 'done'])
    expect(spies.createInvoice).toHaveBeenCalledTimes(1)
    expect(spies.createAwb).toHaveBeenCalledTimes(1)
    expect(spies.transmit).toHaveBeenCalledTimes(1)
    expect(spies.sendConfirmation).toHaveBeenCalledTimes(1)
  })

  it('is idempotent: a retried order produces NO duplicate invoice or AWB', async () => {
    const { providers, spies } = mockProviders(true)
    await runOrderEffects({ orderId, pillar: 'somnium', order }, providers) // first delivery
    const retry = await runOrderEffects({ orderId, pillar: 'somnium', order }, providers) // Inngest retry

    expect(retry.every((r) => r.status === 'skipped' && r.reason === 'already_done')).toBe(true)
    // The external side effects ran exactly once across both invocations.
    expect(spies.createInvoice).toHaveBeenCalledTimes(1)
    expect(spies.createAwb).toHaveBeenCalledTimes(1)
    expect(spies.transmit).toHaveBeenCalledTimes(1)

    const row = (await query<{ oblio_invoice_id: string; sameday_awb: string }>(
      'select oblio_invoice_id, sameday_awb from app.order_effects where order_id = $1',
      [orderId]
    ))[0]
    expect(row.oblio_invoice_id).toBe('inv_TEST_1')
    expect(row.sameday_awb).toBe('AWB_TEST_1')
  })

  it('degrades gracefully when credentials are missing (skip, never crash)', async () => {
    const { providers, spies } = mockProviders(false)
    const results = await runOrderEffects({ orderId, pillar: 'somnium', order }, providers)

    expect(results.find((r) => r.effect === 'oblio')?.reason).toBe('no_credentials')
    expect(results.find((r) => r.effect === 'sameday')?.reason).toBe('no_credentials')
    expect(results.find((r) => r.effect === 'confirmation_email')?.reason).toBe('no_credentials')
    // ANAF depends on an invoice; with none it skips for that reason.
    expect(results.find((r) => r.effect === 'anaf')?.reason).toBe('no_invoice')
    // No external call was attempted.
    expect(spies.createInvoice).not.toHaveBeenCalled()
    expect(spies.createAwb).not.toHaveBeenCalled()
  })

  it('resumes partial progress: invoice exists, AWB still created on retry', async () => {
    // Simulate a first run where only Oblio succeeded (e.g., ANAF/Sameday were down).
    await query(
      `insert into app.order_effects (order_id, pillar, oblio_invoice_id) values ($1, 'somnium', 'inv_TEST_1')`,
      [orderId]
    )
    const { providers, spies } = mockProviders(true)
    const results = await runOrderEffects({ orderId, pillar: 'somnium', order }, providers)

    expect(results.find((r) => r.effect === 'oblio')?.reason).toBe('already_done')
    expect(spies.createInvoice).not.toHaveBeenCalled() // not recreated
    expect(spies.createAwb).toHaveBeenCalledTimes(1) // AWB created now
  })
})
