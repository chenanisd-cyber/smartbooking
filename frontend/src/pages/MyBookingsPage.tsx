import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { reservationApi, reviewApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import type { Reservation, ReservationLine } from '../types/models'
import StarRatingInput from '../components/ui/StarRatingInput'
import './MyBookingsPage.css'

export default function MyBookingsPage() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState<string | null>(null)
  const [cancellingId, setCancellingId] = useState<number | null>(null)

  // Formulaire d'avis inline par ligne (clé = `${reservationId}-${lineId}`)
  const [reviewForKey, setReviewForKey] = useState<string | null>(null)
  const [stars, setStars]               = useState(5)
  const [comment, setComment]           = useState('')
  const [reviewError, setReviewError]   = useState<string | null>(null)
  const [reviewSuccess, setReviewSuccess] = useState<string | null>(null)
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) navigate('/login')
  }, [user, authLoading, navigate])

  const loadReservations = () => {
    reservationApi.myBookings()
      .then(setReservations)
      .catch(() => setError('Impossible de charger vos réservations.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadReservations()
  }, [])

  const formatDate = (dt: string) =>
    new Date(dt).toLocaleDateString('fr-BE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })

  const formatTime = (dt: string) =>
    new Date(dt).toLocaleTimeString('fr-BE', { hour: '2-digit', minute: '2-digit' })

  // Une réservation est annulable si elle est CONFIRMED ou PENDING
  // ET qu'aucune de ses lignes ne concerne une représentation passée
  const isReservationCancellable = (r: Reservation): boolean => {
    if (r.status === 'CANCELLED') return false
    const now = new Date()
    return r.lines.every(line => new Date(line.dateTime) > now)
  }

  // Une ligne est "passée" si sa date est dépassée
  const isLinePast = (line: ReservationLine): boolean =>
    new Date(line.dateTime) < new Date()

  const handleCancel = async (reservationId: number) => {
    if (!confirm(`Annuler cette réservation ?\n\nToutes les places seront remises en vente et la réservation sera marquée comme annulée. Cette action est irréversible.`)) {
      return
    }
    setCancellingId(reservationId)
    try {
      await reservationApi.cancel(reservationId)
      loadReservations()
    } catch (err: unknown) {
      alert('Erreur : ' + (err instanceof Error ? err.message : 'inconnue'))
    } finally {
      setCancellingId(null)
    }
  }

  const handleReviewSubmit = async (showId: number) => {
    setReviewError(null)
    setReviewSuccess(null)
    setSubmittingReview(true)
    try {
      await reviewApi.create({ showId, stars, comment })
      setReviewSuccess('Avis envoyé ! Il sera visible après validation.')
      setReviewForKey(null)
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
          {reservations.map(r => {
            const cancellable = isReservationCancellable(r)
            const orderDate = formatDate(r.createdAt)

            return (
              <div key={r.id} className="booking-card card">
                {/* En-tête de la commande (panier) */}
                <div className="booking-header">
                  <div className="booking-main">
                    <h3 style={{ margin: 0, fontSize: '1.05rem' }}>
                      Commande #{r.id}
                      <span style={{ fontWeight: 400, color: 'var(--muted)', fontSize: '.85rem', marginLeft: '.5rem' }}>
                        — du {orderDate}
                      </span>
                    </h3>
                    <p style={{ margin: '.25rem 0 0 0', color: 'var(--muted)', fontSize: '.88rem' }}>
                      {r.lines.length} {r.lines.length > 1 ? 'lignes' : 'ligne'} • Total : <strong>{r.totalAmount.toFixed(2)} €</strong>
                    </p>
                  </div>

                  <div className="booking-meta">
                    <span className={`badge ${
                      r.status === 'CONFIRMED' ? 'badge-green' :
                      r.status === 'PENDING'   ? 'badge-grey'  :
                                                  'badge-red'
                    }`}>
                      {r.status === 'CONFIRMED' ? 'Confirmée' :
                       r.status === 'PENDING'   ? 'En attente' :
                                                   'Annulée'}
                    </span>
                  </div>
                </div>

                {/* Lignes du panier */}
                <div style={{ marginTop: '.75rem', borderTop: '1px solid var(--border, #e5e5e5)', paddingTop: '.75rem' }}>
                  {r.lines.map(line => {
                    const past = isLinePast(line)
                    const reviewKey = `${r.id}-${line.id}`

                    return (
                      <div key={line.id} style={{ marginBottom: '1rem', paddingBottom: '.75rem', borderBottom: '1px dashed var(--border, #e5e5e5)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '.5rem' }}>
                          <div style={{ flex: '1 1 auto' }}>
                            <Link to={`/shows/${line.showSlug}`} className="booking-show-title">
                              {line.showTitle}
                            </Link>
                            <p className="booking-date" style={{ margin: '.15rem 0' }}>
                              {formatDate(line.dateTime)} à {formatTime(line.dateTime)}
                            </p>
                            {line.locationName && (
                              <p className="booking-location" style={{ margin: 0 }}>📍 {line.locationName}</p>
                            )}
                          </div>
                          <div style={{ textAlign: 'right', minWidth: '140px' }}>
                            <div style={{ fontSize: '.88rem', color: 'var(--muted)' }}>
                              🎫 {line.quantity} × {line.priceType}
                            </div>
                            <div style={{ fontSize: '.88rem', color: 'var(--muted)' }}>
                              {line.unitPrice.toFixed(2)} € / place
                            </div>
                            <div style={{ fontWeight: 600 }}>
                              {line.lineTotal.toFixed(2)} €
                            </div>
                          </div>
                        </div>

                        {/* Formulaire d'avis — par ligne, visible si séance passée et réservation confirmée */}
                        {r.status === 'CONFIRMED' && past && (
                          <div className="booking-review" style={{ marginTop: '.5rem' }}>
                            {reviewForKey === reviewKey ? (
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
                                    onClick={() => handleReviewSubmit(line.showId)}
                                    disabled={submittingReview || !comment.trim()}
                                  >
                                    {submittingReview ? 'Envoi…' : 'Envoyer l\'avis'}
                                  </button>
                                  <button
                                    className="btn btn-outline btn-sm"
                                    onClick={() => { setReviewForKey(null); setReviewError(null) }}
                                  >
                                    Annuler
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                className="btn btn-outline btn-sm"
                                onClick={() => { setReviewForKey(reviewKey); setReviewSuccess(null); setComment(''); setStars(5) }}
                              >
                                ✍️ Laisser un avis sur ce spectacle
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Bouton annuler la commande entière */}
                {cancellable && (
                  <div className="booking-actions" style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap', marginTop: '.5rem' }}>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleCancel(r.id)}
                      disabled={cancellingId === r.id}
                    >
                      {cancellingId === r.id ? 'Annulation…' : '✕ Annuler cette commande'}
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}