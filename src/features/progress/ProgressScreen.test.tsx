import { render, screen } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import { db } from '../../db'
import { ProgressScreen } from './ProgressScreen'

describe('ProgressScreen', () => {
  beforeEach(async () => {
    await db.delete()
    await db.open()
    await db.dailyLogs.bulkPut([
      { date: '2026-09-08', weightKg: 80, waterCount: 0, mealsLogged: [] },
      { date: '2026-09-09', weightKg: 79.8, waterCount: 0, mealsLogged: [] },
      { date: '2026-09-10', weightKg: 80.2, waterCount: 0, mealsLogged: [] },
    ])
  })

  it('renders the 7-day rolling average weight as the primary number', async () => {
    render(<ProgressScreen />)
    expect(await screen.findByText(/7-day average/i)).toBeInTheDocument()
  })

  it('computes and displays the correct 7-day rolling average, not just a static label', async () => {
    render(<ProgressScreen />)
    // seeded weights (80, 79.8, 80.2), rolling average of all logged-so-far each day -> latest = (80+79.8+80.2)/3 = 80.0
    expect(await screen.findByText('80.0kg')).toBeInTheDocument()
  })

  it('shows a placeholder dash when there are no weigh-ins logged', async () => {
    await db.dailyLogs.clear()
    render(<ProgressScreen />)
    expect(await screen.findByText('—')).toBeInTheDocument()
  })
})
