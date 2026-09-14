import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect } from 'react'
import { db } from '../../db'
import { checkMilestones, computeStreak } from '../../domain/motivation'
import { useProfile } from '../../hooks/useProfile'

const MILESTONE_LABELS: Record<string, string> = {
  'first-full-pushup': 'First full push-up!',
  'first-full-week': 'First full week completed!',
  'halfway-to-checkpoint': 'Halfway to your checkpoint!',
}

export function useMilestones() {
  const workoutLogs = useLiveQuery(() => db.workoutLogs.toArray(), []) ?? []
  const dailyLogs = useLiveQuery(() => db.dailyLogs.orderBy('date').toArray(), []) ?? []
  const milestones = useLiveQuery(() => db.milestones.toArray(), []) ?? []
  const { profile } = useProfile()

  const firstFullPushupLogged = workoutLogs.some((log) =>
    log.exercises.some((e) => e.name === 'Push-Up Progression' && e.hitTopOfRange === true)
  )

  // Use 0 grace days here: this milestone is "a literal full week", not "a week that
  // survived on grace days" — a distinct question from the app's day-to-day streak
  // (which does use grace days, see useMotivationState.ts).
  const firstFullWeekCompleted =
    computeStreak(
      workoutLogs.map((l) => ({ date: l.date, completed: l.completed })),
      0
    ) >= 7

  const currentWeightKg = [...dailyLogs].reverse().find((d) => d.weightKg != null)?.weightKg
  let halfwayToCheckpoint = false
  if (profile && currentWeightKg != null) {
    const target = profile.checkpointWeightKg ?? profile.goalWeightKg
    const start = profile.weightKg
    const totalDelta = target - start
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
