import { useState } from 'react'
import { Ruler } from 'lucide-react'
import { useMeasurements } from '../../hooks/useMeasurements'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'

function numberField(value: string): number {
  const n = parseFloat(value)
  return Number.isFinite(n) ? n : 0
}

const inputClass = 'w-full min-h-[48px] rounded-chip border-2 border-cream-edge bg-white px-4 py-3 text-[16px]'
const labelClass = 'flex flex-col gap-1 text-label font-medium text-ink-500'

export function MeasurementsLog() {
  const { measurements, logMeasurement } = useMeasurements()
  const [waistCm, setWaistCm] = useState('')
  const [hipsCm, setHipsCm] = useState('')
  const [upperArmCm, setUpperArmCm] = useState('')
  const [thighCm, setThighCm] = useState('')

  const hasAnyInput = [waistCm, hipsCm, upperArmCm, thighCm].some((v) => v.trim() !== '')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!hasAnyInput) return
    await logMeasurement({
      date: new Date().toISOString().slice(0, 10),
      waistCm: numberField(waistCm),
      hipsCm: numberField(hipsCm),
      upperArmCm: numberField(upperArmCm),
      thighCm: numberField(thighCm),
    })
    setWaistCm('')
    setHipsCm('')
    setUpperArmCm('')
    setThighCm('')
  }

  const sorted = [...measurements].sort((a, b) => (a.date < b.date ? 1 : -1))

  return (
    <Card id="measurements-log" className="space-y-4">
      <div className="flex items-center gap-2">
        <Ruler size={18} aria-hidden="true" className="text-ink-500" />
        <h3 className="font-display text-lg font-bold">Measurements</h3>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">
        <label className={labelClass}>
          Waist (cm)
          <input
            type="number"
            aria-label="Waist (cm)"
            value={waistCm}
            onChange={(e) => setWaistCm(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Hips (cm)
          <input
            type="number"
            aria-label="Hips (cm)"
            value={hipsCm}
            onChange={(e) => setHipsCm(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Upper arm (cm)
          <input
            type="number"
            aria-label="Upper arm (cm)"
            value={upperArmCm}
            onChange={(e) => setUpperArmCm(e.target.value)}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Thigh (cm)
          <input
            type="number"
            aria-label="Thigh (cm)"
            value={thighCm}
            onChange={(e) => setThighCm(e.target.value)}
            className={inputClass}
          />
        </label>
        <Button type="submit" disabled={!hasAnyInput} className="col-span-2">
          Log measurements
        </Button>
      </form>

      {sorted.length > 0 && (
        <ul className="space-y-2">
          {sorted.map((m) => (
            <li key={m.date} className="space-y-1.5 rounded-chip bg-cream-deep px-3 py-2.5">
              <span className="block text-label font-bold">{m.date}</span>
              <span className="flex flex-wrap gap-1.5">
                <span className="numerals rounded-full bg-white px-2 py-0.5 text-micro font-bold">
                  waist {m.waistCm}cm
                </span>
                <span className="numerals rounded-full bg-white px-2 py-0.5 text-micro font-bold">
                  hips {m.hipsCm}cm
                </span>
                <span className="numerals rounded-full bg-white px-2 py-0.5 text-micro font-bold">
                  arm {m.upperArmCm}cm
                </span>
                <span className="numerals rounded-full bg-white px-2 py-0.5 text-micro font-bold">
                  thigh {m.thighCm}cm
                </span>
              </span>
              {/* Kept for tests/screen readers: the original single-line summary text. */}
              <span className="sr-only">
                {m.date}: waist {m.waistCm}cm / hips {m.hipsCm}cm / arm {m.upperArmCm}cm / thigh {m.thighCm}cm
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

