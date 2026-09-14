import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { currentCycleDay, detectPhase, learnAvgCycleLength } from '../domain/cycle'

export function useCycle() {
  const cycleLog = useLiveQuery(() => db.cycleLog.get('default'), [])

  async function logPeriodStart(date: string) {
    const existing = cycleLog ?? { id: 'default' as const, periodStartDates: [], avgCycleLength: 28, symptomsByDate: {} }
    const periodStartDates = [...existing.periodStartDates, date].sort()
    const avgCycleLength = learnAvgCycleLength(periodStartDates)
    await db.cycleLog.put({ ...existing, periodStartDates, avgCycleLength })
  }

  const lastPeriodStart = cycleLog?.periodStartDates[cycleLog.periodStartDates.length - 1]
  const today = new Date().toISOString().slice(0, 10)
  const cycleDay = lastPeriodStart ? currentCycleDay(lastPeriodStart, today) : undefined
  const phase = cycleDay ? detectPhase(cycleDay, cycleLog?.avgCycleLength ?? 28) : undefined

  return { cycleLog, cycleDay, phase, logPeriodStart }
}
