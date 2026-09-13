import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import { db } from '../../db'
import { CycleTracker } from './CycleTracker'

describe('CycleTracker', () => {
  beforeEach(async () => {
    await db.delete()
    await db.open()
  })

  it('logs a period start date and displays the detected phase', async () => {
    render(<CycleTracker />)
    const input = screen.getByLabelText(/period start date/i)
    await userEvent.type(input, '2026-09-01')
    await userEvent.click(screen.getByRole('button', { name: /log period start/i }))
    expect(await screen.findByText(/phase/i)).toBeInTheDocument()
  })
})
