import { ReactNode } from 'react'
import { Card } from './Card'
import { Tone, TONE_MUTED } from './tones'

/**
 * Big-numeral stat block. The value is the focal point — it is deliberately
 * much larger than its label, which is how this design carries hierarchy.
 */
export function StatTile({
  icon,
  label,
  value,
  tone = 'white',
  className = '',
}: {
  icon?: ReactNode
  label: string
  value: string
  tone?: Tone
  className?: string
}) {
  return (
    <Card tone={tone} className={`flex flex-col gap-1 ${className}`}>
      {icon && <div aria-hidden="true" className="mb-1">{icon}</div>}
      <div className="numerals font-display text-numeral-sm font-extrabold">{value}</div>
      <div className={`text-label font-medium ${TONE_MUTED[tone]}`}>{label}</div>
    </Card>
  )
}
