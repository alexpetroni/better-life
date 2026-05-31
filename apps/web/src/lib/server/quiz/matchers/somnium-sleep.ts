import type { ProfileMatcher } from '@better-life/contracts'

// Deterministic matcher migrated verbatim (logic) from better-sleep v7's
// "what keeps you awake" quiz. Option values match the seeded quiz definition.
export const matchSomniumSleep: ProfileMatcher = (answers) => {
  const r = answers as Record<string, string>

  // Conditioned insomnia takes priority — it's the most specific.
  if (
    r.sleep_worry === 'always' &&
    r.time_to_sleep === 'over_60' &&
    (r.bedtime_mind === 'anxious' || r.bedtime_mind === 'racing')
  ) {
    return 'conditioned'
  }

  const hyperarousal =
    (r.bedtime_mind === 'racing' || r.bedtime_mind === 'anxious' ? 2 : 0) +
    (r.sleep_worry === 'most' || r.sleep_worry === 'always' ? 2 : 0) +
    (r.body_at_bedtime === 'wired' ? 1 : 0)

  const tension =
    (r.body_at_bedtime === 'tense' || r.body_at_bedtime === 'restless' || r.body_at_bedtime === 'wired'
      ? 2
      : 0) + (r.time_to_sleep === '30_60' || r.time_to_sleep === 'over_60' ? 1 : 0)

  const behavioral =
    (r.screen_before_bed === 'phone' || r.screen_before_bed === 'tv' ? 2 : 0) +
    (r.bedtime_mind === 'replay' ? 1 : 0) +
    (r.sleep_worry === 'never' || r.sleep_worry === 'sometimes' ? 1 : 0)

  if (hyperarousal >= 3) return 'hyperarousal'
  if (tension >= 3) return 'tension'
  if (behavioral >= 3) return 'behavioral'

  // Fallback: highest score.
  const scores: [string, number][] = [
    ['hyperarousal', hyperarousal],
    ['tension', tension],
    ['behavioral', behavioral],
  ]
  return scores.reduce((a, b) => (b[1] > a[1] ? b : a))[0]
}
