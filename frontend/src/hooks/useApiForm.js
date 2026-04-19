import { useState, useCallback } from 'react'

/**
 * useApiForm — shared state machine for pages that submit a form to the API.
 *
 * @param {(payload: object) => Promise<{data: object}>} apiFn  - axios API function
 * @param {object}  initialForm  - initial form field values
 * @param {boolean} [resetOnSuccess=false] - if true, resets form after a successful call
 *
 * @returns {{
 *   form: object,
 *   loading: boolean,
 *   result: object|null,
 *   error: object|null,
 *   handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
 *   handleSubmit: (buildPayload: (form: object) => object) => (e: React.FormEvent) => Promise<void>,
 *   setResult: React.Dispatch,
 * }}
 */
export function useApiForm(apiFn, initialForm, resetOnSuccess = false) {
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)

  const handleChange = useCallback(
    (e) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value })),
    [],
  )

  /**
   * Returns an onSubmit handler that calls apiFn with `buildPayload(form)`.
   * buildPayload receives the current form object and should return the typed
   * request body (parsing strings to ints/floats as needed).
   *
   * @param {(form: object) => object} buildPayload
   */
  const handleSubmit = useCallback(
    (buildPayload) => async (e) => {
      e.preventDefault()
      setLoading(true)
      setResult(null)
      setError(null)
      try {
        const { data } = await apiFn(buildPayload(form))
        setResult(data)
        if (resetOnSuccess) setForm(initialForm)
      } catch (err) {
        setError(
          err?.response?.data ?? { detail: 'Network error — is the Django backend running?' },
        )
      } finally {
        setLoading(false)
      }
    },
    [apiFn, form, initialForm, resetOnSuccess],
  )

  return { form, loading, result, error, handleChange, handleSubmit, setResult }
}
