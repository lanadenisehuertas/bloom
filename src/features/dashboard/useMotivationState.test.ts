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

  it('does not flag downshiftRecommended when fewer than 3 sessions were missed this week', async () => {
    const monday = '2026-09-14' // "today" is pinned to this same Monday above
    await db.workoutLogs.bulkAdd([
      { date: monday, workoutDayId: 'A', exercises: [], completed: 'skipped' },
    ])
    const { result } = renderHook(() => useMotivationState())
    await waitFor(() => expect(result.current.downshiftRecommended).toBe(false)) // only 1 skip logged
  })

  it('flags downshiftRecommended when 3+ sessions were missed this week', async () => {
    await db.workoutLogs.bulkAdd([
      { date: '2026-09-14', workoutDayId: 'A', exercises: [], completed: 'skipped' },
      { date: '2026-09-15', workoutDayId: 'B', exercises: [], completed: 'skipped' },
      { date: '2026-09-16', workoutDayId: 'C', exercises: [], completed: 'skipped' },
    ])
    const { result } = renderHook(() => useMotivationState())
    await waitFor(() => expect(result.current.downshiftRecommended).toBe(true))
  })
})
