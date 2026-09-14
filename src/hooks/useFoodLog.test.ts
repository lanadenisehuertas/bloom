import { renderHook, waitFor, act } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import { db } from '../db'
import { useFoodLog, useFrequentFoods } from './useFoodLog'

describe('useFoodLog', () => {
  beforeEach(async () => {
    await db.delete()
    await db.open()
  })

  it('logs a food entry and reflects it in totals for that date', async () => {
    const { result } = renderHook(() => useFoodLog('2026-09-14'))
    await act(async () => {
      await result.current.logFood({
        slot: 'breakfast', name: 'Steamed white rice', servingLabel: '1 cup', quantity: 1, kcal: 205, proteinG: 4.3,
      })
    })
    await waitFor(() => expect(result.current.entries).toHaveLength(1))
    expect(result.current.totals.kcal).toBe(205)
    expect(result.current.totals.proteinG).toBe(4.3)
  })

  it('only shows entries for its own date, not another day\'s log', async () => {
    await db.foodLogs.add({ date: '2026-09-13', loggedAt: '2026-09-13T08:00:00.000Z', slot: 'breakfast', name: 'Yesterday food', servingLabel: '1', quantity: 1, kcal: 100, proteinG: 5 })
    const { result } = renderHook(() => useFoodLog('2026-09-14'))
    await waitFor(() => expect(result.current.entries).toHaveLength(0))
    expect(result.current.totals.kcal).toBe(0)
  })

  it('logAgain re-logs a past entry under today rather than mutating the original', async () => {
    const past = await db.foodLogs.add({ date: '2026-09-01', loggedAt: '2026-09-01T08:00:00.000Z', slot: 'lunch', name: 'Chicken adobo', servingLabel: '1 serving', quantity: 1, kcal: 267, proteinG: 30 })
    const pastEntry = (await db.foodLogs.get(past))!

    const { result } = renderHook(() => useFoodLog('2026-09-14'))
    await act(async () => {
      await result.current.logAgain(pastEntry)
    })
    await waitFor(() => expect(result.current.entries).toHaveLength(1))
    expect(result.current.entries[0].date).toBe('2026-09-14')
    // the original entry on 2026-09-01 must be untouched
    expect(await db.foodLogs.get(past)).toMatchObject({ date: '2026-09-01' })
  })

  it('removeEntry deletes a single logged entry', async () => {
    const { result } = renderHook(() => useFoodLog('2026-09-14'))
    await act(async () => {
      await result.current.logFood({ slot: 'snack', name: 'Banana', servingLabel: '1 medium', quantity: 1, kcal: 89, proteinG: 1.1 })
    })
    await waitFor(() => expect(result.current.entries).toHaveLength(1))
    const id = result.current.entries[0].id!
    await act(async () => {
      await result.current.removeEntry(id)
    })
    await waitFor(() => expect(result.current.entries).toHaveLength(0))
  })
})

describe('useFrequentFoods', () => {
  beforeEach(async () => {
    await db.delete()
    await db.open()
  })

  it('ranks foods by how often the same name+serving was logged, across all dates', async () => {
    await db.foodLogs.bulkAdd([
      { date: '2026-09-01', loggedAt: '2026-09-01T08:00:00.000Z', slot: 'breakfast', name: 'Rice', servingLabel: '1 cup', quantity: 1, kcal: 205, proteinG: 4.3 },
      { date: '2026-09-02', loggedAt: '2026-09-02T08:00:00.000Z', slot: 'breakfast', name: 'Rice', servingLabel: '1 cup', quantity: 1, kcal: 205, proteinG: 4.3 },
      { date: '2026-09-03', loggedAt: '2026-09-03T08:00:00.000Z', slot: 'breakfast', name: 'Egg', servingLabel: '1 pc', quantity: 1, kcal: 78, proteinG: 6.5 },
    ])
    const { result } = renderHook(() => useFrequentFoods())
    await waitFor(() => expect(result.current.length).toBeGreaterThan(0))
    expect(result.current[0].name).toBe('Rice') // logged twice, ranks above the once-logged Egg
  })
})
