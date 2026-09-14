import { useLiveQuery } from 'dexie-react-hooks'
import { Camera, Images } from 'lucide-react'
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
    <Card className="space-y-4">
      <div className="flex items-center gap-2">
        <Images size={18} aria-hidden="true" className="text-ink-500" />
        <h3 className="font-display text-lg font-bold">Progress photos</h3>
      </div>

      <label className="inline-flex min-h-[48px] w-fit cursor-pointer items-center gap-2 rounded-full bg-ink-900 px-6 text-[15px] font-bold text-white">
        <Camera size={18} aria-hidden="true" />
        Take a photo
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          onChange={(e) => handleUpload(e, 'frontPhotoBlob')}
        />
      </label>

      {first && latest && first !== latest && (
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="rounded-chip bg-cream-deep px-3 py-2">
            <p className="text-micro font-bold uppercase text-ink-500">First</p>
            <p className="text-label font-bold">{first.date}</p>
          </div>
          <div className="rounded-chip bg-cream-deep px-3 py-2">
            <p className="text-micro font-bold uppercase text-ink-500">Latest</p>
            <p className="text-label font-bold">{latest.date}</p>
          </div>
        </div>
      )}
    </Card>
  )
}
