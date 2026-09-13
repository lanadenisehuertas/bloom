import { NavLink } from 'react-router-dom'
import { Home, Dumbbell, Apple, CalendarHeart, LineChart, Settings } from 'lucide-react'

const items = [
  { to: '/', label: 'Today', icon: Home },
  { to: '/workout', label: 'Workout', icon: Dumbbell },
  { to: '/nutrition', label: 'Nutrition', icon: Apple },
  { to: '/cycle', label: 'Cycle', icon: CalendarHeart },
  { to: '/progress', label: 'Progress', icon: LineChart },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function BottomNav() {
  return (
    <nav
      className="flex justify-around border-t border-cream-200 bg-white/95 pt-1"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 0.5rem)' }}
    >
      {items.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          className={({ isActive }) =>
            `flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 px-2 text-xs ${
              isActive ? 'text-sage-700' : 'text-ink-300'
            }`
          }
        >
          <Icon size={20} />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
