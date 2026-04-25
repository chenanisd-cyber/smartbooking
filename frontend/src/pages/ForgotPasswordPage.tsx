import { useState, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import './AuthPages.css'

const BASE = '/api'

export default function ForgotPasswordPage() {
  const [email,   setEmail]   = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [error,   setError]   = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)
    try {
      const res = await fetch(`${BASE}/users/forgot-password`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Erreur inattendue')
      setMessage(data.message)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur inattendue')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card card">
        <h1 className="auth-title">Mot de passe oublié</h1>
        <p className="auth-subtitle">
          Entrez votre adresse email pour recevoir un lien de réinitialisation.
        </p>

        {message && <div className="alert alert-success">{message}</div>}
        {error   && <div className="alert alert-error">{error}</div>}

        {!message && (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Adresse email</label>
              <input
                id="email"
                type="email"
                className="form-control"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
                autoComplete="email"
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Envoi…' : 'Envoyer le lien'}
            </button>
          </form>
        )}

        <p className="auth-footer">
          <Link to="/login">← Retour à la connexion</Link>
        </p>
      </div>
    </div>
  )
}
