const MS_PER_DAY = 24 * 60 * 60 * 1000
const RECALC_INTERVAL_DAYS = 21
const RECALC_WEIGHT_DELTA_KG = 3
const PLATEAU_STDDEV_THRESHOLD_KG = 0.5

export function shouldRecalcTDEE(lastRecalcDate: string, today: string, weightChangeSinceKg: number): boolean {
  const daysElapsed = (new Date(today).getTime() - new Date(lastRecalcDate).getTime()) / MS_PER_DAY
  return daysElapsed >= RECALC_INTERVAL_DAYS || Math.abs(weightChangeSinceKg) >= RECALC_WEIGHT_DELTA_KG
}

function stdDev(values: number[]): number {
  const mean = values.reduce((a, b) => a + b, 0) / values.length
  const variance = values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length
  return Math.sqrt(variance)
}

/**
 * weeklyAverages: the 7-day rolling average weight, one sample per logged day, spanning
 * 2-3 weeks. Returns 'reduceCalories' or 'flagUnderLogging' if flat despite that span of
 * data, otherwise null. Whether adherence was actually logged decides which of the two.
 *
 * CAVEAT (not yet wired to any UI — read this before you do): this is a raw stdDev
 * "flatness" check, not a trend check. It has two known gaps a real caller must guard
 * against:
 *   1. A slow-but-real decline (e.g. -0.15kg/week) has a low stdDev too, and will be
 *      misread as a plateau. Consider also checking the slope/first-half-vs-second-half
 *      trend before treating this as "still not moving."
 *   2. `weeklyAverages.length` is used as a proxy for "spans 2-3 weeks," but nothing
 *      here enforces the samples are actually ~1/week apart — 4 samples 1 day apart
 *      would pass the length check while covering far less real time. Callers must
 *      ensure the array is built from samples that actually span 2-3 weeks (e.g. by
 *      passing dated samples and checking elapsed days) before calling this.
 */
export function checkPlateau(weeklyAverages: number[], adherenceLogged: boolean): 'reduceCalories' | 'flagUnderLogging' | null {
  if (weeklyAverages.length < 4) return null
  const isFlat = stdDev(weeklyAverages) < PLATEAU_STDDEV_THRESHOLD_KG
  if (!isFlat) return null
  return adherenceLogged ? 'reduceCalories' : 'flagUnderLogging'
}

export function checkTooFastLoss(actualWeeklyLossKg: number, safeWeeklyCapKg: number): boolean {
  return actualWeeklyLossKg > safeWeeklyCapKg
}

export function checkMissedWorkouts(missedCountThisWeek: number): boolean {
  return missedCountThisWeek >= 3
}
