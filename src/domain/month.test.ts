import { describe, it, expect } from 'vitest'
import { buildMonthGrid, monthKey, addMonths } from './month'

describe('buildMonthGrid', () => {
  it('covers whole Sunday-first weeks and marks padding days as out-of-month', () => {
    // Sep 2026 starts on a Tuesday and has 30 days.
    const cells = buildMonthGrid('2026-09')
    expect(cells.length % 7).toBe(0)
    expect(cells[0].date).toBe('2026-08-30') // the Sunday before Sep 1
    expect(cells[0].inMonth).toBe(false)
    expect(cells.find((c) => c.date === '2026-09-01')?.inMonth).toBe(true)
    expect(cells.filter((c) => c.inMonth).length).toBe(30)
  })

  it('builds local dates, not UTC-shifted ones', () => {
    const cells = buildMonthGrid('2026-01')
    expect(cells.find((c) => c.dayOfMonth === 1 && c.inMonth)?.date).toBe('2026-01-01')
  })
})

describe('monthKey / addMonths', () => {
  it('extracts and shifts months, wrapping across year boundaries', () => {
    expect(monthKey('2026-09-14')).toBe('2026-09')
    expect(addMonths('2026-12', 1)).toBe('2027-01')
    expect(addMonths('2026-01', -1)).toBe('2025-12')
  })
})
