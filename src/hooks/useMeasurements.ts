import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { MeasurementLog } from '../db/schema'

export function useMeasurements() {
  const measurements = useLiveQuery(() => db.measurementLogs.orderBy('date').toArray(), []) ?? []

  async function logMeasurement(entry: MeasurementLog) {
    await db.measurementLogs.put(entry)
  }

  return { measurements, logMeasurement }
}
