/**
 * Turns the Weekly Check-in's answers (energy, motivation, joint pain) into
 * real behaviour elsewhere in the app, instead of numbers that sit in
 * `dailyLogs` and are never read again. Both functions take plain log slices
 * so they stay pure and easy to test — callers decide what "recent" means
 * (currently: the last 7 daily logs).
 */

export interface JointPainSample {
  jointPain?: boolean
}

/** True if joint pain was flagged on any of the given (recent) days. */
export function hasRecentJointPain(recentLogs: JointPainSample[]): boolean {
  return recentLogs.some((l) => l.jointPain === true)
}

export interface EnergySample {
  energyRating?: number
  motivationRating?: number
}

const LOW_ENERGY_THRESHOLD = 2

/**
 * True if the average of all logged energy/motivation ratings across the given
 * (recent) days is at or below the low-energy threshold (1-5 scale). Returns
 * false — not "low energy" — when nothing has been rated yet, since silence
 * isn't evidence of a rough week.
 */
export function hasLowRecentEnergy(recentLogs: EnergySample[]): boolean {
  const ratings: number[] = []
  for (const log of recentLogs) {
    if (log.energyRating !== undefined) ratings.push(log.energyRating)
    if (log.motivationRating !== undefined) ratings.push(log.motivationRating)
  }
  if (ratings.length === 0) return false
  const avg = ratings.reduce((a, b) => a + b, 0) / ratings.length
  return avg <= LOW_ENERGY_THRESHOLD
}
