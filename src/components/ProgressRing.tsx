export function ProgressRing({ value, label, size = 72 }: { value: number; label: string; size?: number }) {
  const clamped = Math.min(1, Math.max(0, value))
  const pct = Math.round(clamped * 100)
  const radius = (size - 8) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - clamped)

  return (
    <div className="flex flex-col items-center gap-1" aria-label={label}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img">
        <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth={8} className="stroke-sage-100" fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={8}
          className="stroke-sage-500"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" className="fill-ink-900 text-sm font-semibold">
          {pct}%
        </text>
      </svg>
      <span className="text-xs text-ink-500">{label}</span>
    </div>
  )
}
