import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { CycleLog } from '../db/schema'
import {
  currentCycleDay,
  detectPhase,
  learnAvgCycleLength,
  learnAvgPeriodLength,
  derivePeriodStartDates,
  CyclePhase,
  DEFAULT_PERIOD_LENGTH,
} from '../domain/cycle'
import { todayLocalDate } from '../lib/localDate'

const EMPTY: CycleLog = {
  id: 'default',
  periodStartDates: [],
  periodDays: [],
  avgCycleLength: 28,
  avgPeriodLength: DEFAULT_PERIOD_LENGTH,
  symptomsByDate: {},
}

/**
 * Recomputes every derived cycle value from the raw logged days, so a single
 * tap on the calendar flows all the way through to the workout plan: period days
 * -> period starts -> avg cycle/period length -> cycle day -> phase -> the
 * cycle-phase modifiers the Workout Player and Week view apply.
 */
function recompute(log: CycleLog, periodDays: string[], today: string): CycleLog {
  const periodStartDates = derivePeriodStartDates(periodDays)
  return {
    ...log,
    periodDays,
    periodStartDates,
    avgCycleLength: learnAvgCycleLength(periodStartDates),
    avgPeriodLength: learnAvgPeriodLength(periodDays, today),
  }
}

export function useCycle() {
  const cycleLog = useLiveQuery(() => db.cycleLog.get('default'), [])

  // Records written before day-level logging existed only have start dates; treat
  // each as a single logged day so nothing is lost when she next taps the calendar.
  const periodDays = cycleLog?.periodDays ?? cycleLog?.periodStartDates ?? []

  async function setPeriodDays(next: string[]) {
    const base = cycleLog ?? EMPTY
    await db.cycleLog.put(recompute(base, [...new Set(next)].sort(), todayLocalDate()))
  }

  /** Marks or unmarks a single day as a bleed day. */
  async function togglePeriodDay(date: string) {
    const next = periodDays.includes(date)
      ? periodDays.filter((d) => d !== date)
      : [...periodDays, date]
    await setPeriodDays(next)
  }

  /** Kept for the "log a start date" entry point, now expressed as day logging. */
  async function logPeriodStart(date: string) {
    if (periodDays.includes(date)) return
    await setPeriodDays([...periodDays, date])
  }

  async function setSymptoms(date: string, symptoms: string[]) {
    const base = cycleLog ?? EMPTY
    const symptomsByDate = { ...base.symptomsByDate }
    if (symptoms.length > 0) symptomsByDate[date] = symptoms
    else delete symptomsByDate[date]
    await db.cycleLog.put({ ...base, periodDays, symptomsByDate })
  }

  async function setPhaseOverride(phase: CyclePhase | null) {
    const base = cycleLog ?? EMPTY
    await db.cycleLog.put({
      ...base,
      periodDays,
      phaseOverride: phase ? { date: todayLocalDate(), phase } : undefined,
    })
  }

  const lastPeriodStart = cycleLog?.periodStartDates[cycleLog.periodStartDates.length - 1]
  const today = todayLocalDate()
  const avgCycleLength = cycleLog?.avgCycleLength ?? 28
  const avgPeriodLength = cycleLog?.avgPeriodLength ?? DEFAULT_PERIOD_LENGTH

  const cycleDay = lastPeriodStart ? currentCycleDay(lastPeriodStart, today) : undefined
  const detectedPhase = cycleDay
    ? detectPhase(cycleDay, avgCycleLength, avgPeriodLength)
    : undefined

  // An override only stands for the day it was set — the cycle keeps moving, and a
  // stale override silently steering next week's plan would be worse than none.
  const override =
    cycleLog?.phaseOverride?.date === today ? cycleLog.phaseOverride.phase : undefined
  const phase = override ?? detectedPhase

  return {
    cycleLog,
    cycleDay,
    phase,
    detectedPhase,
    isPhaseOverridden: override != null,
    periodDays,
    avgCycleLength,
    avgPeriodLength,
    symptomsByDate: cycleLog?.symptomsByDate ?? {},
    logPeriodStart,
    togglePeriodDay,
    setSymptoms,
    setPhaseOverride,
  }
}
