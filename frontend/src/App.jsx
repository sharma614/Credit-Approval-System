import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import RegisterCustomer from './pages/RegisterCustomer'
import CheckEligibility from './pages/CheckEligibility'
import CreateLoan from './pages/CreateLoan'
import ViewLoan from './pages/ViewLoan'
import ViewCustomerLoans from './pages/ViewCustomerLoans'

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/register" element={<RegisterCustomer />} />
            <Route path="/eligibility" element={<CheckEligibility />} />
            <Route path="/create-loan" element={<CreateLoan />} />
            <Route path="/view-loan" element={<ViewLoan />} />
            <Route path="/customer-loans" element={<ViewCustomerLoans />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}
