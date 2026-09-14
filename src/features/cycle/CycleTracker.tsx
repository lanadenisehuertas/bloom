import { useMemo, useState } from 'react'
import { CalendarHeart, ChevronLeft, ChevronRight, Droplet, RotateCcw } from 'lucide-react'
import { Card } from '../../components/Card'
import { Tone, TONE_MUTED } from '../../components/tones'
import { Button } from '../../components/Button'
import { Pill } from '../../components/Pill'
import { StatTile } from '../../components/StatTile'
import { useCycle } from '../../hooks/useCycle'
import { CyclePhase, projectCyclePhase } from '../../domain/cycle'
import { buildMonthGrid, monthKey, addMonths, formatMonth } from '../../domain/month'
import { todayLocalDate } from '../../lib/localDate'

const PHASE_LABELS: Record<CyclePhase, string> = {
  menstrual: 'Menstrual', follicular: 'Follicular', ovulation: 'Ovulation', luteal: 'Luteal',
}

/** The block colour is the phase indicator — always paired with the phase name below. */
const PHASE_TONES: Record<CyclePhase, Tone> = {
  menstrual: 'rose', follicular: 'mint', ovulation: 'sun', luteal: 'lilac',
}

/** Calendar-cell tints. Deliberately lighter than the hero tones so a month of
 *  colour doesn't read as louder than the one phase she's actually in today. */
const PHASE_CELL: Record<CyclePhase, string> = {
  menstrual: 'bg-rose/15',
  follicular: 'bg-forest/10',
  ovulation: 'bg-sun/30',
  luteal: 'bg-lilac/25',
}

const PHASES: CyclePhase[] = ['menstrual', 'follicular', 'ovulation', 'luteal']

const SYMPTOMS = ['Cramps', 'Bloating', 'Headache', 'Fatigue', 'Mood swings', 'Sore breasts', 'Cravings', 'Back pain']

const WEEKDAY_INITIALS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

export function CycleTracker() {
  const {
    cycleDay,
    phase,
    detectedPhase,
    isPhaseOverridden,
    periodDays,
    avgCycleLength,
    avgPeriodLength,
    symptomsByDate,
    togglePeriodDay,
    setSymptoms,
    setPhaseOverride,
  } = useCycle()

  const today = todayLocalDate()
  const [month, setMonth] = useState(() => monthKey(today))
  const [selected, setSelected] = useState(today)

  const cells = useMemo(() => buildMonthGrid(month), [month])
  const periodSet = useMemo(() => new Set(periodDays), [periodDays])
  const lastPeriodStart = useMemo(() => {
    const starts = [...periodDays].sort()
    return starts[0] ? starts[starts.length - 1] : undefined
  }, [periodDays])

  const tone: Tone = phase ? PHASE_TONES[phase] : 'cream'
  const onDark = tone === 'rose'
  const chipClass = onDark ? 'bg-white/20' : 'bg-ink-900/10'

  const selectedSymptoms = symptomsByDate[selected] ?? []
  const selectedIsPeriod = periodSet.has(selected)
  const selectedIsFuture = selected > today

  /** A day's phase: real when she's logged it as a bleed day, projected otherwise. */
  function phaseForDate(date: string): CyclePhase | null {
    if (periodSet.has(date)) return 'menstrual'
    if (!lastPeriodStart) return null
    return projectCyclePhase(lastPeriodStart, date, avgCycleLength, avgPeriodLength)
  }

  function toggleSymptom(symptom: string) {
    const next = selectedSymptoms.includes(symptom)
      ? selectedSymptoms.filter((s) => s !== symptom)
      : [...selectedSymptoms, symptom]
    setSymptoms(selected, next)
  }

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
          {phase ? PHASE_LABELS[phase] : 'Tap the days you bleed to begin tracking'}
        </h2>
        {cycleDay ? (
          <div className={`mt-4 inline-flex items-baseline gap-2 rounded-chip px-4 py-2 ${chipClass}`}>
            <span className="numerals font-display text-numeral-sm font-extrabold">{cycleDay}</span>
            <span className={`text-label font-bold ${TONE_MUTED[tone]}`}>day of cycle</span>
          </div>
        ) : null}
        <p className={`mt-3 text-label ${TONE_MUTED[tone]}`}>
          {phase
            ? 'Your workouts follow this automatically — intensity eases during your period and builds back up after it.'
            : 'Once you log a period, your whole plan starts adapting to your cycle.'}
        </p>
      </Card>

      {/* Calendar */}
      <Card tone="white" className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <button
            type="button"
            aria-label="Previous month"
            onClick={() => setMonth((m) => addMonths(m, -1))}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-cream-deep transition-transform duration-200 active:scale-[0.97]"
          >
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
          <p className="font-display text-lg font-bold">{formatMonth(month)}</p>
          <button
            type="button"
            aria-label="Next month"
            onClick={() => setMonth((m) => addMonths(m, 1))}
            className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full bg-cream-deep transition-transform duration-200 active:scale-[0.97]"
          >
            <ChevronRight size={18} aria-hidden="true" />
          </button>
        </div>

        <div aria-hidden="true" className="grid grid-cols-7 gap-1">
          {WEEKDAY_INITIALS.map((d, i) => (
            <span key={i} className="text-center text-micro font-bold text-ink-500">
              {d}
            </span>
          ))}
        </div>

        <div role="grid" aria-label="Cycle calendar" className="grid grid-cols-7 gap-1">
          {cells.map((cell) => {
            const cellPhase = phaseForDate(cell.date)
            const isPeriod = periodSet.has(cell.date)
            const isToday = cell.date === today
            const isSelected = cell.date === selected
            const hasSymptoms = (symptomsByDate[cell.date]?.length ?? 0) > 0

            return (
              <button
                key={cell.date}
                type="button"
                role="gridcell"
                aria-label={`${cell.date}${isPeriod ? ', period day' : ''}${
                  cellPhase ? `, ${PHASE_LABELS[cellPhase]}` : ''
                }`}
                aria-selected={isSelected}
                onClick={() => setSelected(cell.date)}
                className={`relative flex min-h-[44px] flex-col items-center justify-center rounded-chip text-[15px] font-bold transition-colors duration-200 ${
                  cell.inMonth ? '' : 'opacity-35'
                } ${isPeriod ? 'bg-rose text-white' : cellPhase ? PHASE_CELL[cellPhase] : 'bg-cream-deep'} ${
                  isSelected ? 'ring-2 ring-ink-900' : ''
                } ${isToday && !isSelected ? 'ring-2 ring-ink-900/30' : ''}`}
              >
                <span className="numerals">{cell.dayOfMonth}</span>
                {hasSymptoms && (
                  <span
                    aria-hidden="true"
                    className={`absolute bottom-1 h-1 w-1 rounded-full ${isPeriod ? 'bg-white' : 'bg-ink-900/50'}`}
                  />
                )}
              </button>
            )
          })}
        </div>

        {/* Legend — colour is never the only signal, so it's spelled out. */}
        <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1">
          {PHASES.map((p) => (
            <span key={p} className="flex items-center gap-1 text-micro font-bold text-ink-500">
              <span aria-hidden="true" className={`h-2.5 w-2.5 rounded-full ${PHASE_CELL[p]}`} />
              {PHASE_LABELS[p]}
            </span>
          ))}
          <span className="flex items-center gap-1 text-micro font-bold text-ink-500">
            <span aria-hidden="true" className="h-2.5 w-2.5 rounded-full bg-rose" />
            Logged period
          </span>
        </div>
      </Card>

      {/* Selected-day detail */}
      <Card tone="cream" className="space-y-3">
        <h2 className="font-display text-xl font-extrabold">
          {selected === today ? 'Today' : selected}
        </h2>

        {selectedIsFuture ? (
          <p className="text-label text-ink-500">
            This day hasn&rsquo;t happened yet — the colour is Bloom&rsquo;s projection from your
            logged history.
          </p>
        ) : (
          <Button
            variant={selectedIsPeriod ? 'primary' : 'secondary'}
            className="w-full gap-2"
            onClick={() => togglePeriodDay(selected)}
          >
            <Droplet size={17} aria-hidden="true" />
            {selectedIsPeriod ? 'Logged as a period day — tap to remove' : 'Mark as a period day'}
          </Button>
        )}

        <div>
          <p className="mb-2 text-label font-bold">Symptoms</p>
          <div className="flex flex-wrap gap-2">
            {SYMPTOMS.map((symptom) => {
              const on = selectedSymptoms.includes(symptom)
              return (
                <button
                  key={symptom}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggleSymptom(symptom)}
                  className={`min-h-[44px] rounded-chip px-3 text-label font-bold transition-colors duration-200 ${
                    on ? 'bg-ink-900 text-white' : 'bg-white text-ink-900'
                  }`}
                >
                  {symptom}
                </button>
              )
            })}
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <StatTile tone="sky" value={`${Math.round(avgCycleLength)}`} label="Avg cycle length (days)" />
        <StatTile tone="blush" value={`${avgPeriodLength}`} label="Avg period length (days)" />
      </div>

      {/* Manual override — the spec calls for auto-detection that is always overridable. */}
      {detectedPhase && (
        <Card tone="white" className="space-y-3">
          <div>
            <h2 className="font-display text-xl font-extrabold">Does this feel right?</h2>
            <p className="mt-1 text-label text-ink-500">
              Bloom thinks you&rsquo;re in the {PHASE_LABELS[detectedPhase].toLowerCase()} phase. Your
              body knows better than the maths — set it yourself for today if it&rsquo;s off.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {PHASES.map((p) => (
              <button
                key={p}
                type="button"
                aria-pressed={phase === p}
                onClick={() => setPhaseOverride(p)}
                className={`min-h-[44px] rounded-chip px-3 text-label font-bold transition-colors duration-200 ${
                  phase === p ? 'bg-ink-900 text-white' : 'bg-cream-deep text-ink-900'
                }`}
              >
                {PHASE_LABELS[p]}
              </button>
            ))}
          </div>
          {isPhaseOverridden && (
            <Button variant="ghost" className="gap-2 px-2 no-underline" onClick={() => setPhaseOverride(null)}>
              <RotateCcw size={16} aria-hidden="true" />
              Back to automatic
            </Button>
          )}
        </Card>
      )}
    </div>
  )
}
