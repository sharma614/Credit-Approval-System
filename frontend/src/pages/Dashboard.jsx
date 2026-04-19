import { useNavigate } from 'react-router-dom'

const QUICK_ACTIONS = [
  { icon: 'person_add',          title: 'Register Customer', desc: 'Onboard new clients with instant credit limit computation.',          path: '/register',       color: 'from-indigo-500/20 to-indigo-500/5',  tag: '#6366f1' },
  { icon: 'analytics',           title: 'Check Eligibility', desc: 'Evaluate loan eligibility using our 4-factor credit score engine.',  path: '/eligibility',    color: 'from-violet-500/20 to-violet-500/5',  tag: '#8b5cf6' },
  { icon: 'description',         title: 'Create Loan',       desc: 'Disburse approved loans with auto-calculated monthly EMI.',          path: '/create-loan',    color: 'from-primary/20 to-primary/5',         tag: '#81fd77' },
  { icon: 'receipt_long',        title: 'View Loan',         desc: 'Retrieve full details of any credit facility by loan ID.',           path: '/view-loan',      color: 'from-tertiary/20 to-tertiary/5',       tag: '#97f4ff' },
  { icon: 'account_balance_wallet', title: 'Customer Loans', desc: "List all active and historical loans for a customer account.",       path: '/customer-loans', color: 'from-secondary/20 to-secondary/5',     tag: '#87f7a6' },
]

const SCORE_SLABS = [
  { range: '> 50',    decision: 'Approved',  rate: 'As requested', dot: 'bg-primary' },
  { range: '30 – 50', decision: 'Approved',  rate: 'Min 12%',      dot: 'bg-secondary' },
  { range: '10 – 30', decision: 'Approved',  rate: 'Min 16%',      dot: 'bg-tertiary' },
  { range: '< 10',    decision: 'Rejected',  rate: '—',            dot: 'bg-error' },
]

const STATS = [
  { icon: 'hub',       value: '5',     label: 'API Endpoints' },
  { icon: 'tune',      value: '4',     label: 'Score Factors' },
  { icon: 'bolt',      value: 'Async', label: 'Celery Tasks' },
  { icon: 'lock',      value: '50%',   label: 'Max EMI / Salary' },
]

export default function Dashboard() {
  const navigate = useNavigate()

  return (
    <div className="max-w-7xl mx-auto px-6 pt-12 pb-12">
      {/* Hero */}
      <header className="mb-12">
        <span className="text-primary text-[0.75rem] uppercase tracking-[0.1em] font-bold mb-3 block">
          Lending Terminal
        </span>
        <h1 className="text-5xl font-extrabold tracking-tight text-on-surface leading-tight">
          Credit Approval<br />
          <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            System
          </span>
        </h1>
        <p className="text-on-surface-variant mt-4 text-lg max-w-xl">
          A premium, full-featured loan management platform — from customer registration to loan disbursement, powered by a 4-factor credit score engine.
        </p>
      </header>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        {STATS.map(s => (
          <div key={s.label} className="glass-panel p-5 rounded-3xl hover:-translate-y-1 transition-all duration-300">
            <span className="material-symbols-outlined text-primary text-2xl mb-3 block">{s.icon}</span>
            <div className="text-3xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              {s.value}
            </div>
            <div className="text-[0.7rem] uppercase tracking-widest font-bold text-outline mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <section className="mb-12">
        <h2 className="text-on-surface-variant text-[0.75rem] uppercase tracking-widest font-bold mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {QUICK_ACTIONS.map(f => (
            <button
              key={f.path}
              onClick={() => navigate(f.path)}
              className={`text-left p-6 rounded-3xl bg-gradient-to-br ${f.color} border border-white/5 hover:-translate-y-1 hover:border-white/10 transition-all duration-300 active:scale-95`}
            >
              <span className="material-symbols-outlined text-3xl mb-4 block" style={{ color: f.tag }}>{f.icon}</span>
              <div className="font-bold text-on-surface mb-1" style={{ color: f.tag }}>{f.title}</div>
              <p className="text-on-surface-variant text-sm leading-relaxed">{f.desc}</p>
              <div className="mt-4 text-xs font-bold" style={{ color: f.tag }}>Open →</div>
            </button>
          ))}
        </div>
      </section>

      {/* Credit score rules */}
      <section className="glass-panel p-8 rounded-3xl">
        <h2 className="text-on-surface font-bold text-lg mb-6 flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-xl">bar_chart</span>
          Credit Score Slabs
        </h2>
        <div className="space-y-2">
          {SCORE_SLABS.map(s => (
            <div key={s.range} className="lv-kv-row">
              <div className="flex items-center gap-3">
                <span className={`w-2 h-2 rounded-full ${s.dot} flex-shrink-0`} />
                <span className="text-on-surface font-semibold">{s.range}</span>
              </div>
              <div className="flex items-center gap-8">
                <span className={`text-sm font-bold ${s.decision === 'Rejected' ? 'text-error' : 'text-primary'}`}>
                  {s.decision}
                </span>
                <span className="text-on-surface-variant text-sm w-28 text-right">{s.rate}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10 flex items-start gap-3">
          <span className="material-symbols-outlined text-indigo-400 text-lg mt-0.5">info</span>
          <p className="text-on-surface-variant text-sm">
            Affordability check: total EMI (existing + new) must be ≤ <strong className="text-on-surface">50%</strong> of monthly salary, regardless of credit score.
          </p>
        </div>
      </section>
    </div>
  )
}
