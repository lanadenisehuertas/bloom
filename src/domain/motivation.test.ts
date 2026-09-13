import { describe, it, expect } from 'vitest'
import { computeStreak, checkMilestones, MilestoneContext } from './motivation'

describe('computeStreak', () => {
  it('counts consecutive completed days (full or minimal both count)', () => {
    const days = [
      { date: '2026-09-10', completed: 'full' as const },
      { date: '2026-09-11', completed: 'minimal' as const },
      { date: '2026-09-12', completed: 'full' as const },
    ]
    expect(computeStreak(days, 0)).toBe(3)
  })

  it('does not break the streak across a single used grace day', () => {
    const days = [
      { date: '2026-09-10', completed: 'full' as const },
      { date: '2026-09-11', completed: 'skipped' as const },
      { date: '2026-09-12', completed: 'full' as const },
    ]
    expect(computeStreak(days, 1)).toBe(3)
  })

  it('breaks the streak on a skipped day once grace days are exhausted', () => {
    const days = [
      { date: '2026-09-10', completed: 'full' as const },
      { date: '2026-09-11', completed: 'skipped' as const },
      { date: '2026-09-12', completed: 'full' as const },
    ]
    expect(computeStreak(days, 0)).toBe(1)
  })
})

describe('checkMilestones', () => {
  it('unlocks first-full-pushup when a session logs a clean standard push-up for the first time', () => {
    const ctx: MilestoneContext = { firstFullPushupLogged: true, firstFullWeekCompleted: false, halfwayToCheckpoint: false, alreadyUnlocked: [] }
    expect(checkMilestones(ctx)).toContain('first-full-pushup')
  })

  it('does not re-unlock an already-unlocked milestone', () => {
    const ctx: MilestoneContext = { firstFullPushupLogged: true, firstFullWeekCompleted: false, halfwayToCheckpoint: false, alreadyUnlocked: ['first-full-pushup'] }
    expect(checkMilestones(ctx)).not.toContain('first-full-pushup')
  })

  it('unlocks halfway-to-checkpoint and first-full-week independently', () => {
    const ctx: MilestoneContext = { firstFullPushupLogged: false, firstFullWeekCompleted: true, halfwayToCheckpoint: true, alreadyUnlocked: [] }
    const unlocked = checkMilestones(ctx)
    expect(unlocked).toContain('first-full-week')
    expect(unlocked).toContain('halfway-to-checkpoint')
  })
})
