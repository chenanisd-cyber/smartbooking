import { useEffect, useState } from 'react'
import { showApi, artistApi, locationApi, representationApi } from '../../services/api'
import type { Show, Artist, Location } from '../../types/models'
import ShowFormModal from './ShowFormModal'
import RepresentationFormModal from './RepresentationFormModal'

export default function AdminShows() {
  const [shows, setShows]         = useState<Show[]>([])
  const [artists, setArtists]     = useState<Artist[]>([])
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState<string | null>(null)

  // Modal spectacle : null = fermé, 'create' = nouveau, Show = édition
  const [showModal, setShowModal] = useState<null | 'create' | Show>(null)

  // Modal représentation : id du spectacle concerné
  const [repModal, setRepModal]   = useState<number | null>(null)

  // Panneau déroulant des dates par spectacle
  const [expanded, setExpanded]   = useState<number | null>(null)

  // Artiste sélectionné pour ajout de collaborateur (par show id)
  const [collabSelect, setCollabSelect] = useState<Record<number, string>>({})

  const load = () => {
    Promise.all([showApi.getAllAdmin(), artistApi.getAll(), locationApi.getAll()])
      .then(([s, a, l]) => { setShows(s); setArtists(a); setLocations(l) })
      .catch(() => setError('Erreur de chargement'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleConfirm = async (id: number) => { await showApi.confirm(id); load() }
  const handleRevoke  = async (id: number) => { await showApi.revoke(id);  load() }

  const handleDeleteShow = async (id: number, title: string) => {
    if (!confirm(`Supprimer "${title}" ?`)) return
    await showApi.delete(id)
    load()
  }

  const handleDeleteRep = async (repId: number) => {
    if (!confirm('Supprimer cette représentation ?')) return
    await representationApi.delete(repId)
    load()
  }

  const handleAddCollaborator = async (showId: number) => {
    const artistId = collabSelect[showId]
    if (!artistId) return
    await showApi.addCollaborator(showId, Number(artistId))
    setCollabSelect(prev => ({ ...prev, [showId]: '' }))
    load()
  }

  const handleRemoveCollaborator = async (showId: number, artistId: number) => {
    await showApi.removeCollaborator(showId, artistId)
    load()
  }

  const formatDate = (dt: string) =>
    new Date(dt).toLocaleDateString('fr-BE', { day: '2-digit', month: 'short', year: 'numeric' }) +
    ' ' + new Date(dt).toLocaleTimeString('fr-BE', { hour: '2-digit', minute: '2-digit' })

  if (loading) return <div className="spinner" />
  if (error)   return <div className="alert alert-error">{error}</div>

  return (
    <div>
      <div className="admin-section-title">
        Spectacles
        <button className="btn btn-primary btn-sm" onClick={() => setShowModal('create')}>
          + Nouveau spectacle
        </button>
      </div>

      {shows.length === 0 ? (
        <p style={{ color: 'var(--muted)' }}>Aucun spectacle.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
          {shows.map(s => (
            <div key={s.id} className="card">
              {/* Ligne principale */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '.85rem 1rem', flexWrap: 'wrap' }}>
                <div style={{ flex: 1, minWidth: 160 }}>
                  <strong>{s.title}</strong>
                  {s.artist && <span style={{ color: 'var(--muted)', fontSize: '.82rem', marginLeft: '.5rem' }}>{s.artist.name}</span>}
                </div>
                <span className={`badge ${s.isConfirmed ? 'badge-green' : 'badge-grey'}`}>
                  {s.isConfirmed ? 'Confirmé' : 'Non confirmé'}
                </span>
                <div className="admin-actions">
                  <button className="btn btn-outline btn-sm" onClick={() => setExpanded(expanded === s.id ? null : s.id)}>
                    📅 {s.representations.length} date{s.representations.length !== 1 ? 's' : ''}
                  </button>
                  <button className="btn btn-outline btn-sm" onClick={() => setShowModal(s)}>Modifier</button>
                  {s.isConfirmed
                    ? <button className="btn btn-outline btn-sm" onClick={() => handleRevoke(s.id)}>Révoquer</button>
                    : <button className="btn btn-primary btn-sm" onClick={() => handleConfirm(s.id)}>Confirmer</button>
                  }
                  <button className="btn btn-danger btn-sm" onClick={() => handleDeleteShow(s.id, s.title)}>Supprimer</button>
                </div>
              </div>

              {/* Panneau déroulant */}
              {expanded === s.id && (
                <div style={{ borderTop: '1px solid var(--border)', background: 'var(--surface)' }}>

                  {/* Représentations */}
                  <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.75rem' }}>
                      <span style={{ fontSize: '.85rem', fontWeight: 600, color: 'var(--muted)' }}>Représentations</span>
                      <button className="btn btn-primary btn-sm" onClick={() => setRepModal(s.id)}>
                        + Ajouter une date
                      </button>
                    </div>

                    {s.representations.length === 0 ? (
                      <p style={{ color: 'var(--muted)', fontSize: '.85rem' }}>Aucune date programmée.</p>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '.4rem' }}>
                        {s.representations
                          .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
                          .map(rep => (
                            <div key={rep.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', fontSize: '.85rem', flexWrap: 'wrap' }}>
                              <span>📅 {formatDate(rep.dateTime)}</span>
                              {rep.location && <span style={{ color: 'var(--muted)' }}>📍 {rep.location.name}</span>}
                              <span style={{ color: 'var(--success)' }}>{rep.availableSeats} places</span>
                              <span style={{ color: 'var(--muted)' }}>
                                {rep.prices.map(p => `${p.type} ${p.amount}€`).join(' · ')}
                              </span>
                              <button className="btn btn-danger btn-sm" onClick={() => handleDeleteRep(rep.id)}>✕</button>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>

                  {/* Collaborateurs */}
                  <div style={{ padding: '1rem' }}>
                    <span style={{ fontSize: '.85rem', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: '.6rem' }}>
                      Artistes collaborateurs
                    </span>

                    {/* Liste actuelle */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '.4rem', marginBottom: '.75rem' }}>
                      {s.collaborators && s.collaborators.length > 0 ? s.collaborators.map(c => (
                        <span key={c.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '.3rem',
                          background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '999px',
                          padding: '.2rem .6rem', fontSize: '.8rem' }}>
                          {c.name}
                          <button onClick={() => handleRemoveCollaborator(s.id, c.id)}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--danger)',
                              lineHeight: 1, padding: '0 .1rem', fontSize: '.85rem' }}>✕</button>
                        </span>
                      )) : (
                        <span style={{ color: 'var(--muted)', fontSize: '.82rem' }}>Aucun collaborateur.</span>
                      )}
                    </div>

                    {/* Ajout */}
                    <div style={{ display: 'flex', gap: '.5rem', alignItems: 'center' }}>
                      <select
                        className="form-control"
                        style={{ flex: 1, fontSize: '.85rem', padding: '.3rem .5rem' }}
                        value={collabSelect[s.id] ?? ''}
                        onChange={e => setCollabSelect(prev => ({ ...prev, [s.id]: e.target.value }))}
                      >
                        <option value="">— Choisir un artiste —</option>
                        {artists
                          .filter(a => a.id !== s.artist?.id && !s.collaborators?.some(c => c.id === a.id))
                          .map(a => <option key={a.id} value={a.id}>{a.name}</option>)
                        }
                      </select>
                      <button className="btn btn-outline btn-sm"
                        disabled={!collabSelect[s.id]}
                        onClick={() => handleAddCollaborator(s.id)}>
                        + Ajouter
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal spectacle */}
      {showModal !== null && (
        <ShowFormModal
          show={showModal === 'create' ? null : showModal}
          artists={artists}
          onClose={() => setShowModal(null)}
          onSaved={() => { setShowModal(null); load() }}
        />
      )}

      {/* Modal représentation */}
      {repModal !== null && (
        <RepresentationFormModal
          showId={repModal}
          locations={locations}
          onClose={() => setRepModal(null)}
          onSaved={() => { setRepModal(null); load() }}
        />
      )}
    </div>
  )
}
