import { NavLink } from 'react-router-dom'
import { Home, Dumbbell, Apple, CalendarHeart, LineChart, Settings } from 'lucide-react'

const items = [
  { to: '/', label: 'Today', icon: Home },
  { to: '/workout', label: 'Workout', icon: Dumbbell },
  { to: '/nutrition', label: 'Food', icon: Apple },
  { to: '/cycle', label: 'Cycle', icon: CalendarHeart },
  { to: '/progress', label: 'Progress', icon: LineChart },
  { to: '/settings', label: 'You', icon: Settings },
]

export function BottomNav() {
  return (
    <nav
      aria-label="Primary"
      className="clay-dark relative z-10 flex justify-between gap-0.5 rounded-t-block bg-ink-900 px-2 pt-2"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0.5rem)' }}
    >
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex min-h-[48px] flex-1 flex-col items-center justify-center gap-1 rounded-chip px-1 py-1.5 text-[10px] font-bold transition-[background-color,color,transform] duration-200 ${
              isActive
                ? 'clay-sm scale-105 bg-gradient-to-b from-sun to-[#F2B52E] text-ink-900'
                : 'text-white/70 active:text-white'
            }`
          }
        >
          {({ isActive }) => (
            <>
              <Icon size={19} strokeWidth={isActive ? 2.5 : 2} aria-hidden="true" />
              {label}
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
