import { useEffect, useState, FormEvent } from 'react'
import { useParams, Link } from 'react-router-dom'
import { showApi, reviewApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import type { Show, Review } from '../types/models'
import StarRating from '../components/ui/StarRating'
import StarRatingInput from '../components/ui/StarRatingInput'
import './ShowDetailPage.css'

export default function ShowDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { user, isMember, isPress } = useAuth()

  const [show, setShow] = useState<Show | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Press review form
  const [pressComment,    setPressComment]    = useState('')
  const [pressStars,      setPressStars]      = useState(5)
  const [pressUrl,        setPressUrl]        = useState('')
  const [pressSubmitting, setPressSubmitting] = useState(false)
  const [pressError,      setPressError]      = useState<string | null>(null)
  const [pressSuccess,    setPressSuccess]    = useState<string | null>(null)
  const [showPressForm,   setShowPressForm]   = useState(false)

  useEffect(() => {
    if (!slug) return
    showApi.getBySlug(slug)
      .then(s => reviewApi.getByShow(s.id).then(reviews => {
        setShow(s)
        setReviews(reviews)
      }))
      .catch(() => setError('Spectacle introuvable.'))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) return <div className="container"><div className="spinner" /></div>
  if (error || !show) return (
    <div className="container">
      <div className="alert alert-error">{error || 'Spectacle introuvable.'}</div>
      <Link to="/">← Retour au catalogue</Link>
    </div>
  )

  const formatDate = (dt: string) =>
    new Date(dt).toLocaleDateString('fr-BE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })

  const formatTime = (dt: string) =>
    new Date(dt).toLocaleTimeString('fr-BE', { hour: '2-digit', minute: '2-digit' })

  const memberReviews = reviews.filter(r => r.reviewType === 'MEMBER_REVIEW')
  const pressReviews  = reviews.filter(r => r.reviewType === 'PRESS_REVIEW')
  const alreadyReviewed = reviews.some(r => r.userLogin === user?.login)

  const avgStars = memberReviews.length
    ? (memberReviews.reduce((s, r) => s + r.stars, 0) / memberReviews.length).toFixed(1)
    : null

  const handlePressSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!show) return
    setPressError(null)
    setPressSubmitting(true)
    try {
      await reviewApi.create({ showId: show.id, comment: pressComment, stars: pressStars, articleUrl: pressUrl || undefined })
      setPressSuccess('Critique envoyée ! Elle sera visible après validation par l\'admin.')
      setShowPressForm(false)
      setPressComment(''); setPressUrl(''); setPressStars(5)
    } catch (err: unknown) {
      setPressError(err instanceof Error ? err.message : 'Erreur lors de l\'envoi')
    } finally {
      setPressSubmitting(false)
    }
  }

  return (
    <div className="container">
      <Link to="/" className="back-link">← Retour au catalogue</Link>

      {/* Show header */}
      <div className="show-detail-header">
        <div className="show-detail-img">
          {show.imagePath
            ? <img src={`/images/${show.imagePath}`} alt={show.title} />
            : <div className="show-detail-placeholder">🎭</div>
          }
        </div>

        <div className="show-detail-info">
          <h1 className="show-detail-title">{show.title}</h1>

          {show.artist && (
            <p className="show-detail-artist">
              <span className="badge badge-blue">{show.artist.name}</span>
              {show.artist.types && show.artist.types.map(t => (
                <span key={t} className="badge badge-grey" style={{ marginLeft: '.4rem' }}>{t}</span>
              ))}
            </p>
          )}

          {show.collaborators && show.collaborators.length > 0 && (
            <p className="show-detail-artist">
              <span style={{ fontSize: '.8rem', color: 'var(--muted)', marginRight: '.4rem' }}>
                Avec :
              </span>
              {show.collaborators.map(c => (
                <span key={c.id} className="badge badge-grey" style={{ marginRight: '.3rem' }}>{c.name}</span>
              ))}
            </p>
          )}

          {avgStars && (
            <p className="show-detail-rating">
              <StarRating stars={Math.round(Number(avgStars))} />
              <span style={{ marginLeft: '.5rem', color: 'var(--muted)', fontSize: '.85rem' }}>
                {avgStars}/5 ({reviews.length} avis)
              </span>
            </p>
          )}

          {show.description && (
            <p className="show-detail-desc">{show.description}</p>
          )}
        </div>
      </div>

      {/* Representations */}
      <section className="show-section">
        <h2 className="show-section-title">Dates & Réservations</h2>

        {show.representations.length === 0 ? (
          <p style={{ color: 'var(--muted)' }}>Aucune date programmée pour le moment.</p>
        ) : (
          <div className="rep-list">
            {show.representations
              .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
              .map(rep => (
                <div key={rep.id} className="rep-card card">
                  <div className="rep-info">
                    <p className="rep-date">{formatDate(rep.dateTime)} à {formatTime(rep.dateTime)}</p>
                    {rep.location && (
                      <p className="rep-location">
                        📍 {rep.location.name}
                        {rep.location.locality && ` — ${rep.location.locality.name}`}
                      </p>
                    )}
                    <p className="rep-seats">
                      {rep.availableSeats > 0
                        ? <span style={{ color: 'var(--success)' }}>✓ {rep.availableSeats} places disponibles</span>
                        : <span style={{ color: 'var(--danger)' }}>Complet</span>
                      }
                    </p>
                  </div>

                  <div className="rep-prices">
                    {rep.prices.map(p => (
                      <span key={p.id} className="price-tag">
                        {p.type} — <strong>{p.amount} €</strong>
                      </span>
                    ))}
                  </div>

                  {isMember && rep.availableSeats > 0 && (
                    <Link to={`/reservation/${rep.id}`} className="btn btn-primary btn-sm">
                      Réserver
                    </Link>
                  )}
                  {!isMember && (
                    <Link to="/login" className="btn btn-outline btn-sm">
                      Connexion pour réserver
                    </Link>
                  )}
                </div>
              ))}
          </div>
        )}
      </section>

      {/* Press reviews */}
      {(pressReviews.length > 0 || isPress) && (
        <section className="show-section">
          <h2 className="show-section-title">
            Critiques de presse
            {pressReviews.length > 0 && (
              <span className="badge badge-blue" style={{ marginLeft: '.75rem' }}>{pressReviews.length}</span>
            )}
          </h2>

          {pressReviews.length === 0 && (
            <p style={{ color: 'var(--muted)' }}>Aucune critique de presse pour ce spectacle.</p>
          )}

          <div className="reviews-list">
            {pressReviews.map(r => (
              <div key={r.id} className="review-card review-card--press card">
                <div className="review-header">
                  <span className="press-badge">✍️ Critique de presse</span>
                  <span className="review-user">{r.userLogin}</span>
                  <StarRating stars={r.stars} />
                  <span className="review-date">{new Date(r.createdAt).toLocaleDateString('fr-BE')}</span>
                </div>
                <p className="review-comment">{r.comment}</p>
                {r.articleUrl && (
                  <a className="press-article-link" href={r.articleUrl} target="_blank" rel="noopener noreferrer">
                    Lire l'article complet →
                  </a>
                )}
              </div>
            ))}
          </div>

          {/* Press review form */}
          {isPress && !alreadyReviewed && (
            <div style={{ marginTop: '1rem' }}>
              {pressSuccess && <div className="alert alert-success">{pressSuccess}</div>}
              {!showPressForm ? (
                <button className="btn btn-outline btn-sm" onClick={() => setShowPressForm(true)}>
                  ✍️ Soumettre une critique de presse
                </button>
              ) : (
                <form onSubmit={handlePressSubmit} className="press-form card">
                  <h3 style={{ marginBottom: '.75rem', fontSize: '1rem' }}>Votre critique</h3>
                  {pressError && <div className="alert alert-error">{pressError}</div>}
                  <div className="review-form-stars" style={{ marginBottom: '.75rem' }}>
                    <span style={{ fontSize: '.88rem', color: 'var(--muted)' }}>Note :</span>
                    <StarRatingInput value={pressStars} onChange={setPressStars} />
                  </div>
                  <textarea
                    className="form-control"
                    placeholder="Votre critique…"
                    value={pressComment}
                    onChange={e => setPressComment(e.target.value)}
                    rows={4}
                    required
                    style={{ marginBottom: '.75rem' }}
                  />
                  <input
                    className="form-control"
                    type="url"
                    placeholder="URL de l'article (optionnel)"
                    value={pressUrl}
                    onChange={e => setPressUrl(e.target.value)}
                    style={{ marginBottom: '.75rem' }}
                  />
                  <div className="review-form-actions">
                    <button className="btn btn-primary btn-sm" type="submit" disabled={pressSubmitting || !pressComment.trim()}>
                      {pressSubmitting ? 'Envoi…' : 'Envoyer la critique'}
                    </button>
                    <button className="btn btn-outline btn-sm" type="button" onClick={() => setShowPressForm(false)}>
                      Annuler
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </section>
      )}

      {/* Member reviews */}
      <section className="show-section">
        <h2 className="show-section-title">
          Avis des spectateurs
          {memberReviews.length > 0 && (
            <span className="badge badge-blue" style={{ marginLeft: '.75rem' }}>{memberReviews.length}</span>
          )}
        </h2>

        {memberReviews.length === 0 ? (
          <p style={{ color: 'var(--muted)' }}>Aucun avis pour ce spectacle.</p>
        ) : (
          <div className="reviews-list">
            {memberReviews.map(r => (
              <div key={r.id} className="review-card card">
                <div className="review-header">
                  <span className="review-user">👤 {r.userLogin}</span>
                  <StarRating stars={r.stars} />
                  <span className="review-date">
                    {new Date(r.createdAt).toLocaleDateString('fr-BE')}
                  </span>
                </div>
                <p className="review-comment">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
