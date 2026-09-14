import { FoodBase, FoodLogEntry } from '../db/schema'

/**
 * Resolves a chosen serving + quantity of a food into an absolute kcal/protein
 * total, snapshotted at log time. Never recomputed later from `foodId` — if the
 * underlying food's numbers are edited afterward, past log entries must stay
 * exactly as logged (see FoodLogEntry's doc comment in schema.ts).
 */
export function resolveServingTotals(
  food: FoodBase,
  servingLabel: string,
  quantity: number
): { kcal: number; proteinG: number } {
  const serving = food.servings.find((s) => s.label === servingLabel)
  if (!serving) {
    throw new Error(`Unknown serving "${servingLabel}" for food "${food.name}"`)
  }
  const totalGrams = serving.grams * quantity
  const factor = totalGrams / 100
  return {
    kcal: Math.round(food.per100g.kcal * factor),
    proteinG: Math.round(food.per100g.proteinG * factor * 10) / 10,
  }
}

export interface DailyTotals {
  kcal: number
  proteinG: number
}

/** Sums a day's already-resolved log entries — never re-reads the food database. */
export function computeDailyTotals(entries: FoodLogEntry[]): DailyTotals {
  return entries.reduce(
    (acc, e) => ({ kcal: acc.kcal + e.kcal, proteinG: acc.proteinG + e.proteinG }),
    { kcal: 0, proteinG: 0 }
  )
}

export interface CalorieProgress {
  consumed: number
  target: number
  remaining: number
  /** 0-1, clamped — drive a ring/bar with this, not `consumed / target` directly,
   *  so a day over target doesn't visually overflow the display. */
  fractionOfTarget: number
  isOverTarget: boolean
}

/**
 * Deliberately "remaining = target - consumed" and nothing fancier (no adding
 * exercise calories back in) — that's a known source of overcounting/inaccuracy
 * in mainstream trackers. Going over target is reported as a plain fact
 * (`isOverTarget`), never a violation: the UI must not render this as an error
 * state, per the app's anti-guilt design principle.
 */
export function computeCalorieProgress(consumed: number, target: number): CalorieProgress {
  const remaining = target - consumed
  return {
    consumed,
    target,
    remaining,
    fractionOfTarget: target > 0 ? Math.min(1, Math.max(0, consumed / target)) : 0,
    isOverTarget: consumed > target,
  }
}
