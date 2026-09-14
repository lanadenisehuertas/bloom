import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import { db } from '../../db'
import { useMilestones } from './useMilestones'

describe('useMilestones', () => {
  beforeEach(async () => {
    await db.delete()
    await db.open()
  })

  it('unlocks first-full-week when 7 consecutive days of workout logs exist', async () => {
    await db.workoutLogs.bulkAdd([
      { date: '2026-09-01', workoutDayId: 'A', exercises: [], completed: 'full' },
      { date: '2026-09-02', workoutDayId: 'recovery', exercises: [], completed: 'minimal' },
      { date: '2026-09-03', workoutDayId: 'B', exercises: [], completed: 'full' },
      { date: '2026-09-04', workoutDayId: 'recovery', exercises: [], completed: 'minimal' },
      { date: '2026-09-05', workoutDayId: 'C', exercises: [], completed: 'full' },
      { date: '2026-09-06', workoutDayId: 'recovery', exercises: [], completed: 'minimal' },
      { date: '2026-09-07', workoutDayId: 'D', exercises: [], completed: 'full' },
    ])

    const { result } = renderHook(() => useMilestones())

    await waitFor(() => expect(result.current.milestones.map((m) => m.id)).toContain('first-full-week'))
    expect(result.current.milestones.find((m) => m.id === 'first-full-week')?.label).toBe(
      'First full week completed!'
    )
  })

  it('does not unlock first-full-week when fewer than 7 consecutive days are logged', async () => {
    await db.workoutLogs.bulkAdd([
      { date: '2026-09-05', workoutDayId: 'C', exercises: [], completed: 'full' },
      { date: '2026-09-06', workoutDayId: 'recovery', exercises: [], completed: 'minimal' },
      { date: '2026-09-07', workoutDayId: 'D', exercises: [], completed: 'full' },
    ])

    const { result } = renderHook(() => useMilestones())

    // give the effect a tick to (not) write
    await waitFor(() => expect(result.current.milestones).toEqual([]))
    expect(result.current.milestones.map((m) => m.id)).not.toContain('first-full-week')
  })

  it('does not unlock first-full-week when 7 logged rows exist but span non-consecutive dates', async () => {
    // One log per week for 7 weeks: 7 rows with no gap in the array (so a naive
    // computeStreak(...) >= 7 check would wrongly treat this as a streak), but none of
    // them are actually consecutive calendar days.
    await db.workoutLogs.bulkAdd([
      { date: '2026-07-27', workoutDayId: 'A', exercises: [], completed: 'full' },
      { date: '2026-08-03', workoutDayId: 'A', exercises: [], completed: 'full' },
      { date: '2026-08-10', workoutDayId: 'A', exercises: [], completed: 'full' },
      { date: '2026-08-17', workoutDayId: 'A', exercises: [], completed: 'full' },
      { date: '2026-08-24', workoutDayId: 'A', exercises: [], completed: 'full' },
      { date: '2026-08-31', workoutDayId: 'A', exercises: [], completed: 'full' },
      { date: '2026-09-07', workoutDayId: 'A', exercises: [], completed: 'full' },
    ])

    const { result } = renderHook(() => useMilestones())

    // give the effect a tick to (not) write
    await waitFor(() => expect(result.current.milestones).toEqual([]))
    expect(result.current.milestones.map((m) => m.id)).not.toContain('first-full-week')
  })
})
