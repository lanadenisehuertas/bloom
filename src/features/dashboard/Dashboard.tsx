import { Link } from 'react-router-dom'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { StatTile } from '../../components/StatTile'
import { Droplet, Flame } from 'lucide-react'
import { useProfile } from '../../hooks/useProfile'
import { useTodayLog } from '../../hooks/useTodayLog'
import { useCycle } from '../../hooks/useCycle'
import { useSettings } from '../../hooks/useSettings'
import { getScheduledDay } from '../../data/workoutProgram'
import { applyCyclePhaseModifier } from '../../domain/workoutProgram'

export function Dashboard() {
  const { profile } = useProfile()
  const { log, updateToday } = useTodayLog()
  const { phase } = useCycle()
  const { settings } = useSettings()

  const todaysDay = getScheduledDay(new Date().getDay())
  const modifier = phase ? applyCyclePhaseModifier(todaysDay, phase) : null

  return (
    <div className="space-y-4">
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
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <StatTile icon={<Flame size={20} />} label="Streak" value={`${settings.streakCount} days`} />
        <StatTile
          icon={<Droplet size={20} />}
          label="Water"
          value={`${log?.waterCount ?? 0} cups`}
        />
      </div>

      <Button variant="secondary" onClick={() => updateToday({ waterCount: (log?.waterCount ?? 0) + 1 })}>
        + Log a cup of water
      </Button>
    </div>
  )
}
