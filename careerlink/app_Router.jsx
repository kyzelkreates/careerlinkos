/**
 * ============================================================
 * CareerLink OS™ — Application Router
 * Job Search Compliance Dashboard + Jobseeker Activity PWA
 * Powered by 4P3X Intelligent AI — Created by Kyzel Kreates
 * ============================================================
 */

import { createHashRouter, Navigate } from 'react-router-dom'
import AppShell    from './layouts_AppShell'
import AuthGuard   from './components_auth_AuthGuard'

// Auth Pages
import Login           from './pages_auth_Login'
import JobseekerLogin  from './pages_auth_JobseekerLogin'
import ResetConfirm    from './pages_auth_ResetConfirm'
import Setup           from './pages_auth_Setup'
import JobseekerSetup  from './pages_JobseekerSetup'
import JobseekerApp    from './pages_JobseekerApp'

// Dashboard Pages
import Dashboard       from './pages_Dashboard'
import Jobseekers      from './pages_Jobseekers'
import WeeklyActivity  from './pages_WeeklyActivity'
import Applications    from './pages_Applications'
import Interviews      from './pages_Interviews'
import Evidence        from './pages_Evidence'
import CheckIns        from './pages_CheckIns'
import Tasks           from './pages_Tasks'
import SupportRisks    from './pages_SupportRisks'
import Reports         from './pages_Reports'
import AIPage          from './pages_AI'
import Settings        from './pages_Settings'
import NotFound        from './pages_NotFound'

const setupDone = () => localStorage.getItem('cl:setup_complete') === 'true'

const RootRedirect = () =>
  setupDone()
    ? <Navigate to="/dashboard" replace />
    : <Navigate to="/auth/setup" replace />

const LoginOrSetup = ({ element }) =>
  !setupDone() ? <Navigate to="/auth/setup" replace /> : element

export const router = createHashRouter([
  // ── First-run Setup ──────────────────────────────────────
  { path: '/auth/setup',         element: <Setup /> },

  // ── Auth Routes ──────────────────────────────────────────
  { path: '/auth/login',         element: <LoginOrSetup element={<Login />} /> },
  { path: '/auth/jobseeker',     element: <LoginOrSetup element={<JobseekerLogin />} /> },
  { path: '/auth/reset-confirm', element: <ResetConfirm /> },

  // ── Standalone PWA (public — no auth guard) ───────────────
  { path: '/jobseeker-setup',    element: <JobseekerSetup /> },
  { path: '/jobseeker-app',      element: <JobseekerApp /> },

  // ── Protected Coach Dashboard ─────────────────────────────
  {
    path: '/',
    element: (
      <AuthGuard>
        <AppShell />
      </AuthGuard>
    ),
    children: [
      { index: true, element: <RootRedirect /> },

      // Core
      { path: 'dashboard',                      element: <Dashboard /> },

      // Employment Support
      { path: 'jobseekers',                     element: <Jobseekers /> },
      { path: 'jobseekers/:jobseekerId',        element: <Jobseekers /> },
      { path: 'weekly-activity',                element: <WeeklyActivity /> },
      { path: 'applications',                   element: <Applications /> },
      { path: 'interviews',                     element: <Interviews /> },
      { path: 'evidence',                       element: <Evidence /> },
      { path: 'check-ins',                      element: <CheckIns /> },
      { path: 'tasks',                          element: <Tasks /> },

      // AI & Risk
      { path: 'ai',                             element: <AIPage /> },
      { path: 'support-risks',                  element: <SupportRisks /> },

      // Reporting
      { path: 'reports',                        element: <Reports /> },
      { path: 'reports/:jobseekerId',           element: <Reports /> },

      // System
      { path: 'settings',                       element: <Settings /> },
      { path: 'settings/:section',              element: <Settings /> },
    ]
  },

  // ── 404 ──────────────────────────────────────────────────
  { path: '*', element: <NotFound /> }
])

export default router
