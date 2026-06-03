/**
 * ============================================================
 * CareerLink OS™ — Auth Guard
 * Protects coach dashboard routes.
 * Powered by 4P3X Intelligent AI — Created by Kyzel Kreates
 * ============================================================
 */
import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from './core_storage'
import { authService } from './services_supabase_authService'

export default function AuthGuard({ children }) {
  const navigate  = useNavigate()
  const location  = useLocation()
  const isAuth    = useAuthStore(s => s.isAuthenticated)
  const session   = useAuthStore(s => s.session)

  useEffect(() => {
    // Try to restore session from localStorage
    const stored = authService.getSession()
    if (!stored) {
      navigate('/auth/login', { state: { from: location }, replace: true })
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // While checking, show nothing (avoids flash)
  const stored = authService.getSession()
  if (!stored && !session) return null

  return children
}
