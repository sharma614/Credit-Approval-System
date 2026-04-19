import { NavLink } from 'react-router-dom'

const BOTTOM_ITEMS = [
  { to: '/',               icon: 'dashboard',              label: 'Overview',     end: true },
  { to: '/create-loan',    icon: 'description',            label: 'Applications' },
  { to: '/eligibility',    icon: 'analytics',              label: 'Eligibility' },
  { to: '/customer-loans', icon: 'account_balance_wallet', label: 'Accounts' },
]

export default function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-[#0e1322]/80 backdrop-blur-lg flex justify-around items-center px-4 py-3 rounded-t-2xl shadow-[0_-4px_24px_rgba(0,0,0,0.4)] border-t border-white/5">
      {BOTTOM_ITEMS.map(({ to, icon, label, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            isActive
              ? 'flex flex-col items-center text-[#c0c1ff] bg-indigo-500/10 rounded-xl px-4 py-2 active:scale-90 transition-transform'
              : 'flex flex-col items-center text-slate-500 hover:text-indigo-300 transition-colors duration-300 active:scale-90 transition-transform'
          }
        >
          <span className="material-symbols-outlined">{icon}</span>
          <span className="text-[10px] uppercase tracking-widest font-bold mt-1">{label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
