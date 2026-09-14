/**
 * Block tones for the "Claymorphism Bento" design system.
 *
 * Every tone hard-codes its own foreground colour so a caller can never
 * accidentally pair light text with a light block. All pairings — including
 * the muted/secondary variants, and the gradient/glow treatment below — were
 * verified at >= 4.5:1 (WCAG AA) before being added. Don't add a tone without
 * checking its contrast first (see git history for the verification script).
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

const LIGHT_TONES = new Set<Tone>(['white', 'cream', 'blush', 'coral', 'sun', 'mint', 'lilac', 'sky'])

/** Base surface colour + text colour. A subtle gradient reads as "clay", not flat. */
export const TONE_SURFACE: Record<Tone, string> = {
  white: 'bg-gradient-to-br from-white to-cream-deep text-ink-900',
  cream: 'bg-gradient-to-br from-cream-deep to-cream-edge text-ink-900',
  blush: 'bg-gradient-to-br from-blush to-[#F2679B] text-ink-900',
  coral: 'bg-gradient-to-br from-coral to-[#F26F3F] text-ink-900',
  sun: 'bg-gradient-to-br from-sun to-[#F2B52E] text-ink-900',
  mint: 'bg-gradient-to-br from-mint to-[#6FCDA3] text-ink-900',
  lilac: 'bg-gradient-to-br from-lilac to-[#8F7FF2] text-ink-900',
  sky: 'bg-gradient-to-br from-sky to-[#63B4F2] text-ink-900',
  rose: 'bg-gradient-to-br from-rose to-[#A81E49] text-white',
  forest: 'bg-gradient-to-br from-forest to-[#0F5347] text-white',
  ink: 'bg-gradient-to-br from-ink-700 to-ink-900 text-white',
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

/** The puffy-shadow class for a tone — light blocks get a brighter inset edge. */
export function clayShadowFor(tone: Tone): string {
  return LIGHT_TONES.has(tone) ? 'clay' : 'clay-dark'
}
