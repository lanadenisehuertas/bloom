import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import 'fake-indexeddb/auto'
import { db } from '../db'
import { useWellbeingState } from './useWellbeingState'

describe('useWellbeingState', () => {
  beforeEach(async () => {
    await db.delete()
    await db.open()
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-09-14T09:00:00Z'))
  })

  afterEach(() => vi.useRealTimers())

  it('flags joint pain logged within the last 7 days', async () => {
    await db.dailyLogs.put({ date: '2026-09-10', waterCount: 0, mealsLogged: [], jointPain: true })
    const { result } = renderHook(() => useWellbeingState())
    await waitFor(() => expect(result.current.jointPainFlagged).toBe(true))
  })

  it('does not flag joint pain logged more than 7 days ago', async () => {
    await db.dailyLogs.put({ date: '2026-09-01', waterCount: 0, mealsLogged: [], jointPain: true })
    const { result } = renderHook(() => useWellbeingState())
    await waitFor(() => expect(result.current.jointPainFlagged).toBe(false))
  })

  it('flags low energy from recent check-in ratings', async () => {
    await db.dailyLogs.put({ date: '2026-09-12', waterCount: 0, mealsLogged: [], energyRating: 1, motivationRating: 2 })
    const { result } = renderHook(() => useWellbeingState())
    await waitFor(() => expect(result.current.lowEnergyFlagged).toBe(true))
  })

  it('reports no flags when there is no recent data', async () => {
    const { result } = renderHook(() => useWellbeingState())
    await waitFor(() => expect(result.current.jointPainFlagged).toBe(false))
    expect(result.current.lowEnergyFlagged).toBe(false)
  })
})
