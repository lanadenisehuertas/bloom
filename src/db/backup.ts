import { db } from './index'
import { Profile, DailyLog, CycleLog, WorkoutLog, MeasurementLog, Milestone, SettingsRecord } from './schema'

export interface BackupBundle {
  version: 1
  exportedAt: string
  profile: Profile[]
  dailyLogs: DailyLog[]
  cycleLog: CycleLog[]
  workoutLogs: WorkoutLog[]
  measurementLogs: MeasurementLog[]
  milestones: Milestone[]
  settings: SettingsRecord[]
  // Photos are intentionally excluded from JSON export (Blobs don't serialize to JSON safely);
  // photo backup is handled separately as a zip in the Settings feature (Task 21).
}

export async function exportData(): Promise<BackupBundle> {
  const [profile, dailyLogs, cycleLog, workoutLogs, measurementLogs, milestones, settings] = await Promise.all([
    db.profile.toArray(),
    db.dailyLogs.toArray(),
    db.cycleLog.toArray(),
    db.workoutLogs.toArray(),
    db.measurementLogs.toArray(),
    db.milestones.toArray(),
    db.settings.toArray(),
  ])
  return { version: 1, exportedAt: new Date().toISOString(), profile, dailyLogs, cycleLog, workoutLogs, measurementLogs, milestones, settings }
}

/**
 * Restores a backup with REPLACE semantics: each table is cleared before the backup's
 * rows are written back, so restoring never merges with (or can be corrupted by id
 * collisions against) data created locally since the backup was taken.
 */
export async function importData(bundle: BackupBundle): Promise<void> {
  if (bundle.version !== 1) {
    throw new Error(`Unsupported backup version: ${bundle.version}. This app can only import version 1 backups.`)
  }
  const requiredArrayFields: (keyof BackupBundle)[] = [
    'profile', 'dailyLogs', 'cycleLog', 'workoutLogs', 'measurementLogs', 'milestones', 'settings',
  ]
  for (const field of requiredArrayFields) {
    if (!Array.isArray(bundle[field])) {
      throw new Error(`Invalid backup file: expected "${field}" to be an array.`)
    }
  }

  await db.transaction('rw', [db.profile, db.dailyLogs, db.cycleLog, db.workoutLogs, db.measurementLogs, db.milestones, db.settings], async () => {
    // Replace semantics: clear each table before restoring, so a backup with
    // auto-increment ids (workoutLogs) can never collide with rows created
    // locally since the backup was taken.
    await db.profile.clear()
    await db.dailyLogs.clear()
    await db.cycleLog.clear()
    await db.workoutLogs.clear()
    await db.measurementLogs.clear()
    await db.milestones.clear()
    await db.settings.clear()

    if (bundle.profile.length) await db.profile.bulkPut(bundle.profile)
    if (bundle.dailyLogs.length) await db.dailyLogs.bulkPut(bundle.dailyLogs)
    if (bundle.cycleLog.length) await db.cycleLog.bulkPut(bundle.cycleLog)
    if (bundle.workoutLogs.length) await db.workoutLogs.bulkPut(bundle.workoutLogs)
    if (bundle.measurementLogs.length) await db.measurementLogs.bulkPut(bundle.measurementLogs)
    if (bundle.milestones.length) await db.milestones.bulkPut(bundle.milestones)
    if (bundle.settings.length) await db.settings.bulkPut(bundle.settings)
  })
}
