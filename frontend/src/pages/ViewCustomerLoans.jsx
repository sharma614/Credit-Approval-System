import { useState } from 'react'
import { viewCustomerLoans } from '../api/client'
import ErrorPanel from '../components/ErrorPanel'

export default function ViewCustomerLoans() {
  const [customerId, setCustomerId] = useState('')
  const [loading, setLoading]       = useState(false)
  const [loans, setLoans]           = useState(null)
  const [error, setError]           = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true); setLoans(null); setError(null)
    try {
      const { data } = await viewCustomerLoans(customerId.trim())
      setLoans(data)
    } catch (err) {
      setError(err?.response?.data ?? { detail: 'Network error — is the backend running?' })
    } finally { setLoading(false) }
  }

  const totalPrincipal = loans?.reduce((s, l) => s + Number(l.loan_amount), 0) ?? 0
  const totalEMI       = loans?.reduce((s, l) => s + Number(l.monthly_installment), 0) ?? 0

  return (
    <div className="max-w-5xl mx-auto px-6 pt-12 pb-12">
      <header className="mb-10">
        <span className="text-primary text-[0.75rem] uppercase tracking-[0.1em] font-bold mb-2 block">
          Accounts
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight text-on-surface">Customer Loans</h1>
        <p className="text-on-surface-variant mt-3 text-lg max-w-lg">
          View all active and historical loans for a customer, with repayment progress tracking.
        </p>
      </header>

      {/* Search */}
      <div className="glass-panel p-6 rounded-3xl mb-8">
        <form onSubmit={handleSubmit} className="flex gap-4 items-end flex-wrap">
          <div className="space-y-2 flex-1 min-w-[200px]">
            <label className="lv-label">Customer ID</label>
            <input
              className="lv-input"
              type="number"
              placeholder="e.g. 302"
              value={customerId}
              onChange={e => setCustomerId(e.target.value)}
              required
            />
          </div>
          <button type="submit" disabled={loading} className="lv-btn flex items-center gap-2">
            {loading
              ? <><span className="lv-spinner" style={{ borderTopColor: '#00600e' }} />Loading…</>
              : <><span className="material-symbols-outlined text-lg">account_balance_wallet</span> Load Loans</>}
          </button>
        </form>
      </div>

      <ErrorPanel error={error} />

      {/* Empty state */}
      {loans && loans.length === 0 && (
        <div className="glass-panel p-16 rounded-3xl text-center lv-result">
          <span className="material-symbols-outlined text-5xl text-outline mb-4 block">folder_open</span>
          <p className="text-on-surface-variant">No loans found for Customer #{customerId}</p>
        </div>
      )}

      {loans && loans.length > 0 && (
        <div className="lv-result space-y-6">
          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: 'description',           label: 'Total Loans',     value: loans.length },
              { icon: 'payments',               label: 'Total Principal', value: `₹${(totalPrincipal / 100000).toFixed(1)}L` },
              { icon: 'calendar_month',         label: 'Combined EMI',    value: `₹${Math.round(totalEMI).toLocaleString('en-IN')}` },
            ].map(s => (
              <div key={s.label} className="glass-panel p-5 rounded-3xl">
                <span className="material-symbols-outlined text-primary text-2xl mb-2 block">{s.icon}</span>
                <div className="text-2xl font-black bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {s.value}
                </div>
                <div className="text-[0.7rem] uppercase tracking-widest font-bold text-outline mt-1">{s.label}</div>
              </div>
            ))}
          </div>

          {/* Loan cards */}
          <div className="space-y-4">
            {loans.map(loan => {
              const paidPct = (loan.tenure != null && loan.repayments_left != null)
                ? Math.max(0, Math.round(((loan.tenure - loan.repayments_left) / (loan.tenure || 1)) * 100))
                : null

              return (
                <div key={loan.loan_id} className="glass-panel p-6 rounded-3xl hover:-translate-y-0.5 transition-all duration-300">
                  <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                    {/* Left */}
                    <div>
                      <div className="text-[0.65rem] uppercase tracking-widest font-bold text-outline mb-1">
                        Loan #{loan.loan_id}
                      </div>
                      <div className="text-2xl font-bold text-on-surface">
                        ₹{Number(loan.loan_amount).toLocaleString('en-IN')}
                      </div>
                    </div>
                    {/* Right meta */}
                    <div className="flex gap-6 flex-wrap">
                      {[
                        { label: 'Interest Rate', value: `${loan.interest_rate}%` },
                        { label: 'Monthly EMI',   value: `₹${Number(loan.monthly_installment).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` },
                        { label: 'EMIs Left',     value: loan.repayments_left ?? '—' },
                      ].map(m => (
                        <div key={m.label}>
                          <div className="text-[0.65rem] uppercase tracking-widest font-bold text-outline">{m.label}</div>
                          <div className="text-sm font-bold text-on-surface mt-0.5">{m.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Progress bar */}
                  {paidPct !== null && (
                    <div>
                      <div className="flex justify-between text-[0.65rem] font-bold text-outline mb-1.5 uppercase tracking-widest">
                        <span>Repayment Progress</span>
                        <span>{paidPct}%</span>
                      </div>
                      <div className="h-1.5 bg-surface-container-highest rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700 ease-out"
                          style={{
                            width: `${paidPct}%`,
                            background: 'linear-gradient(90deg, #81fd77, #87f7a6)',
                            boxShadow: '0 0 8px rgba(129,253,119,0.4)',
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
