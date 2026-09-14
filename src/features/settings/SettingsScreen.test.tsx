import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import 'fake-indexeddb/auto'
import { db } from '../../db'
import { SettingsScreen } from './SettingsScreen'

describe('SettingsScreen', () => {
  beforeEach(async () => {
    await db.delete()
    await db.open()
    await db.profile.put({
      id: 'default', heightCm: 175, weightKg: 80, age: 21, activityLevel: 'lightlyActive',
      goalWeightKg: 74, goalDate: '2026-10-31', equipment: [], injuryNotes: '', createdAt: '2026-09-14',
    })
  })

  it('triggers a JSON download when "Export my data" is clicked', async () => {
    const createObjectURL = vi.fn(() => 'blob:mock')
    // @ts-expect-error jsdom doesn't implement this
    global.URL.createObjectURL = createObjectURL
    render(<SettingsScreen />)
    await userEvent.click(screen.getByRole('button', { name: /export my data/i }))
    expect(createObjectURL).toHaveBeenCalled()
  })
})
