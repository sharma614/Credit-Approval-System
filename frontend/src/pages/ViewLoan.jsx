import { useState } from 'react'
import { viewLoan } from '../api/client'

export default function ViewLoan() {
  const [loanId, setLoanId] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true); setResult(null); setError(null)
    try {
      const { data } = await viewLoan(loanId.trim())
      setResult(data)
    } catch (err) {
      setError(err.response?.data || { detail: 'Network error — is the Django backend running?' })
    } finally { setLoading(false) }
  }

  return (
    <div>
      <div className="page-header">
        <h1>📄 View Loan Details</h1>
        <p>Look up full loan information including customer profile, interest rate, EMI, and tenure by Loan ID.</p>
      </div>

      <div className="card" style={{ marginBottom: '1.5rem' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <div className="form-field" style={{ flex: '1 1 200px' }}>
            <label className="form-label">Loan ID</label>
            <input className="form-input" type="number" placeholder="e.g. 9997"
              value={loanId} onChange={e => setLoanId(e.target.value)} required />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? <><span className="spinner" /> Fetching…</> : '🔎 Lookup Loan'}
          </button>
        </form>
      </div>

      {result && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
          {/* Loan Details Card */}
          <div className="card">
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.04em' }}>
              📋 Loan Details
            </div>
            <div className="kv-list">
              <div className="kv-item"><div className="kv-key">Loan ID</div><div className="kv-val" style={{ color: 'var(--accent)' }}>#{result.loan_id}</div></div>
              <div className="kv-item"><div className="kv-key">Loan Amount</div><div className="kv-val">₹{Number(result.loan_amount).toLocaleString('en-IN')}</div></div>
              <div className="kv-item"><div className="kv-key">Interest Rate</div><div className="kv-val">{result.interest_rate}%</div></div>
              <div className="kv-item"><div className="kv-key">Monthly EMI</div><div className="kv-val">₹{Number(result.monthly_installment).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div></div>
              <div className="kv-item"><div className="kv-key">Tenure</div><div className="kv-val">{result.tenure} months</div></div>
            </div>
          </div>

          {/* Customer Details Card */}
          {result.customer && (
            <div className="card">
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '0.75rem', letterSpacing: '0.04em' }}>
                👤 Customer Profile
              </div>
              <div className="kv-list">
                <div className="kv-item"><div className="kv-key">Customer ID</div><div className="kv-val" style={{ color: 'var(--accent)' }}>#{result.customer.id}</div></div>
                <div className="kv-item"><div className="kv-key">Name</div><div className="kv-val">{result.customer.first_name} {result.customer.last_name}</div></div>
                <div className="kv-item"><div className="kv-key">Age</div><div className="kv-val">{result.customer.age}</div></div>
                <div className="kv-item"><div className="kv-key">Phone</div><div className="kv-val">{result.customer.phone_number}</div></div>
              </div>
            </div>
          )}
        </div>
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
