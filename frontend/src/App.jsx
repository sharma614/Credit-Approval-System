import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import BottomNav from './components/BottomNav'
import Dashboard from './pages/Dashboard'
import RegisterCustomer from './pages/RegisterCustomer'
import CheckEligibility from './pages/CheckEligibility'
import CreateLoan from './pages/CreateLoan'
import ViewLoan from './pages/ViewLoan'
import ViewCustomerLoans from './pages/ViewCustomerLoans'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-surface text-on-surface font-body">
        <Navbar />
        <Routes>
          <Route path="/"               element={<Dashboard />} />
          <Route path="/register"       element={<RegisterCustomer />} />
          <Route path="/eligibility"    element={<CheckEligibility />} />
          <Route path="/create-loan"    element={<CreateLoan />} />
          <Route path="/view-loan"      element={<ViewLoan />} />
          <Route path="/customer-loans" element={<ViewCustomerLoans />} />
        </Routes>
        <BottomNav />
      </div>
    </BrowserRouter>
  )
}
