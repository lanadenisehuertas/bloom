import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Card } from './Card'

describe('Card', () => {
  it('renders a rounded block with the default white tone', () => {
    render(<Card>content</Card>)
    const el = screen.getByText('content')
    expect(el.parentElement).toHaveClass('rounded-block', 'bg-white', 'text-ink-900')
  })

  it('applies the correct foreground colour for a dark tone', () => {
    render(<Card tone="forest">dark block</Card>)
    expect(screen.getByText('dark block').parentElement).toHaveClass('bg-forest', 'text-white')
  })

  it('applies the correct foreground colour for a light tone', () => {
    render(<Card tone="sun">light block</Card>)
    expect(screen.getByText('light block').parentElement).toHaveClass('bg-sun', 'text-ink-900')
  })
})
