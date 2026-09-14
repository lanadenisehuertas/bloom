export type ActivityLevel = 'sedentary' | 'lightlyActive' | 'active' | 'veryActive'

export const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  lightlyActive: 1.4,
  active: 1.55,
  veryActive: 1.725,
}

const MS_PER_WEEK = 7 * 24 * 60 * 60 * 1000
const DEFAULT_DEFICIT_KCAL = 350
const PROTEIN_G_PER_KG = 1.6

/** Mifflin-St Jeor, female. */
export function calcBMR(weightKg: number, heightCm: number, age: number): number {
  return 10 * weightKg + 6.25 * heightCm - 5 * age - 161
}

export function calcTDEE(bmr: number, activityLevel: ActivityLevel): number {
  return bmr * ACTIVITY_MULTIPLIERS[activityLevel]
}

export function calcDailyTargets(
  tdee: number,
  weightKg: number,
  deficitKcal: number = DEFAULT_DEFICIT_KCAL
): { calorieTarget: number; proteinTarget: number } {
  return {
    calorieTarget: Math.round(tdee - deficitKcal),
    proteinTarget: Math.round(weightKg * PROTEIN_G_PER_KG),
  }
}

/** Never let the implied weekly loss exceed 0.8kg or 1% of body weight, whichever is lower. */
export function calcSafeWeeklyPaceCapKg(weightKg: number): number {
  return Math.min(0.8, weightKg * 0.01)
}

export interface GoalPaceInput {
  startWeightKg: number
  goalWeightKg: number
  startDate: string // ISO date
  goalDate: string // ISO date
}

export interface GoalPaceResult {
  weeksAvailable: number
  requiredWeeklyLossKg: number
  safeWeeklyCapKg: number
  isSafe: boolean
  checkpointWeightKg: number
  recommendedGoalDate: string
}

export function evaluateGoalPace(input: GoalPaceInput): GoalPaceResult {
  const { startWeightKg, goalWeightKg, startDate, goalDate } = input
  const start = new Date(startDate).getTime()
  const end = new Date(goalDate).getTime()
  const weeksAvailable = Math.max((end - start) / MS_PER_WEEK, 0.01)
  const totalLossNeededKg = startWeightKg - goalWeightKg
  const requiredWeeklyLossKg = totalLossNeededKg / weeksAvailable
  const safeWeeklyCapKg = calcSafeWeeklyPaceCapKg(startWeightKg)
  // Epsilon guard: a pace landing exactly on the cap shouldn't flip unsafe due to
  // floating-point noise (e.g. 5.6/7 evaluates to 0.7999999999999999, not 0.8).
  const isSafe = requiredWeeklyLossKg <= safeWeeklyCapKg + 1e-9

  const checkpointWeightKg = Math.max(
    goalWeightKg,
    Math.round((startWeightKg - safeWeeklyCapKg * weeksAvailable) * 10) / 10
  )

  const weeksNeededForGoal = totalLossNeededKg / safeWeeklyCapKg
  const recommendedGoalMs = start + weeksNeededForGoal * MS_PER_WEEK
  const recommendedGoalDate = new Date(recommendedGoalMs).toISOString().slice(0, 10)

  return { weeksAvailable, requiredWeeklyLossKg, safeWeeklyCapKg, isSafe, checkpointWeightKg, recommendedGoalDate }
}
