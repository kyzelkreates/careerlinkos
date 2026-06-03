/**
 * ============================================================
 * CareerLink OS™ — Jobseeker Login redirect
 * Redirects to the standalone Jobseeker PWA.
 * Powered by 4P3X Intelligent AI — Created by Kyzel Kreates
 * ============================================================
 */
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function JobseekerLogin() {
  const navigate = useNavigate()
  useEffect(() => { navigate('/jobseeker-app', { replace: true }) }, [navigate])
  return null
}
