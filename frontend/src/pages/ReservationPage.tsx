import { useEffect, useState, FormEvent } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { paymentApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import type { Representation, Price } from '../types/models'
import './ReservationPage.css'

const PRICE_LABELS: Record<string, string> = {
  STANDARD: 'Standard',
  VIP:      'VIP',
  REDUIT:   'Réduit',
  PREMIUM:  'Premium',
}

// ── Stripe payment form (must be inside <Elements>) ─────────────────────────
function StripePaymentForm({
  reservationId,
  total,
  onSuccess,
  onError,
}: {
  reservationId: number
  total: string
  onSuccess: () => void
  onError: (msg: string) => void
}) {
  const stripe   = useStripe()
  const elements = useElements()
  const [paying, setPaying] = useState(false)

  const handlePay = async (e: FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return
    setPaying(true)

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    })

    if (error) {
      onError(error.message ?? 'Paiement refusé.')
      setPaying(false)
      return
    }

    if (paymentIntent?.status === 'succeeded') {
      try {
        await paymentApi.confirm(reservationId)
        onSuccess()
      } catch {
        onError('Paiement accepté mais confirmation échouée. Contactez le support.')
      }
    } else {
      onError('Statut de paiement inattendu.')
    }
    setPaying(false)
  }

  return (
    <form onSubmit={handlePay} className="res-form">
      <PaymentElement />
      <button
        type="submit"
        className="btn btn-primary btn-block"
        style={{ marginTop: '1.25rem' }}
        disabled={!stripe || paying}
      >
        {paying ? 'Paiement en cours…' : `Payer ${total} €`}
      </button>
    </form>
  )
}

// ── Main page ────────────────────────────────────────────────────────────────
export default function ReservationPage() {
  const { repId } = useParams<{ repId: string }>()
  const { user }  = useAuth()
  const navigate  = useNavigate()

  const [rep,     setRep]     = useState<Representation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState<string | null>(null)

  // Step 1: select
  const [selectedPrice, setSelectedPrice] = useState<Price | null>(null)
  const [quantity,      setQuantity]      = useState(1)
  const [submitting,    setSubmitting]    = useState(false)
  const [submitError,   setSubmitError]   = useState<string | null>(null)

  // Step 2: payment
  const [step,            setStep]            = useState<'select' | 'payment'>('select')
  const [clientSecret,    setClientSecret]    = useState<string | null>(null)
  const [reservationId,   setReservationId]   = useState<number | null>(null)
  const [stripePromise,   setStripePromise]   = useState<ReturnType<typeof loadStripe> | null>(null)

  useEffect(() => { if (!user) navigate('/login') }, [user, navigate])

  // Load Stripe publishable key + representation
  useEffect(() => {
    if (!repId) return

    Promise.all([
      fetch(`/api/representations/${repId}`, { credentials: 'include' })
        .then(r => { if (!r.ok) throw new Error(); return r.json() as Promise<Representation> }),
      paymentApi.getConfig(),
    ])
      .then(([repData, config]) => {
        setRep(repData)
        if (repData.prices.length > 0) setSelectedPrice(repData.prices[0])
        setStripePromise(loadStripe(config.publishableKey))
      })
      .catch(() => setError('Impossible de charger la page de réservation.'))
      .finally(() => setLoading(false))
  }, [repId])

  const formatDate = (dt: string) =>
    new Date(dt).toLocaleDateString('fr-BE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })

  const formatTime = (dt: string) =>
    new Date(dt).toLocaleTimeString('fr-BE', { hour: '2-digit', minute: '2-digit' })

  const total = selectedPrice ? (Number(selectedPrice.amount) * quantity).toFixed(2) : '0.00'

  // Step 1 submit → create PaymentIntent
  const handleProceed = async (e: FormEvent) => {
    e.preventDefault()
    if (!selectedPrice || !repId) return
    setSubmitError(null)
    setSubmitting(true)
    try {
      const { clientSecret: secret, reservationId: resId } = await paymentApi.createIntent({
        representationId: Number(repId),
        priceType:        selectedPrice.type,
        quantity,
      })
      setClientSecret(secret)
      setReservationId(resId)
      setStep('payment')
    } catch (err: unknown) {
      setSubmitError(err instanceof Error ? err.message : 'Erreur lors de l\'initialisation du paiement')
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

          <div className="res-prices">
            {rep.prices.map(p => (
              <div
                key={p.id}
                className={`res-price-option ${selectedPrice?.id === p.id ? 'selected' : ''} ${step === 'payment' ? 'disabled' : ''}`}
                onClick={() => step === 'select' && setSelectedPrice(p)}
              >
                <span className="res-price-type">{PRICE_LABELS[p.type] ?? p.type}</span>
                <span className="res-price-amount">{p.amount} €</span>
              </div>
            ))}
          </div>
        </div>

        {/* Formulaire */}
        <div className="res-form-card card">
          {step === 'select' ? (
            <>
              <h2 className="res-info-title">Votre réservation</h2>
              {submitError && <div className="alert alert-error">{submitError}</div>}

              <form onSubmit={handleProceed} className="res-form">
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
                  {submitting ? 'Chargement…' : `Procéder au paiement — ${total} €`}
                </button>
              </form>
            </>
          ) : (
            <>
              <h2 className="res-info-title">Paiement sécurisé</h2>
              <p className="res-stripe-info">
                Total : <strong>{total} €</strong> — {PRICE_LABELS[selectedPrice?.type ?? ''] ?? ''} × {quantity}
              </p>
              <p className="res-test-card">
                Test : carte <code>4242 4242 4242 4242</code>, date future, CVC quelconque
              </p>

              {clientSecret && stripePromise && (
                <Elements stripe={stripePromise} options={{ clientSecret }}>
                  <StripePaymentForm
                    reservationId={reservationId!}
                    total={total}
                    onSuccess={() => navigate('/my-bookings')}
                    onError={msg => setSubmitError(msg)}
                  />
                </Elements>
              )}
              {submitError && <div className="alert alert-error" style={{ marginTop: '1rem' }}>{submitError}</div>}

              <button
                className="btn btn-secondary btn-block"
                style={{ marginTop: '.75rem' }}
                onClick={() => { setStep('select'); setSubmitError(null) }}
              >
                ← Modifier ma sélection
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
