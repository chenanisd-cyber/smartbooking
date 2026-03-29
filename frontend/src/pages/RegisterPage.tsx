import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { authApi } from '../services/api'
import './AuthPages.css'

export default function RegisterPage() {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    login: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'member', // member ou producer
  })
  const [error, setError]     = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await authApi.register(form)
      setSuccess(res.message)
      // Redirige vers login après 2 secondes
      setTimeout(() => navigate('/login'), 2000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de l\'inscription')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-wrapper">
      <div className="auth-card card">
        <h1 className="auth-title">Inscription</h1>
        <p className="auth-subtitle">Créez votre compte SmartBooking.</p>

        {error   && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {/* Nom & Prénom */}
          <div className="auth-row">
            <div className="form-group">
              <label htmlFor="firstName">Prénom</label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                className="form-control"
                value={form.firstName}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Nom</label>
              <input
                id="lastName"
                name="lastName"
                type="text"
                className="form-control"
                value={form.lastName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="login">Identifiant</label>
            <input
              id="login"
              name="login"
              type="text"
              className="form-control"
              value={form.login}
              onChange={handleChange}
              required
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Adresse e-mail</label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-control"
              value={form.email}
              onChange={handleChange}
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mot de passe</label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-control"
              value={form.password}
              onChange={handleChange}
              required
              autoComplete="new-password"
              minLength={6}
            />
          </div>

          {/* Type de compte */}
          <div className="form-group">
            <label>Type de compte</label>
            <div className="auth-radio-group">
              <label className={`auth-radio ${form.role === 'member' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="role"
                  value="member"
                  checked={form.role === 'member'}
                  onChange={handleChange}
                />
                <span>
                  <strong>Membre</strong>
                  <small>Réservez des spectacles</small>
                </span>
              </label>
              <label className={`auth-radio ${form.role === 'producer' ? 'selected' : ''}`}>
                <input
                  type="radio"
                  name="role"
                  value="producer"
                  checked={form.role === 'producer'}
                  onChange={handleChange}
                />
                <span>
                  <strong>Producteur</strong>
                  <small>Gérez vos spectacles (approbation requise)</small>
                </span>
              </label>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Inscription…' : 'Créer mon compte'}
          </button>
        </form>

        <p className="auth-footer">
          Déjà inscrit ?{' '}
          <Link to="/login">Se connecter</Link>
        </p>
      </div>
    </div>
  )
}
