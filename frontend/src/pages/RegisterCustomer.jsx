import { useState } from 'react'
import { registerCustomer } from '../api/client'

const initialForm = { first_name: '', last_name: '', age: '', monthly_income: '', phone_number: '' }

export default function RegisterCustomer() {
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true); setResult(null); setError(null)
    try {
      const { data } = await registerCustomer({
        first_name: form.first_name, last_name: form.last_name,
        age: parseInt(form.age), monthly_income: parseFloat(form.monthly_income),
        phone_number: parseInt(form.phone_number)
      })
      setResult(data)
      setForm(initialForm)
    } catch (err) {
      setError(err.response?.data || { detail: 'Network error — is the Django backend running?' })
    } finally { setLoading(false) }
  }

  return (
    <div>
      <div className="page-header">
        <h1>👤 Register Customer</h1>
        <p>Create a new customer. The approved credit limit is auto-computed as <strong>36× monthly income</strong>, rounded to the nearest lakh.</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid" style={{ marginBottom: '1.5rem' }}>
            {[
              { name: 'first_name', label: 'First Name', type: 'text', placeholder: 'John' },
              { name: 'last_name',  label: 'Last Name',  type: 'text', placeholder: 'Doe' },
              { name: 'age',        label: 'Age (min 18)', type: 'number', placeholder: '30' },
              { name: 'monthly_income', label: 'Monthly Income (₹)', type: 'number', placeholder: '60000' },
              { name: 'phone_number',   label: 'Phone Number', type: 'number', placeholder: '9876543210' },
            ].map(f => (
              <div className="form-field" key={f.name}>
                <label className="form-label">{f.label}</label>
                <input className="form-input" type={f.type} name={f.name} placeholder={f.placeholder}
                  value={form[f.name]} onChange={handleChange} required min={f.name === 'age' ? 18 : undefined} />
              </div>
            ))}
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}>
            {loading ? <><span className="spinner" /> Registering…</> : '✅ Register Customer'}
          </button>
        </form>

        {result && (
          <div className="result-panel result-success">
            <div className="result-title" style={{ color: 'var(--success)' }}>✔ Customer Registered Successfully</div>
            <div className="kv-list">
              <div className="kv-item"><div className="kv-key">Customer ID</div><div className="kv-val" style={{ color: 'var(--accent)' }}>#{result.customer_id}</div></div>
              <div className="kv-item"><div className="kv-key">Full Name</div><div className="kv-val">{result.first_name} {result.last_name}</div></div>
              <div className="kv-item"><div className="kv-key">Age</div><div className="kv-val">{result.age}</div></div>
              <div className="kv-item"><div className="kv-key">Phone</div><div className="kv-val">{result.phone_number}</div></div>
              <div className="kv-item"><div className="kv-key">Monthly Salary</div><div className="kv-val">₹{Number(result.monthly_salary).toLocaleString('en-IN')}</div></div>
              <div className="kv-item"><div className="kv-key">Approved Limit</div><div className="kv-val">₹{Number(result.approved_limit).toLocaleString('en-IN')}</div></div>
            </div>
            <div className="info-bar" style={{ marginTop: '1rem', marginBottom: 0 }}>
              📌 Save your <strong>Customer ID #{result.customer_id}</strong> — you'll need it for loan operations.
            </div>
          </div>
        )}

        {error && (
          <div className="result-panel result-error">
            <div className="result-title" style={{ color: 'var(--danger)' }}>✖ Registration Failed</div>
            <pre style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>{JSON.stringify(error, null, 2)}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
