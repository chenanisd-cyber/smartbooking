import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { authApi } from '../services/api'
import type { User } from '../types/models'

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (login: string, password: string) => Promise<void>
  logout: () => Promise<void>
  isAdmin: boolean
  isMember: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Try to restore session on page load
  useEffect(() => {
    authApi.getProfile()
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const login = async (login: string, password: string) => {
    await authApi.login(login, password)
    const profile = await authApi.getProfile()
    setUser(profile)
  }

  const logout = async () => {
    await authApi.logout()
    setUser(null)
  }

  const isAdmin = user?.roles.includes('admin') ?? false
  const isMember = user !== null

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAdmin, isMember }}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook for easy access
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
