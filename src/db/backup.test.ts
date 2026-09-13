import { describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import { db } from './index'
import { exportData, importData } from './backup'

describe('backup', () => {
  beforeEach(async () => {
    await db.delete()
    await db.open()
  })

  it('exports all tables to a single JSON-serializable object', async () => {
    await db.profile.put({ id: 'default', heightCm: 175, weightKg: 80, age: 21, activityLevel: 'lightlyActive', goalWeightKg: 65, goalDate: '2027-03-01', equipment: [], injuryNotes: '', createdAt: '2026-09-14' })
    const exported = await exportData()
    expect(exported.version).toBe(1)
    expect(exported.profile[0].weightKg).toBe(80)
  })

  it('round-trips through export then import into a cleared db', async () => {
    await db.measurementLogs.put({ date: '2026-09-14', waistCm: 70, hipsCm: 95, upperArmCm: 26, thighCm: 55 })
    const exported = await exportData()
    await db.delete()
    await db.open()
    await importData(exported)
    const restored = await db.measurementLogs.get('2026-09-14')
    expect(restored?.waistCm).toBe(70)
  })
})
