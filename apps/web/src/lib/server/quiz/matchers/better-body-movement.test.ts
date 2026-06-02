import { describe, expect, it } from 'vitest'
import { matchBetterBodyMovement as match } from './better-body-movement'

const cases: Record<string, Record<string, string>> = {
  sedentary: { daily_movement: 'mostly_sitting', energy_pattern: 'steady', routine: 'none', recovery: 'some_rest', fuel: 'mostly_balanced' },
  depleted: { daily_movement: 'light', energy_pattern: 'afternoon_crash', routine: 'mostly_regular', recovery: 'some_rest', fuel: 'skip_meals' },
  overreached: { daily_movement: 'very_active', energy_pattern: 'steady', routine: 'very_regular', recovery: 'rarely_rest', fuel: 'mostly_balanced' },
  inconsistent: { daily_movement: 'active', energy_pattern: 'up_down', routine: 'on_off', recovery: 'some_rest', fuel: 'irregular' },
}

describe('matchBetterBodyMovement', () => {
  for (const [expected, answers] of Object.entries(cases)) {
    it(`maps a representative "${expected}" answer set to ${expected}`, () => {
      expect(match(answers)).toBe(expected)
    })
  }

  it('over-reaching wins immediately for trains-hard + under-recovers', () => {
    expect(match({ daily_movement: 'very_active', recovery: 'push_through' })).toBe('overreached')
  })

  it('always returns a valid profile, even with no answers', () => {
    expect(['sedentary', 'depleted', 'overreached', 'inconsistent']).toContain(match({}))
  })
})
