import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { AppShell } from './AppShell'

describe('AppShell', () => {
  it('renders children inside the safe-area shell', () => {
    render(<AppShell><p>hello</p></AppShell>)
    expect(screen.getByText('hello')).toBeInTheDocument()
    expect(screen.getByTestId('app-shell')).toHaveClass('app-shell')
  })
})
