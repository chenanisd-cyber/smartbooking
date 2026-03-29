import { useState, FormEvent } from 'react'
import { representationApi } from '../../services/api'
import type { Location } from '../../types/models'
import './Modal.css'

// Types de prix disponibles
const PRICE_TYPES = ['STANDARD', 'VIP', 'REDUIT', 'PREMIUM'] as const
type PriceType = typeof PRICE_TYPES[number]

interface PriceLine {
  type: PriceType
  amount: string
}

interface Props {
  showId: number
  locations: Location[]
  onClose: () => void
  onSaved: () => void
}

export default function RepresentationFormModal({ showId, locations, onClose, onSaved }: Props) {
  const [dateTime, setDateTime]   = useState('')
  const [locationId, setLocation] = useState('')
  const [seats, setSeats]         = useState(100)
  // Au moins une ligne de prix par défaut
  const [prices, setPrices]       = useState<PriceLine[]>([{ type: 'STANDARD', amount: '' }])
  const [error, setError]         = useState<string | null>(null)
  const [saving, setSaving]       = useState(false)

  const addPrice = () => {
    setPrices(prev => [...prev, { type: 'STANDARD', amount: '' }])
  }

  const removePrice = (index: number) => {
    setPrices(prev => prev.filter((_, i) => i !== index))
  }

  const updatePrice = (index: number, field: keyof PriceLine, value: string) => {
    setPrices(prev => prev.map((p, i) => i === index ? { ...p, [field]: value } : p))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSaving(true)
    try {
      await representationApi.create({
        showId,
        locationId: locationId ? Number(locationId) : null,
        dateTime,
        availableSeats: seats,
        prices: prices
          .filter(p => p.amount !== '')
          .map(p => ({ type: p.type, amount: Number(p.amount) })),
      })
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
          <h2 className="modal-title">Ajouter une représentation</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {error && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{error}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-group">
            <label htmlFor="dateTime">Date et heure *</label>
            <input
              id="dateTime"
              type="datetime-local"
              className="form-control"
              value={dateTime}
              onChange={e => setDateTime(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="location">Lieu</label>
            <select
              id="location"
              className="form-control"
              value={locationId}
              onChange={e => setLocation(e.target.value)}
            >
              <option value="">— Aucun —</option>
              {locations.map(l => (
                <option key={l.id} value={l.id}>
                  {l.name}{l.locality ? ` — ${l.locality.name}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="seats">Places disponibles *</label>
            <input
              id="seats"
              type="number"
              className="form-control"
              min={1}
              value={seats}
              onChange={e => setSeats(Number(e.target.value))}
              required
            />
          </div>

          {/* Lignes de tarifs */}
          <div className="form-group">
            <label>Tarifs</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem', marginTop: '.25rem' }}>
              {prices.map((p, i) => (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '.5rem', alignItems: 'center' }}>
                  <select
                    className="form-control"
                    value={p.type}
                    onChange={e => updatePrice(i, 'type', e.target.value)}
                  >
                    {PRICE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Prix €"
                    min={0}
                    step="0.01"
                    value={p.amount}
                    onChange={e => updatePrice(i, 'amount', e.target.value)}
                  />
                  {prices.length > 1 && (
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => removePrice(i)}>✕</button>
                  )}
                </div>
              ))}
              <button type="button" className="btn btn-outline btn-sm" onClick={addPrice} style={{ alignSelf: 'flex-start' }}>
                + Ajouter un tarif
              </button>
            </div>
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
