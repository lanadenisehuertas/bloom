import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { WorkoutLog } from '../db/schema'

export function useWorkoutLog() {
  const logs = useLiveQuery(() => db.workoutLogs.orderBy('date').reverse().toArray(), []) ?? []

  async function logWorkout(entry: WorkoutLog) {
    await db.workoutLogs.add(entry)
  }

  return { logs, logWorkout }
}
