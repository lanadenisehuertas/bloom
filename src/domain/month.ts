import { toLocalDateString } from '../lib/localDate'

export interface MonthCell {
  date: string // local YYYY-MM-DD
  dayOfMonth: number
  /** False for the leading/trailing days that pad the grid out to whole weeks. */
  inMonth: boolean
}

/** "2026-09" for the month containing `date`. */
export function monthKey(date: string): string {
  return date.slice(0, 7)
}

export function addMonths(key: string, months: number): string {
  const [y, m] = key.split('-').map(Number)
  const d = new Date(y, m - 1 + months, 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export function formatMonth(key: string): string {
  const [y, m] = key.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })
}

/**
 * Builds a Sunday-first grid of whole weeks covering the given month, padded with
 * the neighbouring months' days so every row has 7 cells.
 */
export function buildMonthGrid(key: string): MonthCell[] {
  const [year, month] = key.split('-').map(Number)
  const first = new Date(year, month - 1, 1)
  const start = new Date(first)
  start.setDate(1 - first.getDay())

  const last = new Date(year, month, 0)
  const end = new Date(last)
  end.setDate(last.getDate() + (6 - last.getDay()))

  const cells: MonthCell[] = []
  const cursor = new Date(start)
  while (cursor <= end) {
    cells.push({
      date: toLocalDateString(cursor),
      dayOfMonth: cursor.getDate(),
      inMonth: cursor.getMonth() === month - 1,
    })
    cursor.setDate(cursor.getDate() + 1)
  }
  return cells
}
