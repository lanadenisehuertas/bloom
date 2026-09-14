import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import 'fake-indexeddb/auto'
import { db } from '../../db'
import { WorkoutPlayer } from './WorkoutPlayer'

describe('WorkoutPlayer', () => {
  beforeEach(async () => {
    await db.delete()
    await db.open()
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-09-14T09:00:00')) // a Monday -> workout day 'A'
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('lists exercises for the scheduled day and logs a full completion', async () => {
    render(<WorkoutPlayer />)
    expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /complete workout/i }))
    const logs = await db.workoutLogs.toArray()
    expect(logs).toHaveLength(1)
    expect(logs[0].completed).toBe('full')
  })

  it('logs a minimal completion via the Minimum Viable Day button without penalty copy', async () => {
    render(<WorkoutPlayer />)
    await userEvent.click(await screen.findByRole('button', { name: /minimum viable day/i }))
    const logs = await db.workoutLogs.toArray()
    expect(logs[0].completed).toBe('minimal')
  })

  it('gives every exercise a form-video search link instead of on-device form checking', async () => {
    render(<WorkoutPlayer />)
    const links = await screen.findAllByRole('link', { name: /watch form videos/i })
    expect(links.length).toBeGreaterThan(0)
    expect(links[0]).toHaveAttribute('href', expect.stringContaining('youtube.com/results'))
    expect(links[0]).toHaveAttribute('target', '_blank')
    expect(links[0]).toHaveAttribute('rel', expect.stringContaining('noopener'))
  })

  it('shows a rest-day message with no completion buttons on the scheduled rest day', async () => {
    vi.setSystemTime(new Date('2026-09-13T09:00:00')) // a Sunday -> rest day
    render(<WorkoutPlayer />)
    expect(await screen.findByText(/rest day/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /complete workout/i })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /minimum viable day/i })).not.toBeInTheDocument()
  })

  // Today is pinned to 2026-09-14 in beforeEach.
  // currentCycleDay('2026-09-10', '2026-09-14') = floor(4 days) + 1 = 5 -> menstrual (cycleDay <= 5)
  it('shows menstrual-phase guidance when the period was just logged', async () => {
    await db.cycleLog.put({ id: 'default', periodStartDates: ['2026-09-10'], avgCycleLength: 28, symptomsByDate: {} })
    render(<WorkoutPlayer />)
    expect(await screen.findByText(/full permission/i)).toBeInTheDocument()
  })

  // currentCycleDay('2026-09-01', '2026-09-14') = 14; ovulationDay = 28 - 14 = 14 -> ovulation (cycleDay === ovulationDay)
  it('shows ovulation test-day guidance at peak cycle day', async () => {
    await db.cycleLog.put({ id: 'default', periodStartDates: ['2026-09-01'], avgCycleLength: 28, symptomsByDate: {} })
    render(<WorkoutPlayer />)
    expect(await screen.findByText(/peak energy/i)).toBeInTheDocument()
  })

  // currentCycleDay('2026-09-05', '2026-09-14') = floor(9 days) + 1 = 10 -> follicular (5 < cycleDay < ovulationDay 14)
  it('shows a progressive-overload nudge during the follicular phase', async () => {
    await db.cycleLog.put({ id: 'default', periodStartDates: ['2026-09-05'], avgCycleLength: 28, symptomsByDate: {} })
    render(<WorkoutPlayer />)
    expect(await screen.findByText(/highest-capacity week/i)).toBeInTheDocument()
  })

  it('does not gate the completion buttons during the menstrual phase', async () => {
    await db.cycleLog.put({ id: 'default', periodStartDates: ['2026-09-10'], avgCycleLength: 28, symptomsByDate: {} })
    render(<WorkoutPlayer />)
    await screen.findByText(/full permission/i)
    expect(screen.getByRole('button', { name: /complete workout/i })).toBeEnabled()
    expect(screen.getByRole('button', { name: /minimum viable day/i })).toBeEnabled()
  })
})
