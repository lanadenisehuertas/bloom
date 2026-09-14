import { render, screen } from '@testing-library/react'
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

  it('logs a period start date and displays the detected phase', async () => {
    render(<CycleTracker />)
    const input = screen.getByLabelText(/period start date/i)
    await userEvent.type(input, '2026-09-01')
    await userEvent.click(screen.getByRole('button', { name: /log period start/i }))
    expect(await screen.findByText(/ovulation/i)).toBeInTheDocument()
  })

  it('detects a different phase for a different period start date', async () => {
    render(<CycleTracker />)
    const input = screen.getByLabelText(/period start date/i)
    await userEvent.type(input, '2026-09-12') // 3 days before pinned "today" -> cycle day 3 -> menstrual
    await userEvent.click(screen.getByRole('button', { name: /log period start/i }))
    expect(await screen.findByText(/menstrual/i)).toBeInTheDocument()
    expect(screen.queryByText(/ovulation/i)).not.toBeInTheDocument()
  })
})
