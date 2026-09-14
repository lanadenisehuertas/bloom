import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../db'
import { computeStreak } from '../../domain/motivation'
import { checkMissedWorkouts } from '../../domain/adaptiveRecalc'
import { useSettings } from '../../hooks/useSettings'

function startOfWeek(date: string): string {
  const d = new Date(date)
  const day = d.getDay()
  d.setDate(d.getDate() - day)
  return d.toISOString().slice(0, 10)
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
  const missedThisWeek = logs.filter((l) => l.date >= thisWeekStart && l.completed === 'skipped').length
  const downshiftRecommended = checkMissedWorkouts(missedThisWeek)

  return { streak, downshiftRecommended }
}
