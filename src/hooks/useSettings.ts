import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { SettingsRecord } from '../db/schema'

const DEFAULT_SETTINGS: SettingsRecord = {
  id: 'default', lastRecalcDate: new Date().toISOString().slice(0, 10),
  currentCalorieTarget: 1900, currentProteinTarget: 128,
  streakCount: 0, graceDaysAvailable: 1, graceDaysUsedThisMonth: 0,
  pushupLevel: 'pushup-wall',
}

export function useSettings() {
  const settings = useLiveQuery(() => db.settings.get('default'), []) ?? DEFAULT_SETTINGS

  async function updateSettings(patch: Partial<SettingsRecord>) {
    await db.settings.put({ ...DEFAULT_SETTINGS, ...settings, ...patch })
  }

  return { settings, updateSettings }
}
