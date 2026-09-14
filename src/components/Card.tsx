import { HTMLAttributes } from 'react'
import { Tone, TONE_SURFACE, clayShadowFor } from './tones'

type CardProps = HTMLAttributes<HTMLDivElement> & { tone?: Tone }

export function Card({ tone = 'white', className = '', children, ...rest }: CardProps) {
  return (
    <div
      className={`relative overflow-hidden rounded-block p-5 ${TONE_SURFACE[tone]} ${clayShadowFor(tone)} ${className}`}
      {...rest}
    >
      {/* Decorative gloss in the top-right corner only — it fades to fully
          transparent well before reaching where text actually sits (padding + the
          eyebrow pill), so it can never affect the verified text contrast.
          NEGATIVE z-index is required here, not a positive one: an absolutely
          positioned element with z-index:auto/0 paints ABOVE static in-flow
          content per CSS painting order, so without the negative value this glow
          would sit on top of the real text instead of behind it. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-6 -top-10 -z-10 h-32 w-32 rounded-full bg-white/35 blur-2xl"
      />
      {/* display:contents keeps this span invisible to layout — it only exists so
          RTL's getByText resolves to this div (its only real child) instead of the
          bare text node. Don't remove without checking Card.test.tsx. */}
      <span className="contents">{children}</span>
    </div>
  )
}
