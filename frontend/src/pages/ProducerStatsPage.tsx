import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { producerApi, userApi } from '../services/api'
import { useAuth } from '../context/AuthContext'
import type { ProducerStats, ShowStats, User } from '../types/models'
import './ProducerStatsPage.css'

export default function ProducerStatsPage() {
  const { isAdmin } = useAuth()

  const [stats, setStats]         = useState<ProducerStats | null>(null)
  const [producers, setProducers] = useState<User[]>([])
  const [selectedProducerId, setSelectedProducerId] = useState<number | 'all'>('all')
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState<string | null>(null)
  const [expanded, setExpanded]   = useState<Set<number>>(new Set())

  // Charger la liste des producteurs si admin
  useEffect(() => {
    if (isAdmin) {
      userApi.getProducers()
        .then(setProducers)
        .catch(() => { /* silencieux : l'admin verra juste pas le filtre */ })
    }
  }, [isAdmin])

  // Charger les stats — refresh quand le sélecteur change
  useEffect(() => {
    setLoading(true)
    setError(null)
    const producerId = isAdmin && selectedProducerId !== 'all' ? selectedProducerId : undefined
    producerApi.getStats(producerId)
      .then(setStats)
      .catch(() => setError('Impossible de charger les statistiques.'))
      .finally(() => setLoading(false))
  }, [isAdmin, selectedProducerId])

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

  // Libellé du sélecteur courant
  const selectedLabel = selectedProducerId === 'all'
    ? 'Tous les producteurs (vue globale)'
    : producers.find(p => p.id === selectedProducerId)?.login ?? '?'

  return (
    <div className="container producer-page">
      <h1 className="producer-title">
        {isAdmin ? 'Statistiques de la plateforme' : 'Tableau de bord producteur'}
      </h1>

      {/* Sélecteur admin */}
      {isAdmin && (
        <div className="card" style={{ padding: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '.75rem', flexWrap: 'wrap' }}>
          <label htmlFor="producer-filter" style={{ fontWeight: 600 }}>
            🔍 Filtrer par producteur :
          </label>
          <select
            id="producer-filter"
            className="form-control"
            value={selectedProducerId}
            onChange={e => setSelectedProducerId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            style={{ width: 'auto', minWidth: '250px' }}
          >
            <option value="all">Tous les producteurs (vue globale)</option>
            {producers.map(p => (
              <option key={p.id} value={p.id}>
                {p.firstName} {p.lastName} ({p.login})
              </option>
            ))}
          </select>
          <span style={{ color: 'var(--muted)', fontSize: '.88rem' }}>
            Vue actuelle : <strong>{selectedLabel}</strong>
          </span>
        </div>
      )}

      {loading ? (
        <div className="spinner" />
      ) : error || !stats ? (
        <div className="alert alert-error">{error || 'Erreur de chargement.'}</div>
      ) : (
        <>
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
                                          {fill < 1 && fill > 0 ? fill.toFixed(1) : fill.toFixed(0)}%
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
        </>
      )}
    </div>
  )
}