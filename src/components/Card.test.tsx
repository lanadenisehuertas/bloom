import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Card } from './Card'

describe('Card', () => {
  it('renders a rounded soft-shadow container', () => {
    render(<Card>content</Card>)
    const el = screen.getByText('content')
    expect(el.parentElement).toHaveClass('rounded-2xl', 'shadow-soft')
  })
})
