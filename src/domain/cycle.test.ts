import { describe, it, expect } from 'vitest'
import {
  detectPhase,
  currentCycleDay,
  learnAvgCycleLength,
  learnAvgPeriodLength,
  projectCyclePhase,
  groupPeriodRuns,
  derivePeriodStartDates,
} from './cycle'

describe('detectPhase', () => {
  it('classifies each phase per the spec boundaries (28-day default)', () => {
    expect(detectPhase(1, 28)).toBe('menstrual')
    expect(detectPhase(5, 28)).toBe('menstrual')
    expect(detectPhase(6, 28)).toBe('follicular')
    expect(detectPhase(13, 28)).toBe('follicular')
    expect(detectPhase(14, 28)).toBe('ovulation')
    expect(detectPhase(15, 28)).toBe('luteal')
    expect(detectPhase(28, 28)).toBe('luteal')
  })

  it('scales phase boundaries with a non-default cycle length', () => {
    // 35-day cycle: ovulation ≈ day 21 (35-14), not the fixed day-14 default
    expect(detectPhase(20, 35)).toBe('follicular')
    expect(detectPhase(21, 35)).toBe('ovulation')
    expect(detectPhase(22, 35)).toBe('luteal')
  })
})

describe('currentCycleDay', () => {
  it('computes the 1-indexed day since the last period start', () => {
    expect(currentCycleDay('2026-09-01', '2026-09-01')).toBe(1)
    expect(currentCycleDay('2026-09-01', '2026-09-15')).toBe(15)
  })
})

describe('projectCyclePhase', () => {
  const start = '2026-09-01'

  it('matches detectPhase for a date within the current cycle', () => {
    expect(projectCyclePhase(start, '2026-09-01', 28)).toBe('menstrual')
    expect(projectCyclePhase(start, '2026-09-15', 28)).toBe('luteal')
  })

  it('wraps into a new cycle instead of miscounting as an impossibly long luteal phase', () => {
    // 28 days after the period start is day 29 raw -> wraps to day 1 of the NEXT
    // cycle, i.e. the next predicted period, not "still luteal".
    expect(projectCyclePhase(start, '2026-09-29', 28)).toBe('menstrual')
    // 34 days after start (day 35 raw) -> wraps to day 7 of the next cycle -> follicular.
    expect(projectCyclePhase(start, '2026-10-05', 28)).toBe('follicular')
  })
})

describe('learnAvgCycleLength', () => {
  it('falls back to 28 with fewer than 2 logged periods', () => {
    expect(learnAvgCycleLength(['2026-08-01'])).toBe(28)
    expect(learnAvgCycleLength([])).toBe(28)
  })

  it('averages the gaps between consecutive period start dates', () => {
    expect(learnAvgCycleLength(['2026-07-01', '2026-07-29', '2026-08-27'])).toBe(28.5)
  })
})

describe('groupPeriodRuns', () => {
  it('groups contiguous logged days into one run per period', () => {
    const runs = groupPeriodRuns([
      '2026-09-01', '2026-09-02', '2026-09-03',
      '2026-09-29', '2026-09-30',
    ])
    expect(runs).toEqual([
      ['2026-09-01', '2026-09-02', '2026-09-03'],
      ['2026-09-29', '2026-09-30'],
    ])
  })

  it('handles unsorted input and ignores duplicate taps of the same day', () => {
    expect(groupPeriodRuns(['2026-09-02', '2026-09-01', '2026-09-02'])).toEqual([
      ['2026-09-01', '2026-09-02'],
    ])
  })

  it('spans a month boundary as one run rather than splitting it', () => {
    expect(groupPeriodRuns(['2026-09-30', '2026-10-01'])).toEqual([
      ['2026-09-30', '2026-10-01'],
    ])
  })

  it('returns nothing when no days are logged', () => {
    expect(groupPeriodRuns([])).toEqual([])
  })
})

describe('derivePeriodStartDates', () => {
  it('takes the first day of each run, so cycle math works off tapped days', () => {
    expect(
      derivePeriodStartDates(['2026-09-02', '2026-09-01', '2026-09-29', '2026-09-30'])
    ).toEqual(['2026-09-01', '2026-09-29'])
  })
})

describe('learnAvgPeriodLength', () => {
  it('defaults to 5 when nothing has been logged', () => {
    expect(learnAvgPeriodLength([])).toBe(5)
  })

  it('averages the length of completed runs', () => {
    // A 4-day period and a 6-day period -> 5.
    const days = [
      '2026-07-01', '2026-07-02', '2026-07-03', '2026-07-04',
      '2026-08-01', '2026-08-02', '2026-08-03', '2026-08-04', '2026-08-05', '2026-08-06',
    ]
    expect(learnAvgPeriodLength(days)).toBe(5)
  })

  it('ignores a run still in progress so day 1 of a period does not skew the average', () => {
    const days = [
      '2026-06-01', '2026-06-02', '2026-06-03', '2026-06-04', '2026-06-05', '2026-06-06',
      '2026-07-01', '2026-07-02', '2026-07-03', '2026-07-04', '2026-07-05', '2026-07-06',
      '2026-08-01', // logged today, period still ongoing
    ]
    expect(learnAvgPeriodLength(days, '2026-08-01')).toBe(6)
  })

  it('holds the default until 2 completed runs exist, even for one fully-logged period', () => {
    // A single complete 3-day run is too little evidence to declare "your period
    // is 3 days" and start calling day 4 "follicular" — same caution learnAvgCycleLength
    // applies to cycle length with fewer than 2 logged starts.
    const days = ['2026-07-01', '2026-07-02', '2026-07-03']
    expect(learnAvgPeriodLength(days)).toBe(5)
  })
})

describe('detectPhase with a learned period length', () => {
  it('keeps a longer real period in the menstrual phase instead of pushing harder on day 6', () => {
    expect(detectPhase(6, 28, 7)).toBe('menstrual')
    expect(detectPhase(7, 28, 7)).toBe('menstrual')
    expect(detectPhase(8, 28, 7)).toBe('follicular')
  })

  it('ends the menstrual phase early for a shorter real period', () => {
    expect(detectPhase(4, 28, 3)).toBe('follicular')
  })
})
