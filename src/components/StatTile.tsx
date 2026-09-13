import { ReactNode } from 'react'
import { Card } from './Card'

export function StatTile({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <Card className="flex flex-col items-center gap-1 text-center">
      <div className="text-sage-500">{icon}</div>
      <div className="text-lg font-semibold text-ink-900">{value}</div>
      <div className="text-xs text-ink-500">{label}</div>
    </Card>
  )
}
