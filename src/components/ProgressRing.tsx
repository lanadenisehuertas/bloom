export function ProgressRing({
  value,
  label,
  size = 96,
  trackClass = 'stroke-cream-edge',
  barClass = 'stroke-ink-900',
}: {
  value: number
  label: string
  size?: number
  trackClass?: string
  barClass?: string
}) {
  const clamped = Math.min(1, Math.max(0, value))
  const pct = Math.round(clamped * 100)
  const stroke = 10
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - clamped)

  return (
    <div className="flex flex-col items-center gap-1">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={`${label}: ${pct} percent`}>
        <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth={stroke} className={trackClass} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={stroke}
          className={barClass}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          className="numerals fill-current font-display text-lg font-extrabold"
        >
          {pct}%
        </text>
      </svg>
      <span className="text-label font-medium opacity-80">{label}</span>
    </div>
  )
}
