import { HTMLAttributes } from 'react'

type CardProps = HTMLAttributes<HTMLDivElement>

export function Card({ className = '', children, ...rest }: CardProps) {
  return (
    <div className={`rounded-2xl shadow-soft bg-white/90 p-4 ${className}`} {...rest}>
      <span className="contents">{children}</span>
    </div>
  )
}
