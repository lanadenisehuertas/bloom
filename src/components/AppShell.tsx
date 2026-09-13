import { ReactNode } from 'react'

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell" data-testid="app-shell">
      {children}
    </div>
  )
}
