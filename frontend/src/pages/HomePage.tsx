import { useEffect, useState } from 'react'
import { showApi } from '../services/api'
import type { Show } from '../types/models'
import ShowCard from '../components/ui/ShowCard'
import './HomePage.css'

export default function HomePage() {
  const [shows, setShows] = useState<Show[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    showApi.getAll()
      .then(setShows)
      .catch(() => setError('Impossible de charger le catalogue.'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="container">
      {/* Hero */}
      <section className="hero">
        <h1>Découvrez nos spectacles</h1>
        <p>Réservez vos places pour les meilleurs événements culturels</p>
      </section>

      {/* Content */}
      {loading && <div className="spinner" />}

      {error && <div className="alert alert-error">{error}</div>}

      {!loading && !error && shows.length === 0 && (
        <div className="empty-state">
          <span>🎭</span>
          <p>Aucun spectacle disponible pour le moment.</p>
        </div>
      )}

      {!loading && shows.length > 0 && (
        <>
          <p className="catalog-count">{shows.length} spectacle{shows.length > 1 ? 's' : ''} disponible{shows.length > 1 ? 's' : ''}</p>
          <div className="show-grid">
            {shows.map(show => <ShowCard key={show.id} show={show} />)}
          </div>
        </>
      )}
    </div>
  )
}
