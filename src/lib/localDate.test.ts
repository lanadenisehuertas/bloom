import { describe, it, expect, vi, afterEach } from 'vitest'
import { todayLocalDate, toLocalDateString } from './localDate'

describe('toLocalDateString', () => {
  it('zero-pads month and day', () => {
    expect(toLocalDateString(new Date(2026, 0, 5))).toBe('2026-01-05')
  })

  it('does not roll over to UTC — a late-night local time stays on its own local date', () => {
    // 11:30pm local time should still report as the SAME calendar date locally,
    // regardless of what UTC date that instant falls on.
    const lateNight = new Date(2026, 8, 14, 23, 30)
    expect(toLocalDateString(lateNight)).toBe('2026-09-14')
  })
})

describe('todayLocalDate', () => {
  afterEach(() => vi.useRealTimers())

  it('matches the locally-constructed date for "now"', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date(2026, 8, 14, 1, 15)) // 1:15am local
    expect(todayLocalDate()).toBe('2026-09-14')
  })
})
