import type { ProfileMatcher } from '@better-life/contracts'

// Deterministic matcher for the Better Body movement/energy quiz. Option values
// match the seeded quiz definition. Profiles: sedentary / depleted / overreached
// / inconsistent.
export const matchBetterBodyMovement: ProfileMatcher = (answers) => {
  const r = answers as Record<string, string>

  // Over-reaching is the most specific signal: trains hard AND under-recovers.
  if (
    r.daily_movement === 'very_active' &&
    (r.recovery === 'rarely_rest' || r.recovery === 'push_through')
  ) {
    return 'overreached'
  }

  const sedentary =
    (r.daily_movement === 'mostly_sitting' ? 2 : 0) +
    (r.routine === 'none' ? 2 : 0) +
    (r.daily_movement === 'light' ? 1 : 0)

  // `skip_meals` (under-fuelled) signals depleted; `up_down` (no rhythm) signals
  // inconsistent. `irregular` fuel is the only shared weak signal, kept low so it
  // can't flip a clear winner.
  const depleted =
    (r.energy_pattern === 'afternoon_crash' || r.energy_pattern === 'low_all_day' ? 2 : 0) +
    (r.fuel === 'skip_meals' ? 2 : 0) +
    (r.fuel === 'irregular' ? 1 : 0)

  const overreached =
    (r.recovery === 'rarely_rest' || r.recovery === 'push_through' ? 2 : 0) +
    (r.daily_movement === 'very_active' || r.daily_movement === 'active' ? 1 : 0)

  const inconsistent =
    (r.routine === 'on_off' ? 2 : 0) +
    (r.energy_pattern === 'up_down' ? 2 : 0) +
    (r.fuel === 'irregular' ? 1 : 0)

  if (sedentary >= 3) return 'sedentary'
  if (depleted >= 3) return 'depleted'
  if (inconsistent >= 3) return 'inconsistent'
  if (overreached >= 3) return 'overreached'

  // Fallback: highest score.
  const scores: [string, number][] = [
    ['sedentary', sedentary],
    ['depleted', depleted],
    ['overreached', overreached],
    ['inconsistent', inconsistent],
  ]
  return scores.reduce((a, b) => (b[1] > a[1] ? b : a))[0]
}
