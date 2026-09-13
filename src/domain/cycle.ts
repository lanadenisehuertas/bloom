export type CyclePhase = 'menstrual' | 'follicular' | 'ovulation' | 'luteal'

const MS_PER_DAY = 24 * 60 * 60 * 1000

export function detectPhase(cycleDay: number, cycleLength: number = 28): CyclePhase {
  // Luteal-phase length is relatively constant (~14 days) across different cycle
  // lengths, while the follicular phase is what varies, so ovulation day scales
  // with the actual cycle length instead of being a fixed day count.
  const ovulationDay = cycleLength - 14
  if (cycleDay <= 5) return 'menstrual'
  if (cycleDay < ovulationDay) return 'follicular'
  if (cycleDay === ovulationDay) return 'ovulation'
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
