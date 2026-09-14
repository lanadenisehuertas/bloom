import { useLiveQuery } from 'dexie-react-hooks'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { CalendarClock, Ruler, TrendingUp, Award } from 'lucide-react'
import { db } from '../../db'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { Pill } from '../../components/Pill'
import { Tone, TONE_MUTED } from '../../components/tones'
import { useProfile } from '../../hooks/useProfile'
import { useMeasurements } from '../../hooks/useMeasurements'
import { PhotoCompare } from './PhotoCompare'
import { MeasurementsLog } from './MeasurementsLog'
import { useMilestones } from './useMilestones'
import { rollingAverage } from '../../domain/stats'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend, Filler)

const MILESTONE_TONES: Tone[] = ['sun', 'mint', 'lilac']

const prefersReducedMotion = () =>
  typeof window !== 'undefined' &&
  typeof window.matchMedia === 'function' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

function daysBetween(fromIso: string, to: Date): number {
  const from = new Date(fromIso)
  return Math.floor((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24))
}

function scrollToMeasurements() {
  const el = document.getElementById('measurements-log')
  el?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'center' })
  const waistInput = el?.querySelector<HTMLInputElement>('[aria-label="Waist (cm)"]')
  waistInput?.focus()
}

export function ProgressScreen() {
  const dailyLogs = useLiveQuery(() => db.dailyLogs.orderBy('date').toArray(), []) ?? []
  const weighIns = dailyLogs.filter((d) => d.weightKg != null)
  const averages = rollingAverage(weighIns.map((d) => d.weightKg!), 7)
  const latestAvg = averages[averages.length - 1]

  const { profile } = useProfile()
  const { measurements } = useMeasurements()
  const sortedMeasurements = [...measurements].sort((a, b) => (a.date < b.date ? 1 : -1))
  const lastMeasurement = sortedMeasurements[0]

  const { milestones } = useMilestones()
  const sortedMilestones = [...milestones].sort((a, b) => (a.unlockedDate < b.unlockedDate ? 1 : -1))

  const today = new Date()
  const daysSinceLastMeasurement = lastMeasurement ? daysBetween(lastMeasurement.date, today) : null
  const daysSinceProfileCreated = profile?.createdAt ? daysBetween(profile.createdAt, today) : null
  const showMeasurementReminder =
    daysSinceLastMeasurement != null
      ? daysSinceLastMeasurement >= 7
      : daysSinceProfileCreated != null && daysSinceProfileCreated >= 7

  const reducedMotion = prefersReducedMotion()

  const weightChartData = {
    labels: weighIns.map((d) => d.date),
    datasets: [
      {
        label: '7-day avg weight (kg)',
        data: averages,
        borderColor: '#14675A',
        backgroundColor: 'rgba(20,103,90,0.08)',
        fill: true,
        pointRadius: 3,
        borderWidth: 3,
      },
    ],
  }

  const weightChartOptions = {
    maintainAspectRatio: false,
    animation: reducedMotion ? ({ duration: 0 } as const) : undefined,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: '#F0DDC9' }, ticks: { color: '#55555F' } },
      y: { grid: { color: '#F0DDC9' }, ticks: { color: '#55555F' } },
    },
  }

  const measurementChartData = {
    labels: sortedMeasurements.slice().reverse().map((m) => m.date),
    datasets: [
      {
        label: 'Waist (cm)',
        data: sortedMeasurements.slice().reverse().map((m) => m.waistCm),
        borderColor: '#A81E49',
        backgroundColor: 'rgba(168,30,73,0.08)',
        fill: true,
        pointRadius: 3,
        borderWidth: 3,
      },
      {
        label: 'Hips (cm)',
        data: sortedMeasurements.slice().reverse().map((m) => m.hipsCm),
        borderColor: '#A292FF',
        backgroundColor: 'transparent',
        pointRadius: 2,
        borderWidth: 2,
      },
      {
        label: 'Upper arm (cm)',
        data: sortedMeasurements.slice().reverse().map((m) => m.upperArmCm),
        borderColor: '#7CC6FF',
        backgroundColor: 'transparent',
        pointRadius: 2,
        borderWidth: 2,
      },
      {
        label: 'Thigh (cm)',
        data: sortedMeasurements.slice().reverse().map((m) => m.thighCm),
        borderColor: '#F2B52E',
        backgroundColor: 'transparent',
        pointRadius: 2,
        borderWidth: 2,
      },
    ],
  }

  const measurementChartOptions = {
    maintainAspectRatio: false,
    animation: reducedMotion ? ({ duration: 0 } as const) : undefined,
    plugins: {
      legend: {
        display: true,
        position: 'bottom' as const,
        labels: { boxWidth: 10, font: { size: 11 }, color: '#55555F' },
      },
    },
    scales: {
      x: { grid: { color: '#F0DDC9' }, ticks: { color: '#55555F' } },
      y: { grid: { color: '#F0DDC9' }, ticks: { color: '#55555F' } },
    },
  }

  return (
    <div className="space-y-4 pb-8">
      <header className="px-1">
        <p className="text-label font-medium text-ink-500">Your trend</p>
        <h1 className="font-display text-3xl font-extrabold leading-tight">Progress</h1>
      </header>

      {/* Hero: the number she's steering by */}
      <Card tone="forest">
        <Pill className="bg-white/20 text-white">7-day average</Pill>
        {latestAvg ? (
          <div className="mt-3">
            <span className="numerals font-display text-numeral font-extrabold">
              {latestAvg.toFixed(1)}kg
            </span>
          </div>
        ) : (
          <>
            <div className="mt-3 font-display text-numeral font-extrabold">—</div>
            <p className={`mt-1 text-label font-medium ${TONE_MUTED.forest}`}>
              Log your weight to start seeing your trend.
            </p>
          </>
        )}
      </Card>

      {showMeasurementReminder && (
        <Card tone="sun">
          <div className="flex items-start gap-3">
            <CalendarClock size={22} aria-hidden="true" className="mt-0.5 shrink-0" />
            <div className="min-w-0 flex-1">
              <p className="font-display text-[17px] font-extrabold leading-snug">
                It's been a week — want to log your measurements?
              </p>
              <p className={`mt-1 text-label font-medium ${TONE_MUTED.sun}`}>
                A quick check-in helps you see progress the scale doesn't always show.
              </p>
              <Button
                variant="onColor"
                className="mt-3"
                onClick={scrollToMeasurements}
              >
                Log measurements
              </Button>
            </div>
          </div>
        </Card>
      )}

      {weighIns.length > 0 && (
        <Card>
          <div className="flex items-center gap-2">
            <TrendingUp size={16} aria-hidden="true" className="text-ink-500" />
            <h3 className="font-display text-[15px] font-bold">Weight trend</h3>
          </div>
          <div className="mt-3 h-48">
            <Line data={weightChartData} options={weightChartOptions} />
          </div>
        </Card>
      )}

      <Card>
        <div className="flex items-center gap-2">
          <Ruler size={16} aria-hidden="true" className="text-ink-500" />
          <h3 className="font-display text-[15px] font-bold">Measurements trend</h3>
        </div>
        {sortedMeasurements.length >= 2 ? (
          <div className="mt-3 h-48">
            <Line data={measurementChartData} options={measurementChartOptions} />
          </div>
        ) : (
          <p className="mt-2 text-label font-medium text-ink-500">
            Log a couple of weeks of measurements to see your trend here.
          </p>
        )}
      </Card>

      {sortedMilestones.length > 0 ? (
        <section className="space-y-2">
          <h3 className="px-1 font-display text-[15px] font-bold">Milestones</h3>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {sortedMilestones.map((m, i) => (
              <Card
                key={m.id}
                tone={MILESTONE_TONES[i % MILESTONE_TONES.length]}
                className="w-44 shrink-0"
              >
                <Award size={18} aria-hidden="true" />
                <p className="mt-2 font-display text-[15px] font-extrabold leading-snug">{m.label}</p>
                <p className={`mt-1 text-label font-medium ${TONE_MUTED[MILESTONE_TONES[i % MILESTONE_TONES.length]]}`}>
                  {m.unlockedDate}
                </p>
              </Card>
            ))}
          </div>
        </section>
      ) : (
        <Card tone="cream">
          <p className="font-display text-[15px] font-bold">Milestones</p>
          <p className="mt-1 text-label font-medium text-ink-500">
            Keep going — milestones unlock automatically as you build streaks and hit checkpoints.
          </p>
        </Card>
      )}

      <MeasurementsLog />

      <PhotoCompare />
    </div>
  )
}
