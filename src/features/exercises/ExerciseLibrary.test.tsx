import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { ExerciseLibrary } from './ExerciseLibrary'

describe('ExerciseLibrary', () => {
  it('filters the list as the user types a search query', async () => {
    render(<ExerciseLibrary />)
    expect(screen.getByText('Goblet Squat')).toBeInTheDocument()
    await userEvent.type(screen.getByPlaceholderText(/search/i), 'push-up')
    // "push-up" now matches all 5 progression steps, not one opaque entry —
    // that's the actual fix (a user who can't do a full push-up needs a named
    // step to attempt, not a single line item).
    expect(screen.getByText('Wall Push-Up')).toBeInTheDocument()
    expect(screen.getByText('Standard Push-Up')).toBeInTheDocument()
    expect(screen.queryByText('Goblet Squat')).not.toBeInTheDocument()
  })

  it('matches a human-readable muscle group label, not just the raw internal key', async () => {
    render(<ExerciseLibrary />)
    await userEvent.type(screen.getByPlaceholderText(/search/i), 'upper body')
    expect(screen.getByText('Standard Push-Up')).toBeInTheDocument()
    expect(screen.queryByText('Goblet Squat')).not.toBeInTheDocument()
  })

  it('gives every listed exercise a form-video search link', () => {
    render(<ExerciseLibrary />)
    const links = screen.getAllByRole('link', { name: /watch form videos/i })
    expect(links.length).toBe(36) // one per seeded exercise
    expect(links[0]).toHaveAttribute('target', '_blank')
  })
})
