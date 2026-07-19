import { NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Painel', icon: LedgerIcon },
  { to: '/salario', label: 'Salário', icon: CoinIcon },
  { to: '/economias', label: 'Economias', icon: JarIcon },
  { to: '/dividas', label: 'Dívidas', icon: WeightIcon }
]

export default function Sidebar() {
  return (
    <aside className="w-64 shrink-0 bg-paper-100 border-r border-line flex flex-col h-screen sticky top-0">
      <div className="px-6 py-7 border-b border-line">
        <span className="font-display text-2xl text-ink-900 tracking-tight">Finanças</span>
        <p className="text-ink-500 text-xs mt-1">controle financeiro</p>
      </div>

      <nav className="flex-1 px-3 py-5 space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-card text-sm transition-colors ${
                isActive
                  ? 'bg-paper-200 text-gold-600 font-medium'
                  : 'text-ink-700 hover:bg-paper-200 hover:text-ink-900'
              }`
            }
          >
            <Icon />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-6 py-5 border-t border-line text-ink-500 text-xs">
        Seus dados ficam salvos apenas neste navegador.
      </div>
    </aside>
  )
}

function LedgerIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <rect x="4" y="3" width="16" height="18" rx="1.5" />
      <path d="M8 8h8M8 12h8M8 16h5" />
    </svg>
  )
}
function CoinIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5v9M9.5 9.5c0-1.1 1.1-2 2.5-2s2.5.9 2.5 1.8-1 1.6-2.5 1.7-2.5.9-2.5 1.9 1.1 1.8 2.5 1.8 2.5-.9 2.5-2" />
    </svg>
  )
}
function JarIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M7 8h10l-1 12.5a1.5 1.5 0 0 1-1.5 1.4h-5A1.5 1.5 0 0 1 8 20.5L7 8Z" />
      <path d="M9 8V5.5A1.5 1.5 0 0 1 10.5 4h3A1.5 1.5 0 0 1 15 5.5V8" />
      <path d="M7.5 13h9" />
    </svg>
  )
}
function WeightIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M12 3v3M9 6h6l2.5 5.5a4.5 4.5 0 1 1-11 0L9 6Z" />
      <path d="M4 21h16" />
    </svg>
  )
}
