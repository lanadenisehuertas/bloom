import { useLiveQuery } from 'dexie-react-hooks'
import { Line } from 'react-chartjs-2'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Tooltip } from 'chart.js'
import { db } from '../../db'
import { Card } from '../../components/Card'
import { PhotoCompare } from './PhotoCompare'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip)

function rollingAverage(values: number[], windowSize: number): number[] {
  return values.map((_, i) => {
    const window = values.slice(Math.max(0, i - windowSize + 1), i + 1)
    return window.reduce((a, b) => a + b, 0) / window.length
  })
}

export function ProgressScreen() {
  const dailyLogs = useLiveQuery(() => db.dailyLogs.orderBy('date').toArray(), []) ?? []
  const weighIns = dailyLogs.filter((d) => d.weightKg != null)
  const averages = rollingAverage(weighIns.map((d) => d.weightKg!), 7)
  const latestAvg = averages[averages.length - 1]

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

      <PhotoCompare />
    </div>
  )
}
