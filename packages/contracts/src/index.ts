// Shared, framework-agnostic contracts used by the SvelteKit BFF, the Payload
// CMS, and the seed runner. The single `pillar` dimension cuts across all of them.

// ── Pillars ────────────────────────────────────────────────────────────────--
export type PillarStatus = 'live' | 'coming_soon' | 'hidden';

export interface PillarHero {
  heading?: string;
  subheading?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export interface Pillar {
  slug: string;
  name: string;
  tagline?: string;
  icon?: string;
  accentColor?: string;
  order: number;
  status: PillarStatus;
  hasShop: boolean;
  hasQuiz: boolean;
  /** Slug of the quiz this pillar surfaces, if any. */
  quizSlug?: string | null;
  hero?: PillarHero;
}

/** A pillar surfaces publicly (nav, landing, feed) only when live. */
export function isPublic(pillar: Pick<Pillar, 'status'>): boolean {
  return pillar.status === 'live';
}

// ── Articles ───────────────────────────────────────────────────────────────--
export interface ArticleSeo {
  metaTitle?: string;
  metaDescription?: string;
  ogImageUrl?: string;
}

export interface Article {
  slug: string;
  title: string;
  excerpt?: string;
  /** Rendered HTML body (Payload rich text → HTML in the BFF). */
  bodyHtml?: string;
  pillarSlug: string;
  heroImageUrl?: string;
  author?: string;
  publishedAt?: string;
  /** Tags used later for profile-matched recommendations. */
  profileTags?: string[];
  seo?: ArticleSeo;
}

// ── Quiz definitions (content authored in Payload; matching logic in code) ────
export type QuizQuestionType = 'single-select' | 'multi-select' | 'scale';

export interface QuizOption {
  value: string;
  label: string;
}

export interface QuizQuestion {
  key: string;
  text: string;
  helpText?: string;
  type: QuizQuestionType;
  displayVariant?: 'card' | 'list';
  columns?: number;
  options: QuizOption[];
}

export interface QuizRecommendation {
  title: string;
  body: string;
}

export interface QuizProfile {
  key: string;
  title: string;
  description: string;
  tip: string;
  recommendations: QuizRecommendation[];
  ctaLabel?: string;
  ctaHref?: string;
}

export interface QuizDefinition {
  slug: string;
  pillarSlug: string;
  title: string;
  hook?: string;
  /** Wellness disclaimer shown before the quiz. */
  disclaimer?: string;
  /** Disclaimer shown alongside results. */
  resultDisclaimer?: string;
  questions: QuizQuestion[];
  profiles: QuizProfile[];
}

/** Pure, deterministic mapping from answers to a profile key. Lives in code. */
export type ProfileMatcher = (answers: Record<string, string | string[]>) => string;

// ── Identity & consent ───────────────────────────────────────────────────────
export type ConsentPurpose = 'results_delivery' | 'marketing';

export interface ConsentInput {
  purpose: ConsentPurpose;
  granted: boolean;
  consentText: string;
  consentVersion: string;
  locale: string;
}

export interface Lead {
  id: string;
  email: string | null;
  claimToken: string;
  behavioralTags: string[];
  firstTouchUtm: Record<string, string> | null;
  medusaCustomerId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Utm {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
}
