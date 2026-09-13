export type CompletionType = 'full' | 'minimal' | 'skipped'

export interface DayCompletion {
  date: string
  completed: CompletionType
}

/** Walks days most-recent-first; a 'skipped' day consumes a grace day instead of ending the streak. */
export function computeStreak(days: DayCompletion[], graceDaysAvailable: number): number {
  const sorted = [...days].sort((a, b) => (a.date < b.date ? 1 : -1))
  let streak = 0
  let graceRemaining = graceDaysAvailable
  for (const day of sorted) {
    if (day.completed === 'full' || day.completed === 'minimal') {
      streak++
      continue
    }
    if (graceRemaining > 0) {
      graceRemaining--
      streak++
      continue
    }
    break
  }
  return streak
}

export interface MilestoneContext {
  firstFullPushupLogged: boolean
  firstFullWeekCompleted: boolean
  halfwayToCheckpoint: boolean
  alreadyUnlocked: string[]
}

export function checkMilestones(ctx: MilestoneContext): string[] {
  const candidates: [boolean, string][] = [
    [ctx.firstFullPushupLogged, 'first-full-pushup'],
    [ctx.firstFullWeekCompleted, 'first-full-week'],
    [ctx.halfwayToCheckpoint, 'halfway-to-checkpoint'],
  ]
  return candidates
    .filter(([met, id]) => met && !ctx.alreadyUnlocked.includes(id))
    .map(([, id]) => id)
}
