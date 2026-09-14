import { useRef, useState } from 'react'
import { Card } from '../../components/Card'
import { Button } from '../../components/Button'
import { exportData, importData } from '../../db/backup'
import { useProfile } from '../../hooks/useProfile'

export function SettingsScreen() {
  const { profile } = useProfile()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importError, setImportError] = useState<string | null>(null)

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

  return (
    <div className="space-y-3">
      <Card>
        <h3 className="font-medium">Profile</h3>
        <p className="text-sm text-ink-500">
          {profile ? `${profile.weightKg}kg → ${profile.goalWeightKg}kg by ${profile.goalDate}` : 'No profile yet'}
        </p>
      </Card>

      <Card className="space-y-2">
        <h3 className="font-medium">Backup</h3>
        <p className="text-xs text-ink-500">
          Your data lives only on this device. Export it monthly so nothing is lost if this phone's storage is
          ever cleared.
        </p>
        <Button onClick={handleExport}>Export my data</Button>
        <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
          Import data
        </Button>
        <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleImport} />
        {importError && (
          <p role="alert" className="text-xs text-red-600">
            {importError}
          </p>
        )}
      </Card>
    </div>
  )
}
