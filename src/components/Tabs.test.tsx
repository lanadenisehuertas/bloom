import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import { Tabs } from './Tabs'

describe('Tabs', () => {
  it('calls onChange with the clicked tab id', async () => {
    const onChange = vi.fn()
    render(
      <Tabs
        tabs={[{ id: 'daily', label: 'Daily' }, { id: 'weekly', label: 'Weekly' }]}
        activeId="daily"
        onChange={onChange}
      />
    )
    await userEvent.click(screen.getByText('Weekly'))
    expect(onChange).toHaveBeenCalledWith('weekly')
  })
})
