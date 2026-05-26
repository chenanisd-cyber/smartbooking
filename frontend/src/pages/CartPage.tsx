import { useNavigate, Link } from 'react-router-dom'
import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import { paymentApi } from '../services/api'

export default function CartPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { lines, totalItems, totalAmount, updateQuantity, removeLine, clear } = useCart()
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const formatDate = (dt: string) =>
    new Date(dt).toLocaleDateString('fr-BE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })

  const formatTime = (dt: string) =>
    new Date(dt).toLocaleTimeString('fr-BE', { hour: '2-digit', minute: '2-digit' })

  const handleCheckout = async () => {
    if (!user) {
      navigate('/login?redirect=/cart')
      return
    }
    if (lines.length === 0) return

    setError(null)
    setProcessing(true)
    try {
      const payload = {
        lines: lines.map(l => ({
          representationId: l.representationId,
          priceType: l.priceType,
          quantity: l.quantity,
        }))
      }
      const intent = await paymentApi.createIntent(payload)
      navigate(`/checkout/${intent.reservationId}`, {
        state: { clientSecret: intent.clientSecret, totalAmount }
      })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création du paiement')
      setProcessing(false)
    }
  }

  if (lines.length === 0) {
    return (
      <div className="container">
        <h1 className="bookings-title">Mon panier</h1>
        <div className="bookings-empty">
          <span style={{ fontSize: '3rem' }}>🛒</span>
          <p>Votre panier est vide.</p>
          <Link to="/" className="btn btn-primary">Voir le catalogue</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container">
      <h1 className="bookings-title">Mon panier</h1>

      {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      <div className="card" style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '.5rem' }}>
          <span style={{ color: 'var(--muted)' }}>
            {totalItems} {totalItems > 1 ? 'places' : 'place'} • {lines.length} {lines.length > 1 ? 'lignes' : 'ligne'}
          </span>
          <button
            type="button"
            onClick={() => { if (confirm('Vider tout le panier ?')) clear() }}
            className="btn btn-outline btn-sm"
          >
            🗑️ Vider le panier
          </button>
        </div>

        {lines.map(line => (
          <div
            key={line.cartLineId}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              padding: '1rem 0',
              borderBottom: '1px solid var(--border, #e5e5e5)'
            }}
          >
            <div style={{ flex: '1 1 auto', minWidth: '200px' }}>
              <Link to={`/shows/${line.showSlug}`} style={{ fontWeight: 600, textDecoration: 'none' }}>
                {line.showTitle}
              </Link>
              <p style={{ margin: '.15rem 0', color: 'var(--muted)', fontSize: '.88rem' }}>
                {formatDate(line.dateTime)} à {formatTime(line.dateTime)}
              </p>
              {line.locationName && (
                <p style={{ margin: 0, color: 'var(--muted)', fontSize: '.88rem' }}>
                  📍 {line.locationName}
                </p>
              )}
              <p style={{ margin: '.25rem 0 0 0', fontSize: '.88rem' }}>
                Tarif : <strong>{line.priceType}</strong> — {line.unitPrice.toFixed(2)} € / place
              </p>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '.25rem' }}>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => updateQuantity(line.cartLineId, line.quantity - 1)}
                  aria-label="Diminuer"
                  style={{ minWidth: '32px', padding: '.25rem .5rem' }}
                >
                  −
                </button>
                <span style={{ minWidth: '32px', textAlign: 'center', fontWeight: 600 }}>
                  {line.quantity}
                </span>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={() => updateQuantity(line.cartLineId, line.quantity + 1)}
                  aria-label="Augmenter"
                  style={{ minWidth: '32px', padding: '.25rem .5rem' }}
                >
                  +
                </button>
              </div>

              <div style={{ minWidth: '90px', textAlign: 'right', fontWeight: 600 }}>
                {(line.quantity * line.unitPrice).toFixed(2)} €
              </div>

              <button
                type="button"
                className="btn btn-danger btn-sm"
                onClick={() => removeLine(line.cartLineId)}
                aria-label="Supprimer cette ligne"
                style={{ padding: '.25rem .5rem' }}
              >
                ✕
              </button>
            </div>
          </div>
        ))}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '2px solid var(--border, #e5e5e5)' }}>
          <span style={{ fontSize: '1.2rem' }}>
            Total : <strong>{totalAmount.toFixed(2)} €</strong>
          </span>
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleCheckout}
            disabled={processing}
            style={{ minWidth: '200px' }}
          >
            {processing ? 'Préparation…' : '🔒 Procéder au paiement'}
          </button>
        </div>

        {!user && (
          <p style={{ marginTop: '.75rem', textAlign: 'right', fontSize: '.88rem', color: 'var(--muted)' }}>
            Vous devrez vous connecter pour finaliser votre commande.
          </p>
        )}
      </div>
    </div>
  )
}