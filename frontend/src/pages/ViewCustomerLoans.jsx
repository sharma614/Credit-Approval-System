import { useState } from 'react'
import { viewCustomerLoans } from '../api/client'

export default function ViewCustomerLoans() {
  const [customerId, setCustomerId] = useState('')
  const [loading, setLoading] = useState(false)
  const [loans, setLoans] = useState(null)
  const [error, setError] = useState(null)

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true); setLoans(null); setError(null)
    try {
      const { data } = await viewCustomerLoans(customerId.trim())
      setLoans(data)
    } catch (err) {
      setError(err.response?.data || { detail: 'Network error — is the Django backend running?' })
    } finally { setLoading(false) }
  }

  const totalPrincipal = loans?.reduce((s, l) => s + Number(l.loan_amount), 0) || 0
  const totalEMI = loans?.reduce((s, l) => s + Number(l.monthly_installment), 0) || 0

  return (
    <div>
      <div className="page-header">
        <h1>📊 Customer Loans</h1>
        <p>View all active and historical loans for a customer, with remaining repayments tracker.</p>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-field" style={{ flex: '1 1 200px' }}>
            <label className="form-label">Customer ID</label>
            <input className="form-input" type="number" placeholder="e.g. 302"
              value={customerId} onChange={e => setCustomerId(e.target.value)} required />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? <><span className="spinner" /> Loading…</> : '📊 Load Loans'}
          </button>
        </form>
      </div>

      {loans && loans.length === 0 && (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">🗂️</div>
            <p>No loans found for Customer #{customerId}</p>
          </div>
        </div>
      )}

      {loans && loans.length > 0 && (
        <>
          {/* Summary bar */}
          <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
            <div className="stat-card"><div className="stat-card-icon">📋</div><div className="stat-card-value">{loans.length}</div><div className="stat-card-label">Total Loans</div></div>
            <div className="stat-card"><div className="stat-card-icon">💰</div><div className="stat-card-value">₹{(totalPrincipal / 100000).toFixed(1)}L</div><div className="stat-card-label">Total Principal</div></div>
            <div className="stat-card"><div className="stat-card-icon">📅</div><div className="stat-card-value">₹{Math.round(totalEMI).toLocaleString('en-IN')}</div><div className="stat-card-label">Total Monthly EMI</div></div>
          </div>

          <div className="loan-list">
            {loans.map(loan => {
              const paidPct = loan.repayments_left != null
                ? Math.max(0, Math.round(((loan.tenure - loan.repayments_left) / (loan.tenure || 1)) * 100))
                : null

              return (
                <div className="loan-card" key={loan.loan_id}>
                  <div className="loan-card-left">
                    <div className="loan-id">Loan #{loan.loan_id}</div>
                    <div className="loan-amount">₹{Number(loan.loan_amount).toLocaleString('en-IN')}</div>
                  </div>
                  <div className="loan-card-meta">
                    <div className="loan-meta-item"><div className="meta-label">Interest Rate</div><div className="meta-val">{loan.interest_rate}%</div></div>
                    <div className="loan-meta-item"><div className="meta-label">Monthly EMI</div><div className="meta-val">₹{Number(loan.monthly_installment).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div></div>
                    <div className="loan-meta-item"><div className="meta-label">EMIs Remaining</div><div className="meta-val">{loan.repayments_left ?? '—'}</div></div>
                  </div>
                  {paidPct !== null && (
                    <div style={{ width: '100%', marginTop: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '0.35rem', fontWeight: 600 }}>
                        <span>Repayment Progress</span><span>{paidPct}%</span>
                      </div>
                      <div style={{ height: '6px', background: 'rgba(99,102,241,0.12)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${paidPct}%`, background: 'linear-gradient(90deg,#6366f1,#8b5cf6)', borderRadius: '3px', transition: 'width 0.6s ease' }} />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </>
      )}

      {error && (
        <div className="result-panel result-error">
          <div className="result-title" style={{ color: 'var(--danger)' }}>✖ Not Found / Error</div>
          <pre style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>{JSON.stringify(error, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
