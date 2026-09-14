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
    expect(exported.version).toBe(2)
    expect(exported.profile[0].weightKg).toBe(80)
  })

  it('includes food logs and custom foods in the export', async () => {
    await db.customFoods.add({ name: 'Test food', servings: [{ label: '1 pc', grams: 50 }], per100g: { kcal: 100, proteinG: 5 }, createdAt: '2026-09-14' })
    await db.foodLogs.add({ date: '2026-09-14', loggedAt: '2026-09-14T08:00:00.000Z', slot: 'breakfast', name: 'Test food', servingLabel: '1 pc', quantity: 1, kcal: 50, proteinG: 2.5 })
    const exported = await exportData()
    expect(exported.customFoods).toHaveLength(1)
    expect(exported.foodLogs).toHaveLength(1)
  })

  it('round-trips through export then import into a cleared db', async () => {
    await db.measurementLogs.put({ date: '2026-09-14', waistCm: 70, hipsCm: 95, upperArmCm: 26, thighCm: 55 })
    await db.foodLogs.put({ date: '2026-09-14', loggedAt: '2026-09-14T08:00:00.000Z', slot: 'breakfast', name: 'Rice', servingLabel: '1 cup', quantity: 1, kcal: 205, proteinG: 4.3 })
    const exported = await exportData()
    await db.delete()
    await db.open()
    await importData(exported)
    const restored = await db.measurementLogs.get('2026-09-14')
    expect(restored?.waistCm).toBe(70)
    const restoredFoodLogs = await db.foodLogs.toArray()
    expect(restoredFoodLogs).toHaveLength(1)
    expect(restoredFoodLogs[0].name).toBe('Rice')
  })

  it('imports an old version-1 backup (predating food logging) without food tables', async () => {
    const v1Bundle = {
      version: 1,
      exportedAt: '2026-01-01T00:00:00.000Z',
      profile: [],
      dailyLogs: [],
      cycleLog: [],
      workoutLogs: [],
      measurementLogs: [{ date: '2026-01-01', waistCm: 71, hipsCm: 96, upperArmCm: 27, thighCm: 56 }],
      milestones: [],
      settings: [],
      // no customFoods/foodLogs keys at all — this is the exact shape a real v1 export had
    } as unknown as BackupBundle
    await importData(v1Bundle)
    const restored = await db.measurementLogs.get('2026-01-01')
    expect(restored?.waistCm).toBe(71)
    expect(await db.foodLogs.count()).toBe(0)
  })

  it('rejects a backup with an unsupported version', async () => {
    await expect(importData({ version: 3 } as unknown as BackupBundle)).rejects.toThrow('Unsupported backup version')
  })

  it('rejects a backup with a malformed shape', async () => {
    const malformed = { version: 1, exportedAt: '2026-09-14', profile: 'not-an-array' } as unknown as BackupBundle
    await expect(importData(malformed)).rejects.toThrow('Invalid backup file')
  })

  it('rejects a backup whose foodLogs field is present but not an array', async () => {
    const base = await exportData()
    const malformed = { ...base, foodLogs: 'not-an-array' } as unknown as BackupBundle
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
