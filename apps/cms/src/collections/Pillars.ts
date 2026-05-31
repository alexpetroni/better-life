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
  ],
}
