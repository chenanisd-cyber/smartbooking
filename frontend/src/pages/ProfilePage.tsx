import { useState, FormEvent, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { authApi } from '../services/api'
import './AuthPages.css'
import './ProfilePage.css'

export default function ProfilePage() {
  const { user, loading, logout } = useAuth()
  const navigate = useNavigate()

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',      // laissé vide = pas de changement
    confirmPassword: '',
  })
  const [error,   setError]   = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [saving,  setSaving]  = useState(false)

  // Delete account
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting,        setDeleting]        = useState(false)
  const [deleteError,     setDeleteError]     = useState<string | null>(null)

  // Pré-remplir le formulaire avec les données actuelles
  useEffect(() => {
    if (!loading && !user) {
      navigate('/login')
      return
    }
    if (user) {
      setForm(prev => ({
        ...prev,
        firstName: user.firstName ?? '',
        lastName:  user.lastName  ?? '',
        email:     user.email     ?? '',
      }))
    }
  }, [user, loading, navigate])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (form.password && form.password !== form.confirmPassword) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }

    setSaving(true)
    try {
      // On envoie seulement les champs remplis
      const payload: Record<string, string> = {
        firstName: form.firstName,
        lastName:  form.lastName,
        email:     form.email,
      }
      if (form.password) payload.password = form.password

      await authApi.updateProfile(payload)
      setSuccess('Profil mis à jour avec succès.')
      setForm(prev => ({ ...prev, password: '', confirmPassword: '' }))
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la mise à jour')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    setDeleting(true)
    setDeleteError(null)
    try {
      await authApi.deleteAccount()
      await logout()
      navigate('/')
    } catch (err: unknown) {
      setDeleteError(err instanceof Error ? err.message : 'Erreur lors de la suppression')
      setDeleting(false)
    }
  }

  if (loading) return <div className="container"><div className="spinner" /></div>

  return (
    <div className="auth-wrapper">
      <div className="auth-card card">
        <h1 className="auth-title">Mon profil</h1>
        <p className="auth-subtitle">
          Connecté en tant que <strong>{user?.login}</strong>
          {user?.roles.map(r => (
            <span key={r} className="badge badge-blue" style={{ marginLeft: '.5rem' }}>{r}</span>
          ))}
        </p>

        {error   && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
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
            <label htmlFor="email">Adresse e-mail</label>
            <input
              id="email"
              name="email"
              type="email"
              className="form-control"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <hr style={{ margin: '1.25rem 0', borderColor: 'var(--border)' }} />
          <p style={{ fontSize: '.85rem', color: 'var(--muted)', marginBottom: '.5rem' }}>
            Laisser vide pour conserver le mot de passe actuel.
          </p>

          <div className="form-group">
            <label htmlFor="password">Nouveau mot de passe</label>
            <input
              id="password"
              name="password"
              type="password"
              className="form-control"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
              minLength={6}
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              className="form-control"
              value={form.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
            />
          </div>

          <button type="submit" className="btn btn-primary btn-block" disabled={saving}>
            {saving ? 'Enregistrement…' : 'Enregistrer les modifications'}
          </button>
        </form>

        {/* Danger zone */}
        <div className="danger-zone">
          <p className="danger-zone-title">Zone dangereuse</p>
          <p className="danger-zone-text">
            La suppression de votre compte est irréversible. Toutes vos réservations et avis seront également supprimés.
          </p>
          <button
            className="btn btn-danger"
            onClick={() => { setShowDeleteModal(true); setDeleteError(null) }}
          >
            Supprimer mon compte
          </button>
        </div>
      </div>

      {/* Confirmation modal */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => !deleting && setShowDeleteModal(false)}>
          <div className="modal-box card" onClick={e => e.stopPropagation()}>
            <h2 className="modal-title">Supprimer mon compte</h2>
            <p className="modal-text">
              Êtes-vous sûr de vouloir supprimer définitivement votre compte ?<br />
              Cette action est <strong>irréversible</strong>.
            </p>
            {deleteError && <div className="alert alert-error">{deleteError}</div>}
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
              >
                Annuler
              </button>
              <button
                className="btn btn-danger"
                onClick={handleDeleteAccount}
                disabled={deleting}
              >
                {deleting ? 'Suppression…' : 'Oui, supprimer mon compte'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
