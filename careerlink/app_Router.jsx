/**
 * ============================================================
 * CareerLink OS™ — Application Router v3
 * Job Search Compliance Dashboard + Jobseeker Activity PWA
 * Powered by 4P3X Intelligent AI — Created by Kyzel Kreates
 * ============================================================
 *
 * PUBLIC ACCESS — no login required.
 *
 * Route map (hash routing):
 *   /#/                       → LandingPage  (public entry)
 *   /#/pwa/:publicLinkId      → JobseekerPwa (link-based, per jobseeker)
 *   /#/jobseeker-setup        → JobseekerSetup (coach creates + shares link)
 *   /#/jobseeker-app          → JobseekerApp (legacy PIN-based, kept for compat)
 *   /#/dashboard              → Coach Dashboard
 *   /#/jobseekers             → Jobseeker list
 *   … all other coach routes  → inside AppShell
 *   /#/auth/*                 → Auth pages (preserved, not in main flow)
 * ============================================================
 */

import { createHashRouter } from 'react-router-dom'
import AppShell        from './layouts_AppShell'
import LandingPage     from './pages_Landing'

// ── Jobseeker PWA ─────────────────────────────────────────────
import JobseekerSetup  from './pages_JobseekerSetup'
import JobseekerApp    from './pages_JobseekerApp'    // legacy PIN-based (kept)
import JobseekerPwa    from './pages_JobseekerPwa'    // new link-based PWA
import SupabaseSetup         from './pages_SupabaseSetup'         // supabase-specific setup guide
import LiveBackendSettings  from './pages_LiveBackendSettings'  // multi-provider live backend settings

// ── Coach Dashboard pages ─────────────────────────────────────
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

// ── Auth pages (preserved, not in main flow) ──────────────────
import Login           from './pages_auth_Login'
import JobseekerLogin  from './pages_auth_JobseekerLogin'
import ResetConfirm    from './pages_auth_ResetConfirm'
import Setup           from './pages_auth_Setup'

export const router = createHashRouter([

  // ── Public landing page ─────────────────────────────────────
  {
    path: '/',
    element: <LandingPage />,
  },

  // ── Jobseeker PWA — link-based (new) ────────────────────────
  // Each jobseeker gets a unique link: /#/pwa/abc123xyz
  // No auth, no session — identity proven by public link token
  {
    path: '/pwa/:publicLinkId',
    element: <JobseekerPwa />,
  },

  // ── Jobseeker setup (coach creates new jobseeker + link) ─────
  {
    path: '/jobseeker-setup',
    element: <JobseekerSetup />,
  },

  // ── Supabase-specific setup guide ────────────────────────────
  {
    path: '/supabase-setup',
    element: <SupabaseSetup />,
  },

  // ── Multi-provider Live Backend Settings ─────────────────────
  {
    path: '/live-backend-settings',
    element: <LiveBackendSettings />,
  },

  // ── Legacy PIN-based Jobseeker App (kept for compat) ────────
  {
    path: '/jobseeker-app',
    element: <JobseekerApp />,
  },

  // ── Coach Dashboard (AppShell + Outlet) ─────────────────────
  // One layout wrapper — single Outlet — no nesting conflicts
  {
    element: <AppShell />,
    children: [
      { path: '/dashboard',                   element: <Dashboard /> },

      // Employment support pages
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

      // Reports
      { path: '/reports',                     element: <Reports /> },
      { path: '/reports/:jobseekerId',        element: <Reports /> },

      // Settings
      { path: '/settings',                    element: <Settings /> },
      { path: '/settings/:section',           element: <Settings /> },
    ],
  },

  // ── Auth routes (preserved, bypassed in normal flow) ────────
  { path: '/auth/setup',          element: <Setup /> },
  { path: '/auth/login',          element: <Login /> },
  { path: '/auth/jobseeker',      element: <JobseekerLogin /> },
  { path: '/auth/reset-confirm',  element: <ResetConfirm /> },

  // ── 404 ────────────────────────────────────────────────────
  { path: '*', element: <NotFound /> },

])

export default router
