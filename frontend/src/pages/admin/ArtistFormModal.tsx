import { useState, FormEvent } from 'react'
import { artistApi } from '../../services/api'
import type { Artist, ArtistType } from '../../types/models'
import './Modal.css'

interface Props {
  artist: Artist | null
  types: ArtistType[]
  onClose: () => void
  onSaved: () => void
}

export default function ArtistFormModal({ artist, types, onClose, onSaved }: Props) {
  const [name, setName]           = useState(artist?.name ?? '')
  const [biography, setBio]       = useState(artist?.biography ?? '')
  // Types sélectionnés (liste d'IDs) — on convertit les noms existants en IDs pour l'édition
  const [selectedTypeIds, setSelectedTypeIds] = useState<number[]>(
    artist ? types.filter(t => artist.types.includes(t.name)).map(t => t.id) : []
  )
  const [error, setError]         = useState<string | null>(null)
  const [saving, setSaving]       = useState(false)

  const toggleType = (id: number) => {
    setSelectedTypeIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      const payload = { name, biography, typeIds: selectedTypeIds }
      if (artist) {
        await artistApi.update(artist.id, payload)
      } else {
        await artistApi.create(payload)
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
          <h2 className="modal-title">{artist ? 'Modifier l\'artiste' : 'Nouvel artiste'}</h2>
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
            <label htmlFor="bio">Biographie</label>
            <textarea
              id="bio"
              className="form-control"
              rows={3}
              value={biography}
              onChange={e => setBio(e.target.value)}
              style={{ resize: 'vertical', fontFamily: 'inherit' }}
            />
          </div>

          <div className="form-group">
            <label>Types artistiques</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.5rem', marginTop: '.25rem' }}>
              {types.map(t => (
                <label
                  key={t.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '.35rem',
                    padding: '.3rem .7rem',
                    border: `1.5px solid ${selectedTypeIds.includes(t.id) ? 'var(--primary)' : 'var(--border)'}`,
                    borderRadius: '999px',
                    cursor: 'pointer',
                    fontSize: '.82rem',
                    background: selectedTypeIds.includes(t.id) ? 'var(--primary-light)' : 'transparent',
                    color: selectedTypeIds.includes(t.id) ? 'var(--primary)' : 'var(--text)',
                    userSelect: 'none',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={selectedTypeIds.includes(t.id)}
                    onChange={() => toggleType(t.id)}
                    style={{ display: 'none' }}
                  />
                  {t.name}
                </label>
              ))}
            </div>
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
