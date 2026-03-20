import { NavLink } from 'react-router-dom'

export default function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-brand">
          <span className="navbar-brand-icon">🏦</span>
          <span>CreditFlow</span>
        </NavLink>
        <div className="navbar-nav">
          <NavLink to="/" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')} end>Dashboard</NavLink>
          <NavLink to="/register" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>Register</NavLink>
          <NavLink to="/eligibility" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>Eligibility</NavLink>
          <NavLink to="/create-loan" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>Create Loan</NavLink>
          <NavLink to="/view-loan" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>View Loan</NavLink>
          <NavLink to="/customer-loans" className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}>My Loans</NavLink>
        </div>
      </div>
    </nav>
  )
}
