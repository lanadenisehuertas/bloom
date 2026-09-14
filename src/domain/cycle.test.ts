import { describe, it, expect } from 'vitest'
import { detectPhase, currentCycleDay, learnAvgCycleLength } from './cycle'

describe('detectPhase', () => {
  it('classifies each phase per the spec boundaries (28-day default)', () => {
    expect(detectPhase(1, 28)).toBe('menstrual')
    expect(detectPhase(5, 28)).toBe('menstrual')
    expect(detectPhase(6, 28)).toBe('follicular')
    expect(detectPhase(13, 28)).toBe('follicular')
    expect(detectPhase(14, 28)).toBe('ovulation')
    expect(detectPhase(15, 28)).toBe('luteal')
    expect(detectPhase(28, 28)).toBe('luteal')
  })

  it('scales phase boundaries with a non-default cycle length', () => {
    // 35-day cycle: ovulation ≈ day 21 (35-14), not the fixed day-14 default
    expect(detectPhase(20, 35)).toBe('follicular')
    expect(detectPhase(21, 35)).toBe('ovulation')
    expect(detectPhase(22, 35)).toBe('luteal')
  })
})

describe('currentCycleDay', () => {
  it('computes the 1-indexed day since the last period start', () => {
    expect(currentCycleDay('2026-09-01', '2026-09-01')).toBe(1)
    expect(currentCycleDay('2026-09-01', '2026-09-15')).toBe(15)
  })
})

describe('learnAvgCycleLength', () => {
  it('falls back to 28 with fewer than 2 logged periods', () => {
    expect(learnAvgCycleLength(['2026-08-01'])).toBe(28)
    expect(learnAvgCycleLength([])).toBe(28)
  })

  it('averages the gaps between consecutive period start dates', () => {
    expect(learnAvgCycleLength(['2026-07-01', '2026-07-29', '2026-08-27'])).toBe(28.5)
  })
})
