import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { getScheduledDay } from '../../data/workoutProgram'
import { getExercise } from '../../data/exercises'
import { useWorkoutLog } from '../../hooks/useWorkoutLog'
import { buildFormVideoLinks } from '../../domain/formVideos'

export function WorkoutPlayer() {
  const day = getScheduledDay(new Date().getDay())
  const { logWorkout } = useWorkoutLog()

  async function complete(completion: 'full' | 'minimal') {
    await logWorkout({
      date: new Date().toISOString().slice(0, 10),
      workoutDayId: day.id,
      exercises: day.exercises.map((e) => ({ name: getExercise(e.exerciseId).name, sets: e.sets, reps: Number.parseInt(e.reps) || 0 })),
      completed: completion,
    })
  }

  return (
    <div className="space-y-3 pb-24">
      <h1 className="text-xl font-semibold">{day.title}</h1>
      <p className="text-sm text-ink-500">{day.durationMinutes} min</p>

      {day.exercises.map((programExercise) => {
        const exercise = getExercise(programExercise.exerciseId)
        const videoLinks = buildFormVideoLinks(exercise.name)
        return (
          <Card key={exercise.id}>
            <p className="font-medium">{exercise.name}</p>
            <p className="text-sm text-ink-500">{programExercise.sets} sets × {programExercise.reps}</p>
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
          <p className="font-medium">Cooldown</p>
          <ul className="list-disc pl-5 text-sm">{day.cooldown.map((c) => <li key={c}>{c}</li>)}</ul>
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
