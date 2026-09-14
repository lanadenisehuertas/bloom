import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import 'fake-indexeddb/auto'
import { MemoryRouter } from 'react-router-dom'
import { db } from '../../db'
import { Dashboard } from './Dashboard'

describe('Dashboard', () => {
  beforeEach(async () => {
    await db.delete()
    await db.open()
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date('2026-09-14T09:00:00')) // a Monday -> workout day 'A'
    await db.profile.put({
      id: 'default', heightCm: 175, weightKg: 80, age: 21, activityLevel: 'lightlyActive',
      goalWeightKg: 74, goalDate: '2026-10-31', equipment: [], injuryNotes: '', createdAt: '2026-09-14',
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("shows today's scheduled workout title and the streak count", async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    )
    expect(await screen.findByText(/streak/i)).toBeInTheDocument()
  })

  it("shows the profile's own motivation reason instead of a generic slogan when one is set", async () => {
    await db.profile.update('default', { motivationReason: 'Feeling strong enough to hike with my sister again.' })
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    )
    expect(await screen.findByText(/hike with my sister/i)).toBeInTheDocument()
  })

  it('links to the exercise library', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    )
    expect(await screen.findByRole('link', { name: /exercise library/i })).toHaveAttribute('href', '/exercises')
  })

  it('links to the week view', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    )
    expect(await screen.findByRole('link', { name: /see this week/i })).toHaveAttribute('href', '/week')
  })

  it('opens the weekly check-in modal', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    )
    await userEvent.click(await screen.findByRole('button', { name: /weekly check-in/i }))
    expect(await screen.findByText(/weekly reflection/i)).toBeInTheDocument()
  })

  it('shows the day as done once today\'s workout is logged, instead of still inviting her to start it', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>
    )
    expect(await screen.findByRole('button', { name: /start workout/i })).toBeInTheDocument()

    await db.workoutLogs.add({
      date: '2026-09-14',
      workoutDayId: 'A',
      exercises: [],
      completed: 'full',
    })

    expect(await screen.findByText(/done for today/i)).toBeInTheDocument()
    expect(await screen.findByRole('button', { name: /view workout/i })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /^start workout$/i })).not.toBeInTheDocument()
  })
})
