export type Tab = { id: string; label: string }

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
    <div className="flex rounded-full bg-cream-100 p-1" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={tab.id === activeId}
          className={`min-h-[44px] flex-1 rounded-full px-3 text-sm font-medium transition-colors ${
            tab.id === activeId ? 'bg-ink-900 text-cream-50' : 'text-ink-500'
          }`}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}
