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
