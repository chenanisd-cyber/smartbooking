import { useRef, useState } from 'react'

export default function AdminCsv() {
  // Export
  const [exporting, setExporting] = useState(false)

  // Import
  const fileRef = useRef<HTMLInputElement>(null)
  const [importing, setImporting]     = useState(false)
  const [importResults, setImportResults] = useState<string[] | null>(null)
  const [importError, setImportError] = useState<string | null>(null)

  const handleExport = async () => {
    setExporting(true)
    try {
      const res = await fetch('/api/admin/csv/export/reservations', { credentials: 'include' })
      if (!res.ok) throw new Error('Erreur export')
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `reservations_${new Date().toISOString().slice(0, 10)}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } catch {
      alert('Erreur lors de l\'export CSV.')
    } finally {
      setExporting(false)
    }
  }

  const handleImport = async () => {
    const file = fileRef.current?.files?.[0]
    if (!file) return
    setImportError(null)
    setImportResults(null)
    setImporting(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/admin/csv/import/shows', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      })
      if (!res.ok) throw new Error('Erreur serveur')
      const results: string[] = await res.json()
      setImportResults(results)
    } catch {
      setImportError('Erreur lors de l\'import. Vérifiez le format du fichier.')
    } finally {
      setImporting(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const okCount  = importResults?.filter(r => r.includes(' OK ')).length ?? 0
  const errCount = importResults?.filter(r => r.includes('ERREUR') || r.includes('ignorée')).length ?? 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

      {/* Export */}
      <section>
        <div className="admin-section-title">Export CSV</div>
        <div className="card" style={{ padding: '1.5rem' }}>
          <p style={{ color: 'var(--muted)', fontSize: '.9rem', marginBottom: '1rem' }}>
            Télécharge toutes les réservations confirmées au format CSV (UTF-8).
          </p>
          <p style={{ fontSize: '.8rem', color: 'var(--muted)', marginBottom: '1.25rem' }}>
            Colonnes : id, spectacle, utilisateur, lieu, date_heure, type_prix, quantite, montant_total, statut, date_reservation
          </p>
          <button className="btn btn-primary" onClick={handleExport} disabled={exporting}>
            {exporting ? 'Export en cours…' : '⬇ Exporter les réservations'}
          </button>
        </div>
      </section>

      {/* Import */}
      <section>
        <div className="admin-section-title">Import CSV — Spectacles</div>
        <div className="card" style={{ padding: '1.5rem' }}>
          <p style={{ color: 'var(--muted)', fontSize: '.9rem', marginBottom: '.75rem' }}>
            Importe des spectacles et représentations depuis un fichier CSV.
            Chaque ligne = une représentation. Plusieurs lignes avec le même titre = même spectacle.
          </p>

          <div style={{ background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: '.5rem',
                        padding: '.75rem 1rem', marginBottom: '1.25rem', fontSize: '.8rem', color: 'var(--muted)' }}>
            <strong>Format attendu (avec en-tête) :</strong><br />
            <code>title, description, artistName, locationName, dateTime, priceType, priceAmount, availableSeats</code><br /><br />
            <strong>Formats de date acceptés :</strong> <code>dd/MM/yyyy HH:mm</code> ou <code>yyyy-MM-dd'T'HH:mm</code><br />
            <strong>Types de prix :</strong> <code>STANDARD</code>, <code>VIP</code>, <code>REDUIT</code>, <code>PREMIUM</code>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              style={{ flex: 1, minWidth: '200px' }}
            />
            <button className="btn btn-primary" onClick={handleImport} disabled={importing}>
              {importing ? 'Import en cours…' : '⬆ Importer'}
            </button>
          </div>

          {importError && (
            <div className="alert alert-error" style={{ marginTop: '1rem' }}>{importError}</div>
          )}

          {importResults && (
            <div style={{ marginTop: '1.25rem' }}>
              <p style={{ fontSize: '.85rem', marginBottom: '.5rem' }}>
                <span style={{ color: 'var(--success)', fontWeight: 600 }}>✓ {okCount} ligne{okCount > 1 ? 's' : ''} importée{okCount > 1 ? 's' : ''}</span>
                {errCount > 0 && (
                  <span style={{ color: 'var(--danger)', fontWeight: 600, marginLeft: '.75rem' }}>
                    ✗ {errCount} erreur{errCount > 1 ? 's' : ''}
                  </span>
                )}
              </p>
              <div style={{ maxHeight: '300px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '.3rem' }}>
                {importResults.map((msg, i) => (
                  <div key={i} style={{
                    fontSize: '.8rem',
                    padding: '.3rem .6rem',
                    borderRadius: '.3rem',
                    background: msg.includes(' OK ') ? '#f0fdf4' : msg.includes('ERREUR') ? '#fef2f2' : '#fffbeb',
                    color: msg.includes(' OK ') ? '#166534' : msg.includes('ERREUR') ? '#991b1b' : '#92400e',
                  }}>
                    {msg}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
