import { useState, FormEvent } from 'react'
import { locationApi } from '../../services/api'
import type { Location, Locality } from '../../types/models'
import './Modal.css'

interface Props {
  location: Location | null
  localities: Locality[]
  onClose: () => void
  onSaved: () => void
}

export default function LocationFormModal({ location, localities, onClose, onSaved }: Props) {
  const [name, setName]           = useState(location?.name ?? '')
  const [address, setAddress]     = useState(location?.address ?? '')
  const [capacity, setCapacity]   = useState(location?.capacity ?? 100)
  const [localityId, setLocality] = useState<string>(location?.locality?.id?.toString() ?? '')
  const [error, setError]         = useState<string | null>(null)
  const [saving, setSaving]       = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      const payload = {
        name,
        address,
        capacity: Number(capacity),
        localityId: localityId ? Number(localityId) : null,
      }
      if (location) {
        await locationApi.update(location.id, payload)
      } else {
        await locationApi.create(payload)
      }
      onSaved()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box card" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{location ? 'Modifier le lieu' : 'Nouveau lieu'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="name">Nom *</label>
            <input
              id="name"
              type="text"
              className="form-control"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="address">Adresse</label>
            <input
              id="address"
              type="text"
              className="form-control"
              value={address}
              onChange={e => setAddress(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="capacity">Capacité *</label>
            <input
              id="capacity"
              type="number"
              className="form-control"
              min={1}
              value={capacity}
              onChange={e => setCapacity(Number(e.target.value))}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="locality">Localité</label>
            <select
              id="locality"
              className="form-control"
              value={localityId}
              onChange={e => setLocality(e.target.value)}
            >
              <option value="">— Aucune —</option>
              {localities.map(l => (
                <option key={l.id} value={l.id}>
                  {l.name}{l.postalCode ? ` (${l.postalCode})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? 'Enregistrement…' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
