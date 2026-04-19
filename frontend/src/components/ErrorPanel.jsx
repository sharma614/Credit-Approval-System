/**
 * ErrorPanel — displays API error responses in the Luminous Vault design style.
 * Returns null when there is no error.
 *
 * @param {{ error: object|null }} props
 */
export default function ErrorPanel({ error }) {
  if (!error) return null

  return (
    <div className="mt-6 p-5 rounded-2xl bg-error-container/20 border border-error/30 lv-result flex items-start gap-4">
      <div className="w-10 h-10 rounded-xl bg-error/20 flex items-center justify-center flex-shrink-0">
        <span className="material-symbols-outlined text-error text-xl">error</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-error font-semibold text-sm mb-1">Request Failed</div>
        <pre className="text-on-surface-variant text-xs whitespace-pre-wrap break-all">
          {JSON.stringify(error, null, 2)}
        </pre>
      </div>
    </div>
  )
}
