import { NavLink, useLocation } from 'react-router-dom'

const NAV_LINKS = [
  { to: '/',               label: 'Overview',      end: true },
  { to: '/create-loan',    label: 'Applications' },
  { to: '/eligibility',    label: 'Eligibility' },
  { to: '/customer-loans', label: 'Accounts' },
]

export default function Navbar() {
  const location = useLocation()

  return (
    <nav className="bg-slate-950/40 backdrop-blur-xl sticky top-0 w-full z-50 border-b border-white/10 shadow-[0_8px_32px_0_rgba(0,18,5,0.5)]">
      <div className="flex justify-between items-center h-16 px-6 max-w-7xl mx-auto">
        {/* Brand */}
        <NavLink to="/" className="flex items-center gap-3 no-underline">
          <span className="material-symbols-outlined text-indigo-400 text-2xl">account_balance</span>
          <span className="text-xl font-bold tracking-tighter bg-gradient-to-r from-[#6366f1] to-[#8b5cf6] bg-clip-text text-transparent">
            Luminous Vault
          </span>
        </NavLink>

        {/* Desktop nav */}
        <div className="hidden md:flex gap-8 items-center">
          {NAV_LINKS.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                isActive
                  ? 'text-indigo-300 font-semibold border-b-2 border-indigo-500 pb-0.5 hover:translate-y-[-2px] transition-transform duration-300 ease-out'
                  : 'text-slate-400 font-medium hover:translate-y-[-2px] hover:text-on-surface transition-transform duration-300 ease-out'
              }
            >
              {label}
            </NavLink>
          ))}
        </div>

        {/* More links (Register / View Loan) — icon buttons */}
        <div className="flex items-center gap-2">
          <NavLink
            to="/register"
            title="Register Customer"
            className={location.pathname === '/register'
              ? 'p-2 rounded-xl bg-indigo-500/20 text-indigo-300'
              : 'p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-on-surface transition-colors'}
          >
            <span className="material-symbols-outlined text-xl">person_add</span>
          </NavLink>
          <NavLink
            to="/view-loan"
            title="View Loan"
            className={location.pathname === '/view-loan'
              ? 'p-2 rounded-xl bg-indigo-500/20 text-indigo-300'
              : 'p-2 rounded-xl hover:bg-white/5 text-slate-400 hover:text-on-surface transition-colors'}
          >
            <span className="material-symbols-outlined text-xl">receipt_long</span>
          </NavLink>

          {/* Avatar placeholder */}
          <div className="w-9 h-9 rounded-full bg-surface-container-high flex items-center justify-center ml-2 overflow-hidden border border-white/10">
            <span className="material-symbols-outlined text-on-surface-variant text-xl">person</span>
          </div>
        </div>
      </div>
    </nav>
  )
}
