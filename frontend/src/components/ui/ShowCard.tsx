import { Link } from 'react-router-dom'
import type { Show } from '../../types/models'
import './ShowCard.css'

interface Props { show: Show }

export default function ShowCard({ show }: Props) {
  // Find the next upcoming representation
  const next = show.representations
    .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())[0]

  // Find lowest price
  const prices = show.representations.flatMap(r => r.prices).map(p => p.amount)
  const minPrice = prices.length ? Math.min(...prices) : null

  const formatDate = (dt: string) =>
    new Date(dt).toLocaleDateString('fr-BE', { day: '2-digit', month: 'short', year: 'numeric' })

  return (
    <div className="show-card card">
      {/* Image */}
      <div className="show-card-img">
        {show.imagePath
          ? <img src={`/images/${show.imagePath}`} alt={show.title} />
          : <div className="show-card-placeholder">🎭</div>
        }
      </div>

      {/* Content */}
      <div className="show-card-body">
        <h3 className="show-card-title">{show.title}</h3>

        {show.artist && (
          <p className="show-card-artist">👤 {show.artist.name}</p>
        )}

        {next && (
          <p className="show-card-date">
            📅 {formatDate(next.dateTime)}
            {next.location && <span> · {next.location.name}</span>}
          </p>
        )}

        <div className="show-card-footer">
          {minPrice !== null && (
            <span className="show-card-price">À partir de {minPrice} €</span>
          )}
          <Link to={`/shows/${show.slug}`} className="btn btn-primary btn-sm">
            Voir le spectacle
          </Link>
        </div>
      </div>
    </div>
  )
}
