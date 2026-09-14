import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db'
import { Profile } from '../db/schema'

export function useProfile() {
  const profile = useLiveQuery(() => db.profile.get('default'), [])

  async function saveProfile(next: Profile) {
    await db.profile.put(next)
  }

  return { profile, saveProfile }
}
