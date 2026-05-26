import { useEffect, useState } from 'react'
import { userApi, affiliateApi } from '../../services/api'
import type { AffiliateKeyInfo } from '../../services/api'
import type { User } from '../../types/models'

const ASSIGNABLE_ROLES = ['press', 'affiliate', 'producer']

export default function AdminUsers() {
  const [users, setUsers]         = useState<User[]>([])
  const [keys, setKeys]           = useState<AffiliateKeyInfo[]>([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState<string | null>(null)
  // Affichage d'une clé fraîchement générée (pour copier)
  const [showKey, setShowKey]     = useState<AffiliateKeyInfo | null>(null)

  const load = () => {
    Promise.all([
      userApi.getAll(),
      affiliateApi.getAll().catch(() => [] as AffiliateKeyInfo[])
    ])
      .then(([u, k]) => { setUsers(u); setKeys(k) })
      .catch(() => setError('Erreur de chargement'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  // Retourne la clé d'un user, ou null
  const getKeyForUser = (userId: number): AffiliateKeyInfo | undefined =>
    keys.find(k => k.userId === userId)

  const handleActivate   = async (id: number) => { await userApi.activate(id);   load() }
  const handleDeactivate = async (id: number) => { await userApi.deactivate(id); load() }
  const handleApprove    = async (id: number) => { await userApi.approve(id);    load() }
  const handleDelete     = async (id: number, login: string) => {
    if (!confirm(`Supprimer l'utilisateur "${login}" ?`)) return
    await userApi.delete(id)
    load()
  }
  const handleAssignRole = async (id: number, login: string, role: string) => {
    if (!confirm(`Attribuer le rôle "${role}" à "${login}" ?`)) return
    try {
      await userApi.assignRole(id, role)
      load()
    } catch (e) {
      alert('Erreur : ' + (e instanceof Error ? e.message : 'inconnue'))
    }
  }
  const handleRemoveRole = async (id: number, login: string, role: string) => {
    if (!confirm(`Retirer le rôle "${role}" de "${login}" ?`)) return
    try {
      await userApi.removeRole(id, role)
      load()
    } catch (e) {
      alert('Erreur : ' + (e instanceof Error ? e.message : 'inconnue'))
    }
  }

  const handleGenerateKey = async (userId: number, login: string, tier: 'FREE' | 'STARTER' | 'PREMIUM') => {
    if (!confirm(`Générer une nouvelle clé API ${tier} pour "${login}" ?\n\nSi une clé existe déjà, elle sera remplacée.`)) return
    try {
      const newKey = await affiliateApi.generate(userId, tier)
      setShowKey(newKey)
      load()
    } catch (e) {
      alert('Erreur : ' + (e instanceof Error ? e.message : 'inconnue'))
    }
  }

  const handleRevokeKey = async (userId: number, login: string) => {
    if (!confirm(`Révoquer la clé API de "${login}" ?\n\nL'affilié ne pourra plus accéder à l'API.`)) return
    try {
      await affiliateApi.revoke(userId)
      load()
    } catch (e) {
      alert('Erreur : ' + (e instanceof Error ? e.message : 'inconnue'))
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => alert('Clé copiée dans le presse-papiers !'))
      .catch(() => alert('Impossible de copier — sélectionnez et copiez manuellement.'))
  }

  if (loading) return <div className="spinner" />
  if (error)   return <div className="alert alert-error">{error}</div>

  return (
    <div>
      <div className="admin-section-title">Utilisateurs</div>

      {/* Modal d'affichage de la clé fraîchement générée */}
      {showKey && (
        <div
          onClick={() => setShowKey(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
          }}
        >
          <div
            className="card"
            onClick={e => e.stopPropagation()}
            style={{ maxWidth: '600px', padding: '1.5rem', margin: '1rem' }}
          >
            <h3 style={{ marginTop: 0 }}>🔑 Clé API générée</h3>
            <p>
              Clé générée pour <strong>{showKey.userLogin}</strong> — tier <strong>{showKey.tier}</strong>
            </p>
            <p style={{ color: 'var(--muted)', fontSize: '.88rem' }}>
              Quota : {showKey.dailyQuota} requêtes/jour
            </p>
            <div style={{
              background: '#f3f4f6',
              padding: '.75rem',
              borderRadius: '6px',
              fontFamily: 'monospace',
              fontSize: '.85rem',
              wordBreak: 'break-all',
              marginBottom: '.75rem',
              border: '1px solid #d1d5db'
            }}>
              {showKey.apiKey}
            </div>
            <div style={{ display: 'flex', gap: '.5rem' }}>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => copyToClipboard(showKey.apiKey)}
              >
                📋 Copier la clé
              </button>
              <button
                className="btn btn-outline btn-sm"
                onClick={() => setShowKey(null)}
              >
                Fermer
              </button>
            </div>
            <p style={{ marginTop: '.75rem', fontSize: '.82rem', color: 'var(--muted)' }}>
              ⚠️ Conservez cette clé en lieu sûr. Vous pouvez la régénérer à tout moment depuis cette interface.
            </p>
          </div>
        </div>
      )}

      <div className="admin-table-wrapper card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Login</th>
              <th>Nom</th>
              <th>E-mail</th>
              <th>Rôles</th>
              <th>Clé API</th>
              <th>Actif</th>
              <th>Approuvé</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => {
              const isAffiliate = u.roles.includes('affiliate')
              const userKey = getKeyForUser(u.id)

              return (
                <tr key={u.id}>
                  <td><strong>{u.login}</strong></td>
                  <td>{u.firstName} {u.lastName}</td>
                  <td style={{ fontSize: '.82rem', color: 'var(--muted)' }}>{u.email}</td>
                  <td>
                    {u.roles.map(r => (
                      <span
                        key={r}
                        className="badge badge-blue"
                        style={{ marginRight: '.25rem', cursor: ASSIGNABLE_ROLES.includes(r) ? 'pointer' : 'default' }}
                        title={ASSIGNABLE_ROLES.includes(r) ? `Cliquer pour retirer le rôle "${r}"` : undefined}
                        onClick={() => {
                          if (ASSIGNABLE_ROLES.includes(r)) handleRemoveRole(u.id, u.login, r)
                        }}
                      >
                        {r}{ASSIGNABLE_ROLES.includes(r) && ' ✕'}
                      </span>
                    ))}
                  </td>
                  <td style={{ fontSize: '.82rem' }}>
                    {isAffiliate ? (
                      userKey ? (
                        <div>
                          <span className="badge badge-green">{userKey.tier}</span>
                          <div style={{ color: 'var(--muted)', fontSize: '.78rem', marginTop: '.15rem' }}>
                            {userKey.requestsToday} / {userKey.dailyQuota} req. aujourd'hui
                          </div>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--muted)' }}>Aucune clé</span>
                      )
                    ) : (
                      <span style={{ color: 'var(--muted)' }}>—</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${u.isActive ? 'badge-green' : 'badge-red'}`}>
                      {u.isActive ? 'Oui' : 'Non'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${u.isApproved ? 'badge-green' : 'badge-grey'}`}>
                      {u.isApproved ? 'Oui' : 'Non'}
                    </span>
                  </td>
                  <td>
                    <div className="admin-actions">
                      {/* Activer / Désactiver */}
                      {u.isActive
                        ? <button className="btn btn-outline btn-sm" onClick={() => handleDeactivate(u.id)}>Désactiver</button>
                        : <button className="btn btn-primary btn-sm" onClick={() => handleActivate(u.id)}>Activer</button>
                      }
                      {/* Approuver */}
                      {!u.isApproved && (
                        <button className="btn btn-primary btn-sm" onClick={() => handleApprove(u.id)}>Approuver</button>
                      )}

                      {/* Attribution rôle */}
                      <select
                        className="form-control"
                        style={{ width: 'auto', display: 'inline-block', padding: '.25rem .5rem', fontSize: '.82rem' }}
                        defaultValue=""
                        onChange={e => {
                          const role = e.target.value
                          if (role) {
                            handleAssignRole(u.id, u.login, role)
                            e.target.value = ''
                          }
                        }}
                      >
                        <option value="" disabled>+ Rôle</option>
                        {ASSIGNABLE_ROLES.filter(r => !u.roles.includes(r)).map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>

                      {/* Génération clé API — uniquement si user a le rôle affiliate */}
                      {isAffiliate && (
                        <select
                          className="form-control"
                          style={{ width: 'auto', display: 'inline-block', padding: '.25rem .5rem', fontSize: '.82rem' }}
                          defaultValue=""
                          onChange={e => {
                            const tier = e.target.value as 'FREE' | 'STARTER' | 'PREMIUM' | ''
                            if (tier) {
                              handleGenerateKey(u.id, u.login, tier)
                              e.target.value = ''
                            }
                          }}
                        >
                          <option value="" disabled>{userKey ? '🔄 Régénérer' : '🔑 Générer clé'}</option>
                          <option value="FREE">FREE (10/j)</option>
                          <option value="STARTER">STARTER (100/j)</option>
                          <option value="PREMIUM">PREMIUM (illimité)</option>
                        </select>
                      )}

                      {/* Révocation clé */}
                      {isAffiliate && userKey && (
                        <button
                          className="btn btn-outline btn-sm"
                          style={{ borderColor: '#dc2626', color: '#dc2626' }}
                          onClick={() => handleRevokeKey(u.id, u.login)}
                        >
                          🚫 Révoquer clé
                        </button>
                      )}

                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.id, u.login)}>
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}