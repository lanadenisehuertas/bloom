import { useState } from 'react'
import { CalendarHeart } from 'lucide-react'
import { Card, Tone, TONE_MUTED } from '../../components/Card'
import { Button } from '../../components/Button'
import { Pill } from '../../components/Pill'
import { StatTile } from '../../components/StatTile'
import { useCycle } from '../../hooks/useCycle'

const PHASE_LABELS: Record<string, string> = {
  menstrual: 'Menstrual', follicular: 'Follicular', ovulation: 'Ovulation', luteal: 'Luteal',
}

/** The block colour is the phase indicator — always paired with the phase name below. */
const PHASE_TONES: Record<string, Tone> = {
  menstrual: 'rose', follicular: 'mint', ovulation: 'sun', luteal: 'lilac',
}

export function CycleTracker() {
  const { cycleLog, cycleDay, phase, logPeriodStart } = useCycle()
  const [dateInput, setDateInput] = useState('')

  const tone: Tone = phase ? PHASE_TONES[phase] ?? 'cream' : 'cream'
  const onDark = tone === 'rose'
  const chipClass = onDark ? 'bg-white/20' : 'bg-ink-900/10'

  return (
    <div className="space-y-4">
      <header className="px-1">
        <p className="text-label font-medium text-ink-500">Where you are</p>
        <h1 className="font-display text-3xl font-extrabold leading-tight">Cycle</h1>
      </header>

      {/* Hero: the phase, coloured by the phase itself */}
      <Card tone={tone}>
        <Pill className={onDark ? 'bg-white/20 text-white' : 'bg-ink-900/10'}>
          <CalendarHeart size={13} aria-hidden="true" />
          Current phase
        </Pill>
        <h2 className="mt-3 font-display text-[32px] font-extrabold leading-[1.1]">
          {phase ? PHASE_LABELS[phase] : 'Log your last period to begin tracking'}
        </h2>
        {cycleDay ? (
          <div className={`mt-4 inline-flex items-baseline gap-2 rounded-chip px-4 py-2 ${chipClass}`}>
            <span className="numerals font-display text-numeral-sm font-extrabold">{cycleDay}</span>
            <span className={`text-label font-bold ${TONE_MUTED[tone]}`}>day of cycle</span>
          </div>
        ) : null}
      </Card>

      <StatTile
        tone="sky"
        value={`${cycleLog?.avgCycleLength ?? 28}`}
        label="Average cycle length (days)"
      />

      <Card tone="white" className="space-y-3">
        <h2 className="font-display text-xl font-extrabold">Log a new period</h2>
        <div className="space-y-2">
          <label className="block text-label font-bold" htmlFor="period-start">
            Period start date
          </label>
          <input
            id="period-start"
            aria-label="period start date"
            type="date"
            className="min-h-[48px] w-full rounded-chip border-2 border-cream-edge bg-white px-4 py-3 font-body text-[15px] text-ink-900"
            value={dateInput}
            onChange={(e) => setDateInput(e.target.value)}
          />
        </div>
        <Button
          onClick={async () => {
            if (!dateInput) return
            await logPeriodStart(dateInput)
            setDateInput('')
          }}
        >
          Log period start
        </Button>
        <p className="text-label text-ink-500">
          Keeping this up to date lets Bloom tailor workout intensity to where you are in your
          cycle — pushing harder when you have the energy, easing off when you don't.
        </p>
      </Card>
    </div>
  )
}
