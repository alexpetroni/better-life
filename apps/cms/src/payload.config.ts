import path from 'path'
import { fileURLToPath } from 'url'
import { config as loadEnv } from 'dotenv'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'

import { Users } from './collections/Users'
import { Pillars } from './collections/Pillars'
import { Articles } from './collections/Articles'
import { Quizzes } from './collections/Quizzes'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

// Single source of truth for env: the repo-root .env. Loaded here so both the
// Next/Payload runtime and the headless seed runner (getPayload) see the same DB.
loadEnv({ path: path.resolve(dirname, '../../../.env') })

const connectionString = process.env.DIRECT_URL // session/direct — never the tx pooler

export default buildConfig({
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: '· Better Life CMS',
    },
  },
  collections: [Users, Pillars, Articles, Quizzes],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || 'dev-secret-change-me',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  // Romanian first; English added later with no retrofit.
  localization: {
    locales: [
      { label: 'Română', code: 'ro' },
      { label: 'English', code: 'en' },
    ],
    defaultLocale: 'ro',
    fallback: true,
  },
  db: postgresAdapter({
    pool: { connectionString },
    schemaName: 'payload', // isolated schema in the shared Postgres
  }),
  // The SvelteKit BFF is the only caller; these allow the local dev origin.
  cors: ['http://localhost:5173'],
  csrf: ['http://localhost:5173'],
})
