import { describe, it, expect } from 'vitest'
import { hasRecentJointPain, hasLowRecentEnergy } from './wellbeing'

describe('hasRecentJointPain', () => {
  it('is true if any recent day flagged joint pain', () => {
    expect(hasRecentJointPain([{ jointPain: false }, { jointPain: true }])).toBe(true)
  })

  it('is false when nothing was flagged, including when nothing was answered at all', () => {
    expect(hasRecentJointPain([{ jointPain: false }, {}])).toBe(false)
    expect(hasRecentJointPain([])).toBe(false)
  })
})

describe('hasLowRecentEnergy', () => {
  it('is true when the average of logged ratings is at or below the threshold (2)', () => {
    expect(hasLowRecentEnergy([{ energyRating: 1 }, { motivationRating: 2 }])).toBe(true)
    expect(hasLowRecentEnergy([{ energyRating: 2, motivationRating: 2 }])).toBe(true)
  })

  it('is false when the average is above the threshold', () => {
    expect(hasLowRecentEnergy([{ energyRating: 4 }, { motivationRating: 3 }])).toBe(false)
  })

  it('is false — not "low" — when nothing has been rated yet, since silence is not evidence of a rough week', () => {
    expect(hasLowRecentEnergy([])).toBe(false)
    expect(hasLowRecentEnergy([{}, {}])).toBe(false)
  })
})
