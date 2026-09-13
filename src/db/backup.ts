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

export async function importData(bundle: BackupBundle): Promise<void> {
  await db.transaction('rw', [db.profile, db.dailyLogs, db.cycleLog, db.workoutLogs, db.measurementLogs, db.milestones, db.settings], async () => {
    if (bundle.profile.length) await db.profile.bulkPut(bundle.profile)
    if (bundle.dailyLogs.length) await db.dailyLogs.bulkPut(bundle.dailyLogs)
    if (bundle.cycleLog.length) await db.cycleLog.bulkPut(bundle.cycleLog)
    if (bundle.workoutLogs.length) await db.workoutLogs.bulkPut(bundle.workoutLogs)
    if (bundle.measurementLogs.length) await db.measurementLogs.bulkPut(bundle.measurementLogs)
    if (bundle.milestones.length) await db.milestones.bulkPut(bundle.milestones)
    if (bundle.settings.length) await db.settings.bulkPut(bundle.settings)
  })
}
