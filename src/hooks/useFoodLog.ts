import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { FoodLogEntry } from '../db/schema'
import { todayLocalDate } from '../lib/localDate'
import { computeDailyTotals } from '../domain/calories'

export interface LogFoodInput {
  slot: FoodLogEntry['slot']
  foodId?: string
  name: string
  servingLabel: string
  quantity: number
  kcal: number
  proteinG: number
}

/** Food log for a specific date (defaults to today) — used by the Nutrition
 *  screen for "today" and can be reused for a history/detail view later. */
export function useFoodLog(date: string = todayLocalDate()) {
  const entries = useLiveQuery(() => db.foodLogs.where('date').equals(date).sortBy('loggedAt'), [date]) ?? []
  const totals = computeDailyTotals(entries)

  async function logFood(input: LogFoodInput) {
    const entry: FoodLogEntry = {
      date,
      loggedAt: new Date().toISOString(),
      ...input,
    }
    await db.foodLogs.add(entry)
  }

  /** Re-logs a past entry as-is (today, right now) — the "log again" pattern
   *  research flagged as one of the highest-leverage low-friction features. */
  async function logAgain(entry: FoodLogEntry) {
    await logFood({
      slot: entry.slot,
      foodId: entry.foodId,
      name: entry.name,
      servingLabel: entry.servingLabel,
      quantity: entry.quantity,
      kcal: entry.kcal,
      proteinG: entry.proteinG,
    })
  }

  async function removeEntry(id: number) {
    await db.foodLogs.delete(id)
  }

  return { date, entries, totals, logFood, logAgain, removeEntry }
}

/**
 * Most-frequently-logged foods across ALL history (not just today), for the
 * "recents" quick-add grid — real intake is a small repeated set, so
 * defaulting to "what she actually eats" beats a cold search box every time.
 */
export function useFrequentFoods(limit = 12) {
  const allEntries = useLiveQuery(() => db.foodLogs.toArray(), []) ?? []

  const countByKey = new Map<string, { entry: FoodLogEntry; count: number }>()
  for (const entry of allEntries) {
    const key = `${entry.name}::${entry.servingLabel}`
    const existing = countByKey.get(key)
    if (existing) {
      existing.count += 1
    } else {
      countByKey.set(key, { entry, count: 1 })
    }
  }

  const frequent = [...countByKey.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
    .map((x) => x.entry)

  return frequent
}
