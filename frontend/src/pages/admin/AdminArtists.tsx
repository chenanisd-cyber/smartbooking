import { useEffect, useState } from 'react'
import { artistApi } from '../../services/api'
import type { Artist, ArtistType } from '../../types/models'
import ArtistFormModal from './ArtistFormModal'

export default function AdminArtists() {
  const [artists, setArtists]   = useState<Artist[]>([])
  const [types, setTypes]       = useState<ArtistType[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)
  const [modal, setModal]       = useState<null | 'create' | Artist>(null)

  const load = () => {
    Promise.all([artistApi.getAll(), artistApi.getTypes()])
      .then(([a, t]) => { setArtists(a); setTypes(t) })
      .catch(() => setError('Erreur de chargement'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Supprimer "${name}" ?`)) return
    await artistApi.delete(id)
    load()
  }

  if (loading) return <div className="spinner" />
  if (error)   return <div className="alert alert-error">{error}</div>

  return (
    <div>
      <div className="admin-section-title">
        Artistes
        <button className="btn btn-primary btn-sm" onClick={() => setModal('create')}>
          + Nouvel artiste
        </button>
      </div>

      {artists.length === 0 ? (
        <p style={{ color: 'var(--muted)' }}>Aucun artiste.</p>
      ) : (
        <div className="admin-table-wrapper card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Types</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {artists.map(a => (
                <tr key={a.id}>
                  <td><strong>{a.name}</strong></td>
                  <td>
                    {a.types.length > 0
                      ? a.types.map(t => (
                          <span key={t} className="badge badge-grey" style={{ marginRight: '.3rem' }}>{t}</span>
                        ))
                      : <span style={{ color: 'var(--muted)' }}>—</span>
                    }
                  </td>
                  <td>
                    <div className="admin-actions">
                      <button className="btn btn-outline btn-sm" onClick={() => setModal(a)}>Modifier</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(a.id, a.name)}>Supprimer</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal !== null && (
        <ArtistFormModal
          artist={modal === 'create' ? null : modal}
          types={types}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load() }}
        />
      )}
    </div>
  )
}
