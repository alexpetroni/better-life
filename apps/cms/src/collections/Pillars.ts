import type { CollectionConfig } from 'payload'

/**
 * The spine of the system. Nav and pillar landing pages derive from this
 * collection; `status` governs what surfaces publicly. Pillar count, names,
 * order, colors, and status are all data here — never hardcoded.
 */
export const Pillars: CollectionConfig = {
  slug: 'pillars',
  admin: {
    useAsTitle: 'name',
    defaultColumns: ['name', 'slug', 'status', 'order', 'hasShop', 'hasQuiz'],
  },
  access: {
    read: () => true, // public read; the BFF filters by status for public surfaces
  },
  fields: [
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: { description: 'Stable handle, e.g. "somnium". Used as the seed idempotency key.' },
    },
    { name: 'name', type: 'text', required: true, localized: true },
    { name: 'tagline', type: 'text', localized: true },
    { name: 'icon', type: 'text', admin: { description: 'Icon name (lucide).' } },
    { name: 'accentColor', type: 'text', admin: { description: 'Hex, e.g. #4F46E5' } },
    { name: 'order', type: 'number', required: true, defaultValue: 0 },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'hidden',
      options: [
        { label: 'Live', value: 'live' },
        { label: 'Coming soon', value: 'coming_soon' },
        { label: 'Hidden', value: 'hidden' },
      ],
      admin: { description: 'Only "live" pillars surface in nav, landing, and the feed.' },
    },
    { name: 'hasShop', type: 'checkbox', defaultValue: false },
    { name: 'hasQuiz', type: 'checkbox', defaultValue: false },
    {
      name: 'quiz',
      type: 'relationship',
      relationTo: 'quizzes',
      hasMany: false,
      admin: { description: 'The screening quiz this pillar surfaces, if any.' },
    },
    {
      name: 'hero',
      type: 'group',
      fields: [
        { name: 'heading', type: 'text', localized: true },
        { name: 'subheading', type: 'textarea', localized: true },
        { name: 'ctaLabel', type: 'text', localized: true },
        { name: 'ctaHref', type: 'text' },
      ],
    },
    {
      // Composable landing (Phase 4). A small, fixed block set — the landing
      // page renders `hero` then these in order. New types are added deliberately.
      name: 'landingBlocks',
      type: 'blocks',
      labels: { singular: 'Landing block', plural: 'Landing blocks' },
      admin: { description: 'Compose the pillar landing page below the hero.' },
      blocks: [
        {
          slug: 'richText',
          labels: { singular: 'Rich text', plural: 'Rich text' },
          fields: [{ name: 'content', type: 'richText', localized: true }],
        },
        {
          slug: 'articleList',
          labels: { singular: 'Article list', plural: 'Article lists' },
          fields: [
            { name: 'heading', type: 'text', localized: true },
            {
              name: 'source',
              type: 'select',
              required: true,
              defaultValue: 'pillar',
              options: [
                { label: 'This pillar', value: 'pillar' },
                { label: 'By profile tag', value: 'tag' },
              ],
            },
            { name: 'tag', type: 'text', admin: { description: 'profileTag, used when source = "By profile tag".' } },
            { name: 'limit', type: 'number', required: true, defaultValue: 3 },
          ],
        },
        {
          slug: 'quizCta',
          labels: { singular: 'Quiz CTA', plural: 'Quiz CTAs' },
          fields: [
            { name: 'heading', type: 'text', localized: true },
            { name: 'body', type: 'textarea', localized: true },
            { name: 'ctaLabel', type: 'text', localized: true },
          ],
        },
        {
          slug: 'stat',
          labels: { singular: 'Stat', plural: 'Stats' },
          fields: [
            { name: 'value', type: 'text', required: true },
            { name: 'label', type: 'text', localized: true },
          ],
        },
        {
          slug: 'quote',
          labels: { singular: 'Quote', plural: 'Quotes' },
          fields: [
            { name: 'text', type: 'textarea', required: true, localized: true },
            { name: 'attribution', type: 'text' },
          ],
        },
      ],
    },
  ],
}
