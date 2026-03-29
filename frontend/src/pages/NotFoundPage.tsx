import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '5rem 1rem',
      textAlign: 'center',
    }}>
      <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🎭</div>
      <h1 style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>404</h1>
      <p style={{ fontSize: '1.15rem', color: 'var(--text)', margin: '1rem 0 .5rem' }}>
        Cette page n'existe pas.
      </p>
      <p style={{ color: 'var(--muted)', marginBottom: '2rem' }}>
        Il semble que la page que vous cherchez soit introuvable ou a été déplacée.
      </p>
      <Link to="/" className="btn btn-primary">← Retour au catalogue</Link>
    </div>
  )
}
