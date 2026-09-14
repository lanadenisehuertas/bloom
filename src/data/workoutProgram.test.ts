import { describe, it, expect } from 'vitest'
import { WORKOUT_DAYS, getScheduledDay } from './workoutProgram'
import { getExercise } from './exercises'

describe('WORKOUT_DAYS', () => {
  it('references only exercise ids that actually exist in the exercise library, or the known virtual push-up slot', () => {
    const allExerciseIds = Object.values(WORKOUT_DAYS).flatMap((day) => day.exercises.map((e) => e.exerciseId))
    for (const id of allExerciseIds) {
      if (id === 'pushup-current-level') continue // resolved dynamically by WorkoutPlayer, not a real exercise
      expect(() => getExercise(id)).not.toThrow()
    }
  })
})

describe('getScheduledDay', () => {
  it('returns the correct day for each day of the week (0=Sunday..6=Saturday)', () => {
    expect(getScheduledDay(0).id).toBe('rest')
    expect(getScheduledDay(1).id).toBe('A')
    expect(getScheduledDay(2).id).toBe('recovery')
    expect(getScheduledDay(3).id).toBe('B')
    expect(getScheduledDay(4).id).toBe('C')
    expect(getScheduledDay(5).id).toBe('recovery')
    expect(getScheduledDay(6).id).toBe('D')
  })

  it('throws on an out-of-range day of week instead of silently returning undefined', () => {
    expect(() => getScheduledDay(7)).toThrow('No scheduled day for dayOfWeek: 7')
  })
})
