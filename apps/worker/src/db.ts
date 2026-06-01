import pg from 'pg'
import { DATABASE_URL } from './env'

let pool: pg.Pool | null = null
function getPool(): pg.Pool {
  if (!pool) pool = new pg.Pool({ connectionString: DATABASE_URL, max: 4 })
  return pool
}

export async function query<T = Record<string, unknown>>(text: string, params: unknown[] = []): Promise<T[]> {
  const res = await getPool().query(text, params)
  return res.rows as T[]
}

export interface OrderEffectsRow {
  order_id: string
  pillar: string | null
  oblio_invoice_id: string | null
  anaf_status: string | null
  sameday_awb: string | null
  confirmation_email_sent_at: string | null
}

/** Ensure the idempotency row exists; returns the current state. */
export async function ensureEffectsRow(orderId: string, pillar: string): Promise<OrderEffectsRow> {
  const rows = await query<OrderEffectsRow>(
    `insert into app.order_effects (order_id, pillar) values ($1, $2)
     on conflict (order_id) do update set pillar = coalesce(app.order_effects.pillar, $2)
     returning *`,
    [orderId, pillar]
  )
  return rows[0]
}

export async function getEffectsRow(orderId: string): Promise<OrderEffectsRow | null> {
  return (await query<OrderEffectsRow>('select * from app.order_effects where order_id = $1', [orderId]))[0] ?? null
}

export async function setEffect(orderId: string, patch: Record<string, unknown>): Promise<void> {
  const keys = Object.keys(patch)
  if (!keys.length) return
  const sets = keys.map((k, i) => `${k} = $${i + 2}`).join(', ')
  await query(`update app.order_effects set ${sets} where order_id = $1`, [orderId, ...keys.map((k) => patch[k])])
}
