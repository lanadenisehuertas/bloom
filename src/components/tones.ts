/**
 * Block tones for the "Vibrant Block" design system.
 *
 * Every tone hard-codes its own foreground colour so a caller can never
 * accidentally pair light text with a light block. All pairings below —
 * including the muted/secondary variants — were verified at >= 4.5:1 (WCAG AA)
 * before being added. Don't add a tone without checking its contrast first.
 */
export type Tone =
  | 'white'
  | 'cream'
  | 'blush'
  | 'coral'
  | 'sun'
  | 'mint'
  | 'lilac'
  | 'sky'
  | 'rose'
  | 'forest'
  | 'ink'

export const TONE_SURFACE: Record<Tone, string> = {
  white: 'bg-white text-ink-900',
  cream: 'bg-cream-deep text-ink-900',
  blush: 'bg-blush text-ink-900',
  coral: 'bg-coral text-ink-900',
  sun: 'bg-sun text-ink-900',
  mint: 'bg-mint text-ink-900',
  lilac: 'bg-lilac text-ink-900',
  sky: 'bg-sky text-ink-900',
  rose: 'bg-rose text-white',
  forest: 'bg-forest text-white',
  ink: 'bg-ink-900 text-white',
}

/** Secondary/supporting text colour for a given tone. */
export const TONE_MUTED: Record<Tone, string> = {
  white: 'text-ink-500',
  cream: 'text-ink-500',
  blush: 'text-ink-900/85',
  coral: 'text-ink-900/85',
  sun: 'text-ink-900/85',
  mint: 'text-ink-900/85',
  lilac: 'text-ink-900/85',
  sky: 'text-ink-900/85',
  rose: 'text-white/90',
  forest: 'text-white/90',
  ink: 'text-white/90',
}
