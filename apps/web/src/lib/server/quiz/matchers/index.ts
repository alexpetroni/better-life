import type { ProfileMatcher } from '@better-life/contracts'
import { matchSomniumSleep } from './somnium-sleep'
import { matchBetterBodyMovement } from './better-body-movement'

// Registry: quiz slug → code matcher. New quizzes register their matcher here.
const matchers: Record<string, ProfileMatcher> = {
  'somnium-sleep': matchSomniumSleep,
  'better-body-movement': matchBetterBodyMovement,
}

export function getMatcher(slug: string): ProfileMatcher | null {
  return matchers[slug] ?? null
}
