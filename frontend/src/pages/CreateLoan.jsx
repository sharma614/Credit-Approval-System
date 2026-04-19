import { createLoan } from '../api/client'
import { useApiForm } from '../hooks/useApiForm'
import ErrorPanel from '../components/ErrorPanel'

const initialForm = { customer_id: '', loan_amount: '', interest_rate: '', tenure: '' }

const FIELDS = [
  { name: 'customer_id',   label: 'Customer ID',       type: 'number', placeholder: 'e.g. 302' },
  { name: 'loan_amount',   label: 'Loan Amount (₹)',   type: 'number', placeholder: '250,000' },
  { name: 'interest_rate', label: 'Interest Rate (%)', type: 'number', placeholder: '4.25', step: '0.01' },
]

const TENURE_OPTIONS = [12, 24, 36, 48, 60]

function buildPayload(form) {
  return {
    customer_id:   parseInt(form.customer_id),
    loan_amount:   parseFloat(form.loan_amount),
    interest_rate: parseFloat(form.interest_rate),
    tenure:        parseInt(form.tenure) || 12,
  }
}

export default function CreateLoan() {
  const { form, loading, result, error, handleChange, handleSubmit } =
    useApiForm(createLoan, initialForm)

  const approved = result?.loan_approved

  return (
    <div className="max-w-7xl mx-auto px-6 pt-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* ── Left: Form ── */}
      <div className="lg:col-span-7">
        <header className="mb-10">
          <span className="text-primary text-[0.75rem] uppercase tracking-[0.1em] font-bold mb-2 block">
            Lending Terminal
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-on-surface">Loan Application</h1>
          <p className="text-on-surface-variant mt-3 text-lg max-w-md">
            Initiate a new credit facility. Eligibility is rechecked at submission; the corrected interest rate is applied automatically.
          </p>
        </header>

        <form onSubmit={handleSubmit(buildPayload)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FIELDS.map(f => (
              <div key={f.name} className="space-y-2">
                <label className="lv-label">{f.label}</label>
                <input
                  className="lv-input"
                  type={f.type}
                  name={f.name}
                  placeholder={f.placeholder}
                  step={f.step}
                  value={form[f.name]}
                  onChange={handleChange}
                  required
                />
              </div>
            ))}
            {/* Tenure */}
            <div className="space-y-2">
              <label className="lv-label">Tenure (Months)</label>
              <select
                className="lv-input appearance-none cursor-pointer"
                name="tenure"
                value={form.tenure}
                onChange={handleChange}
                required
              >
                <option value="">Select tenure…</option>
                {TENURE_OPTIONS.map(t => (
                  <option key={t} value={t}>{t} Months</option>
                ))}
              </select>
            </div>
          </div>

          {/* Tip bar */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-indigo-500/5 border border-indigo-500/10">
            <span className="material-symbols-outlined text-indigo-400 text-sm mt-0.5">lightbulb</span>
            <p className="text-on-surface-variant text-sm">
              Run <strong className="text-on-surface">Check Eligibility</strong> first to preview the corrected interest rate and monthly EMI.
            </p>
          </div>

          <div className="pt-2">
            <button type="submit" disabled={loading} className="lv-btn w-full md:w-auto flex items-center justify-center gap-2">
              {loading
                ? <><span className="lv-spinner" style={{ borderTopColor: '#00600e' }} />Processing…</>
                : <><span className="material-symbols-outlined text-lg">send</span> Submit Application</>}
            </button>
          </div>
        </form>

        <ErrorPanel error={error} />
      </div>

      {/* ── Right: Results ── */}
      <div className="lg:col-span-5 space-y-6">
        {/* Status panel */}
        <div className="glass-panel p-8 rounded-3xl relative overflow-hidden">
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-primary/10 blur-[64px] rounded-full pointer-events-none" />
          <div className="flex justify-between items-start mb-8">
            <span className="lv-section-tag">Application Status</span>
            <span className="px-3 py-1 bg-surface-container-highest text-on-surface-variant text-[0.65rem] font-bold rounded-full">
              LIVE PREVIEW
            </span>
          </div>

          {!result ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-5xl text-outline mb-4 block">pending_actions</span>
              <p className="text-on-surface-variant text-sm">Submit the form to initiate a credit decision.</p>
            </div>
          ) : (
            <div className="lv-result">
              <div className="text-center py-6">
                <div className={`inline-flex items-center justify-center px-8 py-4 rounded-full border mb-4 ${
                  approved
                    ? 'bg-primary/10 border-primary/30'
                    : 'bg-error/10 border-error/30'
                }`}>
                  <span className={`text-5xl font-black tracking-tighter ${approved ? 'text-primary' : 'text-error'}`}>
                    {approved ? 'Approved' : 'Rejected'}
                  </span>
                </div>
                <p className="text-on-surface-variant text-sm">
                  Credit assessment complete based on algorithmic risk scoring.
                </p>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl bg-surface-container-low border border-white/5">
                  <span className="lv-section-tag">Monthly EMI</span>
                  <span className="text-2xl font-bold text-on-surface">
                    ₹{Number(result.monthly_installment).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                {approved && result.loan_id && (
                  <div className="p-4 rounded-2xl bg-surface-container-low border border-white/5">
                    <span className="lv-section-tag">Loan ID</span>
                    <span className="text-2xl font-bold text-primary font-mono">#{result.loan_id}</span>
                  </div>
                )}
                <div className="p-4 rounded-2xl bg-surface-container-low border border-white/5">
                  <span className="lv-section-tag">Customer ID</span>
                  <span className="text-2xl font-bold text-on-surface font-mono">#{result.customer_id}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Success callout (after approval) */}
        {result && approved && (
          <div className="p-6 rounded-2xl bg-primary/5 border border-primary/15 flex items-start gap-4 lv-result">
            <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-primary">verified</span>
            </div>
            <div>
              <h4 className="text-on-surface font-semibold">Loan Disbursed</h4>
              <p className="text-on-surface-variant text-sm mt-1">
                Reference ID: <span className="text-primary font-mono select-all">#{result.loan_id}</span>.
                Save this to track the loan later.
              </p>
            </div>
          </div>
        )}

        {/* Eligibility summary */}
        <div className="bg-surface-container-low p-6 rounded-3xl space-y-2 border border-white/5">
          <h3 className="text-on-surface font-bold text-lg px-2 mb-4">Eligibility Summary</h3>
          {[
            { icon: 'task_alt', label: 'Credit Score Analysis',  value: '4-Factor Model' },
            { icon: 'task_alt', label: 'Debt-to-Income Check',   value: '≤ 50% of salary' },
            { icon: 'task_alt', label: 'Rate Auto-Correction',   value: 'Applied if needed' },
          ].map(row => (
            <div key={row.label} className="lv-kv-row">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary text-base">{row.icon}</span>
                <span className="text-sm text-on-surface-variant">{row.label}</span>
              </div>
              <span className="text-sm font-bold text-on-surface">{row.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
