import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { reservationApi, reviewApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import type { Reservation } from '../types/models'
import StarRatingInput from '../components/ui/StarRatingInput'
import './MyBookingsPage.css'

export default function MyBookingsPage() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState<string | null>(null)

  // Formulaire d'avis inline par réservation
  const [reviewFor, setReviewFor]   = useState<number | null>(null) // reservation id
  const [stars, setStars]           = useState(5)
  const [comment, setComment]       = useState('')
  const [reviewError, setReviewError] = useState<string | null>(null)
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null)
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) navigate('/login')
  }, [user, authLoading, navigate])

  useEffect(() => {
    reservationApi.myBookings()
      .then(setReservations)
      .catch(() => setError('Impossible de charger vos réservations.'))
      .finally(() => setLoading(false))
  }, [])

  const formatDate = (dt: string) =>
    new Date(dt).toLocaleDateString('fr-BE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })

  const formatTime = (dt: string) =>
    new Date(dt).toLocaleTimeString('fr-BE', { hour: '2-digit', minute: '2-digit' })

  const handleReviewSubmit = async (showSlug: string, showId: number, reservationId: number) => {
    setReviewError(null)
    setReviewSuccess(null)
    setSubmittingReview(true)
    try {
      await reviewApi.create({ showId, stars, comment })
      setReviewSuccess('Avis envoyé ! Il sera visible après validation.')
      setReviewFor(null)
      void reservationId // utilisé pour identifier quelle carte est ouverte
      setComment('')
      setStars(5)
    } catch (err: unknown) {
      setReviewError(err instanceof Error ? err.message : 'Erreur lors de l\'envoi')
    } finally {
      setSubmittingReview(false)
    }
  }

  if (loading || authLoading) return <div className="container"><div className="spinner" /></div>
  if (error) return (
    <div className="container">
      <div className="alert alert-error">{error}</div>
    </div>
  )

  return (
    <div className="container">
      <h1 className="bookings-title">Mes réservations</h1>

      {reservations.length === 0 ? (
        <div className="bookings-empty">
          <span>🎟️</span>
          <p>Vous n'avez pas encore de réservation.</p>
          <Link to="/" className="btn btn-primary">Voir le catalogue</Link>
        </div>
      ) : (
        <div className="bookings-list">
          {reservations.map(r => (
            <div key={r.id} className="booking-card card">
              <div className="booking-header">
                <div className="booking-main">
                  <Link to={`/shows/${r.showSlug}`} className="booking-show-title">
                    {r.showTitle}
                  </Link>
                  <p className="booking-date">
                    {formatDate(r.dateTime)} à {formatTime(r.dateTime)}
                  </p>
                  {r.locationName && (
                    <p className="booking-location">📍 {r.locationName}</p>
                  )}
                </div>

                <div className="booking-meta">
                  <span className={`badge ${r.status === 'CONFIRMED' ? 'badge-green' : 'badge-red'}`}>
                    {r.status === 'CONFIRMED' ? 'Confirmée' : 'Annulée'}
                  </span>
                </div>
              </div>

              <div className="booking-details">
                <span className="booking-detail-item">
                  🎫 {r.quantity} × {r.priceType}
                </span>
                <span className="booking-detail-item booking-total">
                  Total : <strong>{r.totalAmount.toFixed(2)} €</strong>
                </span>
              </div>

              {/* Formulaire d'avis — visible uniquement si séance passée */}
              {r.status === 'CONFIRMED' && new Date(r.dateTime) < new Date() && (
                <div className="booking-review">
                  {reviewFor === r.id ? (
                    <div className="review-form">
                      {reviewError   && <div className="alert alert-error" style={{marginBottom:'.75rem'}}>{reviewError}</div>}
                      {reviewSuccess && <div className="alert alert-success" style={{marginBottom:'.75rem'}}>{reviewSuccess}</div>}
                      <div className="review-form-stars">
                        <span style={{fontSize:'.88rem', color:'var(--muted)'}}>Note :</span>
                        <StarRatingInput value={stars} onChange={setStars} />
                      </div>
                      <textarea
                        className="form-control review-textarea"
                        placeholder="Votre commentaire…"
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        rows={3}
                        required
                      />
                      <div className="review-form-actions">
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={() => handleReviewSubmit(r.showSlug, r.showId, r.id)}
                          disabled={submittingReview || !comment.trim()}
                        >
                          {submittingReview ? 'Envoi…' : 'Envoyer l\'avis'}
                        </button>
                        <button
                          className="btn btn-outline btn-sm"
                          onClick={() => { setReviewFor(null); setReviewError(null) }}
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={() => { setReviewFor(r.id); setReviewSuccess(null) }}
                    >
                      ✍️ Laisser un avis
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
