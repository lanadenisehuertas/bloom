import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, beforeEach } from 'vitest'
import 'fake-indexeddb/auto'
import { db } from '../../db'
import { MeasurementsLog } from './MeasurementsLog'

describe('MeasurementsLog', () => {
  beforeEach(async () => {
    await db.delete()
    await db.open()
  })

  it('logging a measurement makes it appear in the list', async () => {
    const user = userEvent.setup()
    render(<MeasurementsLog />)

    await user.type(screen.getByLabelText('Waist (cm)'), '80')
    await user.type(screen.getByLabelText('Hips (cm)'), '95')
    await user.type(screen.getByLabelText('Upper arm (cm)'), '30')
    await user.type(screen.getByLabelText('Thigh (cm)'), '55')
    await user.click(screen.getByRole('button', { name: /log measurements/i }))

    expect(await screen.findByText(/waist 80cm \/ hips 95cm \/ arm 30cm \/ thigh 55cm/i)).toBeInTheDocument()
  })

  it('disables the submit button when all fields are empty', async () => {
    render(<MeasurementsLog />)

    expect(screen.getByRole('button', { name: /log measurements/i })).toBeDisabled()
  })

  it('enables the submit button once any field has input, and blocks submission otherwise', async () => {
    const user = userEvent.setup()
    render(<MeasurementsLog />)

    const button = screen.getByRole('button', { name: /log measurements/i })
    expect(button).toBeDisabled()

    await user.type(screen.getByLabelText('Waist (cm)'), '80')
    expect(button).not.toBeDisabled()

    await user.clear(screen.getByLabelText('Waist (cm)'))
    expect(button).toBeDisabled()
  })
})
