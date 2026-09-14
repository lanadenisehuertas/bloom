import { Tone } from '../components/tones'
import { Exercise } from './exercises'

type MuscleGroup = Exercise['muscleGroup']

/** Human-readable labels — also what the exercise search matches against. */
export const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  glutes: 'Glutes',
  upperBody: 'Upper Body',
  core: 'Core',
  legs: 'Legs',
  cardio: 'Cardio',
  mobility: 'Mobility',
}

/**
 * One colour block per muscle group, so a list scans as colour before text.
 * Shared by the Exercise Library and the Workout Player so the same exercise
 * is always the same colour wherever it appears.
 */
export const MUSCLE_GROUP_TONES: Record<MuscleGroup, Tone> = {
  glutes: 'blush',
  upperBody: 'sky',
  core: 'lilac',
  legs: 'mint',
  cardio: 'coral',
  mobility: 'sun',
}
