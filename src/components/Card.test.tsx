import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Card } from './Card'

describe('Card', () => {
  it('renders a rounded, clay-shadowed block with the default white tone', () => {
    render(<Card>content</Card>)
    const el = screen.getByText('content').parentElement
    expect(el).toHaveClass('rounded-block', 'text-ink-900', 'clay')
    expect(el?.className).toContain('from-white')
  })

  it('applies the correct foreground colour and shadow for a dark tone', () => {
    render(<Card tone="forest">dark block</Card>)
    const el = screen.getByText('dark block').parentElement
    expect(el).toHaveClass('text-white', 'clay-dark')
    expect(el?.className).toContain('from-forest')
  })

  it('applies the correct foreground colour and shadow for a light tone', () => {
    render(<Card tone="sun">light block</Card>)
    const el = screen.getByText('light block').parentElement
    expect(el).toHaveClass('text-ink-900', 'clay')
    expect(el?.className).toContain('from-sun')
  })
})
