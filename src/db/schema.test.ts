import { describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import { db } from './index'

describe('db schema', () => {
  beforeEach(async () => {
    await db.delete()
    await db.open()
  })

  it('stores and retrieves a profile', async () => {
    await db.profile.put({
      id: 'default',
      heightCm: 175,
      weightKg: 80,
      age: 21,
      activityLevel: 'lightlyActive',
      goalWeightKg: 65,
      goalDate: '2027-03-01',
      equipment: ['dumbbells-5kg', 'resistance-band', 'bodyweight'],
      injuryNotes: 'occasional joint pain',
    })
    const profile = await db.profile.get('default')
    expect(profile?.weightKg).toBe(80)
  })

  it('stores a daily log keyed by date', async () => {
    await db.dailyLogs.put({ date: '2026-09-14', waterCount: 3, mealsLogged: ['tinola'] })
    const log = await db.dailyLogs.get('2026-09-14')
    expect(log?.mealsLogged).toContain('tinola')
  })
})
