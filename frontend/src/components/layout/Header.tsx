import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import './Header.css'

export default function Header() {
  const { user, logout, isAdmin, isProducer } = useAuth()
  const { totalItems } = useCart()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  const isAffiliate = user?.roles.includes('affiliate') ?? false

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
          {isAffiliate && (
            <NavLink to="/affiliate/dashboard" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Mon API
            </NavLink>
          )}
          {(isProducer || isAdmin) && (
            <NavLink to="/producer/stats" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Statistiques
            </NavLink>
          )}
          {isAdmin && (
            <NavLink to="/admin" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              Administration
            </NavLink>
          )}
        </nav>

        {/* Auth buttons + cart */}
        <div className="header-actions">
          {/* Icône panier — visible pour tous (même non connectés) */}
          <Link
            to="/cart"
            title="Mon panier"
            style={{
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              padding: '.4rem .6rem',
              textDecoration: 'none',
              fontSize: '1.25rem',
              borderRadius: '6px'
            }}
          >
            🛒
            {totalItems > 0 && (
              <span
                style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  background: '#dc2626',
                  color: 'white',
                  borderRadius: '999px',
                  minWidth: '20px',
                  height: '20px',
                  padding: '0 .35rem',
                  fontSize: '.7rem',
                  fontWeight: 700,
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 1px 3px rgba(0,0,0,.2)'
                }}
              >
                {totalItems}
              </span>
            )}
          </Link>

          {user ? (
            <>
              <Link to="/profile" className="header-username">👤 {user.login}</Link>
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