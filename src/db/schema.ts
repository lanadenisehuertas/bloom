export type ActivityLevel = 'sedentary' | 'lightlyActive' | 'active' | 'veryActive'

export interface Profile {
  id: 'default'
  heightCm: number
  weightKg: number
  age: number
  activityLevel: ActivityLevel
  goalWeightKg: number
  goalDate: string // ISO date
  checkpointWeightKg?: number
  checkpointDate?: string
  equipment: string[]
  injuryNotes: string
  createdAt?: string
}

export interface DailyLog {
  date: string // ISO date, primary key
  weightKg?: number
  waterCount: number
  mealsLogged: string[]
  workoutCompletedId?: string
  completionType?: 'full' | 'minimal' | 'skipped'
  energyRating?: number
  motivationRating?: number
  jointPain?: boolean
  cycleDay?: number
}

export interface CycleLog {
  id: 'default'
  periodStartDates: string[]
  avgCycleLength: number
  symptomsByDate: Record<string, string[]>
}

export interface WorkoutLogExercise {
  name: string
  sets: number
  reps: number
  weightKg?: number
}

export interface WorkoutLog {
  id?: number
  date: string
  workoutDayId: string
  exercises: WorkoutLogExercise[]
  completed: 'full' | 'minimal' | 'skipped'
}

export interface MeasurementLog {
  date: string
  waistCm: number
  hipsCm: number
  upperArmCm: number
  thighCm: number
}

export interface PhotoLog {
  id?: number
  date: string
  frontPhotoBlob?: Blob
  sidePhotoBlob?: Blob
  backPhotoBlob?: Blob
}

export interface Milestone {
  id: string
  unlockedDate: string
  label: string
}

export interface SettingsRecord {
  id: 'default'
  lastRecalcDate: string
  currentCalorieTarget: number
  currentProteinTarget: number
  streakCount: number
  graceDaysAvailable: number
  graceDaysUsedThisMonth: number
}
