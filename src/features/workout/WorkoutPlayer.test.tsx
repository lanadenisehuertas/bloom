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
    expect(await screen.findByRole('heading')).toBeInTheDocument()
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
})
