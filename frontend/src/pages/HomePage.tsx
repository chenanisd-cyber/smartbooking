import { useEffect, useState, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { showApi, locationApi } from '../services/api'
import type { Show, Locality, Location, PageResponse } from '../types/models'
import ShowCard from '../components/ui/ShowCard'
import './HomePage.css'

export default function HomePage() {
  const [searchParams, setSearchParams] = useSearchParams()

  // Derive filter state from URL
  const search     = searchParams.get('search')     ?? ''
  const sort       = searchParams.get('sort')       ?? 'newest'
  const localityId = searchParams.get('localityId') ? Number(searchParams.get('localityId')) : undefined
  const locationId = searchParams.get('locationId') ? Number(searchParams.get('locationId')) : undefined
  const page       = Number(searchParams.get('page') ?? '0')

  const [pageData,   setPageData]   = useState<PageResponse<Show> | null>(null)
  const [localities, setLocalities] = useState<Locality[]>([])
  const [locations,  setLocations]  = useState<Location[]>([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState<string | null>(null)

  // Local input state for search (debounced before updating URL)
  const [searchInput, setSearchInput] = useState(search)

  // Load filter options once on mount
  useEffect(() => {
    Promise.all([locationApi.getLocalities(), locationApi.getAll()])
      .then(([locs, places]) => { setLocalities(locs); setLocations(places) })
      .catch(() => {})
  }, [])

  // Fetch shows whenever URL params change
  useEffect(() => {
    setLoading(true)
    setError(null)
    showApi.getAll({ search: search || undefined, localityId, locationId, sort, page, size: 10 })
      .then(setPageData)
      .catch(() => setError('Impossible de charger le catalogue.'))
      .finally(() => setLoading(false))
  }, [search, sort, localityId, locationId, page])

  // Sync local input if URL search changes externally
  useEffect(() => { setSearchInput(search) }, [search])

  // Debounce: push search input to URL after 400 ms
  useEffect(() => {
    const timer = setTimeout(() => {
      updateParams({ search: searchInput || undefined })
    }, 400)
    return () => clearTimeout(timer)
  }, [searchInput])

  const updateParams = useCallback((updates: Record<string, string | number | undefined>) => {
    setSearchParams(prev => {
      const next = new URLSearchParams(prev)
      const changingPage = 'page' in updates
      for (const [key, val] of Object.entries(updates)) {
        if (val === undefined || val === '') next.delete(key)
        else next.set(key, String(val))
      }
      // Reset to page 0 when any filter changes
      if (!changingPage) next.delete('page')
      return next
    }, { replace: true })
  }, [setSearchParams])

  const shows        = pageData?.content       ?? []
  const totalPages   = pageData?.totalPages    ?? 0
  const totalElements = pageData?.totalElements ?? 0

  return (
    <div className="container">
      {/* Hero */}
      <section className="hero">
        <h1>Découvrez nos spectacles</h1>
        <p>Réservez vos places pour les meilleurs événements culturels</p>
      </section>

      {/* Toolbar */}
      <div className="catalog-toolbar">
        <input
          className="catalog-search"
          type="search"
          placeholder="Rechercher un spectacle, artiste…"
          value={searchInput}
          onChange={e => setSearchInput(e.target.value)}
        />
        <select
          className="catalog-select"
          value={localityId ?? ''}
          onChange={e => updateParams({ localityId: e.target.value || undefined })}
        >
          <option value="">Toutes les localités</option>
          {localities.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
        <select
          className="catalog-select"
          value={locationId ?? ''}
          onChange={e => updateParams({ locationId: e.target.value || undefined })}
        >
          <option value="">Tous les lieux</option>
          {locations.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
        </select>
        <select
          className="catalog-select"
          value={sort}
          onChange={e => updateParams({ sort: e.target.value })}
        >
          <option value="newest">Nouveautés</option>
          <option value="title">Titre A → Z</option>
          <option value="date">Prochaine date</option>
          <option value="price">Prix croissant</option>
        </select>
      </div>

      {/* Content */}
      {loading && <div className="spinner" />}
      {error   && <div className="alert alert-error">{error}</div>}

      {!loading && !error && pageData && (
        <>
          <p className="catalog-count">
            {totalElements} spectacle{totalElements !== 1 ? 's' : ''} trouvé{totalElements !== 1 ? 's' : ''}
          </p>

          {shows.length === 0 ? (
            <div className="empty-state">
              <span>🎭</span>
              <p>Aucun spectacle ne correspond à votre recherche.</p>
            </div>
          ) : (
            <div className="show-grid">
              {shows.map(show => <ShowCard key={show.id} show={show} />)}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className="page-btn"
                disabled={page === 0}
                onClick={() => updateParams({ page: page - 1 })}
              >
                ← Précédent
              </button>

              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  className={`page-btn${i === page ? ' active' : ''}`}
                  onClick={() => updateParams({ page: i })}
                >
                  {i + 1}
                </button>
              ))}

              <button
                className="page-btn"
                disabled={page >= totalPages - 1}
                onClick={() => updateParams({ page: page + 1 })}
              >
                Suivant →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
