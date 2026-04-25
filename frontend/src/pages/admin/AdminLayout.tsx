import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useEffect } from 'react'
import './AdminLayout.css'

// Liens du menu latéral
const NAV_ITEMS = [
  { to: '/admin/shows',     label: '🎭 Spectacles'  },
  { to: '/admin/artists',   label: '🎤 Artistes'    },
  { to: '/admin/locations', label: '📍 Lieux'       },
  { to: '/admin/users',     label: '👥 Utilisateurs' },
  { to: '/admin/reviews',   label: '⭐ Avis'         },
  { to: '/admin/csv',       label: '📄 Import/Export' },
]

export default function AdminLayout() {
  const { isAdmin, loading } = useAuth()
  const navigate = useNavigate()

  // Rediriger si pas admin
  useEffect(() => {
    if (!loading && !isAdmin) navigate('/')
  }, [isAdmin, loading, navigate])

  if (loading) return <div className="container"><div className="spinner" /></div>

  return (
    <div className="admin-wrapper container">
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <p className="admin-sidebar-title">Administration</p>
        <nav className="admin-nav">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Contenu principal */}
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  )
}
