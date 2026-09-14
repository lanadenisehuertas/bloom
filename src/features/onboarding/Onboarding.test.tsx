import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import 'fake-indexeddb/auto'
import { db } from '../../db'
import { Onboarding } from './Onboarding'

describe('Onboarding', () => {
  beforeEach(async () => {
    await db.delete()
    await db.open()
  })

  it('shows the Realistic Goal reframing screen when the entered pace is unsafe, seeded with the default profile', async () => {
    render(<MemoryRouter><Onboarding /></MemoryRouter>)

    // Default profile values from spec Section 1 are pre-filled; advance through the form.
    await userEvent.click(await screen.findByRole('button', { name: /continue/i }))
    await userEvent.click(await screen.findByRole('button', { name: /continue/i }))

    expect(await screen.findByText(/realistic/i)).toBeInTheDocument()
    expect(screen.getByText(/74/)).toBeInTheDocument()
  })

  it('persists edited stats instead of only the hardcoded defaults', async () => {
    render(<MemoryRouter><Onboarding /></MemoryRouter>)

    const weightInput = await screen.findByLabelText(/weight/i)
    await userEvent.clear(weightInput)
    await userEvent.type(weightInput, '70')
    await userEvent.click(screen.getByRole('button', { name: /continue/i }))

    // Now on the goal step; use a safe pace so onboarding completes in one path.
    const goalWeightInput = screen.getByLabelText(/goal weight/i)
    await userEvent.clear(goalWeightInput)
    await userEvent.type(goalWeightInput, '68')
    await userEvent.click(screen.getByRole('button', { name: /continue/i }))

    const profile = await db.profile.get('default')
    expect(profile?.weightKg).toBe(70)
    expect(profile?.goalWeightKg).toBe(68)
  })

  it('lets the user go back to the stats step and keeps their edit', async () => {
    render(<MemoryRouter><Onboarding /></MemoryRouter>)

    const weightInput = await screen.findByLabelText(/weight/i)
    await userEvent.clear(weightInput)
    await userEvent.type(weightInput, '72')
    await userEvent.click(screen.getByRole('button', { name: /continue/i }))

    // Now on the goal step — go back to stats instead of continuing.
    await userEvent.click(await screen.findByRole('button', { name: /^back$/i }))

    const weightInputAgain = await screen.findByLabelText(/weight/i)
    expect(weightInputAgain).toHaveValue(72)
  })
})
