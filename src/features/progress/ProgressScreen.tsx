import { useLiveQuery } from 'dexie-react-hooks'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip } from 'chart.js'
import { db } from '../../db'
import { Card } from '../../components/Card'
import { PhotoCompare } from './PhotoCompare'
import { MeasurementsLog } from './MeasurementsLog'
import { useMilestones } from './useMilestones'
import { rollingAverage } from '../../domain/stats'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip)

export function ProgressScreen() {
  const dailyLogs = useLiveQuery(() => db.dailyLogs.orderBy('date').toArray(), []) ?? []
  const weighIns = dailyLogs.filter((d) => d.weightKg != null)
  const averages = rollingAverage(weighIns.map((d) => d.weightKg!), 7)
  const latestAvg = averages[averages.length - 1]
  const { milestones } = useMilestones()
  const sortedMilestones = [...milestones].sort((a, b) => (a.unlockedDate < b.unlockedDate ? 1 : -1))

  return (
    <div className="space-y-3">
      <Card className="bg-sage-50 text-center">
        <p className="text-sm text-sage-700">7-day average weight</p>
        <p className="text-2xl font-semibold">{latestAvg ? `${latestAvg.toFixed(1)}kg` : '—'}</p>
      </Card>

      {weighIns.length > 0 && (
        <Card>
          <Line
            data={{
              labels: weighIns.map((d) => d.date),
              datasets: [{ label: '7-day avg weight (kg)', data: averages, borderColor: '#7a9268', tension: 0.3 }],
            }}
          />
        </Card>
      )}

      {sortedMilestones.length > 0 && (
        <Card className="space-y-2">
          <h3 className="font-medium">Milestones</h3>
          <div className="grid grid-cols-1 gap-2">
            {sortedMilestones.map((m) => (
              <div key={m.id} className="rounded bg-sage-50 p-2 text-sm">
                <span className="font-medium">{m.label}</span>
                <span className="ml-2 text-xs text-ink-500">{m.unlockedDate}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      <MeasurementsLog />

      <PhotoCompare />
    </div>
  )
}
