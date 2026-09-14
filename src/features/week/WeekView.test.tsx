import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import 'fake-indexeddb/auto'
import { MemoryRouter } from 'react-router-dom'
import { db } from '../../db'
import { WeekView } from './WeekView'

describe('WeekView', () => {
  beforeEach(async () => {
    // 2026-09-14 is a Monday; the week's Sunday is 2026-09-13.
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-09-14T12:00:00'))

    await db.delete()
    await db.open()
    await db.profile.put({
      id: 'default', heightCm: 175, weightKg: 80, age: 21, activityLevel: 'lightlyActive',
      goalWeightKg: 74, goalDate: '2026-12-31', checkpointWeightKg: 77, checkpointDate: '2026-10-15',
      equipment: [], injuryNotes: '', createdAt: '2026-09-01',
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders all 7 days of the current week', async () => {
    render(
      <MemoryRouter>
        <WeekView />
      </MemoryRouter>
    )
    for (const md of ['09-13', '09-14', '09-15', '09-16', '09-17', '09-18', '09-19']) {
      expect(await screen.findByText(new RegExp(md))).toBeInTheDocument()
    }
  })

  it('shows the goal anchor using the checkpoint weight/date as the stable destination', async () => {
    render(
      <MemoryRouter>
        <WeekView />
      </MemoryRouter>
    )
    expect(await screen.findByText(/still aiming for 77kg by 2026-10-15/i)).toBeInTheDocument()
  })

  it('navigates to the next and previous week', async () => {
    render(
      <MemoryRouter>
        <WeekView />
      </MemoryRouter>
    )
    expect(await screen.findByText(/09-13/)).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /next week/i }))
    expect(await screen.findByText(/09-20/)).toBeInTheDocument()
    expect(screen.queryByText(/09-13/)).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /previous week/i }))
    await userEvent.click(screen.getByRole('button', { name: /previous week/i }))
    expect(await screen.findByText(/09-06/)).toBeInTheDocument()
  })

  it('projects a specific cycle phase for a day from the logged period start', async () => {
    await db.cycleLog.put({
      id: 'default',
      periodStartDates: ['2026-09-01'],
      avgCycleLength: 28,
      symptomsByDate: {},
    })
    render(
      <MemoryRouter>
        <WeekView />
      </MemoryRouter>
    )
    // Hand-computed: last period 2026-09-01, 28-day cycle -> 2026-09-14 is cycle day 14 -> ovulation.
    const todayCard = (await screen.findByText(/09-14/)).closest('div')
    expect(todayCard).not.toBeNull()
    expect(await screen.findByText(/ovulation \(projected\)/i)).toBeInTheDocument()
  })

  it('shows nothing misleading when no period has ever been logged', async () => {
    render(
      <MemoryRouter>
        <WeekView />
      </MemoryRouter>
    )
    expect(screen.queryByText(/projected/i)).not.toBeInTheDocument()
  })

  it('provides an explicit way back to Today, since this screen is not a bottom-nav tab', async () => {
    render(
      <MemoryRouter>
        <WeekView />
      </MemoryRouter>
    )
    expect(await screen.findByRole('link', { name: 'Today' })).toHaveAttribute('href', '/')
  })
})
