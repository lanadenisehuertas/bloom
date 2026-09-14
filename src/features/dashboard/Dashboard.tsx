import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { StatTile } from '../../components/StatTile'
import { Modal } from '../../components/Modal'
import { Droplet, Flame } from 'lucide-react'
import { useProfile } from '../../hooks/useProfile'
import { useTodayLog } from '../../hooks/useTodayLog'
import { useCycle } from '../../hooks/useCycle'
import { getScheduledDay } from '../../data/workoutProgram'
import { applyCyclePhaseModifier } from '../../domain/workoutProgram'
import { WeeklyCheckin } from '../checkin/WeeklyCheckin'
import { useMotivationState } from './useMotivationState'

export function Dashboard() {
  const { profile } = useProfile()
  const { log, updateToday } = useTodayLog()
  const { phase } = useCycle()
  const { streak, downshiftRecommended } = useMotivationState()
  const [showCheckin, setShowCheckin] = useState(false)
  const isRestDay = new Date().getDay() === 0

  const todaysDay = getScheduledDay(new Date().getDay())
  const modifier = phase ? applyCyclePhaseModifier(todaysDay, phase) : null

  return (
    <div className="space-y-4">
      {downshiftRecommended && (
        <Card className="bg-clay-50">
          <p className="text-sm text-clay-700">
            Let's pick back up today — no penalty for a rough week. Start with whatever feels doable.
          </p>
        </Card>
      )}
      <Card className="bg-sage-50">
        <p className="text-sm text-sage-700">Why you're here</p>
        <p className="text-lg font-medium text-ink-900">
          {profile?.motivationReason || 'Building your hourglass shape, one session at a time.'}
        </p>
      </Card>

      <Card>
        <p className="text-sm text-ink-500">Today's plan</p>
        <h2 className="text-xl font-semibold">{todaysDay.title}</h2>
        {modifier?.lowerBarMessage && <p className="mt-1 text-sm text-clay-700">{modifier.lowerBarMessage}</p>}
        <Link to="/workout">
          <Button className="mt-3">Start workout</Button>
        </Link>
        <Link to="/exercises">
          <Button variant="ghost" className="mt-2">Browse exercise library</Button>
        </Link>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <StatTile icon={<Flame size={20} />} label="Streak" value={`${streak} days`} />
        <StatTile
          icon={<Droplet size={20} />}
          label="Water"
          value={`${log?.waterCount ?? 0} cups`}
        />
      </div>

      <Button variant="secondary" onClick={() => updateToday({ waterCount: (log?.waterCount ?? 0) + 1 })}>
        + Log a cup of water
      </Button>

      <Button variant="secondary" onClick={() => setShowCheckin(true)}>
        {isRestDay ? 'Rest day: Weekly check-in' : 'Weekly check-in'}
      </Button>

      <Modal open={showCheckin} onClose={() => setShowCheckin(false)}>
        <WeeklyCheckin onDone={() => setShowCheckin(false)} />
      </Modal>
    </div>
  )
}
