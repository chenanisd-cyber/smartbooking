import { useEffect, useState } from 'react'
import { reviewApi } from '../../services/api'
import type { Review } from '../../types/models'
import StarRating from '../../components/ui/StarRating'

export default function AdminReviews() {
  const [reviews, setReviews]   = useState<Review[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState<string | null>(null)

  const load = () => {
    reviewApi.getPending()
      .then(setReviews)
      .catch(() => setError('Erreur de chargement'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleValidate = async (id: number) => {
    await reviewApi.validate(id)
    load()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cet avis ?')) return
    await reviewApi.delete(id)
    load()
  }

  if (loading) return <div className="spinner" />
  if (error)   return <div className="alert alert-error">{error}</div>

  return (
    <div>
      <div className="admin-section-title">
        Avis en attente
        {reviews.length > 0 && (
          <span className="badge badge-blue">{reviews.length}</span>
        )}
      </div>

      {reviews.length === 0 ? (
        <div className="card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--muted)' }}>
          ✅ Aucun avis en attente de validation.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {reviews.map(r => (
            <div key={r.id} className="card" style={{ padding: '1.1rem 1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '.75rem' }}>
                {/* Infos avis */}
                <div>
                  <p style={{ fontWeight: 600, color: 'var(--text)', marginBottom: '.2rem' }}>
                    {r.showTitle}
                  </p>
                  <p style={{ fontSize: '.83rem', color: 'var(--muted)', marginBottom: '.4rem' }}>
                    👤 {r.userLogin} · {new Date(r.createdAt).toLocaleDateString('fr-BE')}
                  </p>
                  <StarRating stars={r.stars} />
                  <p style={{ marginTop: '.5rem', fontSize: '.9rem', color: 'var(--text)' }}>
                    {r.comment}
                  </p>
                </div>

                {/* Actions */}
                <div className="admin-actions" style={{ flexShrink: 0 }}>
                  <button className="btn btn-primary btn-sm" onClick={() => handleValidate(r.id)}>
                    ✓ Valider
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r.id)}>
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
