import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import { db } from '../../db'
import { NutritionScreen } from './NutritionScreen'

describe('NutritionScreen', () => {
  beforeEach(async () => {
    await db.delete()
    await db.open()
  })

  it('shows the daily calorie/protein target and lets the user select meals into a grocery list', async () => {
    render(<NutritionScreen />)
    expect(within(await screen.findByTestId('daily-target')).getByText(/kcal/i)).toBeInTheDocument()

    await userEvent.click(screen.getByText('Tinolang Manok (Chicken + Malunggay/Sayote)'))
    await userEvent.click(screen.getByRole('button', { name: /grocery list/i }))

    expect(await screen.findByText('Chicken thigh (skinless)')).toBeInTheDocument()
  })

  it('shows a helpful message when no meals are selected for the grocery list', async () => {
    render(<NutritionScreen />)
    await userEvent.click(screen.getByRole('button', { name: /grocery list/i }))
    expect(await screen.findByText(/no meals selected/i)).toBeInTheDocument()
  })
})
