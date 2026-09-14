import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { hasRecentJointPain, hasLowRecentEnergy } from '../domain/wellbeing'

const LOOKBACK_DAYS = 7

/**
 * `dailyLogs.date` (see `useTodayLog`) is keyed with `new Date().toISOString().slice(0,10)`
 * — UTC, not local time. This cutoff has to use the exact same convention, or the
 * boundary of "last 7 days" would silently be off by up to a day against the table
 * it's actually querying. New tables (e.g. `foodLogs`) use the corrected local-date
 * helper instead; this one has to match what `dailyLogs` already does.
 */
function utcCutoffDate(daysAgo: number): string {
  const d = new Date()
  d.setUTCDate(d.getUTCDate() - daysAgo)
  return d.toISOString().slice(0, 10)
}

/** Reads the last week's Weekly Check-in answers and turns them into flags other
 *  screens actually react to (see domain/wellbeing.ts for why each threshold
 *  is what it is). */
export function useWellbeingState() {
  const cutoff = utcCutoffDate(LOOKBACK_DAYS)

  const recentLogs =
    useLiveQuery(() => db.dailyLogs.where('date').aboveOrEqual(cutoff).toArray(), [cutoff]) ?? []

  return {
    jointPainFlagged: hasRecentJointPain(recentLogs),
    lowEnergyFlagged: hasLowRecentEnergy(recentLogs),
  }
}
