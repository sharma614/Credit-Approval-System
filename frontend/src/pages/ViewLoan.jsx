import { useState } from 'react'
import { viewLoan } from '../api/client'
import ErrorPanel from '../components/ErrorPanel'

export default function ViewLoan() {
  const [loanId, setLoanId]   = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult]   = useState(null)
  const [error, setError]     = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setResult(null); setError(null)
    try {
      const { data } = await viewLoan(loanId.trim())
      setResult(data)
    } catch (err) {
      setError(err?.response?.data ?? { detail: 'Network error — is the backend running?' })
    } finally { setLoading(false) }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 pt-12 pb-12">
      <header className="mb-10">
        <span className="text-primary text-[0.75rem] uppercase tracking-[0.1em] font-bold mb-2 block">
          Loan Records
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight text-on-surface">View Loan</h1>
        <p className="text-on-surface-variant mt-3 text-lg max-w-lg">
          Retrieve full loan details including customer profile, interest rate, EMI, and tenure by Loan ID.
        </p>
      </header>

      {/* Search */}
      <div className="glass-panel p-6 rounded-3xl mb-8">
        <form onSubmit={handleSubmit} className="flex gap-4 items-end flex-wrap">
          <div className="space-y-2 flex-1 min-w-[200px]">
            <label className="lv-label">Loan ID</label>
            <input
              className="lv-input"
              type="number"
              placeholder="e.g. 9997"
              value={loanId}
              onChange={e => setLoanId(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={loading} className="lv-btn flex items-center gap-2">
            {loading
              ? <><span className="lv-spinner" style={{ borderTopColor: '#00600e' }} />Fetching…</>
              : <><span className="material-symbols-outlined text-lg">search</span> Lookup Loan</>}
          </button>
        </form>
      </div>

      <ErrorPanel error={error} />

      {result && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lv-result">
          {/* Loan Details Card */}
          <div className="glass-panel p-6 rounded-3xl relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/10 blur-[48px] rounded-full pointer-events-none" />
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-primary text-xl">receipt_long</span>
              <span className="text-[0.75rem] uppercase tracking-widest font-bold text-outline">Loan Details</span>
            </div>
            <div className="space-y-4">
              {[
                { label: 'Loan ID',      value: `#${result.loan_id}`,  accent: true },
                { label: 'Loan Amount',  value: `₹${Number(result.loan_amount).toLocaleString('en-IN')}` },
                { label: 'Interest Rate',value: `${result.interest_rate}%` },
                { label: 'Monthly EMI',  value: `₹${Number(result.monthly_installment).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` },
                { label: 'Tenure',       value: `${result.tenure} months` },
              ].map(item => (
                <div key={item.label} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                  <span className="text-on-surface-variant text-sm">{item.label}</span>
                  <span className={`font-bold ${item.accent ? 'text-primary' : 'text-on-surface'}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Profile Card */}
          {result.customer && (
            <div className="glass-panel p-6 rounded-3xl relative overflow-hidden">
              <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-secondary/10 blur-[48px] rounded-full pointer-events-none" />
              <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-secondary text-xl">person</span>
                <span className="text-[0.75rem] uppercase tracking-widest font-bold text-outline">Customer Profile</span>
              </div>
              {/* Avatar placeholder */}
              <div className="flex items-center gap-4 mb-6 p-4 rounded-2xl bg-surface-container-low border border-white/5">
                <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-on-surface-variant text-2xl">person</span>
                </div>
                <div>
                  <div className="text-on-surface font-bold">
                    {result.customer.first_name} {result.customer.last_name}
                  </div>
                  <div className="text-on-surface-variant text-sm">#{result.customer.id}</div>
                </div>
              </div>
              <div className="space-y-4">
                {[
                  { label: 'Age',   value: `${result.customer.age} years` },
                  { label: 'Phone', value: result.customer.phone_number },
                ].map(item => (
                  <div key={item.label} className="flex justify-between items-center py-2 border-b border-white/5 last:border-0">
                    <span className="text-on-surface-variant text-sm">{item.label}</span>
                    <span className="font-bold text-on-surface">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
