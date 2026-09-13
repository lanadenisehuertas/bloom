import { describe, it, expect } from 'vitest'
import { calcBMR, calcTDEE, calcDailyTargets, evaluateGoalPace, ACTIVITY_MULTIPLIERS } from './nutrition'

describe('calcBMR', () => {
  it('matches the spec worked example (~1628 kcal for 80kg/175cm/21yo female)', () => {
    expect(Math.round(calcBMR(80, 175, 21))).toBe(1628)
  })
})

describe('calcTDEE', () => {
  it('matches the spec worked example (~2250-2300 kcal at lightlyActive)', () => {
    const tdee = calcTDEE(calcBMR(80, 175, 21), 'lightlyActive')
    expect(tdee).toBeGreaterThanOrEqual(2250)
    expect(tdee).toBeLessThanOrEqual(2300)
  })
})

describe('calcDailyTargets', () => {
  it('applies a 300-400 kcal deficit and a 1.6g/kg protein floor', () => {
    const tdee = calcTDEE(calcBMR(80, 175, 21), 'lightlyActive')
    const targets = calcDailyTargets(tdee, 80)
    expect(targets.calorieTarget).toBeGreaterThanOrEqual(1850)
    expect(targets.calorieTarget).toBeLessThanOrEqual(1950)
    expect(targets.proteinTarget).toBe(128)
  })
})

describe('evaluateGoalPace', () => {
  it('flags an unsafe pace and computes a safe Halloween checkpoint (~74-76kg)', () => {
    const result = evaluateGoalPace({
      startWeightKg: 80,
      goalWeightKg: 65,
      startDate: '2026-09-12',
      goalDate: '2026-10-31',
    })
    expect(result.isSafe).toBe(false)
    expect(result.checkpointWeightKg).toBeGreaterThanOrEqual(74)
    expect(result.checkpointWeightKg).toBeLessThanOrEqual(76)
    expect(result.recommendedGoalDate > '2026-10-31').toBe(true)
  })

  it('marks a pace safe when the timeline matches the safe weekly cap', () => {
    const result = evaluateGoalPace({
      startWeightKg: 80,
      goalWeightKg: 75,
      startDate: '2026-09-12',
      goalDate: '2026-10-31',
    })
    expect(result.isSafe).toBe(true)
  })

  it('caps the safe weekly pace at 1% of body weight', () => {
    expect(ACTIVITY_MULTIPLIERS.lightlyActive).toBeCloseTo(1.4)
  })
})
