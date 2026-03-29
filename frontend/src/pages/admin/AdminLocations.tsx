import { useEffect, useState } from 'react'
import { locationApi } from '../../services/api'
import type { Location, Locality } from '../../types/models'
import LocationFormModal from './LocationFormModal'

export default function AdminLocations() {
  const [locations, setLocations] = useState<Location[]>([])
  const [localities, setLocalities] = useState<Locality[]>([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState<string | null>(null)
  const [modal, setModal]         = useState<null | 'create' | Location>(null)

  const load = () => {
    Promise.all([locationApi.getAll(), locationApi.getLocalities()])
      .then(([l, loc]) => { setLocations(l); setLocalities(loc) })
      .catch(() => setError('Erreur de chargement'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Supprimer "${name}" ?`)) return
    await locationApi.delete(id)
    load()
  }

  if (loading) return <div className="spinner" />
  if (error)   return <div className="alert alert-error">{error}</div>

  return (
    <div>
      <div className="admin-section-title">
        Lieux
        <button className="btn btn-primary btn-sm" onClick={() => setModal('create')}>
          + Nouveau lieu
        </button>
      </div>

      {locations.length === 0 ? (
        <p style={{ color: 'var(--muted)' }}>Aucun lieu.</p>
      ) : (
        <div className="admin-table-wrapper card">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Adresse</th>
                <th>Localité</th>
                <th>Capacité</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {locations.map(l => (
                <tr key={l.id}>
                  <td><strong>{l.name}</strong></td>
                  <td>{l.address ?? <span style={{ color: 'var(--muted)' }}>—</span>}</td>
                  <td>{l.locality ? `${l.locality.name}${l.locality.postalCode ? ` (${l.locality.postalCode})` : ''}` : <span style={{ color: 'var(--muted)' }}>—</span>}</td>
                  <td>{l.capacity}</td>
                  <td>
                    <div className="admin-actions">
                      <button className="btn btn-outline btn-sm" onClick={() => setModal(l)}>Modifier</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(l.id, l.name)}>Supprimer</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal !== null && (
        <LocationFormModal
          location={modal === 'create' ? null : modal}
          localities={localities}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load() }}
        />
      )}
    </div>
  )
}
