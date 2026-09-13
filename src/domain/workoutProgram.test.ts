import { describe, it, expect } from 'vitest'
import { applyCyclePhaseModifier, suggestProgressiveOverload } from './workoutProgram'
import { WORKOUT_DAYS } from '../data/workoutProgram'

describe('applyCyclePhaseModifier', () => {
  it('cuts reps ~30% and swaps to recovery framing during menstrual phase', () => {
    const result = applyCyclePhaseModifier(WORKOUT_DAYS.A, 'menstrual')
    expect(result.repReductionPct).toBe(30)
    expect(result.suggestSwapToRecovery).toBe(true)
  })

  it('nudges an added rep/resistance during follicular phase', () => {
    const result = applyCyclePhaseModifier(WORKOUT_DAYS.A, 'follicular')
    expect(result.nudgeProgressiveOverload).toBe(true)
    expect(result.repReductionPct).toBe(0)
  })

  it('flags ovulation as a good day to test a max-effort rep', () => {
    const result = applyCyclePhaseModifier(WORKOUT_DAYS.A, 'ovulation')
    expect(result.testDay).toBe(true)
  })

  it('maintains volume and lowers the bar (not the day) during luteal phase', () => {
    const result = applyCyclePhaseModifier(WORKOUT_DAYS.A, 'luteal')
    expect(result.repReductionPct).toBe(0)
    expect(result.lowerBarMessage).toBeTruthy()
  })
})

describe('suggestProgressiveOverload', () => {
  it('suggests an increase after 2 consecutive sessions at the top of the rep range', () => {
    const history = [
      { hitTopOfRange: true },
      { hitTopOfRange: true },
    ]
    expect(suggestProgressiveOverload(history)).toBe(true)
  })

  it('does not suggest an increase after only 1 session at the top of the range', () => {
    expect(suggestProgressiveOverload([{ hitTopOfRange: true }])).toBe(false)
  })

  it('does not suggest an increase if the most recent session missed the top of the range', () => {
    expect(suggestProgressiveOverload([{ hitTopOfRange: true }, { hitTopOfRange: false }])).toBe(false)
  })
})
