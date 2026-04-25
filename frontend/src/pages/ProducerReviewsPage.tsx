import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { reviewApi } from '../services/api'
import type { Review } from '../types/models'
import StarRating from '../components/ui/StarRating'
import './ProducerReviewsPage.css'

export default function ProducerReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    reviewApi.getPending()
      .then(setReviews)
      .catch(() => setError('Erreur de chargement des avis.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleValidate = async (id: number) => {
    await reviewApi.validate(id)
    load()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cet avis définitivement ?')) return
    await reviewApi.delete(id)
    load()
  }

  if (loading) return <div className="container"><div className="spinner" /></div>
  if (error)   return <div className="container"><div className="alert alert-error">{error}</div></div>

  return (
    <div className="container producer-reviews-page">
      <div className="producer-reviews-header">
        <div>
          <h1 className="producer-reviews-title">Modération des avis</h1>
          <p className="producer-reviews-sub">Avis en attente de validation</p>
        </div>
        <Link to="/producer/stats" className="btn btn-outline btn-sm">
          ← Tableau de bord
        </Link>
      </div>

      {reviews.length === 0 ? (
        <div className="card producer-reviews-empty">
          ✅ Aucun avis en attente de validation.
        </div>
      ) : (
        <>
          <p className="producer-reviews-count">
            <span className="badge badge-blue">{reviews.length}</span> avis à traiter
          </p>
          <div className="producer-reviews-list">
            {reviews.map(r => (
              <div key={r.id} className="review-mod-card card">
                <div className="review-mod-top">
                  <div className="review-mod-meta">
                    <span className={`review-type-badge ${r.reviewType === 'PRESS_REVIEW' ? 'press' : 'member'}`}>
                      {r.reviewType === 'PRESS_REVIEW' ? '✍️ Presse' : '👤 Membre'}
                    </span>
                    <Link to={`/shows/${r.showId}`} className="review-mod-show">
                      {r.showTitle}
                    </Link>
                    <span className="review-mod-user">{r.userLogin}</span>
                    <span className="review-mod-date">
                      {new Date(r.createdAt).toLocaleDateString('fr-BE')}
                    </span>
                  </div>
                  <StarRating stars={r.stars} />
                </div>

                <p className="review-mod-comment">{r.comment}</p>

                {r.articleUrl && (
                  <a className="review-mod-url" href={r.articleUrl} target="_blank" rel="noopener noreferrer">
                    Lire l'article →
                  </a>
                )}

                <div className="review-mod-actions">
                  <button className="btn btn-primary btn-sm" onClick={() => handleValidate(r.id)}>
                    ✓ Valider
                  </button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r.id)}>
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
