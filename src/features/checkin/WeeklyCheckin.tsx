import { useState } from 'react'
import { Button } from '../../components/Button'
import { useTodayLog } from '../../hooks/useTodayLog'

const SCALE = [1, 2, 3, 4, 5]

/**
 * Rendered inside <Modal title="Weekly reflection">, so this component
 * deliberately has no heading of its own.
 */
export function WeeklyCheckin({ onDone }: { onDone: () => void }) {
  const { updateToday } = useTodayLog()
  const [energy, setEnergy] = useState(3)
  const [motivation, setMotivation] = useState(3)
  const [jointPain, setJointPain] = useState(false)

  return (
    <div className="space-y-5">
      <p className="text-label text-ink-500">
        No penalty for a rough week — this just helps next week fit you better.
      </p>

      <ScalePicker label="Energy" value={energy} onChange={setEnergy} />
      <ScalePicker label="Motivation" value={motivation} onChange={setMotivation} />

      <label className="flex min-h-[48px] cursor-pointer items-center gap-3 rounded-chip bg-white p-4">
        <input
          type="checkbox"
          className="h-5 w-5 accent-ink-900"
          checked={jointPain}
          onChange={(e) => setJointPain(e.target.checked)}
        />
        <span className="text-[15px] font-medium">Any joint pain this week?</span>
      </label>

      <Button
        className="w-full"
        onClick={async () => {
          await updateToday({ energyRating: energy, motivationRating: motivation, jointPain })
          onDone()
        }}
      >
        Save check-in
      </Button>
    </div>
  )
}

/**
 * 1-5 picker as discrete buttons rather than a range slider — a slider is a poor
 * touch target and gives no readable current value at a glance.
 */
function ScalePicker({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (n: number) => void
}) {
  return (
    <fieldset>
      <legend className="mb-2 text-label font-bold">{label}</legend>
      <div className="flex gap-2" role="radiogroup" aria-label={label}>
        {SCALE.map((n) => (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${label} ${n} of 5`}
            onClick={() => onChange(n)}
            className={`numerals min-h-[48px] flex-1 rounded-chip font-display text-lg font-extrabold transition-colors duration-200 ${
              value === n ? 'bg-ink-900 text-white' : 'bg-white text-ink-500'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </fieldset>
  )
}
