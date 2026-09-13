import { useState, useMemo } from 'react'
import { Card } from '../../components/Card'
import { EXERCISES } from '../../data/exercises'
import { buildFormVideoLinks } from '../../domain/formVideos'

const MUSCLE_GROUP_LABELS: Record<string, string> = {
  glutes: 'Glutes',
  upperBody: 'Upper Body',
  core: 'Core',
  legs: 'Legs',
  cardio: 'Cardio',
  mobility: 'Mobility',
}

export function ExerciseLibrary() {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.toLowerCase()
    return EXERCISES.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        MUSCLE_GROUP_LABELS[e.muscleGroup].toLowerCase().includes(q)
    )
  }, [query])

  return (
    <div className="space-y-3">
      <input
        className="w-full rounded-2xl border border-cream-200 p-3"
        placeholder="Search exercises..."
        aria-label="Search exercises"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {filtered.map((exercise) => {
        const videoLinks = buildFormVideoLinks(exercise.name)
        return (
          <Card key={exercise.id}>
            <h3 className="font-medium">{exercise.name}</h3>
            <p className="text-xs uppercase tracking-wide text-ink-300">{MUSCLE_GROUP_LABELS[exercise.muscleGroup]}</p>
            <a
              href={videoLinks.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-block text-sm font-medium text-sage-700 underline"
            >
              Watch form videos
            </a>
          </Card>
        )
      })}
    </div>
  )
}
