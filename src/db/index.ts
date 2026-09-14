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
  CustomFood,
  FoodLogEntry,
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
  customFoods!: Table<CustomFood, number>
  foodLogs!: Table<FoodLogEntry, number>

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
    // v2: adds calorie/food logging. Existing v1 tables/data are untouched —
    // Dexie only needs the new tables listed for a version bump that purely adds.
    this.version(2).stores({
      customFoods: '++id, name',
      foodLogs: '++id, date, [date+slot]',
    })
  }
}

export const db = new BloomDB()
