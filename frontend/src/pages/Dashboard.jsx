import { useNavigate } from 'react-router-dom'

const features = [
  { icon: '👤', title: 'Register Customer', desc: 'Onboard new customers with instant credit limit computation', path: '/register', color: '#6366f1' },
  { icon: '🔍', title: 'Check Eligibility', desc: 'Evaluate loan eligibility using our 4-factor credit score model', path: '/eligibility', color: '#8b5cf6' },
  { icon: '💳', title: 'Create Loan', desc: 'Disburse approved loans with auto-calculated monthly EMI', path: '/create-loan', color: '#10b981' },
  { icon: '📄', title: 'View Loan', desc: 'Retrieve full details of any loan by its ID', path: '/view-loan', color: '#f59e0b' },
  { icon: '📊', title: 'Customer Loans', desc: "List all active and past loans for a customer", path: '/customer-loans', color: '#ef4444' },
]

const scoreSlabs = [
  { range: '> 50', action: 'Approved', rate: 'As requested', badge: 'badge-success' },
  { range: '30 – 50', action: 'Approved', rate: 'Min 12%', badge: 'badge-warning' },
  { range: '10 – 30', action: 'Approved', rate: 'Min 16%', badge: 'badge-warning' },
  { range: '< 10', action: 'Rejected', rate: '—', badge: 'badge-danger' },
]

export default function Dashboard() {
  const navigate = useNavigate()

  return (
    <div>
      <div className="dashboard-hero">
        <h1>Credit Approval <span>System</span></h1>
        <p>A full-featured loan management platform — from customer registration to loan disbursement.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card"><div className="stat-card-icon">🏦</div><div className="stat-card-value">5</div><div className="stat-card-label">API Endpoints</div></div>
        <div className="stat-card"><div className="stat-card-icon">📐</div><div className="stat-card-value">4</div><div className="stat-card-label">Score Factors</div></div>
        <div className="stat-card"><div className="stat-card-icon">⚡</div><div className="stat-card-value">Celery</div><div className="stat-card-label">Async Tasks</div></div>
        <div className="stat-card"><div className="stat-card-icon">🔒</div><div className="stat-card-value">50%</div><div className="stat-card-label">Max EMI / Salary</div></div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-secondary)' }}>Quick Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
          {features.map(f => (
            <button
              key={f.path}
              className="card"
              onClick={() => navigate(f.path)}
              style={{ textAlign: 'left', cursor: 'pointer', border: '1px solid var(--border)', background: 'var(--bg-card)' }}
            >
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{f.icon}</div>
              <div style={{ fontWeight: 700, marginBottom: '0.35rem', color: f.color }}>{f.title}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{f.desc}</div>
              <div style={{ marginTop: '1rem', fontSize: '0.82rem', color: f.color, fontWeight: 600 }}>Open →</div>
            </button>
          ))}
        </div>
      </div>

      <div className="card">
        <h2 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>📈 Credit Score Slabs</h2>
        <table className="data-table">
          <thead>
            <tr>
              <th>Credit Score</th>
              <th>Decision</th>
              <th>Interest Rate</th>
            </tr>
          </thead>
          <tbody>
            {scoreSlabs.map(s => (
              <tr key={s.range}>
                <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{s.range}</td>
                <td><span className={`badge ${s.badge}`}>{s.action}</span></td>
                <td style={{ color: 'var(--text-secondary)' }}>{s.rate}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="info-bar" style={{ marginTop: '1rem', marginBottom: 0 }}>
          ⚠️ <span>Affordability check: total EMI (existing + new) must be ≤ <strong>50%</strong> of monthly salary, regardless of credit score.</span>
        </div>
      </div>
    </div>
  )
}
