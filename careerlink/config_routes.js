/**
 * ============================================================
 * CareerLink OS™ — Route Registry
 * Job Search Compliance Dashboard + Jobseeker Activity PWA
 * Powered by 4P3X Intelligent AI — Created by Kyzel Kreates
 * ============================================================
 */

export const ROUTES = {
  // ── Core ──────────────────────────────────────────────────
  ROOT:       '/',
  DASHBOARD:  '/dashboard',

  // ── Jobseekers ────────────────────────────────────────────
  JOBSEEKERS:        '/jobseekers',
  JOBSEEKER_PROFILE: '/jobseekers/:jobseekerId',

  // ── Weekly Activity ───────────────────────────────────────
  WEEKLY_ACTIVITY: '/weekly-activity',

  // ── Applications ──────────────────────────────────────────
  APPLICATIONS: '/applications',

  // ── Interviews ────────────────────────────────────────────
  INTERVIEWS: '/interviews',

  // ── Evidence ──────────────────────────────────────────────
  EVIDENCE: '/evidence',

  // ── Check-ins ─────────────────────────────────────────────
  CHECKINS: '/check-ins',

  // ── Tasks ─────────────────────────────────────────────────
  TASKS: '/tasks',

  // ── Support Risks ─────────────────────────────────────────
  SUPPORT_RISKS: '/support-risks',

  // ── CareerLink Support AI ─────────────────────────────────
  AI: '/ai',

  // ── Reports ───────────────────────────────────────────────
  REPORTS:       '/reports',
  REPORT_DETAIL: '/reports/:jobseekerId',

  // ── Jobseeker Setup / Invite ──────────────────────────────
  JOBSEEKER_SETUP: '/jobseeker-setup',

  // ── Jobseeker PWA ─────────────────────────────────────────
  JOBSEEKER_APP: '/jobseeker-app',

  // ── Settings ──────────────────────────────────────────────
  SETTINGS:              '/settings',
  SETTINGS_PROFILE:      '/settings/profile',
  SETTINGS_PROGRAMME:    '/settings/programme',
  SETTINGS_AI:           '/settings/ai',
  SETTINGS_SECURITY:     '/settings/security',
  SETTINGS_DEMO:         '/settings/demo',

  // ── Auth ──────────────────────────────────────────────────
  AUTH_LOGIN:    '/auth/login',
  AUTH_JOBSEEKER: '/auth/jobseeker',

  // ── Error ─────────────────────────────────────────────────
  NOT_FOUND: '*'
}

// ─── Nav structure for sidebar ────────────────────────────────
export const NAV_ITEMS = [
  {
    id:    'dashboard',
    label: 'Overview',
    route: ROUTES.DASHBOARD,
    icon:  'LayoutDashboard',
    group: 'core'
  },
  {
    id:    'jobseekers',
    label: 'Jobseekers',
    route: ROUTES.JOBSEEKERS,
    icon:  'Users',
    group: 'operations',
  },
  {
    id:    'weekly-activity',
    label: 'Weekly Activity',
    route: ROUTES.WEEKLY_ACTIVITY,
    icon:  'Clock',
    group: 'operations'
  },
  {
    id:    'applications',
    label: 'Applications',
    route: ROUTES.APPLICATIONS,
    icon:  'FileText',
    group: 'operations'
  },
  {
    id:    'interviews',
    label: 'Interviews',
    route: ROUTES.INTERVIEWS,
    icon:  'CalendarCheck',
    group: 'operations'
  },
  {
    id:    'check-ins',
    label: 'Check-ins',
    route: ROUTES.CHECKINS,
    icon:  'CheckSquare',
    group: 'operations'
  },
  {
    id:    'evidence',
    label: 'Evidence',
    route: ROUTES.EVIDENCE,
    icon:  'Paperclip',
    group: 'operations'
  },
  {
    id:    'tasks',
    label: 'Tasks',
    route: ROUTES.TASKS,
    icon:  'ListChecks',
    group: 'operations'
  },
  {
    id:        'jobseeker-setup',
    label:     'Invite Jobseeker',
    route:     ROUTES.JOBSEEKER_SETUP,
    icon:      'UserPlus',
    group:     'operations',
    highlight: true,
  },
  {
    id:        'ai',
    label:     'CareerLink AI',
    route:     ROUTES.AI,
    icon:      'Brain',
    group:     'intelligence',
    highlight: true
  },
  {
    id:    'support-risks',
    label: 'Support Risks',
    route: ROUTES.SUPPORT_RISKS,
    icon:  'ShieldAlert',
    group: 'intelligence'
  },
  {
    id:    'reports',
    label: 'Reports',
    route: ROUTES.REPORTS,
    icon:  'BarChart3',
    group: 'reporting'
  },
  {
    id:    'settings',
    label: 'Settings',
    route: ROUTES.SETTINGS,
    icon:  'Settings',
    group: 'system'
  }
]

export const NAV_GROUPS = {
  core:         { label: null,                   order: 0 },
  operations:   { label: 'Employment Support',   order: 1 },
  intelligence: { label: 'AI & Risk',            order: 2 },
  reporting:    { label: 'Reports & Evidence',   order: 3 },
  system:       { label: 'System',               order: 4 }
}

export default ROUTES
