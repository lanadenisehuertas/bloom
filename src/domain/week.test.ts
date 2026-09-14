import { describe, it, expect } from 'vitest'
import { startOfWeek, addWeeks, buildWeekDays } from './week'

describe('startOfWeek', () => {
  it('returns the Sunday of the week containing the given date', () => {
    // 2026-09-14 is a Monday -> the week's Sunday is 2026-09-13.
    expect(startOfWeek('2026-09-14')).toBe('2026-09-13')
    // A Sunday itself is its own week start.
    expect(startOfWeek('2026-09-13')).toBe('2026-09-13')
    // 2026-09-19 is a Saturday -> same week, Sunday 2026-09-13.
    expect(startOfWeek('2026-09-19')).toBe('2026-09-13')
  })
})

describe('addWeeks', () => {
  it('shifts a week-start date forward and backward by whole weeks', () => {
    expect(addWeeks('2026-09-13', 1)).toBe('2026-09-20')
    expect(addWeeks('2026-09-13', -1)).toBe('2026-09-06')
    expect(addWeeks('2026-09-13', 0)).toBe('2026-09-13')
  })
})

describe('buildWeekDays', () => {
  const weekStart = '2026-09-13' // Sunday

  it('builds 7 days Sun-Sat with the fixed weekly schedule attached', () => {
    const days = buildWeekDays({
      weekStart,
      today: '2026-09-14',
      workoutLogsByDate: new Map(),
    })
    expect(days).toHaveLength(7)
    expect(days.map((d) => d.date)).toEqual([
      '2026-09-13', '2026-09-14', '2026-09-15', '2026-09-16',
      '2026-09-17', '2026-09-18', '2026-09-19',
    ])
    // Matches WEEKLY_SCHEDULE: Sun=rest, Mon=A, Tue=recovery, Wed=B, Thu=C, Fri=recovery, Sat=D
    expect(days[0].scheduledDay.id).toBe('rest')
    expect(days[1].scheduledDay.id).toBe('A')
    expect(days[6].scheduledDay.id).toBe('D')
  })

  it('marks exactly one day as today and flags earlier days as past', () => {
    const days = buildWeekDays({
      weekStart,
      today: '2026-09-15',
      workoutLogsByDate: new Map(),
    })
    expect(days.filter((d) => d.isToday)).toHaveLength(1)
    expect(days.find((d) => d.date === '2026-09-15')?.isToday).toBe(true)
    expect(days.find((d) => d.date === '2026-09-13')?.isPast).toBe(true)
    expect(days.find((d) => d.date === '2026-09-16')?.isPast).toBe(false)
  })

  it('leaves projectedPhase null when no period has ever been logged', () => {
    const days = buildWeekDays({
      weekStart,
      today: '2026-09-14',
      workoutLogsByDate: new Map(),
    })
    expect(days.every((d) => d.projectedPhase === null)).toBe(true)
  })

  it('projects the cycle phase per day from the logged period start, wraparound included', () => {
    // Last period started 2026-09-01, 28-day cycle. Hand-computed via detectPhase:
    // day 13 (09-13) -> cycleDay 13 -> follicular; day 14 (09-14) -> cycleDay 14 -> ovulation;
    // day 15 (09-15) -> cycleDay 15 -> luteal.
    const days = buildWeekDays({
      weekStart,
      today: '2026-09-14',
      lastPeriodStartDate: '2026-09-01',
      avgCycleLength: 28,
      workoutLogsByDate: new Map(),
    })
    expect(days.find((d) => d.date === '2026-09-13')?.projectedPhase).toBe('follicular')
    expect(days.find((d) => d.date === '2026-09-14')?.projectedPhase).toBe('ovulation')
    expect(days.find((d) => d.date === '2026-09-15')?.projectedPhase).toBe('luteal')
  })

  it('attaches the logged completion for a date when one exists, and null otherwise', () => {
    const workoutLogsByDate = new Map<string, 'full' | 'minimal' | 'skipped'>([
      ['2026-09-14', 'full'],
    ])
    const days = buildWeekDays({
      weekStart,
      today: '2026-09-16',
      workoutLogsByDate,
    })
    expect(days.find((d) => d.date === '2026-09-14')?.loggedCompletion).toBe('full')
    expect(days.find((d) => d.date === '2026-09-15')?.loggedCompletion).toBeNull()
  })
})
