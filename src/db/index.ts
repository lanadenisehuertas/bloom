import Dexie, { Table } from 'dexie'
import {
  Profile,
  DailyLog,
  CycleLog,
  WorkoutLog,
  MeasurementLog,
  PhotoLog,
  Milestone,
  SettingsRecord,
} from './schema'

export class BloomDB extends Dexie {
  profile!: Table<Profile, string>
  dailyLogs!: Table<DailyLog, string>
  cycleLog!: Table<CycleLog, string>
  workoutLogs!: Table<WorkoutLog, number>
  measurementLogs!: Table<MeasurementLog, string>
  photoLogs!: Table<PhotoLog, number>
  milestones!: Table<Milestone, string>
  settings!: Table<SettingsRecord, string>

  constructor() {
    super('bloom-db')
    this.version(1).stores({
      profile: 'id',
      dailyLogs: 'date',
      cycleLog: 'id',
      workoutLogs: '++id, date',
      measurementLogs: 'date',
      photoLogs: '++id, date',
      milestones: 'id',
      settings: 'id',
    })
  }
}

export const db = new BloomDB()
