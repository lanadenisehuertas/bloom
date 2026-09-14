import { useState } from 'react'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { getScheduledDay } from '../../data/workoutProgram'
import { getExercise } from '../../data/exercises'
import { useWorkoutLog } from '../../hooks/useWorkoutLog'
import { buildFormVideoLinks } from '../../domain/formVideos'
import { useCycle } from '../../hooks/useCycle'
import { applyCyclePhaseModifier, suggestProgressiveOverload, SessionResult } from '../../domain/workoutProgram'
import { db } from '../../db'
import { WorkoutLogExercise } from '../../db/schema'

/** Only a simple numeric rep-range like "12-15" supports a "hit the top?" toggle. */
const REP_RANGE_PATTERN = /^(\d+)-(\d+)$/

function isRepRangeExercise(reps: string): boolean {
  return REP_RANGE_PATTERN.test(reps)
}

export function WorkoutPlayer() {
  const day = getScheduledDay(new Date().getDay())
  const { logWorkout } = useWorkoutLog()
  const { phase } = useCycle()
  const modifier = phase ? applyCyclePhaseModifier(day, phase) : null
  const [hitTopOfRange, setHitTopOfRange] = useState<Record<string, boolean>>({})
  const [overloadSuggestions, setOverloadSuggestions] = useState<string[]>([])

  async function complete(completion: 'full' | 'minimal') {
    const overloadCandidates: string[] = []

    const exercises: WorkoutLogExercise[] = []
    for (const e of day.exercises) {
      const exercise = getExercise(e.exerciseId)
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
          overloadCandidates.push(exercise.name)
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
  }

  if (day.id === 'rest') {
    return (
      <div className="space-y-3">
        <h1 className="text-xl font-semibold">{day.title}</h1>
        <Card>
          <p className="text-ink-700">
            Today's a rest day. Take stock of the week — weigh in, jot down your measurements, and
            notice how you're feeling. No workout to log today.
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-3 pb-24">
      <h1 className="text-xl font-semibold">{day.title}</h1>
      <p className="text-sm text-ink-500">{day.durationMinutes} min</p>

      {modifier?.suggestSwapToRecovery && (
        <Card>
          <p className="text-sm text-ink-700">
            Today's your period — full permission to keep this light or swap to recovery if you need it.
          </p>
        </Card>
      )}

      {modifier?.testDay && (
        <Card>
          <p className="text-sm text-ink-700">
            Peak energy day — if you're feeling strong, today's a good day to test a max clean rep or a bit
            more resistance.
          </p>
        </Card>
      )}

      {modifier?.nudgeProgressiveOverload && (
        <Card>
          <p className="text-sm text-ink-700">
            This is typically your highest-capacity week — consider adding a rep or a little resistance if
            today's sets feel easy.
          </p>
        </Card>
      )}

      {modifier?.lowerBarMessage &&
        !modifier.suggestSwapToRecovery &&
        !modifier.testDay &&
        !modifier.nudgeProgressiveOverload && (
          <Card>
            <p className="text-sm text-ink-700">{modifier.lowerBarMessage}</p>
          </Card>
        )}

      {day.exercises.map((programExercise) => {
        const exercise = getExercise(programExercise.exerciseId)
        const videoLinks = buildFormVideoLinks(exercise.name)
        const repReductionPct = modifier?.repReductionPct ?? 0
        const isPlainNumberReps = /^\d+$/.test(programExercise.reps)
        const displayedReps =
          repReductionPct > 0 && isPlainNumberReps
            ? Math.max(1, Math.round(Number.parseInt(programExercise.reps, 10) * (1 - repReductionPct / 100)))
            : programExercise.reps
        return (
          <Card key={exercise.id}>
            <h3 className="font-medium">{exercise.name}</h3>
            <p className="text-sm text-ink-500">
              {programExercise.sets} sets × {displayedReps}
              {repReductionPct > 0 && isPlainNumberReps && (
                <span className="text-xs text-clay-700"> (reduced ~{repReductionPct}% for today's phase)</span>
              )}
            </p>
            {repReductionPct > 0 && !isPlainNumberReps && (
              <p className="text-xs text-clay-700">
                (today: aim for ~30% fewer reps, or whatever feels sustainable)
              </p>
            )}
            {isRepRangeExercise(programExercise.reps) && (
              <label className="mt-2 flex items-center gap-2 text-sm text-ink-700">
                <input
                  type="checkbox"
                  checked={hitTopOfRange[programExercise.exerciseId] ?? false}
                  onChange={(ev) =>
                    setHitTopOfRange((prev) => ({ ...prev, [programExercise.exerciseId]: ev.target.checked }))
                  }
                />
                Hit the top of the range today?
              </label>
            )}
            <details className="mt-2 text-sm">
              <summary className="cursor-pointer text-sage-700">Form cues</summary>
              <ul className="mt-1 list-disc pl-5">
                {exercise.cues.map((cue) => <li key={cue}>{cue}</li>)}
              </ul>
              <p className="mt-2 font-medium text-clay-700">Common mistakes</p>
              <ul className="list-disc pl-5">
                {exercise.commonMistakes.map((m) => <li key={m}>{m}</li>)}
              </ul>
            </details>
            <a
              href={videoLinks.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-sm font-medium text-sage-700 underline"
            >
              Watch form videos
            </a>
          </Card>
        )
      })}

      {day.cooldown.length > 0 && (
        <Card>
          <h3 className="font-medium">Cooldown</h3>
          <ul className="list-disc pl-5 text-sm">{day.cooldown.map((c) => <li key={c}>{c}</li>)}</ul>
        </Card>
      )}

      {overloadSuggestions.length > 0 && (
        <Card>
          <p className="text-sm text-ink-700">
            Nice work — next time, try adding a rep or a bit more resistance on: {overloadSuggestions.join(', ')}.
          </p>
        </Card>
      )}

      <div className="fixed inset-x-0 bottom-16 flex justify-center gap-2 px-4">
        <Button onClick={() => complete('full')}>Complete workout</Button>
        <Button variant="secondary" onClick={() => complete('minimal')}>
          Minimum Viable Day
        </Button>
      </div>
    </div>
  )
}
