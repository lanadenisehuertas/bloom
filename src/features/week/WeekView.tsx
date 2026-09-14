import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../../components/Card'
import { Pill } from '../../components/Pill'
import { TONE_MUTED } from '../../components/tones'
import {
  Anchor,
  Check,
  ChevronLeft,
  ChevronRight,
  Circle,
  Flame,
  Utensils,
} from 'lucide-react'
import { useProfile } from '../../hooks/useProfile'
import { useSettings } from '../../hooks/useSettings'
import { useCycle } from '../../hooks/useCycle'
import { useWorkoutLog } from '../../hooks/useWorkoutLog'
import { useMotivationState } from '../dashboard/useMotivationState'
import { useWellbeingState } from '../../hooks/useWellbeingState'
import { applyCyclePhaseModifier } from '../../domain/workoutProgram'
import { buildWeekDays, startOfWeek, addWeeks, WeekDayInfo } from '../../domain/week'
import { todayLocalDate } from '../../lib/localDate'
import { CyclePhase } from '../../domain/cycle'

const WEEKDAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const PHASE_LABEL: Record<CyclePhase, string> = {
  menstrual: 'Period (projected)',
  follicular: 'Follicular (projected)',
  ovulation: 'Ovulation (projected)',
  luteal: 'Luteal (projected)',
}

function formatWeekRange(weekStart: string): string {
  const start = new Date(`${weekStart}T00:00:00`)
  const end = new Date(start)
  end.setDate(start.getDate() + 6)
  const fmt = (d: Date) => d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
  return `${fmt(start)} – ${fmt(end)}`
}

function guidanceLine(
  day: WeekDayInfo,
  jointPainFlagged: boolean,
  lowEnergyFlagged: boolean
): string | null {
  const modifier = day.projectedPhase
    ? applyCyclePhaseModifier(day.scheduledDay, day.projectedPhase)
    : null

  const lines: string[] = []
  if (modifier?.lowerBarMessage) lines.push(modifier.lowerBarMessage)
  else if (modifier?.nudgeProgressiveOverload) lines.push('Good week to nudge a little heavier, if it feels right.')
  else if (modifier?.testDay) lines.push('Energy tends to peak now — a fine day to test your limits safely.')

  if (day.scheduledDay.id === 'D' && jointPainFlagged) {
    lines.push('Gentler, low-impact cardio today, based on your check-in.')
  }
  if (day.isToday && lowEnergyFlagged) {
    lines.push('Your energy has been low this week — it is okay to scale today back.')
  }

  return lines.length > 0 ? lines.join(' ') : null
}

export function WeekView() {
  const { profile } = useProfile()
  const { settings } = useSettings()
  const { cycleLog } = useCycle()
  const { logs } = useWorkoutLog()
  const { streak, downshiftRecommended } = useMotivationState()
  const { jointPainFlagged, lowEnergyFlagged } = useWellbeingState()

  const today = todayLocalDate()
  const [weekStart, setWeekStart] = useState(() => startOfWeek(today))

  const workoutLogsByDate = useMemo(() => {
    const map = new Map<string, 'full' | 'minimal' | 'skipped'>()
    for (const log of logs) map.set(log.date, log.completed)
    return map
  }, [logs])

  const lastPeriodStartDate = cycleLog?.periodStartDates[cycleLog.periodStartDates.length - 1]

  const days = useMemo(
    () =>
      buildWeekDays({
        weekStart,
        today,
        lastPeriodStartDate,
        avgCycleLength: cycleLog?.avgCycleLength,
        workoutLogsByDate,
      }),
    [weekStart, today, lastPeriodStartDate, cycleLog?.avgCycleLength, workoutLogsByDate]
  )

  const isCurrentWeek = weekStart === startOfWeek(today)
  const checkpointWeightKg = profile?.checkpointWeightKg ?? profile?.goalWeightKg
  const checkpointDate = profile?.checkpointDate ?? profile?.goalDate

  return (
    <div className="space-y-4">
      <header className="px-1">
        <p className="text-label font-medium text-ink-500">
          {isCurrentWeek ? 'This week' : 'Browsing another week'}
        </p>
        <h1 className="font-display text-3xl font-extrabold leading-tight">Your week</h1>
      </header>

      {downshiftRecommended && (
        <Card tone="coral">
          <Pill className="bg-ink-900/10">Rebuilding momentum</Pill>
          <p className="mt-2 font-body text-[15px] font-medium leading-snug">
            This week is scaled back — no penalty for a rough week. Start with whatever feels doable.
          </p>
        </Card>
      )}

      {/* This-week summary: streak + current adaptive nutrition targets. */}
      <Card tone="forest">
        <Pill className="bg-white/20 text-white">Where your plan stands this week</Pill>
        <div className="mt-3 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Flame size={20} aria-hidden="true" />
            <span className="numerals font-display text-xl font-extrabold">{streak}</span>
            <span className={`text-label font-medium ${TONE_MUTED.forest}`}>day streak</span>
          </div>
          <div className="flex items-center gap-2">
            <Utensils size={20} aria-hidden="true" />
            <span className="numerals font-display text-xl font-extrabold">
              {settings.currentCalorieTarget}
            </span>
            <span className={`text-label font-medium ${TONE_MUTED.forest}`}>
              kcal / {settings.currentProteinTarget}g protein
            </span>
          </div>
        </div>
        <p className={`mt-2 text-label ${TONE_MUTED.forest}`}>
          These targets update whenever goals are recalculated in Settings.
        </p>
      </Card>

      {/* Goal anchor — deliberately a different, stable-feeling tone from the block
          above: the destination doesn't move week to week, only the execution does. */}
      {profile && (
        <Card tone="ink">
          <Pill className="bg-white/15 text-white">
            <Anchor size={13} aria-hidden="true" />
            Still the goal
          </Pill>
          <p className="mt-2 font-display text-xl font-extrabold leading-snug">
            Still aiming for {checkpointWeightKg}kg by {checkpointDate}
          </p>
          <p className={`mt-1 text-label ${TONE_MUTED.ink}`}>
            This only changes if the profile is edited in Settings — the plan flexes week to
            week, but the destination stays put.
          </p>
        </Card>
      )}

      {/* Week navigation */}
      <div className="flex items-center justify-between gap-2 px-1">
        <button
          type="button"
          aria-label="Previous week"
          onClick={() => setWeekStart((w) => addWeeks(w, -1))}
          className="flex min-h-[48px] min-w-[48px] items-center justify-center rounded-full bg-white active:scale-[0.97]"
        >
          <ChevronLeft size={20} aria-hidden="true" />
        </button>
        <p className="font-display text-lg font-bold">{formatWeekRange(weekStart)}</p>
        <button
          type="button"
          aria-label="Next week"
          onClick={() => setWeekStart((w) => addWeeks(w, 1))}
          className="flex min-h-[48px] min-w-[48px] items-center justify-center rounded-full bg-white active:scale-[0.97]"
        >
          <ChevronRight size={20} aria-hidden="true" />
        </button>
      </div>

      <div className="space-y-3">
        {days.map((day) => {
          const guidance = guidanceLine(day, jointPainFlagged, lowEnergyFlagged)
          const tone = day.isToday ? 'sun' : 'white'
          const content = (
            <Card tone={tone}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className={`text-label font-medium ${TONE_MUTED[tone]}`}>
                    {WEEKDAY_SHORT[day.dayOfWeek]} · {day.date.slice(5)}
                    {day.isToday ? ' · Today' : ''}
                  </p>
                  <h3 className="mt-1 font-display text-lg font-bold leading-snug">
                    {day.scheduledDay.title}
                  </h3>
                  <p className={`text-label ${TONE_MUTED[tone]}`}>
                    {day.scheduledDay.durationMinutes === '-'
                      ? 'Recovery & reflection'
                      : `${day.scheduledDay.durationMinutes} min`}
                  </p>
                </div>
                {day.isPast && (
                  <span aria-hidden="true" className="mt-1">
                    {day.loggedCompletion ? (
                      <Check size={18} className="text-ink-900" />
                    ) : (
                      <Circle size={10} className="text-ink-900/30" />
                    )}
                  </span>
                )}
                <span className="sr-only">
                  {day.isPast ? (day.loggedCompletion ? 'Logged' : 'Not logged') : ''}
                </span>
              </div>

              {day.projectedPhase && (
                <Pill className="mt-2 bg-ink-900/10">{PHASE_LABEL[day.projectedPhase]}</Pill>
              )}

              {guidance && (
                <p className={`mt-2 text-label leading-snug ${TONE_MUTED[tone]}`}>{guidance}</p>
              )}
            </Card>
          )

          return day.isToday ? (
            <Link key={day.date} to="/workout" aria-label={`${day.scheduledDay.title}, today's workout`}>
              {content}
            </Link>
          ) : (
            <div key={day.date}>{content}</div>
          )
        })}
      </div>
    </div>
  )
}
