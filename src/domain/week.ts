import { CyclePhase, projectCyclePhase } from './cycle'
import { getScheduledDay, WorkoutDay } from '../data/workoutProgram'
import { toLocalDateString } from '../lib/localDate'

/** A single day of a browsable week, with everything pre-computed for display. */
export interface WeekDayInfo {
  date: string // local YYYY-MM-DD
  dayOfWeek: number // 0=Sun..6=Sat
  scheduledDay: WorkoutDay
  /** Only set when the user has logged at least one period start date — otherwise
   *  there's no basis to project a phase and the UI should show nothing/neutral. */
  projectedPhase: CyclePhase | null
  isToday: boolean
  isPast: boolean
  /** The actual logged completion for this date, if any (checked against useWorkoutLog). */
  loggedCompletion: 'full' | 'minimal' | 'skipped' | null
}

/**
 * Returns the Sunday that starts the local-calendar week containing `date`,
 * matching WEEKLY_SCHEDULE's convention (0=Sun..6=Sat, see data/workoutProgram.ts).
 */
export function startOfWeek(date: string): string {
  const d = new Date(`${date}T00:00:00`)
  d.setDate(d.getDate() - d.getDay())
  return toLocalDateString(d)
}

/** Shifts a week-start date by a number of weeks (negative goes back). */
export function addWeeks(weekStart: string, weeks: number): string {
  const d = new Date(`${weekStart}T00:00:00`)
  d.setDate(d.getDate() + weeks * 7)
  return toLocalDateString(d)
}

/**
 * Builds the 7 day-cards (Sun-Sat) for the week starting at `weekStart`.
 *
 * The scheduled A/B/C/D/recovery/rest pattern itself never varies week to week
 * (see data/workoutProgram.ts) — what varies, and what this function actually
 * computes fresh each time, is the projected cycle phase for each date (via
 * `projectCyclePhase`, recomputed from the user's real logged period data, never
 * cached/hardcoded) and whether that date was actually logged.
 */
export function buildWeekDays(params: {
  weekStart: string
  today: string
  lastPeriodStartDate?: string
  avgCycleLength?: number
  workoutLogsByDate: Map<string, 'full' | 'minimal' | 'skipped'>
}): WeekDayInfo[] {
  const { weekStart, today, lastPeriodStartDate, avgCycleLength, workoutLogsByDate } = params
  const days: WeekDayInfo[] = []
  const start = new Date(`${weekStart}T00:00:00`)

  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    const date = toLocalDateString(d)
    const dayOfWeek = d.getDay()

    const projectedPhase =
      lastPeriodStartDate != null
        ? projectCyclePhase(lastPeriodStartDate, date, avgCycleLength ?? 28)
        : null

    days.push({
      date,
      dayOfWeek,
      scheduledDay: getScheduledDay(dayOfWeek),
      projectedPhase,
      isToday: date === today,
      isPast: date < today,
      loggedCompletion: workoutLogsByDate.get(date) ?? null,
    })
  }

  return days
}
