export type CompletionType = 'full' | 'minimal' | 'skipped'

export interface DayCompletion {
  date: string
  completed: CompletionType
}

/**
 * Walks days most-recent-first; a 'skipped' day consumes a grace day instead of ending
 * the streak. Pure and stateless — recomputes the whole streak from `days` every call,
 * it doesn't remember which day "used" a grace day between calls.
 *
 * Caller contract (not yet enforced by any caller in this codebase — read this before
 * wiring one up):
 *   - `days` must be dense: a calendar day with no logged workout needs an explicit
 *     `{ completed: 'skipped' }` entry, not an absent one. A missing entry is silently
 *     treated as if that day didn't exist, not as a break — it won't consume grace or
 *     end the streak.
 *   - Whatever persists "how many grace days have been used" (e.g. a settings record)
 *     must derive that count the same way this function does (by walking history top
 *     down), not by an independently-incremented counter — otherwise the two can drift
 *     out of sync at a month boundary or after a missed re-render.
 */
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
