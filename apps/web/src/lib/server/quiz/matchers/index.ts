import type { ProfileMatcher } from '@better-life/contracts'
import { matchSomniumSleep } from './somnium-sleep'

// Registry: quiz slug → code matcher. New quizzes register their matcher here.
const matchers: Record<string, ProfileMatcher> = {
  'somnium-sleep': matchSomniumSleep,
}

export function getMatcher(slug: string): ProfileMatcher | null {
  return matchers[slug] ?? null
}
