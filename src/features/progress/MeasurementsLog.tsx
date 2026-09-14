import { useState } from 'react'
import { useMeasurements } from '../../hooks/useMeasurements'
import { Card } from '../../components/Card'

function numberField(value: string): number {
  const n = parseFloat(value)
  return Number.isFinite(n) ? n : 0
}

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
    <Card className="space-y-3">
      <h3 className="font-medium">Measurements</h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-2">
        <label className="flex flex-col text-xs text-ink-500">
          Waist (cm)
          <input
            type="number"
            aria-label="Waist (cm)"
            value={waistCm}
            onChange={(e) => setWaistCm(e.target.value)}
            className="rounded border p-1"
          />
        </label>
        <label className="flex flex-col text-xs text-ink-500">
          Hips (cm)
          <input
            type="number"
            aria-label="Hips (cm)"
            value={hipsCm}
            onChange={(e) => setHipsCm(e.target.value)}
            className="rounded border p-1"
          />
        </label>
        <label className="flex flex-col text-xs text-ink-500">
          Upper arm (cm)
          <input
            type="number"
            aria-label="Upper arm (cm)"
            value={upperArmCm}
            onChange={(e) => setUpperArmCm(e.target.value)}
            className="rounded border p-1"
          />
        </label>
        <label className="flex flex-col text-xs text-ink-500">
          Thigh (cm)
          <input
            type="number"
            aria-label="Thigh (cm)"
            value={thighCm}
            onChange={(e) => setThighCm(e.target.value)}
            className="rounded border p-1"
          />
        </label>
        <button
          type="submit"
          disabled={!hasAnyInput}
          className="col-span-2 rounded bg-sage-500 p-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Log measurements
        </button>
      </form>

      {sorted.length > 0 && (
        <ul className="space-y-1 text-xs text-ink-500">
          {sorted.map((m) => (
            <li key={m.date}>
              {m.date}: waist {m.waistCm}cm / hips {m.hipsCm}cm / arm {m.upperArmCm}cm / thigh {m.thighCm}cm
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}
