import { useState, ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { Pill } from '../../components/Pill'
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

const inputClass =
  'w-full min-h-[48px] rounded-chip border-2 border-cream-edge bg-white px-4 py-3 font-body text-[16px] font-medium'

function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string
  label: string
  hint?: string
  children: ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-label font-bold" htmlFor={id}>
        {label}
      </label>
      {children}
      {hint && <p className="text-label text-ink-500">{hint}</p>}
    </div>
  )
}

/** A user correcting a typo on step 2 shouldn't have to restart the whole flow —
 *  multi-step forms must always allow going back (design-system UX checklist). */
function BackButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="-ml-2 inline-flex min-h-[44px] items-center gap-1 rounded-full px-2 text-label font-bold text-ink-500 transition-colors duration-200 active:text-ink-900"
    >
      <ArrowLeft size={16} aria-hidden="true" />
      {label}
    </button>
  )
}

function StepDots({ current }: { current: 1 | 2 }) {
  return (
    <div className="flex items-center gap-2" aria-label={`Step ${current} of 2`}>
      {[1, 2].map((n) => (
        <span
          key={n}
          aria-hidden="true"
          className={`h-1.5 rounded-full transition-all duration-200 ${
            n === current ? 'w-8 bg-ink-900' : 'w-4 bg-cream-edge'
          }`}
        />
      ))}
    </div>
  )
}

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
      <div className="mx-auto w-full max-w-md space-y-4 p-4 pt-8">
        <header className="space-y-3 px-1">
          <Pill className="bg-blush text-ink-900">Welcome to Bloom</Pill>
          <h1 className="font-display text-[34px] font-extrabold leading-[1.1]">
            Tell us about you
          </h1>
          <StepDots current={1} />
        </header>

        <Card className="space-y-4">
          <p className="text-label text-ink-500">
            Pre-filled to get you started — adjust anything that isn't right.
          </p>

          <Field id="heightCm" label="Height (cm)">
            <input
              id="heightCm"
              type="number"
              inputMode="numeric"
              className={inputClass}
              value={draft.heightCm}
              onChange={(e) => setDraft({ ...draft, heightCm: Number(e.target.value) })}
            />
          </Field>

          <Field id="weightKg" label="Weight (kg)">
            <input
              id="weightKg"
              type="number"
              inputMode="decimal"
              className={inputClass}
              value={draft.weightKg}
              onChange={(e) => setDraft({ ...draft, weightKg: Number(e.target.value) })}
            />
          </Field>

          <Field id="age" label="Age">
            <input
              id="age"
              type="number"
              inputMode="numeric"
              className={inputClass}
              value={draft.age}
              onChange={(e) => setDraft({ ...draft, age: Number(e.target.value) })}
            />
          </Field>

          <Field
            id="motivationReason"
            label="What are you working toward?"
            hint="This shows up on your home screen — make it yours."
          >
            <textarea
              id="motivationReason"
              className={inputClass}
              rows={3}
              value={draft.motivationReason}
              onChange={(e) => setDraft({ ...draft, motivationReason: e.target.value })}
            />
          </Field>
        </Card>

        <Button className="w-full" onClick={() => setStep('goal')}>
          Continue
        </Button>
      </div>
    )
  }

  if (step === 'goal') {
    return (
      <div className="mx-auto w-full max-w-md space-y-4 p-4 pt-8">
        <header className="space-y-3 px-1">
          <BackButton label="Back" onClick={() => setStep('stats')} />
          <Pill className="bg-sun text-ink-900">Your goal</Pill>
          <h1 className="font-display text-[34px] font-extrabold leading-[1.1]">
            What are you aiming for?
          </h1>
          <StepDots current={2} />
        </header>

        <Card className="space-y-4">
          <Field id="goalWeightKg" label="Goal weight (kg)">
            <input
              id="goalWeightKg"
              type="number"
              inputMode="decimal"
              className={inputClass}
              value={draft.goalWeightKg}
              onChange={(e) => setDraft({ ...draft, goalWeightKg: Number(e.target.value) })}
            />
          </Field>

          <Field
            id="goalDate"
            label="Goal date"
            hint="We'll check this is a safe pace before locking it in."
          >
            <input
              id="goalDate"
              type="date"
              className={inputClass}
              value={draft.goalDate}
              onChange={(e) => setDraft({ ...draft, goalDate: e.target.value })}
            />
          </Field>
        </Card>

        <Button
          className="w-full"
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
      </div>
    )
  }

  if (step === 'realistic-goal' && paceResult) {
    return (
      <div className="mx-auto w-full max-w-md space-y-3 p-4 pt-8">
        <BackButton label="Adjust my goal" onClick={() => setStep('goal')} />
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
