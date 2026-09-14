import { db } from './index'
import {
  Profile,
  DailyLog,
  CycleLog,
  WorkoutLog,
  MeasurementLog,
  Milestone,
  SettingsRecord,
  CustomFood,
  FoodLogEntry,
} from './schema'

export interface BackupBundle {
  version: 1 | 2
  exportedAt: string
  profile: Profile[]
  dailyLogs: DailyLog[]
  cycleLog: CycleLog[]
  workoutLogs: WorkoutLog[]
  measurementLogs: MeasurementLog[]
  milestones: Milestone[]
  settings: SettingsRecord[]
  /** Absent on a version-1 bundle exported before food logging existed. */
  customFoods?: CustomFood[]
  foodLogs?: FoodLogEntry[]
  // Photos are intentionally excluded from JSON export (Blobs don't serialize to JSON
  // safely). There is currently no separate photo-backup path anywhere in the app —
  // progress photos exist only in this browser's IndexedDB and are NOT covered by
  // export/import. If photo backup is ever built, it needs its own export mechanism
  // (e.g. a zip of Blobs) and this comment should point to it.
}

export async function exportData(): Promise<BackupBundle> {
  const [profile, dailyLogs, cycleLog, workoutLogs, measurementLogs, milestones, settings, customFoods, foodLogs] =
    await Promise.all([
      db.profile.toArray(),
      db.dailyLogs.toArray(),
      db.cycleLog.toArray(),
      db.workoutLogs.toArray(),
      db.measurementLogs.toArray(),
      db.milestones.toArray(),
      db.settings.toArray(),
      db.customFoods.toArray(),
      db.foodLogs.toArray(),
    ])
  return {
    version: 2,
    exportedAt: new Date().toISOString(),
    profile,
    dailyLogs,
    cycleLog,
    workoutLogs,
    measurementLogs,
    milestones,
    settings,
    customFoods,
    foodLogs,
  }
}

/**
 * Restores a backup with REPLACE semantics: each table is cleared before the backup's
 * rows are written back, so restoring never merges with (or can be corrupted by id
 * collisions against) data created locally since the backup was taken.
 */
export async function importData(bundle: BackupBundle): Promise<void> {
  if (bundle.version !== 1 && bundle.version !== 2) {
    throw new Error(`Unsupported backup version: ${bundle.version}. This app can only import version 1 or 2 backups.`)
  }
  const requiredArrayFields: (keyof BackupBundle)[] = [
    'profile', 'dailyLogs', 'cycleLog', 'workoutLogs', 'measurementLogs', 'milestones', 'settings',
  ]
  for (const field of requiredArrayFields) {
    if (!Array.isArray(bundle[field])) {
      throw new Error(`Invalid backup file: expected "${field}" to be an array.`)
    }
  }
  // customFoods/foodLogs are optional (absent on a v1 bundle predating food logging),
  // but if PRESENT they must actually be arrays — a truthy non-array here is corrupt data.
  for (const field of ['customFoods', 'foodLogs'] as const) {
    if (bundle[field] !== undefined && !Array.isArray(bundle[field])) {
      throw new Error(`Invalid backup file: expected "${field}" to be an array.`)
    }
  }

  const customFoods = bundle.customFoods ?? []
  const foodLogs = bundle.foodLogs ?? []

  await db.transaction(
    'rw',
    [
      db.profile,
      db.dailyLogs,
      db.cycleLog,
      db.workoutLogs,
      db.measurementLogs,
      db.milestones,
      db.settings,
      db.customFoods,
      db.foodLogs,
    ],
    async () => {
      // Replace semantics: clear each table before restoring, so a backup with
      // auto-increment ids (workoutLogs, customFoods, foodLogs) can never collide
      // with rows created locally since the backup was taken.
      await db.profile.clear()
      await db.dailyLogs.clear()
      await db.cycleLog.clear()
      await db.workoutLogs.clear()
      await db.measurementLogs.clear()
      await db.milestones.clear()
      await db.settings.clear()
      await db.customFoods.clear()
      await db.foodLogs.clear()

      if (bundle.profile.length) await db.profile.bulkPut(bundle.profile)
      if (bundle.dailyLogs.length) await db.dailyLogs.bulkPut(bundle.dailyLogs)
      if (bundle.cycleLog.length) await db.cycleLog.bulkPut(bundle.cycleLog)
      if (bundle.workoutLogs.length) await db.workoutLogs.bulkPut(bundle.workoutLogs)
      if (bundle.measurementLogs.length) await db.measurementLogs.bulkPut(bundle.measurementLogs)
      if (bundle.milestones.length) await db.milestones.bulkPut(bundle.milestones)
      if (bundle.settings.length) await db.settings.bulkPut(bundle.settings)
      if (customFoods.length) await db.customFoods.bulkPut(customFoods)
      if (foodLogs.length) await db.foodLogs.bulkPut(foodLogs)
    }
  )
}
