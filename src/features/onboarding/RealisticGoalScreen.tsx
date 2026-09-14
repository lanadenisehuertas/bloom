import { Card } from '../../components/Card'
import { TONE_MUTED } from '../../components/tones'
import { Button } from '../../components/Button'
import { Pill } from '../../components/Pill'
import { Sparkles } from 'lucide-react'
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
    <div className="space-y-4">
      <Card tone="forest">
        <Pill className="bg-white/20 text-white">
          <Sparkles size={13} aria-hidden="true" />
          Good news
        </Pill>

        {/* Only one element on this screen may match /realistic/i — a test asserts a
            single match. Keep alternative wording elsewhere. */}
        <h2 className="mt-3 font-display text-[30px] font-extrabold leading-[1.12]">
          Let's set a realistic pace
        </h2>

        <p className={`mt-3 text-[15px] leading-relaxed ${TONE_MUTED.forest}`}>
          Hitting your goal by {goalDate} would mean losing about{' '}
          <strong className="font-bold text-white">{result.requiredWeeklyLossKg.toFixed(1)}kg a week</strong> —
          faster than is safe for your muscle and hormonal health (the safe ceiling is{' '}
          {result.safeWeeklyCapKg.toFixed(1)}kg/week).
        </p>

        <p className={`mt-3 text-[15px] leading-relaxed ${TONE_MUTED.forest}`}>
          Your <em>shape</em> changes faster than the scale does. You'll see the difference
          in the mirror well before you see it in a number.
        </p>
      </Card>

      <Card tone="sun">
        <Pill className="bg-ink-900/10">Your checkpoint</Pill>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="numerals font-display text-numeral font-extrabold">
            {result.checkpointWeightKg}
          </span>
          <span className="font-display text-2xl font-extrabold">kg</span>
        </div>
        <p className={`text-label font-bold ${TONE_MUTED.sun}`}>by {goalDate}</p>

        <div className="mt-4 rounded-chip bg-ink-900/10 p-3">
          <p className="text-label font-medium">
            Full goal, at a safe pace, by{' '}
            <strong className="font-bold">{result.recommendedGoalDate}</strong>
          </p>
        </div>
      </Card>

      <div className="space-y-2">
        <Button className="w-full" onClick={onAcceptCheckpoint}>
          Use this plan
        </Button>
        <Button variant="ghost" className="w-full" onClick={onOverride}>
          Keep my original goal anyway
        </Button>
      </div>
    </div>
  )
}
