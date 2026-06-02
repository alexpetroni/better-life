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
// Custom Netopia provider — registered only when configured (graceful: absent →
// method simply not offered; the manual/system provider remains the fallback).
if (process.env.NETOPIA_SIGNATURE) {
  paymentProviders.push({
    resolve: './src/modules/netopia',
    id: 'netopia',
    options: {
      signature: process.env.NETOPIA_SIGNATURE,
      posSignature: process.env.NETOPIA_PUBLIC_KEY,
      sandbox: process.env.NETOPIA_SANDBOX !== 'false',
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
    // Medusa owns the `public` schema (app + payload remain isolated in theirs).
    // Medusa v2 does not reliably support a non-public schema: its provider/link
    // sync targets public regardless of search_path or databaseSchema. Flagged
    // deviation from CLAUDE.md; see .env.example and PHASE-2-PLAN.md.
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
