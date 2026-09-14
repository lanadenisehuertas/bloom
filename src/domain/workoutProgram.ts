import { CyclePhase } from './cycle'
import { WorkoutDay } from '../data/workoutProgram'

export interface CycleModifierResult {
  repReductionPct: number
  suggestSwapToRecovery: boolean
  nudgeProgressiveOverload: boolean
  testDay: boolean
  lowerBarMessage: string | null
}

// _day: reserved for a future per-day-specific modifier (the Dashboard/Workout
// Player tasks already call this with the scheduled day); unused for now.
export function applyCyclePhaseModifier(_day: WorkoutDay, phase: CyclePhase): CycleModifierResult {
  switch (phase) {
    case 'menstrual':
      return {
        repReductionPct: 30,
        suggestSwapToRecovery: true,
        nudgeProgressiveOverload: false,
        testDay: false,
        lowerBarMessage: 'Full permission to rest if cramping — a light or skipped day is completely fine today.',
      }
    case 'follicular':
      return {
        repReductionPct: 0,
        suggestSwapToRecovery: false,
        nudgeProgressiveOverload: true,
        testDay: false,
        lowerBarMessage: null,
      }
    case 'ovulation':
      return {
        repReductionPct: 0,
        suggestSwapToRecovery: false,
        nudgeProgressiveOverload: false,
        testDay: true,
        lowerBarMessage: null,
      }
    case 'luteal':
      return {
        repReductionPct: 0,
        suggestSwapToRecovery: false,
        nudgeProgressiveOverload: false,
        testDay: false,
        lowerBarMessage: "Keep the volume, skip chasing a new PR this week — extra sleep and stretching count as progress too.",
      }
  }
}

/**
 * Resolves a program slot's exercise id to the actual exercise to show/log.
 * 'pushup-current-level' is a virtual marker resolved to whichever progression
 * step the user is currently on; 'cardio-circuit' swaps to its low-impact
 * variant when a recent joint-pain check-in flagged it.
 */
export function resolveExerciseId(
  rawId: string,
  pushupLevel: string,
  jointPainFlagged: boolean
): string {
  if (rawId === 'pushup-current-level') return pushupLevel
  if (rawId === 'cardio-circuit' && jointPainFlagged) return 'cardio-circuit-low-impact'
  return rawId
}

export interface SessionResult {
  hitTopOfRange: boolean
}

/**
 * Suggests a small increase once the last 2 logged sessions both hit the top of the
 * rep range. Assumes `history` is ordered oldest-to-newest — pass a chronological log,
 * not a "most recent first" query result.
 */
export function suggestProgressiveOverload(history: SessionResult[]): boolean {
  if (history.length < 2) return false
  const lastTwo = history.slice(-2)
  return lastTwo.every((s) => s.hitTopOfRange)
}
