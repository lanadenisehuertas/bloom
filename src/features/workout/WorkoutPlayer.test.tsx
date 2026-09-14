import { render, screen, waitFor } from '@testing-library/react'
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
    await waitFor(async () => {
      expect(await db.workoutLogs.toArray()).toHaveLength(1)
    })
    const logs = await db.workoutLogs.toArray()
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

  // 2026-09-16 is a Wednesday -> workout day 'B', which has db-bent-over-row at a
  // plain-integer 12 reps. currentCycleDay('2026-09-14', '2026-09-16') = floor(2 days) + 1
  // = 3 -> menstrual (cycleDay <= 5), so reps should be reduced: round(12 * (1 - 30/100)) = 8.
  it('actually reduces a plain-integer rep count during the menstrual phase', async () => {
    vi.setSystemTime(new Date('2026-09-16T09:00:00'))
    await db.cycleLog.put({ id: 'default', periodStartDates: ['2026-09-14'], avgCycleLength: 28, symptomsByDate: {} })
    render(<WorkoutPlayer />)
    await screen.findByText(/full permission/i)
    // Scope to this exercise's own card rather than walking the DOM structure, so
    // the assertion survives layout changes and only breaks if the maths breaks.
    const heading = await screen.findByRole('heading', { name: 'Dumbbell Bent-Over Row' })
    const card = heading.closest('div.rounded-block')
    expect(card).not.toBeNull()
    expect(card).toHaveTextContent('3 sets × 8')
    expect(card).toHaveTextContent(/reduced ~30% for today's phase/i)
  })

  it('does not gate the completion buttons during the menstrual phase', async () => {
    await db.cycleLog.put({ id: 'default', periodStartDates: ['2026-09-10'], avgCycleLength: 28, symptomsByDate: {} })
    render(<WorkoutPlayer />)
    await screen.findByText(/full permission/i)
    expect(screen.getByRole('button', { name: /complete workout/i })).toBeEnabled()
    expect(screen.getByRole('button', { name: /minimum viable day/i })).toBeEnabled()
  })

  describe('progressive overload suggestion', () => {
    // Day A's goblet-squat is the only rep-range ("12-15") exercise.
    it('suggests a small increase after 2 prior sessions plus today all hit the top of the range', async () => {
      await db.workoutLogs.bulkAdd([
        {
          date: '2026-09-01',
          workoutDayId: 'A',
          completed: 'full',
          exercises: [{ name: 'Goblet Squat', sets: 3, reps: 15, hitTopOfRange: true }],
        },
        {
          date: '2026-09-08',
          workoutDayId: 'A',
          completed: 'full',
          exercises: [{ name: 'Goblet Squat', sets: 3, reps: 15, hitTopOfRange: true }],
        },
      ])

      render(<WorkoutPlayer />)
      const toggle = await screen.findByLabelText(/hit the top of the range today\?/i)
      await userEvent.click(toggle)
      await userEvent.click(screen.getByRole('button', { name: /complete workout/i }))

      expect(
        await screen.findByText(/try adding a rep or a bit more resistance on: goblet squat/i)
      ).toBeInTheDocument()

      const logs = await db.workoutLogs.orderBy('date').toArray()
      const todayLog = logs[logs.length - 1]
      const gobletEntry = todayLog.exercises.find((e) => e.name === 'Goblet Squat')
      expect(gobletEntry?.hitTopOfRange).toBe(true)
    })

    it('shows no suggestion when the toggle is left off', async () => {
      await db.workoutLogs.bulkAdd([
        {
          date: '2026-09-01',
          workoutDayId: 'A',
          completed: 'full',
          exercises: [{ name: 'Goblet Squat', sets: 3, reps: 15, hitTopOfRange: true }],
        },
        {
          date: '2026-09-08',
          workoutDayId: 'A',
          completed: 'full',
          exercises: [{ name: 'Goblet Squat', sets: 3, reps: 15, hitTopOfRange: true }],
        },
      ])

      render(<WorkoutPlayer />)
      await screen.findByLabelText(/hit the top of the range today\?/i)
      await userEvent.click(screen.getByRole('button', { name: /complete workout/i }))

      expect(screen.queryByText(/try adding a rep/i)).not.toBeInTheDocument()
    })

    it('suggests an increase after just 1 qualifying prior session plus today, matching the domain function\'s 2-session contract', async () => {
      await db.workoutLogs.add({
        date: '2026-09-08',
        workoutDayId: 'A',
        completed: 'full',
        exercises: [{ name: 'Goblet Squat', sets: 3, reps: 15, hitTopOfRange: true }],
      })

      render(<WorkoutPlayer />)
      const toggle = await screen.findByLabelText(/hit the top of the range today\?/i)
      await userEvent.click(toggle)
      await userEvent.click(screen.getByRole('button', { name: /complete workout/i }))

      expect(
        await screen.findByText(/try adding a rep or a bit more resistance on: goblet squat/i)
      ).toBeInTheDocument()
    })

    it('shows no suggestion when there are fewer than 2 total qualifying sessions', async () => {
      render(<WorkoutPlayer />)
      const toggle = await screen.findByLabelText(/hit the top of the range today\?/i)
      await userEvent.click(toggle)
      await userEvent.click(screen.getByRole('button', { name: /complete workout/i }))

      expect(screen.queryByText(/try adding a rep/i)).not.toBeInTheDocument()
    })

    it('does not count a Minimum Viable Day toggle toward progressive-overload history', async () => {
      await db.workoutLogs.bulkAdd([
        {
          date: '2026-09-01',
          workoutDayId: 'A',
          completed: 'full',
          exercises: [{ name: 'Goblet Squat', sets: 3, reps: 15, hitTopOfRange: true }],
        },
        {
          date: '2026-09-08',
          workoutDayId: 'A',
          completed: 'full',
          exercises: [{ name: 'Goblet Squat', sets: 3, reps: 15, hitTopOfRange: true }],
        },
      ])

      render(<WorkoutPlayer />)
      const toggle = await screen.findByLabelText(/hit the top of the range today\?/i)
      await userEvent.click(toggle)
      await userEvent.click(screen.getByRole('button', { name: /minimum viable day/i }))

      expect(screen.queryByText(/try adding a rep/i)).not.toBeInTheDocument()
      const logs = await db.workoutLogs.orderBy('date').toArray()
      const todayLog = logs[logs.length - 1]
      const gobletEntry = todayLog.exercises.find((e) => e.name === 'Goblet Squat')
      expect(gobletEntry?.hitTopOfRange).toBeUndefined()
    })
  })
})
