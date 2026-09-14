import { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'onColor' | 'secondary' | 'ghost'

const variants: Record<Variant, string> = {
  /** Dark pill — the single primary action on a screen. */
  primary: 'clay-sm bg-gradient-to-b from-ink-700 to-ink-900 text-white active:from-ink-900 active:to-ink-900',
  /** White pill for use *on top of* a coloured block. */
  onColor: 'clay-sm bg-gradient-to-b from-white to-cream-deep text-ink-900 active:from-cream-deep active:to-cream-deep',
  /** Quieter action on a neutral surface. */
  secondary:
    'clay-sm bg-gradient-to-b from-cream-deep to-cream-edge text-ink-900 active:from-cream-edge active:to-cream-edge',
  ghost: 'bg-transparent text-ink-700 underline underline-offset-4 active:text-ink-900',
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }

export function Button({ variant = 'primary', className = '', children, ...rest }: ButtonProps) {
  return (
    <button
      className={`inline-flex min-h-[48px] min-w-[48px] items-center justify-center rounded-full px-6 py-3 font-body text-[15px] font-bold transition-[background-color,transform,box-shadow] duration-200 active:scale-[0.97] active:shadow-none disabled:pointer-events-none disabled:opacity-40 disabled:shadow-none ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
