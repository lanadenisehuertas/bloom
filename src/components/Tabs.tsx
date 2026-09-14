export type Tab = { id: string; label: string }

/** Pill switcher — cream track, dark active pill. */
export function Tabs({
  tabs,
  activeId,
  onChange,
}: {
  tabs: Tab[]
  activeId: string
  onChange: (id: string) => void
}) {
  return (
    <div className="flex rounded-full bg-cream-deep p-1" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={tab.id === activeId}
          className={`min-h-[44px] flex-1 rounded-full px-3 text-label font-bold transition-colors duration-200 ${
            tab.id === activeId ? 'bg-ink-900 text-white' : 'text-ink-500'
          }`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
