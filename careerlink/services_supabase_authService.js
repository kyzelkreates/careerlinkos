/**
 * ============================================================
 * CareerLink OS™ — Local Auth Service
 * All credentials stored in localStorage. No Supabase needed.
 * Powered by 4P3X Intelligent AI — Created by Kyzel Kreates
 *
 * Storage keys:
 *   cl:accounts       — array of { id, username, email, password, role, fullName }
 *   cl:session        — { userId, role, email, username, fullName, expiresAt }
 *   cl:setup_complete — 'true' once initial account is created
 * ============================================================
 */

import { useAuthStore } from './core_storage'

const KEYS = {
  ACCOUNTS:       'cl:accounts',
  SESSION:        'cl:session',
  SETUP_COMPLETE: 'cl:setup_complete',
}

export const USER_ROLES = {
  ADMIN:   'admin',
  COACH:   'coach',
  VIEWER:  'viewer',
}

export const ROLE_LABELS = {
  admin:  'Admin',
  coach:  'Employment Coach',
  viewer: 'Viewer',
}

const getAccounts = () => {
  try { return JSON.parse(localStorage.getItem(KEYS.ACCOUNTS) || '[]') }
  catch { return [] }
}

const saveAccounts = (accounts) => {
  localStorage.setItem(KEYS.ACCOUNTS, JSON.stringify(accounts))
}

const getStoredSession = () => {
  try {
    const raw = localStorage.getItem(KEYS.SESSION)
    if (!raw) return null
    const session = JSON.parse(raw)
    if (session.expiresAt && Date.now() > session.expiresAt) {
      localStorage.removeItem(KEYS.SESSION)
      return null
    }
    return session
  } catch { return null }
}

const saveSession = (session) => {
  localStorage.setItem(KEYS.SESSION, JSON.stringify(session))
}

const genId = () => `usr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`

export const authService = {
  // ── Create a new account ──────────────────────────────────
  createAccount: ({ username, email, password, role = 'coach', fullName = '' }) => {
    const accounts = getAccounts()
    const existing = accounts.find(a =>
      a.username.toLowerCase() === username.toLowerCase() ||
      (email && a.email?.toLowerCase() === email.toLowerCase())
    )
    if (existing) return { error: { message: 'Username or email already exists.' } }

    const account = { id: genId(), username, email: email || '', password, role, fullName, createdAt: new Date().toISOString() }
    saveAccounts([...accounts, account])
    // Mark setup complete using the CareerLink key
    localStorage.setItem('cl:setup_complete', 'true')
    return { data: account, error: null }
  },

  // ── Sign in ───────────────────────────────────────────────
  signIn: async (usernameOrEmail, password) => {
    const accounts = getAccounts()
    const account = accounts.find(a =>
      (a.username.toLowerCase() === usernameOrEmail.toLowerCase() ||
       a.email?.toLowerCase() === usernameOrEmail.toLowerCase()) &&
      a.password === password
    )
    if (!account) return { data: null, error: { message: 'Invalid username or password.' } }

    const session = {
      userId:    account.id,
      username:  account.username,
      email:     account.email,
      role:      account.role,
      full_name: account.fullName || account.username,
      expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    }
    saveSession(session)
    useAuthStore.getState().setSession(session)
    useAuthStore.getState().setUser({ ...account, full_name: account.fullName || account.username })
    useAuthStore.getState().setRole(account.role)
    return { data: session, error: null }
  },

  // ── Sign out ──────────────────────────────────────────────
  signOut: async () => {
    localStorage.removeItem(KEYS.SESSION)
    useAuthStore.getState().clearAuth()
    return { error: null }
  },

  // ── Restore session on load ───────────────────────────────
  getSession: () => {
    const session = getStoredSession()
    if (session) {
      useAuthStore.getState().setSession(session)
      useAuthStore.getState().setUser({ full_name: session.full_name, username: session.username, email: session.email })
      useAuthStore.getState().setRole(session.role)
    }
    return session
  },

  // ── Check if setup is complete ────────────────────────────
  isSetupComplete: () => localStorage.getItem('cl:setup_complete') === 'true',

  // ── Update account ────────────────────────────────────────
  updateAccount: (userId, patch) => {
    const accounts = getAccounts()
    const updated  = accounts.map(a => a.id === userId ? { ...a, ...patch } : a)
    saveAccounts(updated)
    return { error: null }
  },
}

export default authService
