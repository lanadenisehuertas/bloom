import { HTMLAttributes } from 'react'
import { Tone, TONE_SURFACE } from './tones'

type CardProps = HTMLAttributes<HTMLDivElement> & { tone?: Tone }

export function Card({ tone = 'white', className = '', children, ...rest }: CardProps) {
  return (
    <div className={`rounded-block p-5 ${TONE_SURFACE[tone]} ${className}`} {...rest}>
      {/* display:contents keeps this invisible to layout — it only exists so RTL's
          getByText resolves to this div (its only real child) instead of the bare
          text node. Don't remove without checking Card.test.tsx. */}
      <span className="contents">{children}</span>
    </div>
  )
}
