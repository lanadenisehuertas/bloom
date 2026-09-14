import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { ProgressRing } from './ProgressRing'

describe('ProgressRing', () => {
  it('renders the percentage label and clamps out-of-range values', () => {
    render(<ProgressRing value={0.735} label="Sleep Quality" />)
    expect(screen.getByText('74%')).toBeInTheDocument()
    render(<ProgressRing value={1.4} label="Over" />)
    expect(screen.getByText('100%')).toBeInTheDocument()
  })
})
