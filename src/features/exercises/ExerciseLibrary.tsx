import { useState, useMemo } from 'react'
import { ArrowUpRight, Search } from 'lucide-react'
import { Card } from '../../components/Card'
import { MUSCLE_GROUP_LABELS, MUSCLE_GROUP_TONES } from '../../data/muscleGroups'
import { Pill } from '../../components/Pill'
import { EXERCISES } from '../../data/exercises'
import { buildFormVideoLinks } from '../../domain/formVideos'

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
    <div className="space-y-4">
      <header className="px-1">
        <p className="numerals text-label font-medium text-ink-500">{EXERCISES.length} exercises</p>
        <h1 className="font-display text-3xl font-extrabold leading-tight">Exercises</h1>
      </header>

      <div className="relative">
        <Search
          size={18}
          aria-hidden="true"
          className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-ink-500"
        />
        <input
          className="min-h-[48px] w-full rounded-full border-2 border-cream-edge bg-white py-3 pl-12 pr-5 text-[15px] placeholder:text-ink-500"
          placeholder="Search exercises..."
          aria-label="Search exercises"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {filtered.length === 0 && (
        <Card tone="cream">
          <h2 className="font-display text-lg font-bold">No exercises match "{query}"</h2>
          <p className="mt-1 text-label text-ink-500">
            Try a different name, or search by muscle group — glutes, core, legs, cardio, mobility.
          </p>
        </Card>
      )}

      {filtered.map((exercise) => {
        const videoLinks = buildFormVideoLinks(exercise.name)
        return (
          <Card key={exercise.id} tone={MUSCLE_GROUP_TONES[exercise.muscleGroup] ?? 'white'}>
            <Pill className="bg-ink-900/10">{MUSCLE_GROUP_LABELS[exercise.muscleGroup]}</Pill>
            <h3 className="mt-2 font-display text-lg font-bold leading-snug">{exercise.name}</h3>
            <a
              href={videoLinks.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-1 inline-flex min-h-[48px] items-center gap-1 text-label font-bold underline underline-offset-4"
            >
              Watch form videos
              <ArrowUpRight size={15} aria-hidden="true" />
            </a>
          </Card>
        )
      })}
    </div>
  )
}
