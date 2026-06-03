/**
 * ============================================================
 * CareerLink OS™ — Application Router
 * Job Search Compliance Dashboard + Jobseeker Activity PWA
 * Powered by 4P3X Intelligent AI — Created by Kyzel Kreates
 * ============================================================
 *
 * PUBLIC ACCESS — no login required.
 * "/"               → LandingPage (public entry point)
 * "/dashboard"      → Coach Dashboard (AppShell)
 * "/jobseeker-app"  → Jobseeker Activity PWA
 *
 * Auth files are preserved in the codebase but are NOT in the
 * critical render path. AuthGuard is replaced by a transparent
 * passthrough so the dashboard renders without a session.
 * ============================================================
 */

import { createHashRouter, Navigate } from 'react-router-dom'
import AppShell       from './layouts_AppShell'
import LandingPage    from './pages_Landing'

// Jobseeker PWA
import JobseekerSetup from './pages_JobseekerSetup'
import JobseekerApp   from './pages_JobseekerApp'

// Dashboard Pages
import Dashboard      from './pages_Dashboard'
import Jobseekers     from './pages_Jobseekers'
import WeeklyActivity from './pages_WeeklyActivity'
import Applications   from './pages_Applications'
import Interviews     from './pages_Interviews'
import Evidence       from './pages_Evidence'
import CheckIns       from './pages_CheckIns'
import Tasks          from './pages_Tasks'
import SupportRisks   from './pages_SupportRisks'
import Reports        from './pages_Reports'
import AIPage         from './pages_AI'
import Settings       from './pages_Settings'
import NotFound       from './pages_NotFound'

// Auth pages — preserved but behind /auth/* (not in critical path)
import Login          from './pages_auth_Login'
import JobseekerLogin from './pages_auth_JobseekerLogin'
import ResetConfirm   from './pages_auth_ResetConfirm'
import Setup          from './pages_auth_Setup'

// ── Public passthrough (replaces AuthGuard) ───────────────
// The coach dashboard is publicly accessible in demo/product mode.
// Existing auth files are untouched — just no longer gatekeeping.
function PublicShell() {
  return <AppShell />
}

export const router = createHashRouter([
  // ── Public Landing Page (root entry point) ────────────────
  { path: '/', element: <LandingPage /> },

  // ── Standalone Jobseeker PWA (public) ─────────────────────
  { path: '/jobseeker-setup', element: <JobseekerSetup /> },
  { path: '/jobseeker-app',   element: <JobseekerApp /> },

  // ── Coach Dashboard (public — no auth gate) ───────────────
  {
    path: '/dashboard',
    element: <PublicShell />,
    children: [
      { index: true, element: <Dashboard /> },
    ]
  },
  {
    element: <PublicShell />,
    children: [
      // Core
      { path: 'dashboard',                    element: <Dashboard /> },

      // Employment Support
      { path: 'jobseekers',                   element: <Jobseekers /> },
      { path: 'jobseekers/:jobseekerId',      element: <Jobseekers /> },
      { path: 'weekly-activity',              element: <WeeklyActivity /> },
      { path: 'applications',                 element: <Applications /> },
      { path: 'interviews',                   element: <Interviews /> },
      { path: 'evidence',                     element: <Evidence /> },
      { path: 'check-ins',                    element: <CheckIns /> },
      { path: 'tasks',                        element: <Tasks /> },

      // AI & Risk
      { path: 'ai',                           element: <AIPage /> },
      { path: 'support-risks',                element: <SupportRisks /> },

      // Reporting
      { path: 'reports',                      element: <Reports /> },
      { path: 'reports/:jobseekerId',         element: <Reports /> },

      // System
      { path: 'settings',                     element: <Settings /> },
      { path: 'settings/:section',            element: <Settings /> },
    ]
  },

  // ── Auth Routes (preserved — accessible but not in main flow) ──
  { path: '/auth/setup',         element: <Setup /> },
  { path: '/auth/login',         element: <Login /> },
  { path: '/auth/jobseeker',     element: <JobseekerLogin /> },
  { path: '/auth/reset-confirm', element: <ResetConfirm /> },

  // ── 404 ──────────────────────────────────────────────────
  { path: '*', element: <NotFound /> },
])

export default router
