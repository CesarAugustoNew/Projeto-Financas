import { Link, NavLink } from 'react-router-dom'

const links = [
  { to: '/', label: 'Painel', icon: LedgerIcon },
  { to: '/salario', label: 'Salário', icon: CoinIcon },
  { to: '/gastos', label: 'Gastos', icon: CartIcon },
  { to: '/economias', label: 'Economias', icon: JarIcon }
]

export default function Sidebar() {
  return (
    <aside className="w-64 shrink-0 bg-brand-900 flex flex-col h-screen sticky top-0">
      <Link to="/" aria-label="Ir para o painel" className="px-6 py-7 flex items-center gap-3">
        <span className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center text-white">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 17l5-5 4 4 7-8M15 8h5v5" />
          </svg>
        </span>
        <div>
          <span className="font-display text-xl text-white">Finanças</span>
          <p className="text-white/50 text-xs">controle financeiro</p>
        </div>
      </Link>

      <nav className="flex-1 px-3 py-3 space-y-1">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors ${
                isActive
                  ? 'bg-brand-500 text-white font-medium'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <Icon />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="px-6 py-5 border-t border-white/10 text-white/50 text-xs">
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
function CartIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M3 4h2l1.6 9.6a2 2 0 0 0 2 1.7h7.4a2 2 0 0 0 2-1.6L19.5 8H6" />
      <circle cx="9.5" cy="19.5" r="1.3" />
      <circle cx="16.5" cy="19.5" r="1.3" />
    </svg>
  )
}
