import { registerCustomer } from '../api/client'
import { useApiForm } from '../hooks/useApiForm'
import ErrorPanel from '../components/ErrorPanel'

const initialForm = {
  first_name: '', last_name: '', age: '', monthly_income: '', phone_number: '',
}

const FIELDS = [
  { name: 'first_name',     label: 'First Name',           type: 'text',   placeholder: 'John' },
  { name: 'last_name',      label: 'Last Name',            type: 'text',   placeholder: 'Doe' },
  { name: 'age',            label: 'Age (min 18)',         type: 'number', placeholder: '30',         min: 18 },
  { name: 'monthly_income', label: 'Monthly Income (₹)',  type: 'number', placeholder: '60,000' },
  { name: 'phone_number',   label: 'Phone Number',         type: 'number', placeholder: '9876543210' },
]

function buildPayload(form) {
  return {
    first_name:     form.first_name,
    last_name:      form.last_name,
    age:            parseInt(form.age),
    monthly_income: parseFloat(form.monthly_income),
    phone_number:   parseInt(form.phone_number),
  }
}

export default function RegisterCustomer() {
  const { form, loading, result, error, handleChange, handleSubmit } =
    useApiForm(registerCustomer, initialForm, /* resetOnSuccess */ true)

  return (
    <div className="max-w-3xl mx-auto px-6 pt-12 pb-12">
      <header className="mb-10">
        <span className="text-primary text-[0.75rem] uppercase tracking-[0.1em] font-bold mb-2 block">
          Customer Onboarding
        </span>
        <h1 className="text-4xl font-extrabold tracking-tight text-on-surface">Register Customer</h1>
        <p className="text-on-surface-variant mt-3 text-lg max-w-lg">
          The approved credit limit is auto-computed as <strong className="text-on-surface">36× monthly income</strong>,
          rounded to the nearest lakh.
        </p>
      </header>

      <div className="glass-panel p-8 rounded-3xl">
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
                  value={form[f.name]}
                  onChange={handleChange}
                  required
                  min={f.min}
                />
              </div>
            ))}
          </div>
          <div className="pt-2">
            <button type="submit" disabled={loading} className="lv-btn w-full md:w-auto flex items-center justify-center gap-2">
              {loading
                ? <><span className="lv-spinner" style={{ borderTopColor: '#00600e' }} />Registering…</>
                : <><span className="material-symbols-outlined text-lg">person_add</span> Register Customer</>}
            </button>
          </div>
        </form>

        <ErrorPanel error={error} />
      </div>

      {/* Success panel */}
      {result && (
        <div className="mt-6 lv-result">
          <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 flex items-start gap-4 mb-4">
            <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
              <span className="material-symbols-outlined text-primary">verified</span>
            </div>
            <div>
              <h4 className="text-on-surface font-semibold">Customer Registered Successfully</h4>
              <p className="text-on-surface-variant text-sm mt-1">
                Customer ID: <span className="text-primary font-mono font-bold select-all">#{result.customer_id}</span> — save this for loan operations.
              </p>
            </div>
          </div>

          <div className="bg-surface-container-low rounded-3xl p-6 border border-white/5">
            <h3 className="text-on-surface font-bold mb-4">Account Details</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: 'Customer ID',    value: `#${result.customer_id}`, accent: true },
                { label: 'Full Name',      value: result.name },
                { label: 'Age',            value: result.age },
                { label: 'Phone',          value: result.phone_number },
                { label: 'Monthly Income', value: `₹${Number(result.monthly_income).toLocaleString('en-IN')}` },
                { label: 'Approved Limit', value: `₹${Number(result.approved_limit).toLocaleString('en-IN')}`, accent: true },
              ].map(item => (
                <div key={item.label} className="p-4 rounded-2xl bg-surface-container border border-white/5">
                  <span className="lv-section-tag">{item.label}</span>
                  <span className={`text-lg font-bold ${item.accent ? 'text-primary' : 'text-on-surface'}`}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
