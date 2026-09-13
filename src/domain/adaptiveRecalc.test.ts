import { describe, it, expect } from 'vitest'
import { shouldRecalcTDEE, checkPlateau, checkTooFastLoss, checkMissedWorkouts } from './adaptiveRecalc'

describe('shouldRecalcTDEE', () => {
  it('triggers after 21 days since the last recalculation', () => {
    expect(shouldRecalcTDEE('2026-08-24', '2026-09-14', 0)).toBe(true)
  })
  it('triggers immediately after a 3kg change regardless of elapsed days', () => {
    expect(shouldRecalcTDEE('2026-09-10', '2026-09-14', 3)).toBe(true)
  })
  it('does not trigger before 14 days with no weight-change threshold met', () => {
    expect(shouldRecalcTDEE('2026-09-10', '2026-09-14', 1)).toBe(false)
  })
})

describe('checkPlateau', () => {
  it('flags a possible reduction or under-logging when weight is flat for 2-3 weeks despite adherence', () => {
    const flatHistory = [80, 80.1, 79.9, 80, 80.2, 79.8, 80] // 7-day averages over 3 weeks, logged as flat
    expect(checkPlateau(flatHistory, true)).toBe('reduceCalories')
    expect(checkPlateau(flatHistory, false)).toBe('flagUnderLogging')
  })
  it('returns null when weight is still trending down', () => {
    expect(checkPlateau([80, 79.5, 79, 78.5], true)).toBe(null)
  })
})

describe('checkTooFastLoss', () => {
  it('flags when weekly loss rate exceeds the safe cap', () => {
    expect(checkTooFastLoss(1.0, 0.8)).toBe(true)
  })
  it('does not flag when within the safe cap', () => {
    expect(checkTooFastLoss(0.6, 0.8)).toBe(false)
  })
})

describe('checkMissedWorkouts', () => {
  it('triggers an auto-downshift after 3+ missed sessions in a week', () => {
    expect(checkMissedWorkouts(3)).toBe(true)
    expect(checkMissedWorkouts(2)).toBe(false)
  })
})
