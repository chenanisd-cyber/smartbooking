import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { affiliateApi } from '../services/api'
import type { AffiliateKeyInfo } from '../services/api'
import { useAuth } from '../context/AuthContext'

export default function AffiliateDashboard() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()

  const [keyInfo, setKeyInfo] = useState<AffiliateKeyInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)
  const [showKey, setShowKey] = useState(false)
  const [copied, setCopied]   = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) { navigate('/login'); return }
    if (!user.roles.includes('affiliate')) {
      setError('Vous devez avoir le rôle "affilié" pour accéder à cette page. Contactez un administrateur.')
      setLoading(false)
      return
    }

    affiliateApi.getMyKey()
      .then(info => {
        if (info && info.hasKey) {
          setKeyInfo(info)
        } else {
          setKeyInfo(null)
        }
      })
      .catch(() => setError('Impossible de charger les informations d\'affiliation.'))
      .finally(() => setLoading(false))
  }, [user, authLoading, navigate])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
      .catch(() => alert('Impossible de copier — sélectionnez et copiez manuellement.'))
  }

  const maskKey = (key: string) => {
    if (!key) return ''
    return key.substring(0, 10) + '•••••••••••••••••••••••••••••••' + key.substring(key.length - 4)
  }

  if (loading || authLoading) return <div className="container"><div className="spinner" /></div>

  if (error) {
    return (
      <div className="container">
        <h1 className="bookings-title">Mon API</h1>
        <div className="alert alert-error">{error}</div>
      </div>
    )
  }

  // Cas où l'user est affilié mais n'a pas encore de clé
  if (!keyInfo) {
    return (
      <div className="container">
        <h1 className="bookings-title">Mon API</h1>
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔑</div>
          <h2 style={{ marginTop: 0 }}>Aucune clé API active</h2>
          <p style={{ color: 'var(--muted)', marginBottom: '1rem' }}>
            Votre compte a le statut affilié, mais aucune clé API ne vous a encore été attribuée.
          </p>
          <p style={{ color: 'var(--muted)' }}>
            Contactez un administrateur pour qu'il génère votre clé.
          </p>
        </div>
      </div>
    )
  }

  const quotaPercent = typeof keyInfo.dailyQuota === 'number'
    ? Math.round((keyInfo.requestsToday / keyInfo.dailyQuota) * 100)
    : 0

  const tierColor = keyInfo.tier === 'PREMIUM' ? '#7c3aed'
                  : keyInfo.tier === 'STARTER' ? '#0891b2'
                  : '#6b7280'

  return (
    <div className="container" style={{ maxWidth: '900px' }}>
      <h1 className="bookings-title">Mon API</h1>

      {/* Carte clé API */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ marginTop: 0, marginBottom: '.25rem' }}>🔑 Votre clé API</h2>
            <p style={{ margin: 0, color: 'var(--muted)', fontSize: '.88rem' }}>
              Utilisez cette clé pour authentifier vos requêtes à notre API.
            </p>
          </div>
          <span
            className="badge"
            style={{
              background: tierColor,
              color: 'white',
              padding: '.35rem .75rem',
              fontWeight: 700,
              fontSize: '.95rem'
            }}
          >
            {keyInfo.tier}
          </span>
        </div>

        <div style={{
          background: '#f3f4f6',
          padding: '.75rem 1rem',
          borderRadius: '8px',
          fontFamily: 'monospace',
          fontSize: '.95rem',
          wordBreak: 'break-all',
          border: '1px solid #d1d5db',
          marginBottom: '.75rem'
        }}>
          {showKey ? keyInfo.apiKey : maskKey(keyInfo.apiKey)}
        </div>

        <div style={{ display: 'flex', gap: '.5rem', flexWrap: 'wrap' }}>
          <button
            className="btn btn-outline btn-sm"
            onClick={() => setShowKey(!showKey)}
          >
            {showKey ? '🙈 Masquer' : '👁️ Afficher'}
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => copyToClipboard(keyInfo.apiKey)}
          >
            {copied ? '✓ Copié !' : '📋 Copier'}
          </button>
        </div>

        <p style={{ marginTop: '1rem', fontSize: '.82rem', color: 'var(--muted)' }}>
          ⚠️ Conservez votre clé secrète. Ne la partagez pas publiquement (dépôts GitHub, forums…).
          Si elle est compromise, contactez un administrateur pour la régénérer.
        </p>
      </div>

      {/* Carte quota */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
        <h2 style={{ marginTop: 0, marginBottom: '.75rem' }}>📊 Votre consommation</h2>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '.5rem', flexWrap: 'wrap' }}>
          <span style={{ color: 'var(--muted)' }}>Aujourd'hui</span>
          <strong>
            {keyInfo.requestsToday} / {keyInfo.dailyQuota === 'unlimited' || keyInfo.dailyQuota === -1 ? '∞' : keyInfo.dailyQuota} requêtes
          </strong>
        </div>

        {typeof keyInfo.dailyQuota === 'number' && (
          <div style={{
            background: '#e5e7eb',
            borderRadius: '999px',
            height: '12px',
            overflow: 'hidden',
            marginBottom: '.75rem'
          }}>
            <div style={{
              width: `${Math.min(quotaPercent, 100)}%`,
              height: '100%',
              background: quotaPercent >= 90 ? '#dc2626' : quotaPercent >= 70 ? '#f59e0b' : '#10b981',
              transition: 'width .3s'
            }} />
          </div>
        )}

        <p style={{ margin: 0, fontSize: '.82rem', color: 'var(--muted)' }}>
          Le compteur est remis à zéro automatiquement à minuit (Europe/Bruxelles).
        </p>
      </div>

      {/* Documentation */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
        <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>📚 Documentation</h2>

        <h3 style={{ fontSize: '1rem', marginBottom: '.5rem' }}>Endpoint disponible</h3>
        <div style={{
          background: '#f3f4f6',
          padding: '.75rem 1rem',
          borderRadius: '6px',
          fontFamily: 'monospace',
          marginBottom: '1rem',
          border: '1px solid #d1d5db'
        }}>
          <span style={{ color: '#059669', fontWeight: 700 }}>GET</span>{' '}
          http://localhost:8080/api/affiliate/shows?limit=20
        </div>

        <h3 style={{ fontSize: '1rem', marginBottom: '.5rem' }}>Authentification</h3>
        <p style={{ marginBottom: '.5rem' }}>
          Incluez votre clé dans le header HTTP <code style={{ background: '#f3f4f6', padding: '.1rem .35rem', borderRadius: '4px' }}>X-API-Key</code> :
        </p>

        <h3 style={{ fontSize: '1rem', marginBottom: '.5rem', marginTop: '1rem' }}>Exemple — cURL</h3>
        <pre style={{
          background: '#1f2937',
          color: '#f9fafb',
          padding: '1rem',
          borderRadius: '6px',
          overflow: 'auto',
          fontSize: '.82rem',
          lineHeight: 1.5
        }}>
{`curl -H "X-API-Key: ${showKey ? keyInfo.apiKey : 'votre_cle_api'}" \\
     http://localhost:8080/api/affiliate/shows?limit=10`}
        </pre>

        <h3 style={{ fontSize: '1rem', marginBottom: '.5rem', marginTop: '1rem' }}>Exemple — JavaScript (fetch)</h3>
        <pre style={{
          background: '#1f2937',
          color: '#f9fafb',
          padding: '1rem',
          borderRadius: '6px',
          overflow: 'auto',
          fontSize: '.82rem',
          lineHeight: 1.5
        }}>
{`fetch('http://localhost:8080/api/affiliate/shows?limit=10', {
  headers: {
    'X-API-Key': '${showKey ? keyInfo.apiKey : 'votre_cle_api'}'
  }
})
  .then(res => res.json())
  .then(data => console.log(data))`}
        </pre>

        <h3 style={{ fontSize: '1rem', marginBottom: '.5rem', marginTop: '1rem' }}>Exemple — Python (requests)</h3>
        <pre style={{
          background: '#1f2937',
          color: '#f9fafb',
          padding: '1rem',
          borderRadius: '6px',
          overflow: 'auto',
          fontSize: '.82rem',
          lineHeight: 1.5
        }}>
{`import requests

response = requests.get(
    'http://localhost:8080/api/affiliate/shows',
    headers={'X-API-Key': '${showKey ? keyInfo.apiKey : 'votre_cle_api'}'},
    params={'limit': 10}
)
print(response.json())`}
        </pre>
      </div>

      {/* Tarification */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h2 style={{ marginTop: 0, marginBottom: '1rem' }}>💎 Les niveaux d'affiliation</h2>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ textAlign: 'left', padding: '.5rem' }}>Niveau</th>
              <th style={{ textAlign: 'center', padding: '.5rem' }}>Quota</th>
              <th style={{ textAlign: 'left', padding: '.5rem' }}>Champs retournés</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #e5e7eb', background: keyInfo.tier === 'FREE' ? '#fef3c7' : 'transparent' }}>
              <td style={{ padding: '.75rem .5rem' }}><strong>FREE</strong></td>
              <td style={{ padding: '.75rem .5rem', textAlign: 'center' }}>10/jour</td>
              <td style={{ padding: '.75rem .5rem', fontSize: '.88rem' }}>id, titre, prochaine date</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e5e7eb', background: keyInfo.tier === 'STARTER' ? '#fef3c7' : 'transparent' }}>
              <td style={{ padding: '.75rem .5rem' }}><strong>STARTER</strong></td>
              <td style={{ padding: '.75rem .5rem', textAlign: 'center' }}>100/jour</td>
              <td style={{ padding: '.75rem .5rem', fontSize: '.88rem' }}>+ description, lieu, slug</td>
            </tr>
            <tr style={{ background: keyInfo.tier === 'PREMIUM' ? '#fef3c7' : 'transparent' }}>
              <td style={{ padding: '.75rem .5rem' }}><strong>PREMIUM</strong></td>
              <td style={{ padding: '.75rem .5rem', textAlign: 'center' }}>illimité</td>
              <td style={{ padding: '.75rem .5rem', fontSize: '.88rem' }}>+ places dispo, prix, image, artiste</td>
            </tr>
          </tbody>
        </table>

        <p style={{ marginTop: '1rem', fontSize: '.82rem', color: 'var(--muted)' }}>
          Pour passer à un niveau supérieur, contactez un administrateur.
        </p>
      </div>
    </div>
  )
}