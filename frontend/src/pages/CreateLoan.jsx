import { useState } from 'react'
import { createLoan } from '../api/client'

const initialForm = { customer_id: '', loan_amount: '', interest_rate: '', tenure: '' }

export default function CreateLoan() {
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true); setResult(null); setError(null)
    try {
      const { data } = await createLoan({
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

  const approved = result?.loan_approved

  return (
    <div>
      <div className="page-header">
        <h1>💳 Create Loan</h1>
        <p>Submit a loan application. Eligibility is rechecked at creation time; the corrected interest rate will be applied automatically.</p>
      </div>

      <div className="info-bar">
        💡 Run <strong>Check Eligibility</strong> first to see if the loan will be approved and what the corrected interest rate will be.
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid" style={{ marginBottom: '1.5rem' }}>
            {[
              { name: 'customer_id', label: 'Customer ID', type: 'number', placeholder: '302' },
              { name: 'loan_amount', label: 'Loan Amount (₹)', type: 'number', placeholder: '500000' },
              { name: 'interest_rate', label: 'Requested Interest Rate (%)', type: 'number', placeholder: '10', step: '0.01' },
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
            {loading ? <><span className="spinner" /> Processing…</> : '💳 Create Loan'}
          </button>
        </form>

        {result && (
          <div className={`result-panel ${approved ? 'result-success' : 'result-error'}`}>
            <div className="result-title" style={{ color: approved ? 'var(--success)' : 'var(--danger)' }}>
              {approved ? '✔ Loan Approved & Created' : '✖ Loan Not Approved'}
            </div>
            <div className="kv-list">
              <div className="kv-item"><div className="kv-key">Status</div><div className="kv-val"><span className={`badge ${approved ? 'badge-success' : 'badge-danger'}`}>{approved ? '✔ Approved' : '✖ Rejected'}</span></div></div>
              {approved && <div className="kv-item"><div className="kv-key">Loan ID</div><div className="kv-val" style={{ color: 'var(--accent)' }}>#{result.loan_id}</div></div>}
              <div className="kv-item"><div className="kv-key">Customer ID</div><div className="kv-val">#{result.customer_id}</div></div>
              <div className="kv-item"><div className="kv-key">Monthly EMI</div><div className="kv-val">₹{Number(result.monthly_installment).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div></div>
              <div className="kv-item"><div className="kv-key">Message</div><div className="kv-val">{result.message}</div></div>
            </div>
            {approved && (
              <div className="info-bar" style={{ marginTop: '1rem', marginBottom: 0 }}>
                📌 Save your <strong>Loan ID #{result.loan_id}</strong> to track this loan later.
              </div>
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
