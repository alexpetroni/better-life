// Pillar config — the spine. Names, taglines, colors, order, and status are all
// data here. Two pillars are live (Somnium + Better Body) so the cross-pillar
// feed is real; two are coming_soon to prove status-gating end to end (they
// exist in config but stay absent from public surfaces until flipped to live).

export interface SeedPillar {
  slug: string
  name: string
  tagline: string
  icon: string
  accentColor: string
  order: number
  status: 'live' | 'coming_soon' | 'hidden'
  hasShop: boolean
  hasQuiz: boolean
  /** Linked after quizzes are seeded. */
  quizSlug?: string
  hero?: {
    heading: string
    subheading: string
    ctaLabel?: string
    ctaHref?: string
  }
}

export const pillars: SeedPillar[] = [
  {
    slug: 'somnium',
    name: 'Somnium',
    tagline: 'Știința somnului, pe înțelesul tău.',
    icon: 'moon',
    accentColor: '#4F46E5',
    order: 1,
    status: 'live',
    hasShop: true, // shop arrives in Phase 2; the flag is set now
    hasQuiz: true,
    quizSlug: 'somnium-sleep',
    hero: {
      heading: 'Înțelege-ți somnul. Apoi schimbă-l.',
      subheading:
        'Conținut bazat pe dovezi, un test de screening care îți arată tiparul tău de somn și recomandări pe care le poți aplica diseară.',
      ctaLabel: 'Începe testul de somn',
      ctaHref: '/screening',
    },
  },
  {
    slug: 'better-body',
    name: 'Better Body',
    tagline: 'Mișcare, recuperare, energie.',
    icon: 'activity',
    accentColor: '#16A34A',
    order: 2,
    status: 'live',
    hasShop: false,
    hasQuiz: true,
    quizSlug: 'better-body-movement',
    hero: {
      heading: 'Un corp care te susține.',
      subheading: 'Mișcare sustenabilă, recuperare reală și energie care durează toată ziua.',
    },
  },
  {
    slug: 'better-mind',
    name: 'Better Mind',
    tagline: 'Claritate, calm, concentrare.',
    icon: 'brain',
    accentColor: '#0D9488',
    order: 3,
    status: 'coming_soon',
    hasShop: false,
    hasQuiz: false,
  },
  {
    slug: 'better-action',
    name: 'Better Action',
    tagline: 'Obiceiuri care rămân.',
    icon: 'target',
    accentColor: '#D97706',
    order: 4,
    status: 'coming_soon',
    hasShop: false,
    hasQuiz: false,
  },
]
