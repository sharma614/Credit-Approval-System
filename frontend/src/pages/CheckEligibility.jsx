import { checkEligibility } from '../api/client'
import { useApiForm } from '../hooks/useApiForm'
import ErrorPanel from '../components/ErrorPanel'

const initialForm = { customer_id: '', loan_amount: '', interest_rate: '', tenure: '' }

const FIELDS = [
  { name: 'customer_id',   label: 'Customer ID',       type: 'number', placeholder: 'e.g. 302' },
  { name: 'loan_amount',   label: 'Loan Amount (₹)',   type: 'number', placeholder: '500,000' },
  { name: 'interest_rate', label: 'Interest Rate (%)', type: 'number', placeholder: '10.00', step: '0.01' },
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

function CreditRing({ score }) {
  const pct = Math.min(100, Math.max(0, score))
  const circumference = 314
  const dash = (pct / 100) * circumference
  let color = '#ff7351'; let label = 'Poor'
  if (score > 50) { color = '#81fd77'; label = 'Good' }
  else if (score > 30) { color = '#87f7a6'; label = 'Fair' }
  else if (score > 10) { color = '#97f4ff'; label = 'Low' }
  return (
    <div className="flex flex-col items-center gap-2 py-4">
      <svg width="130" height="130" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(129,253,119,0.08)" strokeWidth="10" />
        <circle cx="60" cy="60" r="50" fill="none" stroke={color} strokeWidth="10"
          strokeDasharray={`${dash} ${circumference}`} strokeLinecap="round"
          transform="rotate(-90 60 60)"
          style={{ transition: 'stroke-dasharray 0.9s cubic-bezier(.4,0,.2,1)', filter: `drop-shadow(0 0 8px ${color}60)` }}
        />
        <text x="60" y="56" textAnchor="middle" fill={color} fontSize="24" fontWeight="900">{score}</text>
        <text x="60" y="73" textAnchor="middle" fill="#8bb591" fontSize="11">{label}</text>
      </svg>
      <span className="text-[0.65rem] uppercase tracking-widest font-bold text-outline">Credit Score</span>
    </div>
  )
}

export default function CheckEligibility() {
  const { form, loading, result, error, handleChange, handleSubmit } =
    useApiForm(checkEligibility, initialForm)

  const approved = result?.approval

  return (
    <div className="max-w-7xl mx-auto px-6 pt-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* ── Left: Form ── */}
      <div className="lg:col-span-7">
        <header className="mb-10">
          <span className="text-primary text-[0.75rem] uppercase tracking-[0.1em] font-bold mb-2 block">
            Lending Terminal
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-on-surface">Eligibility Check</h1>
          <p className="text-on-surface-variant mt-3 text-lg max-w-md">
            Evaluate loan eligibility using our 4-factor credit score model before committing.
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
            {/* Tenure select */}
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

          <div className="pt-2">
            <button type="submit" disabled={loading} className="lv-btn w-full md:w-auto flex items-center justify-center gap-2">
              {loading
                ? <><span className="lv-spinner" style={{ borderTopColor: '#00600e' }} />Analysing…</>
                : <><span className="material-symbols-outlined text-lg">analytics</span> Check Eligibility</>}
            </button>
          </div>
        </form>

        <ErrorPanel error={error} />

        {/* Infographic callout (always visible) */}
        <div className="mt-10 p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-500/15 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-indigo-400">info</span>
          </div>
          <div>
            <h4 className="text-on-surface font-semibold">Score Model: 4 Factors</h4>
            <p className="text-on-surface-variant text-sm mt-1">
              Payment history (40 pts) · Loan count (20 pts) · Current-year activity (20 pts) · Credit utilisation (20 pts)
            </p>
          </div>
        </div>
      </div>

      {/* ── Right: Results ── */}
      <div className="lg:col-span-5 space-y-6">
        {/* Status panel */}
        <div className="glass-panel p-8 rounded-3xl relative overflow-hidden">
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-primary/10 blur-[64px] rounded-full pointer-events-none" />
          <div className="flex justify-between items-start mb-6">
            <span className="lv-section-tag">Application Status</span>
            <span className="px-3 py-1 bg-surface-container-highest text-on-surface-variant text-[0.65rem] font-bold rounded-full">
              LIVE PREVIEW
            </span>
          </div>

          {!result ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-5xl text-outline mb-4 block">pending</span>
              <p className="text-on-surface-variant text-sm">Submit the form to see the credit assessment.</p>
            </div>
          ) : (
            <div className="lv-result">
              <div className="text-center py-4">
                <div className={`inline-flex items-center justify-center px-8 py-4 rounded-full border mb-4 ${
                  approved
                    ? 'bg-primary/10 border-primary/30'
                    : 'bg-error/10 border-error/30'
                }`}>
                  <span className={`text-4xl font-black tracking-tighter ${approved ? 'text-primary' : 'text-error'}`}>
                    {approved ? 'Approved' : 'Rejected'}
                  </span>
                </div>
                <p className="text-on-surface-variant text-sm">
                  Credit assessment complete based on algorithmic risk scoring.
                </p>
              </div>

              <CreditRing score={result.credit_score ?? 0} />

              <div className="mt-4 grid grid-cols-2 gap-3">
                {[
                  { label: 'Requested Rate', value: `${result.interest_rate}%` },
                  { label: 'Corrected Rate',
                    value: `${result.corrected_interest_rate}%`,
                    highlight: result.corrected_interest_rate > result.interest_rate },
                  { label: 'Monthly EMI',
                    value: `₹${Number(result.monthly_installment).toLocaleString('en-IN', { minimumFractionDigits: 2 })}` },
                  { label: 'Tenure',         value: `${result.tenure} months` },
                ].map(item => (
                  <div key={item.label} className="p-4 rounded-2xl bg-surface-container-low border border-white/5">
                    <span className="lv-section-tag">{item.label}</span>
                    <span className={`text-xl font-bold ${item.highlight ? 'text-tertiary' : 'text-on-surface'}`}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>

              {!approved && (
                <div className="mt-4 p-4 rounded-xl bg-error/5 border border-error/20 flex items-start gap-2">
                  <span className="material-symbols-outlined text-error text-sm mt-0.5">warning</span>
                  <p className="text-error text-xs">
                    Rejected — total EMI exceeds 50% of salary or credit score is below 10.
                  </p>
                </div>
              )}
              {approved && result.corrected_interest_rate > result.interest_rate && (
                <div className="mt-4 p-4 rounded-xl bg-tertiary/5 border border-tertiary/20 flex items-start gap-2">
                  <span className="material-symbols-outlined text-tertiary text-sm mt-0.5">info</span>
                  <p className="text-tertiary text-xs">
                    Rate corrected from {result.interest_rate}% → <strong>{result.corrected_interest_rate}%</strong> based on credit score slab.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Eligibility summary bento */}
        <div className="bg-surface-container-low p-6 rounded-3xl space-y-2 border border-white/5">
          <h3 className="text-on-surface font-bold text-lg px-2 mb-4">Eligibility Criteria</h3>
          {[
            { icon: 'task_alt', label: 'Credit Score Analysis',  value: result ? `${result.credit_score ?? '—'} / 100`   : '—' },
            { icon: 'task_alt', label: 'Rate Correction Applied', value: result ? (result.corrected_interest_rate > result.interest_rate ? 'Yes' : 'No') : '—' },
            { icon: 'task_alt', label: 'Affordability Check',    value: result ? (result.approval ? 'Passed' : 'Failed') : '—' },
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
