import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './Header.css'

export default function Header() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <header className="header">
      <div className="container header-inner">
        {/* Logo */}
        <Link to="/" className="logo">
          Smart<span>Booking</span>
        </Link>

        {/* Nav links */}
        <nav className="nav">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            Catalogue
          </NavLink>
          {user && (
            <NavLink to="/my-bookings" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Mes réservations
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Administration
            </NavLink>
          )}
        </nav>

        {/* Auth buttons */}
        <div className="header-actions">
          {user ? (
            <>
              <span className="header-username">👤 {user.login}</span>
              <button onClick={handleLogout} className="btn btn-outline btn-sm">
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm">Connexion</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Inscription</Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
