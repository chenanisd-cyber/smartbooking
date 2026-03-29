// Placeholder — sera remplacé à l'étape 10 avec le vrai catalogue
export default function HomePage() {
  return (
    <div className="container" style={{ padding: '3rem 1.5rem', textAlign: 'center' }}>
      <h1 className="page-title">Bienvenue sur SmartBooking</h1>
      <p style={{ color: 'var(--muted)', marginBottom: '2rem' }}>
        Découvrez et réservez les meilleurs spectacles près de chez vous.
      </p>
      <div className="spinner" />
      <p style={{ color: 'var(--muted)', fontSize: '.9rem' }}>Chargement du catalogue...</p>
    </div>
  )
}
