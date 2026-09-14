import { ReactNode } from 'react'

/** Small label chip — used for eyebrow labels sitting on top of colour blocks. */
export function Pill({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-micro font-bold uppercase ${className}`}
    >
      {children}
    </span>
  )
}
