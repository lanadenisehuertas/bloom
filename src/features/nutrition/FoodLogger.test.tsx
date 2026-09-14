import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import { db } from '../../db'
import { NutritionScreen } from './NutritionScreen'

describe('FoodLogger (via NutritionScreen)', () => {
  beforeEach(async () => {
    await db.delete()
    await db.open()
  })

  it('logs a food found via search and updates the remaining-calories hero', async () => {
    render(<NutritionScreen />)

    const heroCard = await screen.findByTestId('daily-target')
    expect(within(heroCard).getByText(/kcal/i)).toBeInTheDocument()
    const before = within(heroCard).getByText(/^\d+$/).textContent

    await userEvent.type(screen.getByLabelText(/search foods/i), 'banana')
    await userEvent.click(await screen.findByRole('button', { name: /^banana \(lakatan/i }))

    // Serving/quantity picker modal, pre-filled with sensible defaults.
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /log it/i }))

    const todaysLog = (await screen.findByText("Today’s log")).closest('section')
    expect(todaysLog).not.toBeNull()
    expect(within(todaysLog as HTMLElement).getByText('Banana (lakatan/latundan)')).toBeInTheDocument()

    const after = within(screen.getByTestId('daily-target')).getByText(/kcal/i).textContent
    expect(after).not.toEqual(before)
  })

  it('logs a food from the recents grid with one confirm tap', async () => {
    await db.foodLogs.add({
      date: '2020-01-01',
      loggedAt: '2020-01-01T08:00:00.000Z',
      slot: 'breakfast',
      foodId: 'egg-boiled',
      name: 'Boiled egg',
      servingLabel: '1 pc',
      quantity: 1,
      kcal: 78,
      proteinG: 6.5,
    })

    render(<NutritionScreen />)

    const recents = (await screen.findByText(/recents — tap to log again/i)).parentElement as HTMLElement
    await userEvent.click(within(recents).getByRole('button', { name: /boiled egg/i }))
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /log it/i }))

    const todaysLog = (await screen.findByText("Today’s log")).closest('section')
    expect(todaysLog).not.toBeNull()
    expect(within(todaysLog as HTMLElement).getByText('Boiled egg')).toBeInTheDocument()
  })

  it('quick-adds a calorie-only entry with no food identity', async () => {
    render(<NutritionScreen />)

    await userEvent.click(screen.getByRole('button', { name: /quick add calories/i }))
    expect(await screen.findByRole('dialog')).toBeInTheDocument()

    await userEvent.type(screen.getByLabelText(/calories \(kcal\)/i), '350')
    await userEvent.type(screen.getByLabelText(/protein \(g\)/i), '20')
    await userEvent.click(screen.getByRole('button', { name: /log it/i }))

    const todaysLog = (await screen.findByText("Today’s log")).closest('section') as HTMLElement
    expect(within(todaysLog).getByText('Quick add')).toBeInTheDocument()
    expect(within(todaysLog).getByText(/quick add · 1x · 350 kcal/i)).toBeInTheDocument()
  })

  it('removes a logged entry', async () => {
    render(<NutritionScreen />)

    await userEvent.click(screen.getByRole('button', { name: /quick add calories/i }))
    await userEvent.type(screen.getByLabelText(/calories \(kcal\)/i), '200')
    await userEvent.click(screen.getByRole('button', { name: /log it/i }))

    const todaysLog = (await screen.findByText("Today’s log")).closest('section') as HTMLElement
    expect(within(todaysLog).getByText('Quick add')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: /remove quick add from today's log/i }))

    expect(screen.queryByText("Today’s log")).not.toBeInTheDocument()
  })
})
