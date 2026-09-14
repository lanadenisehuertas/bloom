import { useRef, useState } from 'react'
import { Download, Upload, RefreshCcw } from 'lucide-react'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { Pill } from '../../components/Pill'
import { TONE_MUTED } from '../../components/tones'
import { exportData, importData } from '../../db/backup'
import { db } from '../../db'
import { Profile } from '../../db/schema'
import { useProfile } from '../../hooks/useProfile'
import { useSettings } from '../../hooks/useSettings'
import { evaluateGoalPace, GoalPaceResult, calcBMR, calcTDEE, calcDailyTargets, calcSafeWeeklyPaceCapKg } from '../../domain/nutrition'
import { checkTooFastLoss, checkPlateau } from '../../domain/adaptiveRecalc'
import { rollingAverage } from '../../domain/stats'
import { RealisticGoalScreen } from '../onboarding/RealisticGoalScreen'

type ProfileDraft = Pick<Profile, 'heightCm' | 'weightKg' | 'age' | 'goalWeightKg' | 'goalDate' | 'motivationReason'>

const inputClass = 'mt-1 w-full min-h-[48px] rounded-chip border-2 border-cream-edge bg-white px-4 py-3 text-[16px] text-ink-900'
const labelClass = 'block text-label font-medium'

function draftFromProfile(profile: Profile): ProfileDraft {
  return {
    heightCm: profile.heightCm,
    weightKg: profile.weightKg,
    age: profile.age,
    goalWeightKg: profile.goalWeightKg,
    goalDate: profile.goalDate,
    motivationReason: profile.motivationReason ?? '',
  }
}

export function SettingsScreen() {
  const { profile, saveProfile } = useProfile()
  const { settings, updateSettings } = useSettings()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importError, setImportError] = useState<string | null>(null)

  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState<ProfileDraft | null>(null)
  const [pendingUnsafePace, setPendingUnsafePace] = useState<GoalPaceResult | null>(null)

  const [recalcMessage, setRecalcMessage] = useState<string | null>(null)
  const [recalcNote, setRecalcNote] = useState<string | null>(null)

  async function handleExport() {
    const bundle = await exportData()
    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `bloom-backup-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
  }

  async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    // Reset the input so re-selecting the same (still-broken) file re-fires onChange.
    e.target.value = ''
    if (!file) return
    setImportError(null)
    try {
      const text = await file.text()
      await importData(JSON.parse(text))
    } catch (err) {
      setImportError(
        err instanceof Error ? err.message : 'Could not import this file — it may not be a valid Bloom backup.'
      )
    }
  }

  function startEditing() {
    if (!profile) return
    setDraft(draftFromProfile(profile))
    setPendingUnsafePace(null)
    setIsEditing(true)
  }

  function cancelEditing() {
    setIsEditing(false)
    setDraft(null)
    setPendingUnsafePace(null)
  }

  async function finishSavingProfile(finalGoalWeightKg: number, finalGoalDate: string) {
    if (!profile || !draft) return
    const updated: Profile = {
      ...profile,
      heightCm: draft.heightCm,
      weightKg: draft.weightKg,
      age: draft.age,
      motivationReason: draft.motivationReason,
      goalWeightKg: finalGoalWeightKg,
      goalDate: finalGoalDate,
    }
    await saveProfile(updated)
    setIsEditing(false)
    setDraft(null)
    setPendingUnsafePace(null)
  }

  function handleSaveChanges() {
    if (!draft) return
    const result = evaluateGoalPace({
      startWeightKg: draft.weightKg,
      goalWeightKg: draft.goalWeightKg,
      startDate: new Date().toISOString().slice(0, 10),
      goalDate: draft.goalDate,
    })
    if (result.isSafe) {
      void finishSavingProfile(draft.goalWeightKg, draft.goalDate)
    } else {
      setPendingUnsafePace(result)
    }
  }

  async function handleRecalculate() {
    if (!profile) return
    const dailyLogs = await db.dailyLogs.orderBy('date').toArray()
    const weighIns = dailyLogs.filter((d) => d.weightKg != null)
    const averages = rollingAverage(weighIns.map((d) => d.weightKg!), 7)
    const currentWeightKg = averages.length > 0 ? averages[averages.length - 1] : profile.weightKg

    const bmr = calcBMR(currentWeightKg, profile.heightCm, profile.age)
    const tdee = calcTDEE(bmr, profile.activityLevel)
    const { calorieTarget, proteinTarget } = calcDailyTargets(tdee, currentWeightKg)

    await updateSettings({
      currentCalorieTarget: calorieTarget,
      currentProteinTarget: proteinTarget,
      lastRecalcDate: new Date().toISOString().slice(0, 10),
    })

    setRecalcMessage(`Updated targets: ${calorieTarget} kcal/day, ${proteinTarget}g protein/day.`)

    // Nice-to-have: flag anything noteworthy in the recent weight trend. Not required
    // for the recalculation itself to take effect, so kept best-effort/simple.
    let note: string | null = null
    if (averages.length >= 2) {
      const weekAgoIndex = Math.max(0, averages.length - 1 - 7)
      const actualWeeklyLossKg = averages[weekAgoIndex] - averages[averages.length - 1]
      const safeWeeklyCapKg = calcSafeWeeklyPaceCapKg(currentWeightKg)
      if (checkTooFastLoss(actualWeeklyLossKg, safeWeeklyCapKg)) {
        note = 'Your weight is dropping faster than the safe pace — consider increasing your calorie target slightly.'
      } else if (averages.length >= 4) {
        const weeklySamples = averages.filter((_, i) => (averages.length - 1 - i) % 7 === 0).slice(-4)
        const recentLogs = dailyLogs.slice(-7)
        const adherenceLogged = recentLogs.filter((d) => d.mealsLogged.length > 0).length >= 4
        const plateau = checkPlateau(weeklySamples, adherenceLogged)
        if (plateau === 'reduceCalories') {
          note = 'Your weight has been steady for a while — you could try reducing your target slightly, or check that you\'re logging consistently.'
        } else if (plateau === 'flagUnderLogging') {
          note = 'Your weight has been steady for a while — make sure you\'re logging meals and weigh-ins consistently so targets stay accurate.'
        }
      }
    }
    setRecalcNote(note)
  }

  return (
    <div className="space-y-4">
      <header className="px-1">
        <p className="text-label font-medium text-ink-500">Account</p>
        <h1 className="font-display text-3xl font-extrabold leading-tight">You</h1>
      </header>

      <Card tone="lilac" className="space-y-3">
        <Pill className="bg-ink-900/10">Profile</Pill>
        <p className="font-display text-xl font-extrabold leading-snug">
          {profile ? (
            <>
              <span className="numerals">{profile.weightKg}kg</span> {'→'}{' '}
              <span className="numerals">{profile.goalWeightKg}kg</span> by {profile.goalDate}
            </>
          ) : (
            'No profile yet'
          )}
        </p>
        {!isEditing && profile && (
          <Button variant="onColor" onClick={startEditing}>
            Edit profile
          </Button>
        )}

        {isEditing && draft && !pendingUnsafePace && (
          <div className="space-y-3">
            <label className={labelClass} htmlFor="edit-heightCm">
              Height (cm)
              <input
                id="edit-heightCm"
                type="number"
                className={inputClass}
                value={draft.heightCm}
                onChange={(e) => setDraft({ ...draft, heightCm: Number(e.target.value) })}
              />
            </label>

            <label className={labelClass} htmlFor="edit-weightKg">
              Weight (kg)
              <input
                id="edit-weightKg"
                type="number"
                className={inputClass}
                value={draft.weightKg}
                onChange={(e) => setDraft({ ...draft, weightKg: Number(e.target.value) })}
              />
            </label>

            <label className={labelClass} htmlFor="edit-age">
              Age
              <input
                id="edit-age"
                type="number"
                className={inputClass}
                value={draft.age}
                onChange={(e) => setDraft({ ...draft, age: Number(e.target.value) })}
              />
            </label>

            <label className={labelClass} htmlFor="edit-goalWeightKg">
              Goal weight (kg)
              <input
                id="edit-goalWeightKg"
                type="number"
                className={inputClass}
                value={draft.goalWeightKg}
                onChange={(e) => setDraft({ ...draft, goalWeightKg: Number(e.target.value) })}
              />
            </label>

            <label className={labelClass} htmlFor="edit-goalDate">
              Goal date
              <input
                id="edit-goalDate"
                type="date"
                className={inputClass}
                value={draft.goalDate}
                onChange={(e) => setDraft({ ...draft, goalDate: e.target.value })}
              />
            </label>

            <label className={labelClass} htmlFor="edit-motivationReason">
              What are you working toward?
              <textarea
                id="edit-motivationReason"
                className={inputClass}
                rows={2}
                value={draft.motivationReason}
                onChange={(e) => setDraft({ ...draft, motivationReason: e.target.value })}
              />
            </label>

            <div className="flex flex-wrap gap-2">
              <Button variant="onColor" onClick={handleSaveChanges}>
                Save changes
              </Button>
              <Button variant="secondary" onClick={cancelEditing}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {isEditing && draft && pendingUnsafePace && (
          <RealisticGoalScreen
            result={pendingUnsafePace}
            goalDate={draft.goalDate}
            onAcceptCheckpoint={() => void finishSavingProfile(pendingUnsafePace.checkpointWeightKg, draft.goalDate)}
            onOverride={() => void finishSavingProfile(draft.goalWeightKg, draft.goalDate)}
          />
        )}
      </Card>

      <Card tone="sun" className="space-y-3">
        <Pill className="bg-ink-900/10">Goals</Pill>
        <div className="flex items-baseline gap-2">
          <span className="numerals font-display text-numeral-sm font-extrabold">
            {settings.currentCalorieTarget}
          </span>
          <span className="font-body text-[15px] font-bold">kcal/day</span>
        </div>
        <p className={`text-label font-medium ${TONE_MUTED.sun}`}>
          <span className="numerals font-bold">{settings.currentProteinTarget}g</span> protein/day · last
          recalculated {settings.lastRecalcDate}
        </p>
        <Button variant="onColor" onClick={handleRecalculate}>
          <RefreshCcw size={16} aria-hidden="true" className="mr-2" />
          Recalculate goals
        </Button>
        {recalcMessage && (
          <p className="rounded-chip bg-ink-900/10 p-3 text-label font-medium">{recalcMessage}</p>
        )}
        {recalcNote && <p className="rounded-chip bg-ink-900/10 p-3 text-label font-medium">{recalcNote}</p>}
      </Card>

      <Card className="space-y-3">
        <h3 className="font-display text-lg font-bold">Backup</h3>
        <p className="text-label font-medium text-ink-500">
          Your data lives only on this device. Export it monthly so nothing is lost if this phone's storage is
          ever cleared.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button onClick={handleExport}>
            <Download size={16} aria-hidden="true" className="mr-2" />
            Export my data
          </Button>
          <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
            <Upload size={16} aria-hidden="true" className="mr-2" />
            Import data
          </Button>
        </div>
        <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleImport} />
        {importError && (
          <p role="alert" className="rounded-chip bg-rose p-3 text-label text-white">
            {importError}
          </p>
        )}
      </Card>

      <p className="px-1 text-center text-label font-medium text-ink-500">
        Your data is stored only on this device — nothing is sent to a server.
      </p>
    </div>
  )
}
