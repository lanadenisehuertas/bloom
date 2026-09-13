import { describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import { db } from './index'
import { exportData, importData, BackupBundle } from './backup'

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

  it('rejects a backup with an unsupported version', async () => {
    await expect(importData({ version: 2 } as unknown as BackupBundle)).rejects.toThrow('Unsupported backup version')
  })

  it('rejects a backup with a malformed shape', async () => {
    const malformed = { version: 1, exportedAt: '2026-09-14', profile: 'not-an-array' } as unknown as BackupBundle
    await expect(importData(malformed)).rejects.toThrow('Invalid backup file')
  })

  it('replaces existing workoutLogs instead of colliding on auto-increment ids', async () => {
    // Simulate a workout logged locally AFTER the backup was taken, using the same
    // auto-increment id the backup's own row will get.
    await db.workoutLogs.add({ date: '2026-09-20', workoutDayId: 'A', exercises: [], completed: 'full' })
    const bundle = await exportData()
    bundle.workoutLogs = [{ id: 1, date: '2026-01-01', workoutDayId: 'B', exercises: [], completed: 'minimal' }]

    await importData(bundle)

    const logs = await db.workoutLogs.toArray()
    expect(logs).toHaveLength(1)
    expect(logs[0].date).toBe('2026-01-01')
  })
})
