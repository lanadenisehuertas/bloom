export interface ProgramExercise {
  exerciseId: string
  sets: number
  reps: string // e.g. "15" or "12/side" or "20-30s"
}

export interface WorkoutDay {
  id: 'A' | 'B' | 'C' | 'D' | 'recovery' | 'rest'
  title: string
  durationMinutes: string
  exercises: ProgramExercise[]
  cooldown: string[]
}

export const WORKOUT_DAYS: Record<string, WorkoutDay> = {
  A: {
    id: 'A', title: 'Glutes & Hips', durationMinutes: '35-40',
    exercises: [
      { exerciseId: 'banded-glute-bridge-hold', sets: 3, reps: '15 pulses + 20s hold' },
      { exerciseId: 'side-lying-leg-raise', sets: 3, reps: '15/side' },
      { exerciseId: 'clamshells', sets: 3, reps: '15/side' },
      { exerciseId: 'banded-lateral-walk', sets: 3, reps: '10 steps each direction' },
      { exerciseId: 'single-leg-glute-bridge', sets: 3, reps: '12/leg' },
      { exerciseId: 'fire-hydrants', sets: 2, reps: '15/side' },
      { exerciseId: 'goblet-squat', sets: 3, reps: '12-15' },
      { exerciseId: 'standing-hip-abduction', sets: 3, reps: '15/side' },
    ],
    cooldown: ['90/90 hip stretch', 'Pigeon stretch'],
  },
  B: {
    id: 'B', title: 'Upper Body, Arms & Back', durationMinutes: '35-40',
    exercises: [
      // 'pushup-current-level' is a virtual slot, not a real exercise id — WorkoutPlayer
      // resolves it to whichever step of PUSHUP_PROGRESSION the user is currently on.
      { exerciseId: 'pushup-current-level', sets: 3, reps: 'max clean reps' },
      { exerciseId: 'db-bent-over-row', sets: 3, reps: '12' },
      { exerciseId: 'banded-lat-pulldown', sets: 3, reps: '15' },
      { exerciseId: 'reverse-fly', sets: 3, reps: '15' },
      { exerciseId: 'band-pull-apart', sets: 3, reps: '15' },
      { exerciseId: 'db-overhead-press', sets: 3, reps: '10-12' },
      { exerciseId: 'bicep-curl', sets: 3, reps: '12' },
      { exerciseId: 'tricep-kickback', sets: 3, reps: '12' },
      { exerciseId: 'plank-hold', sets: 3, reps: '20-30s' },
    ],
    cooldown: ['Doorway chest stretch', 'Cat-cow', "Child's pose"],
  },
  C: {
    id: 'C', title: 'Core & Waist', durationMinutes: '30-35',
    exercises: [
      { exerciseId: 'dead-bug', sets: 3, reps: '10/side' },
      { exerciseId: 'bird-dog', sets: 3, reps: '10/side' },
      { exerciseId: 'standing-oblique-bend', sets: 3, reps: '15/side' },
      { exerciseId: 'glute-bridge-march', sets: 3, reps: '10/side' },
      { exerciseId: 'pallof-press', sets: 3, reps: '12/side' },
      { exerciseId: 'plank-shoulder-tap', sets: 3, reps: '20 taps' },
      { exerciseId: 'diaphragmatic-breathing', sets: 2, reps: '10 breaths' },
    ],
    cooldown: ['Cat-cow', 'Seated spinal twist'],
  },
  D: {
    id: 'D', title: 'Glutes/Legs Part 2 + Cardio Finisher', durationMinutes: '35-45',
    exercises: [
      { exerciseId: 'db-romanian-deadlift', sets: 3, reps: '12' },
      { exerciseId: 'hip-thrust', sets: 3, reps: '15' },
      { exerciseId: 'step-up', sets: 3, reps: '10/leg' },
      { exerciseId: 'banded-squat', sets: 3, reps: '15' },
      { exerciseId: 'donkey-kicks', sets: 3, reps: '15/side' },
      { exerciseId: 'cardio-circuit', sets: 1, reps: '10-12 min, 40s on/20s off' },
    ],
    cooldown: ['Quad stretch', 'Hamstring stretch', 'Calf stretch', 'Hip flexor stretch'],
  },
  recovery: {
    id: 'recovery', title: 'Active Recovery', durationMinutes: '10-15',
    exercises: [{ exerciseId: 'active-recovery-flow', sets: 1, reps: '10 min flow' }],
    cooldown: [],
  },
  rest: { id: 'rest', title: 'Rest + Weekly Check-In', durationMinutes: '-', exercises: [], cooldown: [] },
}

/** 0 = Sunday ... 6 = Saturday, matching Date#getDay(). */
export const WEEKLY_SCHEDULE: Record<number, string> = {
  0: 'rest',
  1: 'A',
  2: 'recovery',
  3: 'B',
  4: 'C',
  5: 'recovery',
  6: 'D',
}

export function getScheduledDay(dayOfWeek: number): WorkoutDay {
  const dayKey = WEEKLY_SCHEDULE[dayOfWeek]
  const day = WORKOUT_DAYS[dayKey]
  if (!day) throw new Error(`No scheduled day for dayOfWeek: ${dayOfWeek}`)
  return day
}
