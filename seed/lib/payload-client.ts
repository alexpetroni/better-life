import { getPayload, type Payload } from 'payload'
// Reuse the CMS's own config so the seed writes through the same schema + models.
import config from '../../apps/cms/src/payload.config'

let client: Payload | null = null

export async function getClient(): Promise<Payload> {
  if (client) return client
  client = await getPayload({ config })
  return client
}

type Collection = 'pillars' | 'articles' | 'quizzes'

/**
 * Idempotent upsert keyed on the stable `slug`. Safe to re-run: existing docs
 * are updated, new ones created. Returns the doc id and whether it was created.
 */
export async function upsertBySlug(
  payload: Payload,
  collection: Collection,
  slug: string,
  data: Record<string, unknown>,
  locale: 'ro' | 'en' = 'ro'
): Promise<{ id: string | number; created: boolean }> {
  const existing = await payload.find({
    collection,
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
    locale,
    overrideAccess: true,
  })

  if (existing.docs.length > 0) {
    const id = existing.docs[0].id
    await payload.update({ collection, id, data: { ...data, slug }, locale, overrideAccess: true })
    return { id, created: false }
  }

  const doc = await payload.create({
    collection,
    data: { ...data, slug },
    locale,
    overrideAccess: true,
  })
  return { id: doc.id, created: true }
}

/** Ensure the first admin user exists (so the admin panel is usable out of the box in dev). */
export async function ensureAdminUser(payload: Payload, email: string, password: string) {
  const existing = await payload.find({
    collection: 'users',
    where: { email: { equals: email } },
    limit: 1,
    overrideAccess: true,
  })
  if (existing.docs.length > 0) return { created: false }
  await payload.create({
    collection: 'users',
    data: { email, password, name: 'Demo Admin', role: 'admin' },
    overrideAccess: true,
  })
  return { created: true }
}
