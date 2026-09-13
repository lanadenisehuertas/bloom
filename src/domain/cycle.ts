export type CyclePhase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal'

const MS_PER_DAY = 24 * 60 * 60 * 1000

export function detectPhase(cycleDay: number, cycleLength: number = 28): CyclePhase {
  // cycleLength is accepted for API symmetry with the rest of the domain (and future
  // per-user-length phase boundaries) but the spec's boundaries are fixed day counts.
  void cycleLength
  if (cycleDay <= 5) return 'menstrual'
  if (cycleDay <= 13) return 'follicular'
  if (cycleDay === 14) return 'ovulation'
  return 'luteal'
}

export function currentCycleDay(lastPeriodStartDate: string, today: string): number {
  const start = new Date(lastPeriodStartDate).getTime()
  const now = new Date(today).getTime()
  return Math.floor((now - start) / MS_PER_DAY) + 1
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
