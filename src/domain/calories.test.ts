import { describe, it, expect } from 'vitest'
import { resolveServingTotals, computeDailyTotals, computeCalorieProgress } from './calories'
import { FoodBase, FoodLogEntry } from '../db/schema'

const rice: FoodBase = {
  name: 'Steamed white rice',
  servings: [{ label: '1 cup', grams: 158 }],
  per100g: { kcal: 130, proteinG: 2.7 },
}

describe('resolveServingTotals', () => {
  it('scales per-100g values by the serving grams and quantity', () => {
    // 158g at 130 kcal/100g = 205.4 -> rounds to 205; protein 2.7 * 1.58 = 4.266 -> 4.3
    const totals = resolveServingTotals(rice, '1 cup', 1)
    expect(totals.kcal).toBe(205)
    expect(totals.proteinG).toBe(4.3)
  })

  it('scales correctly for a fractional quantity (half a cup)', () => {
    const totals = resolveServingTotals(rice, '1 cup', 0.5)
    expect(totals.kcal).toBe(103) // 79g -> 102.7 -> rounds to 103
  })

  it('throws on an unknown serving label rather than silently returning zero', () => {
    expect(() => resolveServingTotals(rice, '1 bowl', 1)).toThrow(/unknown serving/i)
  })
})

describe('computeDailyTotals', () => {
  it('sums already-resolved entries without touching the food database', () => {
    const entries: FoodLogEntry[] = [
      { date: '2026-09-14', loggedAt: '2026-09-14T00:00:00Z', slot: 'breakfast', name: 'A', servingLabel: '1', quantity: 1, kcal: 300, proteinG: 10 },
      { date: '2026-09-14', loggedAt: '2026-09-14T00:00:00Z', slot: 'lunch', name: 'B', servingLabel: '1', quantity: 1, kcal: 450, proteinG: 20 },
    ]
    expect(computeDailyTotals(entries)).toEqual({ kcal: 750, proteinG: 30 })
  })

  it('returns zero totals for an empty day', () => {
    expect(computeDailyTotals([])).toEqual({ kcal: 0, proteinG: 0 })
  })
})

describe('computeCalorieProgress', () => {
  it('computes remaining and a clamped fraction when under target', () => {
    const progress = computeCalorieProgress(1200, 1929)
    expect(progress.remaining).toBe(729)
    expect(progress.isOverTarget).toBe(false)
    expect(progress.fractionOfTarget).toBeCloseTo(1200 / 1929)
  })

  it('reports going over target as a plain fact, not an error — remaining goes negative but fraction clamps at 1', () => {
    const progress = computeCalorieProgress(2200, 1929)
    expect(progress.remaining).toBe(-271)
    expect(progress.isOverTarget).toBe(true)
    expect(progress.fractionOfTarget).toBe(1) // clamped, so a ring never visually overflows
  })

  it('does not divide by zero when target is zero', () => {
    expect(computeCalorieProgress(500, 0).fractionOfTarget).toBe(0)
  })
})
