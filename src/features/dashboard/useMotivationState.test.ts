import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import 'fake-indexeddb/auto'
import { db } from '../../db'
import { useMotivationState } from './useMotivationState'

describe('useMotivationState', () => {
  beforeEach(async () => {
    await db.delete()
    await db.open()
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-09-14T09:00:00'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('computes the current streak from logged workout completions', async () => {
    await db.workoutLogs.bulkAdd([
      { date: '2026-09-12', workoutDayId: 'A', exercises: [], completed: 'full' },
      { date: '2026-09-13', workoutDayId: 'recovery', exercises: [], completed: 'minimal' },
      { date: '2026-09-14', workoutDayId: 'B', exercises: [], completed: 'full' },
    ])
    const { result } = renderHook(() => useMotivationState())
    await waitFor(() => expect(result.current.streak).toBe(3))
  })

  // "Today" is pinned to Saturday 2026-09-19 for the two tests below. The week
  // (Sun 2026-09-13 -> Sat 2026-09-19, per WEEKLY_SCHEDULE) has real scheduled
  // workout days ('A'/'B'/'C'/'D', not 'recovery'/'rest') on:
  //   Mon 2026-09-14 (A), Wed 2026-09-16 (B), Thu 2026-09-17 (C)
  // Sat 2026-09-19 itself is 'today' and is excluded (a day isn't missed until
  // it's over); Sun/Tue/Fri are 'rest'/'recovery' and are never "missed".
  // A missed day is represented by the ABSENCE of a workoutLogs row for that
  // date, since nothing in the app ever writes a 'skipped' row.

  it('does not flag downshiftRecommended when fewer than 3 sessions were missed this week', async () => {
    vi.setSystemTime(new Date('2026-09-19T09:00:00')) // Saturday
    await db.workoutLogs.bulkAdd([
      { date: '2026-09-14', workoutDayId: 'A', exercises: [], completed: 'full' },
      { date: '2026-09-16', workoutDayId: 'B', exercises: [], completed: 'minimal' },
      // 2026-09-17 (Thursday, scheduled day C) has no log row -> 1 missed workout
    ])
    const { result } = renderHook(() => useMotivationState())
    await waitFor(() => expect(result.current.downshiftRecommended).toBe(false))
  })

  it('flags downshiftRecommended when 3+ sessions were missed this week', async () => {
    vi.setSystemTime(new Date('2026-09-19T09:00:00')) // Saturday
    // No logs at all: 2026-09-14 (A), 2026-09-16 (B), and 2026-09-17 (C) are all
    // scheduled real workout days with no log row -> 3 missed workouts
    const { result } = renderHook(() => useMotivationState())
    await waitFor(() => expect(result.current.downshiftRecommended).toBe(true))
  })

  it('does not count days before the user created their profile as missed', async () => {
    // pinned "today" is Saturday 2026-09-19 (see other tests in this file); profile created
    // Friday 2026-09-18, so Monday(A)/Wednesday(B)/Thursday(C) all predate the account and
    // must not count as missed, even though none of them have a logged workout.
    vi.setSystemTime(new Date('2026-09-19T09:00:00')) // Saturday
    await db.profile.put({
      id: 'default', heightCm: 175, weightKg: 80, age: 21, activityLevel: 'lightlyActive',
      goalWeightKg: 74, goalDate: '2026-10-31', equipment: [], injuryNotes: '',
      createdAt: '2026-09-18T10:00:00.000Z',
    })
    const { result } = renderHook(() => useMotivationState())
    await waitFor(() => expect(result.current.downshiftRecommended).toBe(false))
  })
})
