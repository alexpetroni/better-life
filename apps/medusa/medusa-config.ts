import { loadEnv, defineConfig } from '@medusajs/framework/utils'
import { config as loadRootEnv } from 'dotenv'
import path from 'path'

// Single source of truth: the repo-root .env (shared with web, cms, seed, migrate).
loadRootEnv({ path: path.resolve(process.cwd(), '../../.env') })
loadEnv(process.env.NODE_ENV || 'development', process.cwd())

// Graceful degradation: register a payment provider only when its key is present.
const paymentProviders: { resolve: string; id: string; options?: Record<string, unknown> }[] = []
if (process.env.STRIPE_API_KEY) {
  paymentProviders.push({
    resolve: '@medusajs/payment-stripe',
    id: 'stripe',
    options: {
      apiKey: process.env.STRIPE_API_KEY,
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    },
  })
}

const modules: Record<string, unknown>[] = []
if (paymentProviders.length > 0) {
  modules.push({
    resolve: '@medusajs/medusa/payment',
    options: { providers: paymentProviders },
  })
}

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.MEDUSA_DATABASE_URL || process.env.DIRECT_URL,
    // Isolate all Medusa tables in the dedicated `medusa` schema (created by
    // supabase/migrations/0002). Keeps commerce separate from `app` and `payload`.
    databaseSchema: process.env.MEDUSA_DATABASE_SCHEMA || 'medusa',
    redisUrl: process.env.REDIS_URL,
    http: {
      storeCors: process.env.STORE_CORS || 'http://localhost:5173',
      adminCors: process.env.ADMIN_CORS || 'http://localhost:9000',
      authCors: process.env.AUTH_CORS || 'http://localhost:5173',
      jwtSecret: process.env.JWT_SECRET || 'supersecret',
      cookieSecret: process.env.COOKIE_SECRET || 'supersecret',
    },
  },
  modules,
})
