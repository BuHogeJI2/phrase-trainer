import { NavLink, Outlet } from 'react-router-dom'
import { ui } from '../data/ui'

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
        `rounded-xl px-3 py-2 text-xs font-semibold transition ${
          isActive ? 'bg-sky-700 text-white' : 'text-slate-600 hover:bg-slate-100'
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
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#d7e8ff,transparent_55%),linear-gradient(180deg,#f8fbff,#eef2ff)] text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200/80 bg-white/85 backdrop-blur">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-slate-900">{ui.appName}</p>
            <p className="text-xs text-slate-500">{ui.appSubtitle}</p>
          </div>
          <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-900">A1 / A2</span>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl px-4 pb-24 pt-4">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 border-t border-slate-200 bg-white/95 p-3 backdrop-blur">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between gap-2">
          {navItems.map((item) => (
            <NavItem key={item.to} to={item.to} label={item.label} />
          ))}
        </div>
      </nav>
    </div>
  )
}
