import { useState, FormEvent } from 'react'
import { showApi } from '../../services/api'
import type { Show, Artist } from '../../types/models'
import './Modal.css'

interface Props {
  show: Show | null       // null = création, sinon édition
  artists: Artist[]
  onClose: () => void
  onSaved: () => void
}

export default function ShowFormModal({ show, artists, onClose, onSaved }: Props) {
  const [title, setTitle]       = useState(show?.title ?? '')
  const [description, setDesc]  = useState(show?.description ?? '')
  const [artistId, setArtistId] = useState<string>(show?.artist?.id?.toString() ?? '')
  const [imageFile, setImage]   = useState<File | null>(null)
  const [error, setError]       = useState<string | null>(null)
  const [saving, setSaving]     = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)

    try {
      // On utilise FormData car il y a un fichier possible
      const fd = new FormData()
      fd.append('title', title)
      fd.append('description', description)
      if (artistId) fd.append('artistId', artistId)
      if (imageFile) fd.append('image', imageFile)

      if (show) {
        await showApi.update(show.id, fd)
      } else {
        await showApi.create(fd)
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
          <h2 className="modal-title">{show ? 'Modifier le spectacle' : 'Nouveau spectacle'}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {error && <div className="alert alert-error" style={{marginBottom:'1rem'}}>{error}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="title">Titre *</label>
            <input
              id="title"
              type="text"
              className="form-control"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              className="form-control"
              rows={3}
              value={description}
              onChange={e => setDesc(e.target.value)}
              style={{ resize: 'vertical', fontFamily: 'inherit' }}
            />
          </div>

          <div className="form-group">
            <label htmlFor="artistId">Artiste</label>
            <select
              id="artistId"
              className="form-control"
              value={artistId}
              onChange={e => setArtistId(e.target.value)}
            >
              <option value="">— Aucun —</option>
              {artists.map(a => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="image">Image {show?.imagePath && '(laisser vide pour conserver)'}</label>
            {show?.imagePath && (
              <img
                src={`/images/${show.imagePath}`}
                alt="actuelle"
                style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 6, marginBottom: '.5rem', display: 'block' }}
              />
            )}
            <input
              id="image"
              type="file"
              accept="image/*"
              className="form-control"
              onChange={e => setImage(e.target.files?.[0] ?? null)}
            />
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
