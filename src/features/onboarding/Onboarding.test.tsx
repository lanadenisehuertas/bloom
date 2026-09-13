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
})
