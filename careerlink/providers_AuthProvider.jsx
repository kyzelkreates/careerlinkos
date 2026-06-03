/**
 * ============================================================
 * CareerLink OS™ — Auth Provider
 * Restores session on app load.
 * Powered by 4P3X Intelligent AI — Created by Kyzel Kreates
 * ============================================================
 */
import { useEffect } from 'react'
import { authService } from './services_supabase_authService'

export default function AuthProvider({ children }) {
  useEffect(() => {
    // Restore existing session silently on load
    authService.getSession()
  }, [])

  return children
}
