import type { GlobalConfig } from 'payload'

/**
 * Editor-curated homepage feed (Phase 4). Lets the beneficiary recompose the
 * portal homepage — swap the featured article(s), change the featured product,
 * point the quiz invitation at a pillar — without a deploy. Every slot is
 * optional; the BFF falls back to the rule-based default when a slot is empty
 * (latest from live pillars / first live pillar with a quiz).
 */
export const Homepage: GlobalConfig = {
  slug: 'homepage',
  access: {
    read: () => true, // public read; the BFF is the only caller
  },
  admin: {
    description: 'Recompose the homepage feed. Empty slots fall back to sensible defaults.',
  },
  fields: [
    {
      name: 'featuredArticles',
      type: 'relationship',
      relationTo: 'articles',
      hasMany: true,
      admin: { description: 'Curated, in order. Empty → latest published from live pillars.' },
    },
    {
      name: 'featuredProductHandle',
      type: 'text',
      admin: { description: 'A Somnium product handle to feature, e.g. "somneo-supliment". Empty → no product slot.' },
    },
    {
      name: 'quizInvitationPillar',
      type: 'relationship',
      relationTo: 'pillars',
      hasMany: false,
      admin: { description: 'Pillar whose quiz the invitation points to. Empty → first live pillar with a quiz.' },
    },
  ],
}
