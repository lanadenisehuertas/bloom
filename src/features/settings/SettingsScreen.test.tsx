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

  it('shows Realistic Goal guidance instead of silently saving when an edited goal pace is unsafe', async () => {
    render(<SettingsScreen />)
    await userEvent.click(await screen.findByRole('button', { name: /edit profile/i }))

    const goalWeightInput = screen.getByLabelText(/goal weight/i)
    await userEvent.clear(goalWeightInput)
    await userEvent.type(goalWeightInput, '60')

    const goalDateInput = screen.getByLabelText(/goal date/i)
    await userEvent.clear(goalDateInput)
    // One week out: losing 20kg in a week is nowhere near a safe pace.
    await userEvent.type(goalDateInput, '2026-09-21')

    await userEvent.click(screen.getByRole('button', { name: /save changes/i }))

    expect(await screen.findByText(/realistic pace/i)).toBeInTheDocument()

    // The unsafe goal must not have been persisted yet — only accepting the
    // checkpoint (or explicitly overriding) should write it.
    const stored = await db.profile.get('default')
    expect(stored?.goalWeightKg).toBe(74)

    await userEvent.click(screen.getByRole('button', { name: /use this plan/i }))

    const updated = await db.profile.get('default')
    expect(updated?.goalWeightKg).not.toBe(60)
    expect(updated?.goalDate).toBe('2026-09-21')
  })

  it('recalculates and displays the updated calorie/protein target', async () => {
    render(<SettingsScreen />)
    await userEvent.click(screen.getByRole('button', { name: /recalculate goals/i }))

    // weightKg 80, heightCm 175, age 21, lightlyActive -> BMR 1627.75, TDEE 2278.85,
    // calorie target round(2278.85 - 350) = 1929, protein round(80 * 1.6) = 128.
    expect(await screen.findByText(/1929/)).toBeInTheDocument()

    const settingsRecord = await db.settings.get('default')
    expect(settingsRecord?.currentCalorieTarget).toBe(1929)
    expect(settingsRecord?.currentProteinTarget).toBe(128)
    expect(settingsRecord?.lastRecalcDate).toBe(new Date().toISOString().slice(0, 10))
  })
})
