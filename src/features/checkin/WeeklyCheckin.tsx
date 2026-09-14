import { useState } from 'react'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { useTodayLog } from '../../hooks/useTodayLog'

export function WeeklyCheckin({ onDone }: { onDone: () => void }) {
  const { updateToday } = useTodayLog()
  const [energy, setEnergy] = useState(3)
  const [motivation, setMotivation] = useState(3)
  const [jointPain, setJointPain] = useState(false)

  return (
    <Card className="space-y-4">
      <h2 className="text-lg font-semibold">Weekly reflection</h2>
      <p className="text-sm text-ink-500">No penalty for a rough week — this just helps next week fit you better.</p>

      <div>
        <label className="block text-sm">Energy (1-5)</label>
        <input type="range" min={1} max={5} value={energy} onChange={(e) => setEnergy(Number(e.target.value))} />
      </div>
      <div>
        <label className="block text-sm">Motivation (1-5)</label>
        <input type="range" min={1} max={5} value={motivation} onChange={(e) => setMotivation(Number(e.target.value))} />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={jointPain} onChange={(e) => setJointPain(e.target.checked)} />
        Any joint pain this week?
      </label>

      <Button
        onClick={async () => {
          await updateToday({ energyRating: energy, motivationRating: motivation, jointPain })
          onDone()
        }}
      >
        Save check-in
      </Button>
    </Card>
  )
}
