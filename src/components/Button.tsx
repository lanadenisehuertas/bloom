import { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost'

const variants: Record<Variant, string> = {
  primary: 'bg-sage-500 text-white active:bg-sage-700',
  secondary: 'bg-clay-100 text-clay-700 active:bg-clay-300',
  ghost: 'bg-transparent text-ink-700 active:bg-ink-50',
}

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant }

export function Button({ variant = 'primary', className = '', children, ...rest }: ButtonProps) {
  return (
    <button
      className={`min-h-[44px] min-w-[44px] rounded-2xl px-5 py-3 font-medium transition-colors ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
