# Bloom Design System — "Vibrant Block"

Style: **Vibrant & Block-based + Flat Mobile (touch-first)**. Colour blocks carry the
hierarchy. No shadows anywhere. Big numerals are the signature move.

## Palette (all pairings verified >= 4.5:1 WCAG AA)

| Token | Hex | Text on it |
|---|---|---|
| `cream` (page bg) | #FFF6EC | ink |
| `cream-deep` (inner surface) | #FBEADA | ink |
| `cream-edge` (track/border) | #F0DDC9 | ink |
| `ink` / `ink-900` | #17171F | white |
| `ink-500` (muted on neutral) | #55555F | — |
| `blush` | #FF7BA9 | **ink** |
| `coral` | #FF7F4D | **ink** |
| `sun` | #FFC53D | **ink** |
| `mint` | #86DCB6 | **ink** |
| `lilac` | #A292FF | **ink** |
| `sky` | #7CC6FF | **ink** |
| `rose` | #C42557 | **white** |
| `forest` | #14675A | **white** |

**Never hand-pick text colour on a block.** Use `<Card tone="...">` — it applies the
correct foreground automatically. For secondary text use `TONE_MUTED[tone]`.

## Type

- Display: **Nunito Variable** (`font-display`), weight 800 for headings/numerals.
- Body: **DM Sans Variable** (`font-body`), 400/500/700.
- Both self-hosted via `@fontsource-variable/*` — this is an offline-first PWA, so
  no CDN font loading.

Scale: `text-numeral` (48px) hero numerals · `text-numeral-sm` (32px) stat numerals ·
`text-3xl` screen title · `text-xl` card title · `text-[15px]` body · `text-label` (13px)
secondary · `text-micro` (11px, uppercase, tracked) pill labels.

Add `.numerals` to any changing number so tabular figures prevent layout jitter.

## Shape & space

- Cards: `rounded-block` (28px), padding `p-5`.
- Chips/inner surfaces: `rounded-chip` (16px). Buttons/pills: `rounded-full`.
- Gap between blocks: `space-y-4` / `gap-3`.
- **No shadows.** Separation comes from colour only.

## Components

- `<Card tone>` — the block. Tones above.
- `<Button variant>` — `primary` (dark pill, one per screen), `onColor` (white pill on a
  coloured block), `secondary` (cream), `ghost` (underlined text).
- `<StatTile tone icon value label>` — big numeral block.
- `<Pill>` — eyebrow label chip; pass its own bg (e.g. `bg-ink-900/10`, `bg-white/20`).
- `<Modal open onClose title>` — bottom sheet; has Escape, `role="dialog"`, close button.
  **Don't render your own title heading inside it** — pass `title`.
- `<Tabs>` — cream track, dark active pill.
- `<ProgressRing value label>` — pass `trackClass`/`barClass` to tint per block.

## Screen recipe

1. `<header>`: small muted eyebrow (day/context) + `font-display text-3xl font-extrabold` title.
2. One **hero block** in a saturated tone (`forest` / `rose`) holding the screen's primary action.
3. Supporting content in lighter tones — vary colour between adjacent blocks, never repeat
   the same tone twice in a row.
4. Exactly **one** `primary` button per screen.

## Non-negotiables

- Touch targets >= 48px; 8px+ between them.
- Every icon-only control needs `aria-label`; decorative icons get `aria-hidden="true"`.
- Inputs: `rounded-chip border-2 border-cream-edge bg-white px-4 py-3 min-h-[48px]`, always
  with a visible `<label>` (never placeholder-only).
- Focus ring is global (`:focus-visible` in index.css) — never remove it.
- `prefers-reduced-motion` is handled globally; transitions 200ms.
- No emoji as icons — lucide-react only.
