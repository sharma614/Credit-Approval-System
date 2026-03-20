import { useState } from 'react'
import { checkEligibility } from '../api/client'

const initialForm = { customer_id: '', loan_amount: '', interest_rate: '', tenure: '' }

function CreditGauge({ score }) {
  const pct = (score / 100) * 100
  let color = '#ef4444'; let label = 'Poor'
  if (score > 50) { color = '#10b981'; label = 'Good' }
  else if (score > 30) { color = '#f59e0b'; label = 'Fair' }
  else if (score > 10) { color = '#f97316'; label = 'Low' }
  return (
    <div className="score-ring-wrap">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(99,102,241,0.1)" strokeWidth="12" />
        <circle cx="60" cy="60" r="50" fill="none" stroke={color} strokeWidth="12"
          strokeDasharray={`${(pct / 100) * 314} 314`} strokeLinecap="round"
          transform="rotate(-90 60 60)" style={{ transition: 'stroke-dasharray 0.8s ease' }} />
        <text x="60" y="55" textAnchor="middle" fill={color} fontSize="22" fontWeight="800">{score}</text>
        <text x="60" y="72" textAnchor="middle" fill="#94a3b8" fontSize="11">{label}</text>
      </svg>
      <div className="score-ring-label">Credit Score</div>
    </div>
  )
}

export default function CheckEligibility() {
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true); setResult(null); setError(null)
    try {
      const { data } = await checkEligibility({
        customer_id: parseInt(form.customer_id),
        loan_amount: parseFloat(form.loan_amount),
        interest_rate: parseFloat(form.interest_rate),
        tenure: parseInt(form.tenure),
      })
      setResult(data)
    } catch (err) {
      setError(err.response?.data || { detail: 'Network error — is the Django backend running?' })
    } finally { setLoading(false) }
  }

  const approved = result?.approval

  return (
    <div>
      <div className="page-header">
        <h1>🔍 Check Loan Eligibility</h1>
        <p>Evaluate loan eligibility before committing. Uses a 4-factor credit score model (payment history, loan count, activity, utilization).</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid" style={{ marginBottom: '1.5rem' }}>
            {[
              { name: 'customer_id', label: 'Customer ID', type: 'number', placeholder: '302' },
              { name: 'loan_amount', label: 'Loan Amount (₹)', type: 'number', placeholder: '500000' },
              { name: 'interest_rate', label: 'Interest Rate (%)', type: 'number', placeholder: '10', step: '0.01' },
              { name: 'tenure', label: 'Tenure (months)', type: 'number', placeholder: '24' },
            ].map(f => (
              <div className="form-field" key={f.name}>
                <label className="form-label">{f.label}</label>
                <input className="form-input" type={f.type} name={f.name} placeholder={f.placeholder}
                  step={f.step} value={form[f.name]} onChange={handleChange} required />
              </div>
            ))}
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? <><span className="spinner" /> Checking…</> : '🔍 Check Eligibility'}
          </button>
        </form>

        {result && (
          <div className={`result-panel ${approved ? 'result-success' : 'result-error'}`}>
            <div className="result-title" style={{ color: approved ? 'var(--success)' : 'var(--danger)' }}>
              {approved ? '✔ Loan Eligible' : '✖ Loan Not Eligible'}
            </div>
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <CreditGauge score={result.credit_score ?? 0} />
              <div className="kv-list" style={{ flex: 1 }}>
                <div className="kv-item"><div className="kv-key">Status</div><div className="kv-val"><span className={`badge ${approved ? 'badge-success' : 'badge-danger'}`}>{approved ? '✔ Approved' : '✖ Rejected'}</span></div></div>
                <div className="kv-item"><div className="kv-key">Requested Rate</div><div className="kv-val">{result.interest_rate}%</div></div>
                <div className="kv-item"><div className="kv-key">Corrected Rate</div><div className="kv-val" style={{ color: result.corrected_interest_rate > result.interest_rate ? 'var(--warning)' : 'var(--success)' }}>{result.corrected_interest_rate}%</div></div>
                <div className="kv-item"><div className="kv-key">Monthly EMI</div><div className="kv-val">₹{Number(result.monthly_installment).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div></div>
                <div className="kv-item"><div className="kv-key">Tenure</div><div className="kv-val">{result.tenure} months</div></div>
              </div>
            </div>
            {!approved && <div className="info-bar" style={{ marginTop: '1rem', marginBottom: 0 }}>ℹ️ Loan rejected — either total EMI exceeds 50% of salary or credit score is below 10.</div>}
            {approved && result.corrected_interest_rate > result.interest_rate && (
              <div className="info-bar" style={{ marginTop: '1rem', marginBottom: 0 }}>⚠️ Interest rate corrected from {result.interest_rate}% to <strong>{result.corrected_interest_rate}%</strong> based on your credit score slab.</div>
            )}
          </div>
        )}

        {error && (
          <div className="result-panel result-error">
            <div className="result-title" style={{ color: 'var(--danger)' }}>✖ Error</div>
            <pre style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>{JSON.stringify(error, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
