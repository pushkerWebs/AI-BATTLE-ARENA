import { createContext, useContext, useState, useEffect, useCallback } from 'react'

import { API_BASE } from '../config'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(() => localStorage.getItem('arena_token') || null)
  const [loading, setLoading] = useState(true)

  // ── Verify token on mount ──────────────────────────────────────────────────
  useEffect(() => {
    if (!token) {
      setLoading(false)
      return
    }
    fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.status === 401) {
          localStorage.removeItem('arena_token')
          setToken(null)
          setUser(null)
          return null
        }
        if (!res.ok) throw new Error('Server error')
        return res.json()
      })
      .then((data) => {
        if (data && data.user) {
          setUser(data.user)
        }
      })
      .catch((err) => {
        console.warn('Could not verify session token (backend offline?):', err.message)
      })
      .finally(() => setLoading(false))
  }, [token])

  // ── Register ────────────────────────────────────────────────────────────────
  const register = useCallback(async ({ name, email, password }) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Registration failed')
    localStorage.setItem('arena_token', data.token)
    setToken(data.token)
    setUser(data.user)
    return data
  }, [])

  // ── Login ───────────────────────────────────────────────────────────────────
  const loginFn = useCallback(async ({ email, password }) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Login failed')
    localStorage.setItem('arena_token', data.token)
    setToken(data.token)
    setUser(data.user)
    return data
  }, [])

  // ── Google Login ───────────────────────────────────────────────────────────
  const googleLogin = useCallback(async (credential) => {
    const res = await fetch(`${API_BASE}/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ credential }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Google Login failed')
    localStorage.setItem('arena_token', data.token)
    setToken(data.token)
    setUser(data.user)
    return data
  }, [])

  // ── Update Avatar ──────────────────────────────────────────────────────────
  const updateAvatar = useCallback(async (avatarUrlOrSeed) => {
    if (!token) return
    const res = await fetch(`${API_BASE}/auth/avatar`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ avatar: avatarUrlOrSeed }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Failed to update avatar')
    setUser(data.user)
    return data.user
  }, [token])

  // ── Logout ──────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    localStorage.removeItem('arena_token')
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, loading, register, login: loginFn, logout, updateAvatar, googleLogin }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
