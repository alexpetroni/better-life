import type { CollectionConfig } from 'payload'

/**
 * Blog articles, tagged by pillar. Editorial workflow via the `status` field:
 * draft → in_review → published. Only published articles are public; the BFF
 * (and public REST reads) see only those.
 */
export const Articles: CollectionConfig = {
  slug: 'articles',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'pillar', 'status', 'publishedAt'],
  },
  access: {
    // Editors (authenticated) see everything; the public sees only published.
    read: ({ req }) => {
      if (req.user) return true
      return { status: { equals: 'published' } }
    },
  },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    { name: 'excerpt', type: 'textarea', localized: true },
    { name: 'pillar', type: 'relationship', relationTo: 'pillars', required: true },
    { name: 'heroImageUrl', type: 'text', admin: { description: 'Hero image URL.' } },
    { name: 'author', type: 'text' },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'draft',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'In review', value: 'in_review' },
        { label: 'Published', value: 'published' },
      ],
    },
    { name: 'publishedAt', type: 'date' },
    {
      name: 'profileTags',
      type: 'text',
      hasMany: true,
      admin: { description: 'Tags for profile-matched recommendations (e.g. "hyperarousal").' },
    },
    { name: 'body', type: 'richText', localized: true },
    {
      name: 'seo',
      type: 'group',
      fields: [
        { name: 'metaTitle', type: 'text', localized: true },
        { name: 'metaDescription', type: 'textarea', localized: true },
        { name: 'ogImageUrl', type: 'text' },
      ],
    },
  ],
}
