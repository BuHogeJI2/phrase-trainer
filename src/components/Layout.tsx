import { NavLink, Outlet } from 'react-router-dom'
import { ui } from '../data/ui'
import { LevelBadge } from './ui/LevelBadge'

const navItems = [
  { to: '/', label: ui.nav.home },
  { to: '/practice', label: ui.nav.practice },
  { to: '/saved', label: ui.nav.saved },
  { to: '/settings', label: ui.nav.settings },
]

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `rounded-full px-3 py-2 text-xs font-semibold transition ${
          isActive
            ? 'bg-[var(--color-accent)] text-white shadow-[var(--shadow-soft)]'
            : 'text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)]'
        }`
      }
      end={to === '/'}
    >
      {label}
    </NavLink>
  )
}

export function Layout() {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#efe3cf,transparent_45%),linear-gradient(180deg,#f8f4ef,#f6f1ea)] text-[var(--color-text)]">
      <header className="sticky top-0 z-20 border-b border-[var(--color-border)] bg-[color:rgba(248,244,239,0.92)] backdrop-blur">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-[var(--color-text)]">{ui.appName}</p>
            <p className="text-xs text-[var(--color-text-muted)]">{ui.appSubtitle}</p>
          </div>
          <LevelBadge level="all" compact />
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 pb-24 pt-4">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 border-t border-[var(--color-border)] bg-[color:rgba(255,253,249,0.96)] p-3 backdrop-blur">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-2">
          {navItems.map((item) => (
            <NavItem key={item.to} to={item.to} label={item.label} />
          ))}
        </div>
      </nav>
    </div>
  )
}
