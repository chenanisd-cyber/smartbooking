import { useEffect, useState } from 'react'
import { userApi } from '../../services/api'
import type { User } from '../../types/models'

export default function AdminUsers() {
  const [users, setUsers]     = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  const load = () => {
    userApi.getAll()
      .then(setUsers)
      .catch(() => setError('Erreur de chargement'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleActivate   = async (id: number) => { await userApi.activate(id);   load() }
  const handleDeactivate = async (id: number) => { await userApi.deactivate(id); load() }
  const handleApprove    = async (id: number) => { await userApi.approve(id);    load() }
  const handleDelete     = async (id: number, login: string) => {
    if (!confirm(`Supprimer l'utilisateur "${login}" ?`)) return
    await userApi.delete(id)
    load()
  }

  if (loading) return <div className="spinner" />
  if (error)   return <div className="alert alert-error">{error}</div>

  return (
    <div>
      <div className="admin-section-title">Utilisateurs</div>

      <div className="admin-table-wrapper card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Login</th>
              <th>Nom</th>
              <th>E-mail</th>
              <th>Rôles</th>
              <th>Actif</th>
              <th>Approuvé</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td><strong>{u.login}</strong></td>
                <td>{u.firstName} {u.lastName}</td>
                <td style={{ fontSize: '.82rem', color: 'var(--muted)' }}>{u.email}</td>
                <td>
                  {u.roles.map(r => (
                    <span key={r} className="badge badge-blue" style={{ marginRight: '.25rem' }}>{r}</span>
                  ))}
                </td>
                <td>
                  <span className={`badge ${u.isActive ? 'badge-green' : 'badge-red'}`}>
                    {u.isActive ? 'Oui' : 'Non'}
                  </span>
                </td>
                <td>
                  <span className={`badge ${u.isApproved ? 'badge-green' : 'badge-grey'}`}>
                    {u.isApproved ? 'Oui' : 'Non'}
                  </span>
                </td>
                <td>
                  <div className="admin-actions">
                    {/* Activer / Désactiver */}
                    {u.isActive
                      ? <button className="btn btn-outline btn-sm" onClick={() => handleDeactivate(u.id)}>Désactiver</button>
                      : <button className="btn btn-primary btn-sm" onClick={() => handleActivate(u.id)}>Activer</button>
                    }
                    {/* Approuver (utile pour producteurs en attente) */}
                    {!u.isApproved && (
                      <button className="btn btn-primary btn-sm" onClick={() => handleApprove(u.id)}>Approuver</button>
                    )}
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.id, u.login)}>
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
