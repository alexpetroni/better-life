#!/usr/bin/env tsx
// Single seed entry point. Idempotent (upsert on slug), environment-aware
// (demo vs minimal), phase-aware (no products — those enter with Medusa in
// Phase 2). Dependency order: pillars → quizzes → link → articles.
import 'dotenv/config'
import { getClient, upsertBySlug, ensureAdminUser } from './lib/payload-client'
import { getSeedEnv } from './lib/env'
import { pillars } from './data/pillars'
import { somniumSleepQuiz } from './data/quizzes/somnium-sleep'
import { betterBodyMovementQuiz } from './data/quizzes/better-body-movement'
import { articles } from './data/articles'

const quizzes = [somniumSleepQuiz, betterBodyMovementQuiz]

async function main() {
  const env = getSeedEnv()
  console.log(`▶ Seeding (env: ${env})`)
  const payload = await getClient()

  // ── 1. Pillars (always — prod minimal at least populates pillar config) ─────
  const pillarIdBySlug = new Map<string, string | number>()
  for (const p of pillars) {
    const { id, created } = await upsertBySlug(payload, 'pillars', p.slug, {
      name: p.name,
      tagline: p.tagline,
      icon: p.icon,
      accentColor: p.accentColor,
      order: p.order,
      status: p.status,
      hasShop: p.hasShop,
      hasQuiz: p.hasQuiz,
      hero: p.hero,
    })
    pillarIdBySlug.set(p.slug, id)
    console.log(`  ${created ? '＋' : '↻'} pillar: ${p.slug} (${p.status})`)
  }

  // The demo content (articles, quiz definitions) is skipped in minimal/prod seeds.
  if (env === 'demo') {
    // ── 2. Quizzes + 3. link each pillar → its quiz (resolves the circular ref) ─
    for (const q of quizzes) {
      const { id: quizId, created: quizCreated } = await upsertBySlug(payload, 'quizzes', q.slug, {
        title: q.title,
        hook: q.hook,
        pillar: pillarIdBySlug.get(q.pillarSlug),
        disclaimer: q.disclaimer,
        resultDisclaimer: q.resultDisclaimer,
        questions: q.questions,
        profiles: q.profiles,
      })
      console.log(`  ${quizCreated ? '＋' : '↻'} quiz: ${q.slug}`)

      const pillarId = pillarIdBySlug.get(q.pillarSlug)
      if (pillarId) {
        await payload.update({ collection: 'pillars', id: pillarId, data: { quiz: quizId }, overrideAccess: true })
      }
    }

    // ── 4. Articles ─────────────────────────────────────────────────────────--
    for (const a of articles) {
      const pillarId = pillarIdBySlug.get(a.pillarSlug)
      if (!pillarId) {
        console.warn(`  ! article "${a.slug}" references unknown pillar "${a.pillarSlug}" — skipped`)
        continue
      }
      const { created } = await upsertBySlug(payload, 'articles', a.slug, {
        title: a.title,
        excerpt: a.excerpt,
        pillar: pillarId,
        author: a.author,
        status: 'published',
        publishedAt: a.publishedAt,
        profileTags: a.profileTags,
        heroImageUrl: a.heroImageUrl,
        body: a.body,
        seo: a.seo,
      })
      console.log(`  ${created ? '＋' : '↻'} article: ${a.slug} → ${a.pillarSlug}`)
    }

    // ── Demo admin user (dev convenience) ──────────────────────────────────────
    const { created: adminCreated } = await ensureAdminUser(
      payload,
      process.env.SEED_ADMIN_EMAIL || 'admin@betterlife.ro',
      process.env.SEED_ADMIN_PASSWORD || 'changeme123'
    )
    if (adminCreated) {
      console.log('  ＋ admin user: admin@betterlife.ro (password: changeme123 — dev only)')
    }
  }

  console.log('✔ Seed complete')
  process.exit(0)
}

main().catch((err) => {
  console.error('✖ Seed failed:', err)
  process.exit(1)
})
