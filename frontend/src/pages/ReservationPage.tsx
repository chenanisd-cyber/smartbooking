import { useEffect, useState, FormEvent } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { representationApi, reservationApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import type { Representation, Price } from '../types/models'
import './ReservationPage.css'

// Labels lisibles pour les types de prix
const PRICE_LABELS: Record<string, string> = {
  STANDARD: 'Standard',
  VIP:      'VIP',
  REDUIT:   'Réduit',
  PREMIUM:  'Premium',
}

export default function ReservationPage() {
  const { repId } = useParams<{ repId: string }>()
  const { user }  = useAuth()
  const navigate  = useNavigate()

  const [rep, setRep]           = useState<Representation | null>(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)

  // Champs du formulaire
  const [selectedPrice, setSelectedPrice] = useState<Price | null>(null)
  const [quantity, setQuantity]           = useState(1)

  // Soumission
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Rediriger si pas connecté
  useEffect(() => {
    if (!user) navigate('/login')
  }, [user, navigate])

  // Charger la représentation
  useEffect(() => {
    if (!repId) return
    // On utilise l'API representations pour récupérer les détails
    fetch(`/api/representations/${repId}`, { credentials: 'include' })
      .then(r => {
        if (!r.ok) throw new Error('Représentation introuvable')
        return r.json() as Promise<Representation>
      })
      .then(data => {
        setRep(data)
        if (data.prices.length > 0) setSelectedPrice(data.prices[0])
      })
      .catch(() => setError('Représentation introuvable.'))
      .finally(() => setLoading(false))
  }, [repId])

  const formatDate = (dt: string) =>
    new Date(dt).toLocaleDateString('fr-BE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })

  const formatTime = (dt: string) =>
    new Date(dt).toLocaleTimeString('fr-BE', { hour: '2-digit', minute: '2-digit' })

  const total = selectedPrice ? (selectedPrice.amount * quantity).toFixed(2) : '0.00'

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedPrice || !repId) return
    setSubmitError(null)
    setSubmitting(true)
    try {
      await reservationApi.create({
        representationId: Number(repId),
        priceType:        selectedPrice.type,
        quantity,
      })
      navigate('/my-bookings')
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Erreur lors de la réservation')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div className="container"><div className="spinner" /></div>
  if (error || !rep) return (
    <div className="container">
      <div className="alert alert-error">{error || 'Représentation introuvable.'}</div>
      <Link to="/">← Retour au catalogue</Link>
    </div>
  )

  return (
    <div className="container">
      <Link to="/" className="back-link">← Retour au catalogue</Link>

      <div className="res-wrapper">
        {/* Informations sur la représentation */}
        <div className="res-info card">
          <h2 className="res-info-title">Détails de la séance</h2>

          <div className="res-info-row">
            <span className="res-info-label">Date</span>
            <span>{formatDate(rep.dateTime)} à {formatTime(rep.dateTime)}</span>
          </div>

          {rep.location && (
            <div className="res-info-row">
              <span className="res-info-label">Lieu</span>
              <span>
                {rep.location.name}
                {rep.location.locality && ` — ${rep.location.locality.name}`}
              </span>
            </div>
          )}

          <div className="res-info-row">
            <span className="res-info-label">Places restantes</span>
            <span style={{ color: 'var(--success)', fontWeight: 600 }}>{rep.availableSeats}</span>
          </div>

          {/* Grille des tarifs */}
          <div className="res-prices">
            {rep.prices.map(p => (
              <div
                key={p.id}
                className={`res-price-option ${selectedPrice?.id === p.id ? 'selected' : ''}`}
                onClick={() => setSelectedPrice(p)}
              >
                <span className="res-price-type">{PRICE_LABELS[p.type] ?? p.type}</span>
                <span className="res-price-amount">{p.amount} €</span>
              </div>
            ))}
          </div>
        </div>

        {/* Formulaire de réservation */}
        <div className="res-form-card card">
          <h2 className="res-info-title">Votre réservation</h2>

          {submitError && <div className="alert alert-error">{submitError}</div>}

          <form onSubmit={handleSubmit} className="res-form">
            <div className="form-group">
              <label htmlFor="quantity">Nombre de places</label>
              <input
                id="quantity"
                type="number"
                className="form-control"
                min={1}
                max={Math.min(10, rep.availableSeats)}
                value={quantity}
                onChange={e => setQuantity(Number(e.target.value))}
                required
              />
            </div>

            {/* Récapitulatif */}
            <div className="res-recap">
              <div className="res-recap-row">
                <span>Tarif</span>
                <span>{selectedPrice ? (PRICE_LABELS[selectedPrice.type] ?? selectedPrice.type) : '—'}</span>
              </div>
              <div className="res-recap-row">
                <span>Prix unitaire</span>
                <span>{selectedPrice ? `${selectedPrice.amount} €` : '—'}</span>
              </div>
              <div className="res-recap-row">
                <span>Quantité</span>
                <span>{quantity}</span>
              </div>
              <div className="res-recap-row res-recap-total">
                <span>Total</span>
                <span>{total} €</span>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-block"
              disabled={submitting || !selectedPrice}
            >
              {submitting ? 'Réservation en cours…' : 'Confirmer la réservation'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
