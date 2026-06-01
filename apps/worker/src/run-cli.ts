// Run order effects for an order from the CLI: `npm run effects -w @better-life/worker -- <orderId>`
import { getOrderInfo } from './medusa'
import { runOrderEffects } from './run'

const orderId = process.argv[2]
if (!orderId) {
  console.error('Usage: tsx src/run-cli.ts <orderId>')
  process.exit(1)
}

const order = await getOrderInfo(orderId)
if (!order) {
  console.error(`Order ${orderId} not found (is Medusa running + admin creds set?)`)
  process.exit(1)
}
const results = await runOrderEffects({ orderId: order.id, pillar: 'somnium', order })
console.log(JSON.stringify(results, null, 2))
process.exit(0)
