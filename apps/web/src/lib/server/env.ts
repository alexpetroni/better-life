import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { config as loadEnv } from 'dotenv'

// Single source of truth for env: the repo-root .env (shared with CMS, seed,
// migrations). Loaded once here for dev convenience. In production, real env
// vars are already set and dotenv does not override them.
//
// Every external integration degrades gracefully when its credentials are
// absent (CLAUDE.md): a missing key warns and disables only that capability.
loadEnv({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../../../.env') })

export const DATABASE_URL = process.env.DATABASE_URL ?? ''
export const PAYLOAD_URL = process.env.PAYLOAD_PUBLIC_SERVER_URL ?? 'http://localhost:3001'
export const RESEND_API_KEY = process.env.RESEND_API_KEY ?? ''
export const EMAIL_FROM = process.env.EMAIL_FROM ?? 'Better Life <hello@betterlife.ro>'
export const SITE_URL = process.env.PUBLIC_SITE_URL ?? 'http://localhost:5173'
export const DEFAULT_BRAND = process.env.PUBLIC_DEFAULT_BRAND ?? 'betterlife'

// Commerce (Phase 2). Absent publishable key → storefront degrades (no shop).
export const MEDUSA_URL = process.env.MEDUSA_BACKEND_URL ?? 'http://localhost:9000'
export const MEDUSA_PUBLISHABLE_KEY = process.env.MEDUSA_PUBLISHABLE_KEY ?? ''
export const MEDUSA_ADMIN_EMAIL = process.env.MEDUSA_ADMIN_EMAIL ?? ''
export const MEDUSA_ADMIN_PASSWORD = process.env.MEDUSA_ADMIN_PASSWORD ?? ''
export const WORKER_URL = process.env.WORKER_URL ?? 'http://localhost:3002'
