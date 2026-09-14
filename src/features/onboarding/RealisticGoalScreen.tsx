import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { GoalPaceResult } from '../../domain/nutrition'

export function RealisticGoalScreen({
  result,
  goalDate,
  onAcceptCheckpoint,
  onOverride,
}: {
  result: GoalPaceResult
  goalDate: string
  onAcceptCheckpoint: () => void
  onOverride: () => void
}) {
  return (
    <Card className="space-y-4">
      <h2 className="text-xl font-semibold text-ink-900">Let's set a realistic pace</h2>
      <p className="text-ink-700">
        Reaching your goal weight by {goalDate} would mean losing about{' '}
        {result.requiredWeeklyLossKg.toFixed(1)}kg/week — faster than what's safe for muscle and
        hormonal health (up to {result.safeWeeklyCapKg.toFixed(1)}kg/week).
      </p>
      <p className="text-ink-700">
        Good news: recomposition changes how you <em>look</em> — your shape — faster than the
        scale moves. Here's an honest plan:
      </p>
      <div className="rounded-2xl bg-sage-50 p-4">
        <p className="font-medium text-sage-700">
          Checkpoint by {goalDate}: ~{result.checkpointWeightKg}kg
        </p>
        <p className="text-sm text-ink-500">Full goal, at a safe pace, by: {result.recommendedGoalDate}</p>
      </div>
      <div className="flex gap-2">
        <Button onClick={onAcceptCheckpoint}>Use this plan</Button>
        <Button variant="ghost" onClick={onOverride}>
          Keep my original goal anyway
        </Button>
      </div>
    </Card>
  )
}
