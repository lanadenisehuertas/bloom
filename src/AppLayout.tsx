import { useLiveQuery } from 'dexie-react-hooks'
import { Outlet, Navigate } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { BottomNav } from './components/BottomNav'
import { db } from './db'

// Distinct from `undefined` (Dexie's "no row found" result) so we can tell
// "still loading" apart from "confirmed there is no profile yet" — both of
// which useLiveQuery would otherwise report as `undefined`.
const LOADING = Symbol('loading')

export function AppLayout() {
  const profile = useLiveQuery(() => db.profile.get('default'), [], LOADING)

  if (profile === LOADING) return null // still loading
  if (!profile) return <Navigate to="/onboarding" replace />

  return (
    <AppShell>
      <div className="flex-1 overflow-y-auto p-4 pb-2">
        <Outlet />
      </div>
      <BottomNav />
    </AppShell>
  )
}
