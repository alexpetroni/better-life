import express from 'express'
import { serve } from 'inngest/express'
import { inngest, functions } from './inngest'
import { getOrderInfo } from './medusa'
import { runOrderEffects } from './run'
import { PORT_WORKER } from './env'

const app = express()
app.use(express.json())

// Inngest endpoint (production trigger via the order.placed event).
app.use('/api/inngest', serve({ client: inngest, functions }))

app.get('/health', (_req, res) => res.json({ ok: true }))

// Dev/ops trigger: run the order effects directly (no Inngest dev server needed).
// The BFF posts here after checkout in development.
app.post('/run-effects/:orderId', async (req, res) => {
  const order = await getOrderInfo(req.params.orderId)
  if (!order) return res.status(404).json({ error: 'order_not_found' })
  const pillar = (req.query.pillar as string) || 'somnium'
  try {
    const results = await runOrderEffects({ orderId: order.id, pillar, order })
    res.json({ orderId: order.id, results })
  } catch (err) {
    res.status(500).json({ error: (err as Error).message })
  }
})

app.listen(PORT_WORKER, () => console.log(`▶ worker on :${PORT_WORKER} (inngest at /api/inngest)`))
