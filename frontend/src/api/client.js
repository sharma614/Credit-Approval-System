import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

export const registerCustomer = (data) => api.post('/register/', data)
export const checkEligibility = (data) => api.post('/check-eligibility/', data)
export const createLoan = (data) => api.post('/create-loan/', data)
export const viewLoan = (loanId) => api.get(`/view-loan/${loanId}/`)
export const viewCustomerLoans = (customerId) => api.get(`/view-loans/${customerId}/`)

export default api
