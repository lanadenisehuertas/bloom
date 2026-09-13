import { useState } from 'react'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { useCycle } from '../../hooks/useCycle'

const PHASE_LABELS: Record<string, string> = {
  menstrual: 'Menstrual', follicular: 'Follicular', ovulation: 'Ovulation', luteal: 'Luteal',
}

export function CycleTracker() {
  const { cycleLog, cycleDay, phase, logPeriodStart } = useCycle()
  const [dateInput, setDateInput] = useState('')

  return (
    <div className="space-y-3">
      <Card className="bg-sage-50">
        <p className="text-sm text-sage-700">Current phase</p>
        <p className="text-xl font-semibold">
          {phase ? PHASE_LABELS[phase] : 'Log your last period to begin tracking'}
          {cycleDay ? ` · Day ${cycleDay}` : ''}
        </p>
        <p className="text-xs text-ink-500">Average cycle length: {cycleLog?.avgCycleLength ?? 28} days</p>
      </Card>

      <Card className="space-y-2">
        <label className="block text-sm" htmlFor="period-start">Period start date</label>
        <input
          id="period-start"
          aria-label="period start date"
          type="date"
          className="w-full rounded-2xl border border-cream-200 p-3"
          value={dateInput}
          onChange={(e) => setDateInput(e.target.value)}
        />
        <Button
          onClick={async () => {
            if (!dateInput) return
            await logPeriodStart(dateInput)
            setDateInput('')
          }}
        >
          Log period start
        </Button>
      </Card>
    </div>
  )
}
