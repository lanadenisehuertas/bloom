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
})
