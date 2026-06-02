import type { CollectionConfig } from 'payload'

/**
 * Product reviews with a moderation workflow. Only verified buyers can submit
 * (enforced by the BFF before it writes here), and every review is `pending`
 * until an editor approves it. Public read returns approved reviews only.
 */
export const Reviews: CollectionConfig = {
  slug: 'reviews',
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['productHandle', 'rating', 'status', 'authorName', 'createdAt'],
  },
  access: {
    read: ({ req }) => {
      if (req.user) return true
      return { status: { equals: 'approved' } }
    },
  },
  fields: [
    { name: 'productHandle', type: 'text', required: true, index: true },
    { name: 'rating', type: 'number', required: true, min: 1, max: 5 },
    { name: 'title', type: 'text' },
    { name: 'body', type: 'textarea', required: true },
    { name: 'authorName', type: 'text' },
    {
      name: 'email',
      type: 'text',
      admin: { description: 'Buyer email (verified-purchase match); not shown publicly.' },
    },
    { name: 'pillar', type: 'text', defaultValue: 'somnium' },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      options: [
        { label: 'Pending', value: 'pending' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
      ],
    },
  ],
}
