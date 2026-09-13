import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import { ExerciseLibrary } from './ExerciseLibrary'

describe('ExerciseLibrary', () => {
  it('filters the list as the user types a search query', async () => {
    render(<ExerciseLibrary />)
    expect(screen.getByText('Goblet Squat')).toBeInTheDocument()
    await userEvent.type(screen.getByPlaceholderText(/search/i), 'push-up')
    expect(screen.getByText('Push-Up Progression')).toBeInTheDocument()
    expect(screen.queryByText('Goblet Squat')).not.toBeInTheDocument()
  })

  it('gives every listed exercise a form-video search link', () => {
    render(<ExerciseLibrary />)
    const links = screen.getAllByRole('link', { name: /watch form videos/i })
    expect(links.length).toBe(30) // one per seeded exercise
    expect(links[0]).toHaveAttribute('target', '_blank')
  })
})
