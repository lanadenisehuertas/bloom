import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { db } from '../../db'
import { ActivityLevel, Profile } from '../../db/schema'
import { evaluateGoalPace, GoalPaceResult } from '../../domain/nutrition'
import { RealisticGoalScreen } from './RealisticGoalScreen'

const DEFAULT_PROFILE_DRAFT = {
  heightCm: 175,
  weightKg: 80,
  age: 21,
  activityLevel: 'lightlyActive' as ActivityLevel,
  goalWeightKg: 65,
  goalDate: '2026-10-31',
  equipment: ['dumbbells-5kg', 'resistance-band', 'bodyweight'],
  injuryNotes: 'Occasional joint pain — needs mobility work built in.',
}

type Step = 'stats' | 'goal' | 'realistic-goal' | 'done'

export function Onboarding() {
  const [step, setStep] = useState<Step>('stats')
  const [draft] = useState(DEFAULT_PROFILE_DRAFT)
  const [paceResult, setPaceResult] = useState<GoalPaceResult | null>(null)
  const navigate = useNavigate()

  async function finishOnboarding(finalGoalWeightKg: number, finalGoalDate: string) {
    const profile: Profile = {
      id: 'default',
      ...draft,
      goalWeightKg: finalGoalWeightKg,
      goalDate: finalGoalDate,
      createdAt: new Date().toISOString(),
    }
    await db.profile.put(profile)
    navigate('/')
  }

  if (step === 'stats') {
    return (
      <Card className="m-4 space-y-3">
        <h1 className="text-xl font-semibold">Tell us about you</h1>
        <p className="text-sm text-ink-500">
          Pre-filled with your seeded profile — height {draft.heightCm}cm, weight {draft.weightKg}kg, age {draft.age}.
        </p>
        <Button onClick={() => setStep('goal')}>Continue</Button>
      </Card>
    )
  }

  if (step === 'goal') {
    return (
      <Card className="m-4 space-y-3">
        <h1 className="text-xl font-semibold">Your goal</h1>
        <p className="text-sm text-ink-500">
          Goal weight {draft.goalWeightKg}kg by {draft.goalDate}.
        </p>
        <Button
          onClick={() => {
            const result = evaluateGoalPace({
              startWeightKg: draft.weightKg,
              goalWeightKg: draft.goalWeightKg,
              startDate: new Date().toISOString().slice(0, 10),
              goalDate: draft.goalDate,
            })
            if (result.isSafe) {
              finishOnboarding(draft.goalWeightKg, draft.goalDate)
            } else {
              setPaceResult(result)
              setStep('realistic-goal')
            }
          }}
        >
          Continue
        </Button>
      </Card>
    )
  }

  if (step === 'realistic-goal' && paceResult) {
    return (
      <div className="m-4">
        <RealisticGoalScreen
          result={paceResult}
          goalDate={draft.goalDate}
          onAcceptCheckpoint={() => finishOnboarding(paceResult.checkpointWeightKg, draft.goalDate)}
          onOverride={() => finishOnboarding(draft.goalWeightKg, draft.goalDate)}
        />
      </div>
    )
  }

  return null
}
