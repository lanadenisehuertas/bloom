import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../../components/Card'
import { TONE_MUTED } from '../../components/tones'
import { Button } from '../../components/Button'
import { StatTile } from '../../components/StatTile'
import { Pill } from '../../components/Pill'
import { Modal } from '../../components/Modal'
import { Flame, Droplet, ArrowUpRight, Dumbbell, Sparkles, Plus, ClipboardCheck } from 'lucide-react'
import { useProfile } from '../../hooks/useProfile'
import { useTodayLog } from '../../hooks/useTodayLog'
import { useCycle } from '../../hooks/useCycle'
import { getScheduledDay } from '../../data/workoutProgram'
import { applyCyclePhaseModifier } from '../../domain/workoutProgram'
import { WeeklyCheckin } from '../checkin/WeeklyCheckin'
import { useMotivationState } from './useMotivationState'

const WEEKDAY = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

export function Dashboard() {
  const { profile } = useProfile()
  const { log, updateToday } = useTodayLog()
  const { phase } = useCycle()
  const { streak, downshiftRecommended } = useMotivationState()
  const [showCheckin, setShowCheckin] = useState(false)

  const today = new Date()
  const isRestDay = today.getDay() === 0
  const todaysDay = getScheduledDay(today.getDay())
  const modifier = phase ? applyCyclePhaseModifier(todaysDay, phase) : null
  const water = log?.waterCount ?? 0

  return (
    <div className="space-y-4">
      <header className="flex items-start justify-between gap-3 px-1">
        <div>
          <p className="text-label font-medium text-ink-500">{WEEKDAY[today.getDay()]}</p>
          <h1 className="font-display text-3xl font-extrabold leading-tight">Today</h1>
        </div>
        <Pill className="mt-1 bg-cream-deep text-ink-700">
          <Flame size={13} aria-hidden="true" />
          {streak} day{streak === 1 ? '' : 's'}
        </Pill>
      </header>

      {downshiftRecommended && (
        <Card tone="coral">
          <Pill className="bg-ink-900/10">Rebuilding momentum</Pill>
          <p className="mt-2 font-body text-[15px] font-medium leading-snug">
            Let's pick back up today — no penalty for a rough week. Start with whatever feels doable.
          </p>
        </Card>
      )}

      {/* Hero: the one thing that matters today */}
      <Card tone="forest" className="relative overflow-hidden">
        <Pill className="bg-white/20 text-white">
          <Dumbbell size={13} aria-hidden="true" />
          {isRestDay ? 'Rest day' : "Today's plan"}
        </Pill>
        <h2 className="mt-3 font-display text-[32px] font-extrabold leading-[1.1]">
          {todaysDay.title}
        </h2>
        <p className={`mt-1 text-label font-medium ${TONE_MUTED.forest}`}>
          {todaysDay.durationMinutes === '-' ? 'Recovery & reflection' : `${todaysDay.durationMinutes} min`}
        </p>

        {modifier?.lowerBarMessage && (
          <p className="mt-3 rounded-chip bg-white/15 p-3 text-label font-medium leading-snug">
            {modifier.lowerBarMessage}
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Link to="/workout">
            <Button variant="onColor">
              {isRestDay ? 'View today' : 'Start workout'}
            </Button>
          </Link>
          <Link
            to="/exercises"
            className="inline-flex min-h-[48px] items-center gap-1 rounded-full px-4 text-[15px] font-bold text-white underline underline-offset-4"
          >
            Exercise library
            <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </div>
      </Card>

      {/* Why — her own words, kept close to the action it motivates */}
      <Card tone="blush">
        <Pill className="bg-ink-900/10">
          <Sparkles size={13} aria-hidden="true" />
          Why you're here
        </Pill>
        <p className="mt-2 font-display text-xl font-extrabold leading-snug">
          {profile?.motivationReason || 'Building your hourglass shape, one session at a time.'}
        </p>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <StatTile
          tone="sun"
          icon={<Flame size={20} aria-hidden="true" />}
          value={String(streak)}
          label={streak === 1 ? 'Day streak' : 'Day streak'}
        />
        <StatTile
          tone="sky"
          icon={<Droplet size={20} aria-hidden="true" />}
          value={String(water)}
          label="Cups of water"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => updateToday({ waterCount: water + 1 })}
          className="flex min-h-[56px] items-center justify-center gap-2 whitespace-nowrap rounded-full bg-white px-4 text-[15px] font-bold transition-transform duration-200 active:scale-[0.97]"
        >
          <Plus size={17} aria-hidden="true" />
          Water
        </button>
        <button
          type="button"
          onClick={() => setShowCheckin(true)}
          className="flex min-h-[56px] items-center justify-center gap-2 whitespace-nowrap rounded-full bg-white px-4 text-[15px] font-bold transition-transform duration-200 active:scale-[0.97]"
        >
          <ClipboardCheck size={17} aria-hidden="true" />
          Weekly check-in
        </button>
      </div>

      <Modal open={showCheckin} onClose={() => setShowCheckin(false)} title="Weekly reflection">
        <WeeklyCheckin onDone={() => setShowCheckin(false)} />
      </Modal>
    </div>
  )
}
