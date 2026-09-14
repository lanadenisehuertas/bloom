import { HTMLAttributes } from 'react'

type CardProps = HTMLAttributes<HTMLDivElement>

export function Card({ className = '', children, ...rest }: CardProps) {
  return (
    <div className={`rounded-2xl shadow-soft bg-white/90 p-4 ${className}`} {...rest}>
      {/* display:contents keeps this invisible to layout — it only exists so RTL's
          getByText resolves to this div (its only real child) instead of the bare
          text node. Don't remove without checking Card.test.tsx. */}
      <span className="contents">{children}</span>
    </div>
  )
}
