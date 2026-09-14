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
  motivationReason: 'Building the confidence that comes with feeling strong in my own body.',
}

type Step = 'stats' | 'goal' | 'realistic-goal' | 'done'

export function Onboarding() {
  const [step, setStep] = useState<Step>('stats')
  const [draft, setDraft] = useState(DEFAULT_PROFILE_DRAFT)
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
          Pre-filled with your seeded profile — feel free to adjust the numbers below.
        </p>

        <label className="block text-sm" htmlFor="heightCm">Height (cm)</label>
        <input
          id="heightCm"
          type="number"
          className="w-full rounded-2xl border border-cream-200 p-3"
          value={draft.heightCm}
          onChange={(e) => setDraft({ ...draft, heightCm: Number(e.target.value) })}
        />

        <label className="block text-sm" htmlFor="weightKg">Weight (kg)</label>
        <input
          id="weightKg"
          type="number"
          className="w-full rounded-2xl border border-cream-200 p-3"
          value={draft.weightKg}
          onChange={(e) => setDraft({ ...draft, weightKg: Number(e.target.value) })}
        />

        <label className="block text-sm" htmlFor="age">Age</label>
        <input
          id="age"
          type="number"
          className="w-full rounded-2xl border border-cream-200 p-3"
          value={draft.age}
          onChange={(e) => setDraft({ ...draft, age: Number(e.target.value) })}
        />

        <label className="block text-sm" htmlFor="motivationReason">What are you working toward?</label>
        <textarea
          id="motivationReason"
          className="w-full rounded-2xl border border-cream-200 p-3"
          rows={2}
          value={draft.motivationReason}
          onChange={(e) => setDraft({ ...draft, motivationReason: e.target.value })}
        />

        <Button onClick={() => setStep('goal')}>Continue</Button>
      </Card>
    )
  }

  if (step === 'goal') {
    return (
      <Card className="m-4 space-y-3">
        <h1 className="text-xl font-semibold">Your goal</h1>
        <p className="text-sm text-ink-500">
          Adjust your goal weight and target date below.
        </p>

        <label className="block text-sm" htmlFor="goalWeightKg">Goal weight (kg)</label>
        <input
          id="goalWeightKg"
          type="number"
          className="w-full rounded-2xl border border-cream-200 p-3"
          value={draft.goalWeightKg}
          onChange={(e) => setDraft({ ...draft, goalWeightKg: Number(e.target.value) })}
        />

        <label className="block text-sm" htmlFor="goalDate">Goal date</label>
        <input
          id="goalDate"
          type="date"
          className="w-full rounded-2xl border border-cream-200 p-3"
          value={draft.goalDate}
          onChange={(e) => setDraft({ ...draft, goalDate: e.target.value })}
        />

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
