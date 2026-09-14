import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import 'fake-indexeddb/auto'
import { db } from '../../db'
import { CycleTracker } from './CycleTracker'

describe('CycleTracker', () => {
  beforeEach(async () => {
    await db.delete()
    await db.open()
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-09-14T09:00:00'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  async function logPeriodDay(date: string) {
    await userEvent.click(await screen.findByRole('gridcell', { name: date }))
    await userEvent.click(screen.getByRole('button', { name: /mark as a period day/i }))
  }

  it('logs a tapped calendar day as a period day and displays the detected phase', async () => {
    render(<CycleTracker />)
    await logPeriodDay('2026-09-01')
    // 2026-09-01 -> "today" (09-14) is cycle day 14 of a 28-day default -> ovulation.
    expect(await screen.findByRole('heading', { level: 2, name: /^ovulation$/i })).toBeInTheDocument()
  })

  it('detects a different phase for a different logged period day', async () => {
    render(<CycleTracker />)
    await logPeriodDay('2026-09-12') // 3 days before pinned "today" -> cycle day 3 -> menstrual
    expect(await screen.findByRole('heading', { level: 2, name: /^menstrual$/i })).toBeInTheDocument()
    expect(screen.queryByRole('heading', { level: 2, name: /^ovulation$/i })).not.toBeInTheDocument()
  })

  it('lets a logged period day be un-marked by tapping it again', async () => {
    render(<CycleTracker />)
    await logPeriodDay('2026-09-14')
    expect(await screen.findByRole('button', { name: /logged as a period day/i })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /logged as a period day/i }))
    expect(await screen.findByRole('button', { name: /^mark as a period day$/i })).toBeInTheDocument()
  })

  it('records symptoms for the selected day', async () => {
    render(<CycleTracker />)
    const cramps = await screen.findByRole('button', { name: 'Cramps' })
    expect(cramps).toHaveAttribute('aria-pressed', 'false')

    await userEvent.click(cramps)
    await waitFor(() => expect(cramps).toHaveAttribute('aria-pressed', 'true'))

    await userEvent.click(cramps)
    await waitFor(() => expect(cramps).toHaveAttribute('aria-pressed', 'false'))
  })

  it('lets a detected phase be manually overridden, and reverted back to automatic', async () => {
    render(<CycleTracker />)
    await logPeriodDay('2026-09-01') // -> ovulation, per above
    await screen.findByText(/does this feel right/i)

    const lutealOverride = screen.getByRole('button', { name: 'Luteal' })
    await userEvent.click(lutealOverride)

    expect(await screen.findByRole('heading', { level: 2, name: /^luteal$/i })).toBeInTheDocument()
    await waitFor(() => expect(lutealOverride).toHaveAttribute('aria-pressed', 'true'))

    await userEvent.click(screen.getByRole('button', { name: /back to automatic/i }))
    expect(await screen.findByRole('heading', { level: 2, name: /^ovulation$/i })).toBeInTheDocument()
  })

  it('does not let a future day be logged as a period, since it has not happened yet', async () => {
    render(<CycleTracker />)
    await userEvent.click(await screen.findByRole('gridcell', { name: '2026-09-20' }))
    expect(await screen.findByText(/hasn.t happened yet/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /mark as a period day/i })).not.toBeInTheDocument()
  })
})
