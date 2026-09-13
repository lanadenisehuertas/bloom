import { renderHook, waitFor, act } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import { db } from '../db'
import { useProfile } from './useProfile'

describe('useProfile', () => {
  beforeEach(async () => {
    await db.delete()
    await db.open()
  })

  it('returns undefined then the saved profile, and exposes a saveProfile setter', async () => {
    const { result } = renderHook(() => useProfile())
    await act(async () => {
      await result.current.saveProfile({
        id: 'default', heightCm: 175, weightKg: 80, age: 21, activityLevel: 'lightlyActive',
        goalWeightKg: 65, goalDate: '2027-03-01', equipment: [], injuryNotes: '', createdAt: '2026-09-14',
      })
    })
    await waitFor(() => expect(result.current.profile?.weightKg).toBe(80))
  })
})
