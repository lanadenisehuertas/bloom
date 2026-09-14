import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect } from 'react'
import { db } from '../../db'
import { checkMilestones, MilestoneId } from '../../domain/motivation'
import { useProfile } from '../../hooks/useProfile'

const MILESTONE_LABELS: Record<MilestoneId, string> = {
  'first-full-pushup': 'First full push-up!',
  'first-full-week': 'First full week completed!',
  'halfway-to-checkpoint': 'Halfway to your checkpoint!',
}

// Direct check for 7 genuinely consecutive calendar dates with at least one workout log
// each (any completion type). computeStreak is NOT used here: its caller contract requires
// an explicit `{ completed: 'skipped' }` row for every day with no logged workout, but
// nothing in this app ever writes those rows, so a gap of unlogged days between real
// entries is invisible to it -- it would count 7 logged rows spread across weeks as a
// "streak" of 7, which is not what "first full week" means.
function hasSevenConsecutiveLoggedDays(logs: { date: string }[]): boolean {
  const loggedDates = new Set(logs.map((l) => l.date))
  if (loggedDates.size < 7) return false

  const sortedDates = [...loggedDates].sort()
  for (const startDate of sortedDates) {
    let allPresent = true
    const cursor = new Date(startDate)
    for (let i = 0; i < 7; i++) {
      const dateStr = cursor.toISOString().slice(0, 10)
      if (!loggedDates.has(dateStr)) {
        allPresent = false
        break
      }
      cursor.setDate(cursor.getDate() + 1)
    }
    if (allPresent) return true
  }
  return false
}

export function useMilestones() {
  const workoutLogs = useLiveQuery(() => db.workoutLogs.toArray(), []) ?? []
  const dailyLogs = useLiveQuery(() => db.dailyLogs.orderBy('date').toArray(), []) ?? []
  const milestones = useLiveQuery(() => db.milestones.toArray(), []) ?? []
  const { profile } = useProfile()

  const firstFullPushupLogged = workoutLogs.some((log) =>
    log.exercises.some((e) => e.name === 'Push-Up Progression' && e.hitTopOfRange === true)
  )

  // This milestone is "a literal full week", not "a week that survived on grace days" —
  // a distinct question from the app's day-to-day streak (which does use grace days, see
  // useMotivationState.ts). It requires 7 actually-consecutive calendar days each with a
  // logged workout, not merely 7 logged rows with no gap in the array.
  const firstFullWeekCompleted = hasSevenConsecutiveLoggedDays(workoutLogs)

  const currentWeightKg = [...dailyLogs].reverse().find((d) => d.weightKg != null)?.weightKg
  let halfwayToCheckpoint = false
  if (profile && currentWeightKg != null) {
    const target = profile.checkpointWeightKg ?? profile.goalWeightKg
    const start = profile.weightKg
    const totalDelta = target - start
    // Deliberate guard, not an oversight: if the user's target already equals their
    // starting weight (totalDelta === 0), there's no distance to be "halfway" across.
    // They don't get this milestone -- there's currently no separate "reached your
    // goal" milestone to award instead.
    if (totalDelta !== 0) {
      const progressDelta = currentWeightKg - start
      const fractionOfWay = progressDelta / totalDelta
      halfwayToCheckpoint = fractionOfWay >= 0.5
    }
  }

  const alreadyUnlocked = milestones.map((m) => m.id)

  useEffect(() => {
    const newlyUnlocked = checkMilestones({
      firstFullPushupLogged,
      firstFullWeekCompleted,
      halfwayToCheckpoint,
      alreadyUnlocked,
    })
    if (newlyUnlocked.length === 0) return
    const today = new Date().toISOString().slice(0, 10)
    for (const id of newlyUnlocked) {
      void db.milestones.put({ id, unlockedDate: today, label: MILESTONE_LABELS[id] ?? id })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstFullPushupLogged, firstFullWeekCompleted, halfwayToCheckpoint, alreadyUnlocked.join(',')])

  return { milestones }
}
