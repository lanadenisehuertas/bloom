import { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'onColor' | 'secondary' | 'ghost'

const variants: Record<Variant, string> = {
  /** Dark pill — the single primary action on a screen. */
  primary: 'bg-ink-900 text-white active:bg-ink-700',
  /** White pill for use *on top of* a coloured block. */
  onColor: 'bg-white text-ink-900 active:bg-cream-deep',
  /** Quieter action on a neutral surface. */
  secondary: 'bg-cream-deep text-ink-900 active:bg-cream-edge',
  ghost: 'bg-transparent text-ink-700 underline underline-offset-4 active:text-ink-900',
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }

export function Button({ variant = 'primary', className = '', children, ...rest }: ButtonProps) {
  return (
    <button
      className={`inline-flex min-h-[48px] min-w-[48px] items-center justify-center rounded-full px-6 py-3 font-body text-[15px] font-bold transition-[background-color,transform] duration-200 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40 ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
