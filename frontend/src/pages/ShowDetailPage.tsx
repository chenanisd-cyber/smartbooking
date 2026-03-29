import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { showApi, reviewApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import type { Show, Review } from '../types/models'
import StarRating from '../components/ui/StarRating'
import './ShowDetailPage.css'

export default function ShowDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { isMember } = useAuth()

  const [show, setShow] = useState<Show | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  const avgStars = reviews.length
    ? (reviews.reduce((s, r) => s + r.stars, 0) / reviews.length).toFixed(1)
    : null

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

      {/* Reviews */}
      <section className="show-section">
        <h2 className="show-section-title">
          Avis des spectateurs
          {reviews.length > 0 && <span className="badge badge-blue" style={{ marginLeft: '.75rem' }}>{reviews.length}</span>}
        </h2>

        {reviews.length === 0 ? (
          <p style={{ color: 'var(--muted)' }}>Aucun avis pour ce spectacle.</p>
        ) : (
          <div className="reviews-list">
            {reviews.map(r => (
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
