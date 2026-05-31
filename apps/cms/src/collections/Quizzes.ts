import type { CollectionConfig } from 'payload'

/**
 * Quiz DEFINITIONS as authorable content: questions, options, and profile copy.
 * The matching logic (answers → profile) lives in code, keyed by `slug`
 * (apps/web/src/lib/server/quiz/matchers/<slug>.ts) — a data-driven scoring
 * engine would be exactly the generic machinery CLAUDE.md principle #1 forbids.
 */
export const Quizzes: CollectionConfig = {
  slug: 'quizzes',
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'slug', 'pillar'] },
  access: { read: () => true },
  fields: [
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'title', type: 'text', required: true, localized: true },
    { name: 'hook', type: 'textarea', localized: true },
    { name: 'pillar', type: 'relationship', relationTo: 'pillars', required: true },
    {
      name: 'disclaimer',
      type: 'textarea',
      localized: true,
      admin: { description: 'Wellness disclaimer shown before the quiz.' },
    },
    {
      name: 'resultDisclaimer',
      type: 'textarea',
      localized: true,
      admin: { description: 'Disclaimer shown alongside results.' },
    },
    {
      name: 'questions',
      type: 'array',
      labels: { singular: 'Question', plural: 'Questions' },
      fields: [
        { name: 'key', type: 'text', required: true },
        { name: 'text', type: 'text', required: true, localized: true },
        { name: 'helpText', type: 'text', localized: true },
        {
          name: 'type',
          type: 'select',
          required: true,
          defaultValue: 'single-select',
          options: [
            { label: 'Single select', value: 'single-select' },
            { label: 'Multi select', value: 'multi-select' },
            { label: 'Scale', value: 'scale' },
          ],
        },
        {
          name: 'displayVariant',
          type: 'select',
          options: [
            { label: 'Card', value: 'card' },
            { label: 'List', value: 'list' },
          ],
        },
        { name: 'columns', type: 'number' },
        {
          name: 'options',
          type: 'array',
          fields: [
            { name: 'value', type: 'text', required: true },
            { name: 'label', type: 'text', required: true, localized: true },
          ],
        },
      ],
    },
    {
      name: 'profiles',
      type: 'array',
      labels: { singular: 'Profile', plural: 'Profiles' },
      fields: [
        { name: 'key', type: 'text', required: true },
        { name: 'title', type: 'text', required: true, localized: true },
        { name: 'description', type: 'textarea', required: true, localized: true },
        { name: 'tip', type: 'textarea', localized: true },
        {
          name: 'recommendations',
          type: 'array',
          fields: [
            { name: 'title', type: 'text', required: true, localized: true },
            { name: 'body', type: 'textarea', required: true, localized: true },
          ],
        },
        { name: 'ctaLabel', type: 'text', localized: true },
        { name: 'ctaHref', type: 'text' },
      ],
    },
  ],
}
