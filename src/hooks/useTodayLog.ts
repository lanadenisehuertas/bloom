import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { DailyLog } from '../db/schema'

function todayIso() {
  return new Date().toISOString().slice(0, 10)
}

export function useTodayLog() {
  const date = todayIso()
  const log = useLiveQuery(() => db.dailyLogs.get(date), [date])

  async function updateToday(patch: Partial<DailyLog>) {
    const existing = await db.dailyLogs.get(date)
    await db.dailyLogs.put({ date, waterCount: 0, mealsLogged: [], ...existing, ...patch })
  }

  return { date, log, updateToday }
}
