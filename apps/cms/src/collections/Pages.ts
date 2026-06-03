import type { CollectionConfig } from 'payload'

/**
 * Free-form narrative pages (About, mission, philosophy, …) — CMS-authored so the
 * beneficiary edits the Better Life story without a deploy. Rendered by the BFF at
 * /<slug>. Same editorial gate as articles: public sees only published.
 */
export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'status'],
  },
  access: {
    read: ({ req }) => {
      if (req.user) return true
      return { status: { equals: 'published' } }
    },
  },
  fields: [
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: { description: 'URL path: /<slug> (e.g. "about", "mission", "philosophy").' },
    },
    { name: 'title', type: 'text', required: true, localized: true },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'Published', value: 'published' },
      ],
    },
    { name: 'body', type: 'richText', localized: true },
    {
      name: 'seo',
      type: 'group',
      fields: [
        { name: 'metaTitle', type: 'text', localized: true },
        { name: 'metaDescription', type: 'textarea', localized: true },
      ],
    },
  ],
}
