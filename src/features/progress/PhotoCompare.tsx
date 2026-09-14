import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../db'
import { Card } from '../../components/Card'

export function PhotoCompare() {
  const photos = useLiveQuery(() => db.photoLogs.orderBy('date').toArray(), []) ?? []
  const first = photos[0]
  const latest = photos[photos.length - 1]

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>, slot: 'frontPhotoBlob' | 'sidePhotoBlob' | 'backPhotoBlob') {
    const file = e.target.files?.[0]
    if (!file) return
    await db.photoLogs.add({ date: new Date().toISOString().slice(0, 10), [slot]: file })
  }

  return (
    <Card className="space-y-3">
      <h3 className="font-medium">Progress photos</h3>
      <input type="file" accept="image/*" capture="environment" onChange={(e) => handleUpload(e, 'frontPhotoBlob')} />
      {first && latest && first !== latest && (
        <div className="grid grid-cols-2 gap-2 text-center text-xs text-ink-500">
          <span>First: {first.date}</span>
          <span>Latest: {latest.date}</span>
        </div>
      )}
    </Card>
  )
}
