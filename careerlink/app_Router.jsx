/**
 * ============================================================
 * CareerLink OS™ — Application Router
 * Job Search Compliance Dashboard + Jobseeker Activity PWA
 * Powered by 4P3X Intelligent AI — Created by Kyzel Kreates
 * ============================================================
 *
 * PUBLIC ACCESS — no login required.
 *
 * Route map (hash routing):
 *   /#/                  → LandingPage  (public entry)
 *   /#/dashboard         → Coach Dashboard
 *   /#/jobseekers        → Jobseeker list
 *   /#/weekly-activity   → Weekly Activity
 *   /#/applications      → Applications
 *   /#/interviews        → Interviews
 *   /#/evidence          → Evidence
 *   /#/check-ins         → Check-ins
 *   /#/tasks             → Tasks
 *   /#/ai                → AI Assistants
 *   /#/support-risks     → Support & Risks
 *   /#/reports           → Reports
 *   /#/settings          → Settings
 *   /#/jobseeker-app     → Jobseeker PWA
 *   /#/jobseeker-setup   → Jobseeker Setup
 *   /#/auth/*            → Auth pages (preserved, not in main flow)
 *
 * AuthGuard is NOT used. All dashboard routes are public.
 * Auth files remain in the codebase but are not in the
 * critical render path.
 * ============================================================
 */

import { createHashRouter } from 'react-router-dom'
import AppShell        from './layouts_AppShell'
import LandingPage     from './pages_Landing'

// Jobseeker PWA
import JobseekerSetup  from './pages_JobseekerSetup'
import JobseekerApp    from './pages_JobseekerApp'

// Dashboard pages
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

// Auth pages — preserved at /auth/* but not in main user flow
import Login           from './pages_auth_Login'
import JobseekerLogin  from './pages_auth_JobseekerLogin'
import ResetConfirm    from './pages_auth_ResetConfirm'
import Setup           from './pages_auth_Setup'

export const router = createHashRouter([

  // ── Public landing page ─────────────────────────────────
  // This is the root entry point. No auth. No redirect.
  {
    path: '/',
    element: <LandingPage />,
  },

  // ── Standalone Jobseeker PWA (public, no shell) ─────────
  {
    path: '/jobseeker-setup',
    element: <JobseekerSetup />,
  },
  {
    path: '/jobseeker-app',
    element: <JobseekerApp />,
  },

  // ── Coach Dashboard (single layout wrapper + children) ──
  // AppShell renders <Outlet /> — one layout, one Outlet, no nesting.
  {
    element: <AppShell />,
    children: [
      // Dashboard is the default shell child
      { path: '/dashboard',                   element: <Dashboard /> },

      // Employment support
      { path: '/jobseekers',                  element: <Jobseekers /> },
      { path: '/jobseekers/:jobseekerId',     element: <Jobseekers /> },
      { path: '/weekly-activity',             element: <WeeklyActivity /> },
      { path: '/applications',                element: <Applications /> },
      { path: '/interviews',                  element: <Interviews /> },
      { path: '/evidence',                    element: <Evidence /> },
      { path: '/check-ins',                   element: <CheckIns /> },
      { path: '/tasks',                       element: <Tasks /> },

      // AI & risk
      { path: '/ai',                          element: <AIPage /> },
      { path: '/support-risks',               element: <SupportRisks /> },

      // Reporting
      { path: '/reports',                     element: <Reports /> },
      { path: '/reports/:jobseekerId',        element: <Reports /> },

      // System
      { path: '/settings',                    element: <Settings /> },
      { path: '/settings/:section',           element: <Settings /> },
    ],
  },

  // ── Auth routes (preserved, not in main flow) ──────────
  { path: '/auth/setup',          element: <Setup /> },
  { path: '/auth/login',          element: <Login /> },
  { path: '/auth/jobseeker',      element: <JobseekerLogin /> },
  { path: '/auth/reset-confirm',  element: <ResetConfirm /> },

  // ── 404 ────────────────────────────────────────────────
  { path: '*', element: <NotFound /> },

])

export default router
