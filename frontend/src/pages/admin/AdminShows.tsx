import { useEffect, useState } from 'react'
import { showApi, artistApi } from '../../services/api'
import type { Show, Artist } from '../../types/models'
import ShowFormModal from './ShowFormModal'

export default function AdminShows() {
  const [shows, setShows]     = useState<Show[]>([])
  const [artists, setArtists] = useState<Artist[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  // Modal : null = fermé, 'create' = nouveau, show = édition
  const [modal, setModal] = useState<null | 'create' | Show>(null)

  const load = () => {
    Promise.all([showApi.getAllAdmin(), artistApi.getAll()])
      .then(([s, a]) => { setShows(s); setArtists(a) })
      .catch(() => setError('Erreur de chargement'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleConfirm = async (id: number) => {
    await showApi.confirm(id)
    load()
  }

  const handleRevoke = async (id: number) => {
    await showApi.revoke(id)
    load()
  }

  const handleDelete = async (id: number, title: string) => {
    if (!confirm(`Supprimer "${title}" ?`)) return
    await showApi.delete(id)
    load()
  }

  if (loading) return <div className="spinner" />
  if (error)   return <div className="alert alert-error">{error}</div>

  return (
    <div>
      <div className="admin-section-title">
        Spectacles
        <button className="btn btn-primary btn-sm" onClick={() => setModal('create')}>
          + Nouveau spectacle
        </button>
      </div>

      {shows.length === 0 ? (
        <p style={{ color: 'var(--muted)' }}>Aucun spectacle.</p>
      ) : (
        <div className="admin-table-wrapper card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Titre</th>
                <th>Artiste</th>
                <th>Statut</th>
                <th>Dates</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {shows.map(s => (
                <tr key={s.id}>
                  <td><strong>{s.title}</strong></td>
                  <td>{s.artist?.name ?? <span style={{color:'var(--muted)'}}>—</span>}</td>
                  <td>
                    <span className={`badge ${s.isConfirmed ? 'badge-green' : 'badge-grey'}`}>
                      {s.isConfirmed ? 'Confirmé' : 'Non confirmé'}
                    </span>
                  </td>
                  <td>{s.representations.length} date{s.representations.length !== 1 ? 's' : ''}</td>
                  <td>
                    <div className="admin-actions">
                      <button className="btn btn-outline btn-sm" onClick={() => setModal(s)}>
                        Modifier
                      </button>
                      {s.isConfirmed
                        ? <button className="btn btn-outline btn-sm" onClick={() => handleRevoke(s.id)}>Révoquer</button>
                        : <button className="btn btn-primary btn-sm" onClick={() => handleConfirm(s.id)}>Confirmer</button>
                      }
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.id, s.title)}>
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal création / édition */}
      {modal !== null && (
        <ShowFormModal
          show={modal === 'create' ? null : modal}
          artists={artists}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load() }}
        />
      )}
    </div>
  )
}
