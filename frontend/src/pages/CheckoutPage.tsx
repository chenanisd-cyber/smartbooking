import { useEffect, useState, FormEvent } from 'react'
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { paymentApi } from '../services/api'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

interface CheckoutState {
  clientSecret: string
  totalAmount: number
}

function StripePaymentForm({
  reservationId,
  total,
  onSuccess,
  onError,
}: {
  reservationId: number
  total: number
  onSuccess: () => void
  onError: (msg: string) => void
}) {
  const stripe = useStripe()
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
        setPaying(false)
      }
    } else {
      onError('Statut de paiement inattendu.')
      setPaying(false)
    }
  }

  return (
    <form onSubmit={handlePay}>
      <PaymentElement />
      <button
        type="submit"
        className="btn btn-primary btn-block"
        style={{ marginTop: '1.25rem' }}
        disabled={!stripe || paying}
      >
        {paying ? 'Paiement en cours…' : `Payer ${total.toFixed(2)} €`}
      </button>
    </form>
  )
}

export default function CheckoutPage() {
  const { reservationId } = useParams<{ reservationId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuth()
  const { clear } = useCart()

  const state = location.state as CheckoutState | null

  const [stripePromise, setStripePromise] = useState<ReturnType<typeof loadStripe> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    if (!state?.clientSecret || !reservationId) {
      setError('Session de paiement invalide. Veuillez recommencer depuis votre panier.')
      setLoading(false)
      return
    }
    paymentApi.getConfig()
      .then(config => {
        setStripePromise(loadStripe(config.publishableKey))
      })
      .catch(() => setError('Impossible de charger Stripe.'))
      .finally(() => setLoading(false))
  }, [user, state, reservationId, navigate])

  if (loading) return <div className="container"><div className="spinner" /></div>

  if (error || !state || !reservationId) {
    return (
      <div className="container">
        <div className="alert alert-error">{error || 'Session invalide.'}</div>
        <Link to="/cart" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          ← Retour au panier
        </Link>
      </div>
    )
  }

  return (
    <div className="container" style={{ maxWidth: '600px' }}>
      <h1 className="bookings-title">Paiement</h1>

      <div className="card" style={{ padding: '1.5rem' }}>
        <p style={{ marginBottom: '1rem' }}>
          Montant total à payer : <strong style={{ fontSize: '1.2rem' }}>{state.totalAmount.toFixed(2)} €</strong>
        </p>

        <p style={{ fontSize: '.82rem', color: 'var(--muted)', marginBottom: '1.5rem', padding: '.75rem', background: 'var(--bg-light, #f9fafb)', borderRadius: '6px' }}>
          🧪 <strong>Test :</strong> carte <code>4242 4242 4242 4242</code>, date future quelconque, CVC à 3 chiffres, code postal 1000.
        </p>

        {stripePromise && state.clientSecret && (
          <Elements stripe={stripePromise} options={{ clientSecret: state.clientSecret }}>
            <StripePaymentForm
              reservationId={Number(reservationId)}
              total={state.totalAmount}
              onSuccess={() => {
                clear() // Vider le panier après paiement réussi
                navigate('/my-bookings')
              }}
              onError={msg => setError(msg)}
            />
          </Elements>
        )}

        <Link
          to="/cart"
          style={{
            display: 'inline-block',
            marginTop: '1rem',
            color: 'var(--muted)',
            textDecoration: 'none',
            fontSize: '.88rem'
          }}
        >
          ← Modifier mon panier
        </Link>
      </div>
    </div>
  )
}