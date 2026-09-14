import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../db'
import { computeStreak } from '../../domain/motivation'
import { checkMissedWorkouts } from '../../domain/adaptiveRecalc'
import { getScheduledDay } from '../../data/workoutProgram'
import { useSettings } from '../../hooks/useSettings'

const REAL_WORKOUT_DAY_IDS = new Set(['A', 'B', 'C', 'D'])

function startOfWeek(date: string): string {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() - day)
  return d.toISOString().slice(0, 10)
}

function datesBetween(start: string, endExclusive: string): string[] {
  const dates: string[] = []
  const cursor = new Date(start)
  const end = new Date(endExclusive)
  while (cursor < end) {
    dates.push(cursor.toISOString().slice(0, 10))
    cursor.setDate(cursor.getDate() + 1)
  }
  return dates
}

export function useMotivationState() {
  const logs = useLiveQuery(() => db.workoutLogs.toArray(), []) ?? []
  const { settings } = useSettings()

  // computeStreak's contract (see src/domain/motivation.ts) requires that whatever
  // tracks "grace days used" derive that count the same way computeStreak itself does
  // (by walking history top-down), not from an independently-incremented counter, or
  // the two drift out of sync. `settings.graceDaysUsedThisMonth` is never incremented
  // anywhere in this codebase, so `graceDaysAvailable - graceDaysUsedThisMonth` is
  // always just `graceDaysAvailable` today. That's consistent (both read as "nothing
  // spent yet") but only because nothing spends it — a future settings-writer that
  // increments graceDaysUsedThisMonth independently of this walk would violate the
  // contract and desync the two counts.
  const streak = computeStreak(
    logs.map((l) => ({ date: l.date, completed: l.completed })),
    settings.graceDaysAvailable - settings.graceDaysUsedThisMonth
  )

  const today = new Date().toISOString().slice(0, 10)
  const thisWeekStart = startOfWeek(today)
  const loggedDates = new Set(logs.map((l) => l.date))

  // "Missed" is derived from the schedule vs. what's actually logged, rather than
  // from an explicit 'skipped' marker — nothing in this app's write path (see
  // useWorkoutLog.ts's logWorkout, the only writer) ever produces a 'skipped' row.
  // A day the user simply never opens the app leaves no row at all, so we detect
  // that absence directly: for each past day this week that was scheduled as a
  // real workout (A/B/C/D, not recovery/rest), no logged entry means it was missed.
  const missedThisWeek = datesBetween(thisWeekStart, today).filter((date) => {
    const dayOfWeek = new Date(date).getDay()
    const scheduledDay = getScheduledDay(dayOfWeek)
    return REAL_WORKOUT_DAY_IDS.has(scheduledDay.id) && !loggedDates.has(date)
  }).length

  const downshiftRecommended = checkMissedWorkouts(missedThisWeek)

  return { streak, downshiftRecommended }
}
