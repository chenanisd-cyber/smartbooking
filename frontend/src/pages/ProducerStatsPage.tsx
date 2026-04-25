import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { producerApi } from '../services/api'
import type { ProducerStats, ShowStats } from '../types/models'
import './ProducerStatsPage.css'

export default function ProducerStatsPage() {
  const [stats, setStats]     = useState<ProducerStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)
  const [expanded, setExpanded] = useState<Set<number>>(new Set())

  useEffect(() => {
    producerApi.getStats()
      .then(setStats)
      .catch(() => setError('Impossible de charger les statistiques.'))
      .finally(() => setLoading(false))
  }, [])

  const toggle = (id: number) => {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const fmt = (amount: number) =>
    new Intl.NumberFormat('fr-BE', { style: 'currency', currency: 'EUR' }).format(amount)

  const fmtDate = (dt: string) =>
    new Date(dt).toLocaleDateString('fr-BE', { day: '2-digit', month: 'short', year: 'numeric' })

  if (loading) return <div className="container"><div className="spinner" /></div>
  if (error || !stats) return (
    <div className="container">
      <div className="alert alert-error">{error || 'Erreur de chargement.'}</div>
    </div>
  )

  return (
    <div className="container producer-page">
      <h1 className="producer-title">Tableau de bord producteur</h1>

      {/* Global KPIs */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <span className="kpi-icon">🎭</span>
          <span className="kpi-value">{stats.totalShows}</span>
          <span className="kpi-label">Spectacles</span>
        </div>
        <div className="kpi-card">
          <span className="kpi-icon">🎟</span>
          <span className="kpi-value">{stats.totalConfirmedSeats}</span>
          <span className="kpi-label">Places vendues</span>
        </div>
        <div className="kpi-card kpi-card--revenue">
          <span className="kpi-icon">💶</span>
          <span className="kpi-value">{fmt(stats.totalRevenue)}</span>
          <span className="kpi-label">Chiffre d'affaires total</span>
        </div>
      </div>

      {/* Per-show breakdown */}
      <h2 className="producer-section-title">Détail par spectacle</h2>

      {stats.shows.length === 0 ? (
        <p style={{ color: 'var(--muted)' }}>Aucun spectacle disponible.</p>
      ) : (
        <div className="show-stats-list">
          {stats.shows.map((show: ShowStats) => (
            <div key={show.id} className="show-stats-card card">
              <div className="show-stats-header" onClick={() => toggle(show.id)} role="button" tabIndex={0}
                   onKeyDown={e => e.key === 'Enter' && toggle(show.id)}>
                <div className="show-stats-main">
                  <Link to={`/shows/${show.slug}`} className="show-stats-title"
                        onClick={e => e.stopPropagation()}>
                    {show.title}
                  </Link>
                  <div className="show-stats-summary">
                    <span className="stat-pill">🎟 {show.totalConfirmedSeats} places</span>
                    <span className="stat-pill stat-pill--green">{fmt(show.totalRevenue)}</span>
                    <span className="stat-pill stat-pill--grey">
                      {show.representations.length} représentation{show.representations.length > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
                <span className="show-stats-chevron">{expanded.has(show.id) ? '▲' : '▼'}</span>
              </div>

              {expanded.has(show.id) && (
                <div className="rep-stats-table-wrap">
                  <table className="rep-stats-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Lieu</th>
                        <th>Capacité</th>
                        <th>Vendues</th>
                        <th>Remplissage</th>
                        <th>Recettes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {show.representations
                        .slice()
                        .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
                        .map(rep => {
                          const fill = rep.capacity > 0 ? rep.fillRate : 0
                          const fillColor = fill >= 80 ? 'var(--success)' : fill >= 40 ? 'var(--warning, #f59e0b)' : 'var(--muted)'
                          return (
                            <tr key={rep.id}>
                              <td>{fmtDate(rep.dateTime)}</td>
                              <td>{rep.locationName ?? '—'}</td>
                              <td>{rep.capacity > 0 ? rep.capacity : '—'}</td>
                              <td>{rep.confirmedSeats}</td>
                              <td>
                                {rep.capacity > 0 ? (
                                  <div className="fill-bar-wrap">
                                    <div className="fill-bar">
                                      <div className="fill-bar-inner" style={{ width: `${fill}%`, background: fillColor }} />
                                    </div>
                                    <span style={{ color: fillColor, fontSize: '.8rem' }}>
                                      {fill.toFixed(0)}%
                                    </span>
                                  </div>
                                ) : '—'}
                              </td>
                              <td><strong>{fmt(rep.revenue)}</strong></td>
                            </tr>
                          )
                        })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
