import { useState } from 'react'
import { ArrowUpRight, Sparkles, TrendingUp, HeartPulse, CheckCircle2 } from 'lucide-react'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { Pill } from '../../components/Pill'
import { getScheduledDay } from '../../data/workoutProgram'
import { getExercise, PUSHUP_PROGRESSION, nextPushupLevel } from '../../data/exercises'
import { MUSCLE_GROUP_LABELS } from '../../data/muscleGroups'
import { useWorkoutLog } from '../../hooks/useWorkoutLog'
import { buildFormVideoLinks } from '../../domain/formVideos'
import { useCycle } from '../../hooks/useCycle'
import { useSettings } from '../../hooks/useSettings'
import { useWellbeingState } from '../../hooks/useWellbeingState'
import {
  applyCyclePhaseModifier,
  suggestProgressiveOverload,
  resolveExerciseId,
  SessionResult,
} from '../../domain/workoutProgram'
import { db } from '../../db'
import { WorkoutLogExercise } from '../../db/schema'

/** Exercises that bear weight on one leg — offer a support note when joint pain
 *  was flagged this week, rather than only swapping the cardio finisher. */
const SINGLE_LEG_EXERCISE_IDS = new Set(['single-leg-glute-bridge', 'step-up', 'donkey-kicks'])

/**
 * Step-badge accents cycle through the palette. Colouring the whole card by muscle
 * group was tried and rejected: a single day is mostly one muscle group, so every
 * card came out the same colour and the list read as a flat wall. Numbered accents
 * keep the screen lively and add a sense of progress without hurting legibility
 * mid-workout.
 */
const STEP_ACCENTS = ['bg-blush', 'bg-sun', 'bg-mint', 'bg-sky', 'bg-lilac', 'bg-coral']

/** Only a simple numeric rep-range like "12-15" supports a "hit the top?" toggle. */
const REP_RANGE_PATTERN = /^(\d+)-(\d+)$/

function isRepRangeExercise(reps: string): boolean {
  return REP_RANGE_PATTERN.test(reps)
}

export function WorkoutPlayer() {
  const day = getScheduledDay(new Date().getDay())
  const { logWorkout, logs } = useWorkoutLog()
  const { phase } = useCycle()
  const { settings, updateSettings } = useSettings()
  const { jointPainFlagged } = useWellbeingState()
  const modifier = phase ? applyCyclePhaseModifier(day, phase) : null
  const [hitTopOfRange, setHitTopOfRange] = useState<Record<string, boolean>>({})
  const [overloadSuggestions, setOverloadSuggestions] = useState<string[]>([])
  const [repCeilingSuggestions, setRepCeilingSuggestions] = useState<string[]>([])
  const [readyToLevelUp, setReadyToLevelUp] = useState(false)

  const pushupLevel = settings.pushupLevel ?? PUSHUP_PROGRESSION[0]
  // Matches the date convention logWorkout writes with below (and the one
  // dailyLogs/useTodayLog already use) — a plain UTC date string, not the local
  // one newer tables use, so "today's log" actually matches what was just saved.
  const todayIso = new Date().toISOString().slice(0, 10)
  const todaysLog = logs.find((l) => l.date === todayIso)

  async function complete(completion: 'full' | 'minimal') {
    const overloadCandidates: string[] = []
    // Once a rep range's own ceiling is high enough to be an endurance range
    // rather than a hypertrophy one, "add a rep" stops being useful advice —
    // with fixed 5kg dumbbells there's no heavier weight to progress to, so the
    // suggestion needs a different lever (tempo/unilateral/pause) instead of an
    // ever-climbing rep count that eventually becomes cardio, not strength work.
    const nearRepCeiling: string[] = []

    const exercises: WorkoutLogExercise[] = []
    for (const e of day.exercises) {
      const resolvedId = resolveExerciseId(e.exerciseId, pushupLevel, jointPainFlagged)
      const exercise = getExercise(resolvedId)
      const entry: WorkoutLogExercise = { name: exercise.name, sets: e.sets, reps: Number.parseInt(e.reps) || 0 }

      if (completion === 'full' && isRepRangeExercise(e.reps)) {
        const toggled = hitTopOfRange[e.exerciseId] ?? false
        entry.hitTopOfRange = toggled

        const pastLogs = await db.workoutLogs.orderBy('date').toArray()
        const priorSessions = pastLogs
          .filter((log) => log.exercises.some((le) => le.name === exercise.name && le.hitTopOfRange !== undefined))
          .slice(-2)
        // suggestProgressiveOverload already only looks at the last 2 sessions of whatever
        // history it's given (and safely returns false when there are fewer than 2 total),
        // so there's no need to gate on priorSessions.length here.
        const history: SessionResult[] = [
          ...priorSessions.map((log) => ({
            hitTopOfRange: log.exercises.find((le) => le.name === exercise.name)!.hitTopOfRange!,
          })),
          { hitTopOfRange: toggled },
        ]
        if (suggestProgressiveOverload(history)) {
          const rangeTop = Number(REP_RANGE_PATTERN.exec(e.reps)?.[2] ?? 0)
          if (rangeTop >= 15) {
            nearRepCeiling.push(exercise.name)
          } else {
            overloadCandidates.push(exercise.name)
          }
        }
      }

      exercises.push(entry)
    }

    await logWorkout({
      date: new Date().toISOString().slice(0, 10),
      workoutDayId: day.id,
      exercises,
      completed: completion,
    })

    setOverloadSuggestions(overloadCandidates)
    setRepCeilingSuggestions(nearRepCeiling)

    // Push-up level-up check: 2 FULL sessions logged at the current level (this one
    // included) is the signal to offer the next step — "max clean reps" has no
    // numeric target to toggle against the way a rep-range exercise does, so
    // completion itself is what "hit the top" means here.
    if (completion === 'full' && day.exercises.some((e) => e.exerciseId === 'pushup-current-level')) {
      const currentLevelName = getExercise(pushupLevel).name
      const priorFullSessionsAtLevel = logs.filter(
        (l) => l.completed === 'full' && l.exercises.some((le) => le.name === currentLevelName)
      ).length
      setReadyToLevelUp(priorFullSessionsAtLevel + 1 >= 2 && nextPushupLevel(pushupLevel) !== null)
    }
  }

  if (day.id === 'rest') {
    return (
      <div className="space-y-4">
        <header className="px-1">
          <p className="text-label font-medium text-ink-500">Recovery &amp; reflection</p>
          <h1 className="font-display text-3xl font-extrabold leading-tight">{day.title}</h1>
        </header>
        <Card tone="mint">
          <Pill className="bg-ink-900/10">Take it easy</Pill>
          <p className="mt-2 font-body text-[15px] font-medium leading-snug">
            Today's a rest day. Take stock of the week — weigh in, jot down your measurements, and
            notice how you're feeling. No workout to log today.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-4 pb-52">
      <header className="px-1">
        <p className="numerals text-label font-medium text-ink-500">
          {day.durationMinutes} min · {day.exercises.length} exercises
        </p>
        <h1 className="font-display text-3xl font-extrabold leading-tight">{day.title}</h1>
      </header>

      {/* Unconditional confirmation — logging a workout should always be visibly
          acknowledged, not just silently written to the database. The suggestion
          cards below are conditional (rep ceiling, level-up); this isn't. */}
      {todaysLog && (
        <Card tone="mint">
          <Pill className="bg-ink-900/10">
            <CheckCircle2 size={13} aria-hidden="true" />
            Logged for today
          </Pill>
          <p className="mt-2 font-body text-[15px] font-medium leading-snug">
            {todaysLog.completed === 'full'
              ? "Nice work — today's full session is saved."
              : 'Saved as a Minimum Viable Day — showing up counts.'}
          </p>
        </Card>
      )}

      {jointPainFlagged && (
        <Card tone="lilac">
          <Pill className="bg-ink-900/10">
            <HeartPulse size={13} aria-hidden="true" />
            From your check-in
          </Pill>
          <p className="mt-2 font-body text-[15px] font-medium leading-snug">
            You flagged joint pain this week, so today's cardio finisher (if any) is swapped to a
            gentler, low-impact version, and single-leg moves are worth doing near a wall or chair for support.
          </p>
        </Card>
      )}

      {modifier?.suggestSwapToRecovery && (
        <Card tone="lilac">
          <Pill className="bg-ink-900/10">Period</Pill>
          <p className="mt-2 font-body text-[15px] font-medium leading-snug">
            Today's your period — full permission to keep this light or swap to recovery if you need it.
          </p>
        </Card>
      )}

      {modifier?.testDay && (
        <Card tone="sun">
          {/* Deliberately not "Peak energy" — the test matches /peak energy/i by
              text and a second match here would make the query ambiguous. */}
          <Pill className="bg-ink-900/10">Ovulation</Pill>
          <p className="mt-2 font-body text-[15px] font-medium leading-snug">
            Peak energy day — if you're feeling strong, today's a good day to test a max clean rep or a bit
            more resistance.
          </p>
        </Card>
      )}

      {modifier?.nudgeProgressiveOverload && (
        <Card tone="mint">
          <Pill className="bg-ink-900/10">High capacity</Pill>
          <p className="mt-2 font-body text-[15px] font-medium leading-snug">
            This is typically your highest-capacity week — consider adding a rep or a little resistance if
            today's sets feel easy.
          </p>
        </Card>
      )}

      {modifier?.lowerBarMessage &&
        !modifier.suggestSwapToRecovery &&
        !modifier.testDay &&
        !modifier.nudgeProgressiveOverload && (
          <Card tone="sky">
            <Pill className="bg-ink-900/10">This week</Pill>
            <p className="mt-2 font-body text-[15px] font-medium leading-snug">
              {modifier.lowerBarMessage}
            </p>
          </Card>
        )}

      {day.exercises.map((programExercise, index) => {
        const resolvedId = resolveExerciseId(programExercise.exerciseId, pushupLevel, jointPainFlagged)
        const exercise = getExercise(resolvedId)
        const videoLinks = buildFormVideoLinks(exercise.name)
        const repReductionPct = modifier?.repReductionPct ?? 0
        const isPlainNumberReps = /^\d+$/.test(programExercise.reps)
        const displayedReps =
          repReductionPct > 0 && isPlainNumberReps
            ? Math.max(1, Math.round(Number.parseInt(programExercise.reps, 10) * (1 - repReductionPct / 100)))
            : programExercise.reps
        return (
          <Card key={exercise.id} tone="white">
            <div className="flex items-start gap-3">
              <span
                aria-hidden="true"
                className={`numerals flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-display text-[15px] font-extrabold text-ink-900 ${STEP_ACCENTS[index % STEP_ACCENTS.length]}`}
              >
                {index + 1}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-micro font-bold uppercase text-ink-500">
                  {MUSCLE_GROUP_LABELS[exercise.muscleGroup]}
                </p>
                <h3 className="font-display text-lg font-bold leading-snug">{exercise.name}</h3>
              </div>
            </div>
            {/* Keep this the FIRST <p> in the card — WorkoutPlayer.test.tsx reads the
                rep count via heading.parentElement.querySelector('p'). */}
            <p className="mt-2 flex flex-wrap items-center gap-2">
              <span className="numerals rounded-chip bg-cream-deep px-3 py-1 text-label font-bold">
                {programExercise.sets} sets × {displayedReps}
              </span>
              {repReductionPct > 0 && isPlainNumberReps && (
                <span className="text-label text-ink-500">
                  (reduced ~{repReductionPct}% for today's phase)
                </span>
              )}
            </p>
            {repReductionPct > 0 && !isPlainNumberReps && (
              <p className="mt-2 text-label text-ink-500">
                (today: aim for ~30% fewer reps, or whatever feels sustainable)
              </p>
            )}
            {jointPainFlagged && SINGLE_LEG_EXERCISE_IDS.has(programExercise.exerciseId) && (
              <p className="mt-2 text-label text-ink-500">
                (use a wall or sturdy chair for support today)
              </p>
            )}
            {isRepRangeExercise(programExercise.reps) && (
              <label className="mt-3 flex min-h-[48px] cursor-pointer items-center gap-3 rounded-chip bg-cream-deep p-3 text-[15px] font-medium">
                <input
                  type="checkbox"
                  className="h-5 w-5 shrink-0 accent-ink-900"
                  checked={hitTopOfRange[programExercise.exerciseId] ?? false}
                  onChange={(ev) =>
                    setHitTopOfRange((prev) => ({ ...prev, [programExercise.exerciseId]: ev.target.checked }))
                  }
                />
                Hit the top of the range today?
              </label>
            )}
            <details className="mt-2">
              <summary className="inline-flex min-h-[44px] cursor-pointer list-none items-center text-label font-bold underline underline-offset-4">
                Form cues
              </summary>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-label">
                {exercise.cues.map((cue) => <li key={cue}>{cue}</li>)}
              </ul>
              <p className="mt-3 text-label font-bold">Common mistakes</p>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-label">
                {exercise.commonMistakes.map((m) => <li key={m}>{m}</li>)}
              </ul>
            </details>
            <a
              href={videoLinks.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center gap-1 text-label font-bold underline underline-offset-4"
            >
              Watch form videos
              <ArrowUpRight size={15} aria-hidden="true" />
            </a>
          </Card>
        )
      })}

      {day.cooldown.length > 0 && (
        <Card tone="cream">
          <h3 className="font-display text-lg font-bold">Cooldown</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-label">
            {day.cooldown.map((c) => <li key={c}>{c}</li>)}
          </ul>
        </Card>
      )}

      {overloadSuggestions.length > 0 && (
        <Card tone="sun">
          <Pill className="bg-ink-900/10">
            <Sparkles size={13} aria-hidden="true" />
            Progress
          </Pill>
          <p className="mt-2 font-body text-[15px] font-medium leading-snug">
            Nice work — next time, try adding a rep or a bit more resistance on: {overloadSuggestions.join(', ')}.
          </p>
        </Card>
      )}

      {repCeilingSuggestions.length > 0 && (
        <Card tone="sun">
          <Pill className="bg-ink-900/10">
            <TrendingUp size={13} aria-hidden="true" />
            Progress
          </Pill>
          <p className="mt-2 font-body text-[15px] font-medium leading-snug">
            You've maxed the rep range on {repCeilingSuggestions.join(', ')} — with fixed dumbbells, a
            higher rep count stops adding much. Try a slower 3-second lowering phase, a single-arm/single-leg
            version, or a brief pause at the hardest point instead of just more reps.
          </p>
        </Card>
      )}

      {readyToLevelUp && nextPushupLevel(pushupLevel) && (
        <Card tone="mint">
          <Pill className="bg-ink-900/10">
            <TrendingUp size={13} aria-hidden="true" />
            Push-up progress
          </Pill>
          <p className="mt-2 font-body text-[15px] font-medium leading-snug">
            Two solid sessions at {getExercise(pushupLevel).name.toLowerCase()} — ready to try{' '}
            {getExercise(nextPushupLevel(pushupLevel)!).name.toLowerCase()} next time?
          </p>
          <Button
            variant="onColor"
            className="mt-3"
            onClick={() => {
              const next = nextPushupLevel(pushupLevel)
              if (next) updateSettings({ pushupLevel: next })
              setReadyToLevelUp(false)
            }}
          >
            Level up
          </Button>
        </Card>
      )}

      {/* Action bar sits above the bottom nav. The gradient gives the scrolling
          content a soft edge instead of appearing to be sliced in half by an
          opaque band. */}
      <div className="pointer-events-none fixed inset-x-0 bottom-[4.25rem] z-30">
        <div className="h-6 bg-gradient-to-t from-cream to-transparent" />
        <div className="pointer-events-auto space-y-1 bg-cream px-4 pb-4">
          <Button variant="primary" className="w-full" onClick={() => complete('full')}>
            {todaysLog ? 'Log full session again' : 'Complete workout'}
          </Button>
          {/* Low-friction escape hatch — deliberately quieter than the primary, but
              never hidden: this is the anti-all-or-nothing feature. */}
          <button
            type="button"
            onClick={() => complete('minimal')}
            className="min-h-[44px] w-full text-label font-bold text-ink-500 underline underline-offset-4 transition-colors duration-200 active:text-ink-900"
          >
            Minimum Viable Day
          </button>
        </div>
      </div>
    </div>
  )
}
