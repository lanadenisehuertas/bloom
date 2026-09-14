export type CyclePhase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal'

const MS_PER_DAY = 24 * 60 * 60 * 1000

export const DEFAULT_PERIOD_LENGTH = 5

export function detectPhase(
  cycleDay: number,
  cycleLength: number = 28,
  periodLength: number = DEFAULT_PERIOD_LENGTH
): CyclePhase {
  // Luteal-phase length is relatively constant (~14 days) across different cycle
  // lengths, while the follicular phase is what varies, so ovulation day scales
  // with the actual cycle length instead of being a fixed day count.
  const ovulationDay = cycleLength - 14
  // Menstrual runs as long as she actually bleeds, learned from her logged period
  // days — a 7-day period shouldn't be told it's "follicular, push harder" on day 6.
  if (cycleDay <= periodLength) return 'menstrual'
  if (cycleDay < ovulationDay) return 'follicular'
  if (cycleDay === ovulationDay) return 'ovulation'
  return 'luteal'
}

export function currentCycleDay(lastPeriodStartDate: string, today: string): number {
  const start = new Date(lastPeriodStartDate).getTime()
  const now = new Date(today).getTime()
  return Math.floor((now - start) / MS_PER_DAY) + 1
}

/**
 * Projects which phase a FUTURE date will fall in, given the last known period
 * start and the learned average cycle length. Used by the weekly/dashboard
 * preview — it's explicitly a projection (best guess from history), not a
 * measurement, and always adjusts as newer period-start data comes in since it's
 * recomputed from `avgCycleLength`/`periodStartDates` each time, never cached.
 *
 * `currentCycleDay` returns a raw day count that isn't bounded to one cycle
 * (e.g. day 30 of a 28-day cycle), so this wraps it back into range before
 * calling `detectPhase` — otherwise a date far enough out would be miscounted
 * as an impossibly long luteal phase instead of wrapping to the next period.
 */
export function projectCyclePhase(
  lastPeriodStartDate: string,
  targetDate: string,
  avgCycleLength: number,
  avgPeriodLength: number = DEFAULT_PERIOD_LENGTH
): CyclePhase {
  const rawDay = currentCycleDay(lastPeriodStartDate, targetDate)
  const wrappedDay = ((((rawDay - 1) % avgCycleLength) + avgCycleLength) % avgCycleLength) + 1
  return detectPhase(wrappedDay, avgCycleLength, avgPeriodLength)
}

/**
 * Groups individually-logged bleed days into contiguous runs (one run = one period).
 * This is what lets the Cycle tab be a tap-the-day tracker rather than a
 * "type your start date" form: she marks the days she actually bleeds, and the
 * cycle boundaries fall out of the data instead of being declared up front.
 */
export function groupPeriodRuns(periodDays: string[]): string[][] {
  if (periodDays.length === 0) return []
  const sorted = [...new Set(periodDays)].sort()
  const runs: string[][] = [[sorted[0]]]

  for (let i = 1; i < sorted.length; i++) {
    const prev = new Date(`${sorted[i - 1]}T00:00:00`).getTime()
    const curr = new Date(`${sorted[i]}T00:00:00`).getTime()
    const isNextDay = Math.round((curr - prev) / MS_PER_DAY) === 1
    if (isNextDay) runs[runs.length - 1].push(sorted[i])
    else runs.push([sorted[i]])
  }

  return runs
}

/** The first day of each contiguous run — i.e. the start date of each period. */
export function derivePeriodStartDates(periodDays: string[]): string[] {
  return groupPeriodRuns(periodDays).map((run) => run[0])
}

/**
 * Her real average period length, learned from logged runs. The most recent run is
 * excluded when it may still be in progress (i.e. it includes today), so a period
 * logged on its first day doesn't drag the average down to 1. Mirrors
 * `learnAvgCycleLength`'s own caution: at least 2 completed runs are required before
 * trusting the learned value at all — a single logged day (retroactive or not) is
 * too little evidence to declare "your period is 1 day" and reclassify tomorrow as
 * follicular; it takes the default until a real pattern has actually been observed.
 */
export function learnAvgPeriodLength(periodDays: string[], today?: string): number {
  const runs = groupPeriodRuns(periodDays)
  const complete = today ? runs.filter((run) => !run.includes(today)) : runs
  if (complete.length < 2) return DEFAULT_PERIOD_LENGTH
  const total = complete.reduce((sum, run) => sum + run.length, 0)
  return Math.round(total / complete.length)
}

export function learnAvgCycleLength(periodStartDates: string[]): number {
  if (periodStartDates.length < 2) return 28
  const sorted = [...periodStartDates].sort()
  const gaps: number[] = []
  for (let i = 1; i < sorted.length; i++) {
    const gap = (new Date(sorted[i]).getTime() - new Date(sorted[i - 1]).getTime()) / MS_PER_DAY
    gaps.push(gap)
  }
  return gaps.reduce((a, b) => a + b, 0) / gaps.length
}
