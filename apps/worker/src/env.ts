import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { config as loadEnv } from 'dotenv'

// Shared repo-root .env (same as web/cms/medusa).
loadEnv({ path: path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../.env') })

export const DATABASE_URL = process.env.DATABASE_URL ?? ''
export const MEDUSA_URL = process.env.MEDUSA_BACKEND_URL ?? 'http://localhost:9000'
export const MEDUSA_ADMIN_EMAIL = process.env.MEDUSA_ADMIN_EMAIL ?? ''
export const MEDUSA_ADMIN_PASSWORD = process.env.MEDUSA_ADMIN_PASSWORD ?? ''

export const OBLIO_EMAIL = process.env.OBLIO_EMAIL ?? ''
export const OBLIO_SECRET = process.env.OBLIO_SECRET ?? ''
export const OBLIO_CIF = process.env.OBLIO_CIF ?? ''
export const SAMEDAY_USER = process.env.SAMEDAY_USER ?? ''
export const SAMEDAY_PASSWORD = process.env.SAMEDAY_PASSWORD ?? ''
export const RESEND_API_KEY = process.env.RESEND_API_KEY ?? ''
export const EMAIL_FROM = process.env.EMAIL_FROM ?? 'Somnium <hello@betterlife.ro>'
export const PORT_WORKER = Number(process.env.PORT_WORKER ?? 3002)
// Public site URL — used to build CTA + one-click unsubscribe links in marketing email.
export const SITE_URL = process.env.PUBLIC_SITE_URL ?? 'http://localhost:5173'
