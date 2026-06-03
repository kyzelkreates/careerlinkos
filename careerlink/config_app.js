/**
 * ============================================================
 * CareerLink OS™ — App Configuration
 * Job Search Compliance Dashboard + Jobseeker Activity PWA
 * Powered by 4P3X Intelligent AI — Created by Kyzel Kreates
 * ============================================================
 */

export const APP_CONFIG = {
  name:        'CareerLink OS™',
  shortName:   'CareerLink',
  version:     '1.0.0',
  buildStage:  'CareerLink OS™ — Employment Support Platform',
  tagline:     'Job Search Compliance Dashboard + Jobseeker Activity PWA',
  brand:       'Powered by 4P3X Intelligent AI — Created by Kyzel Kreates',

  products: {
    coachDashboard: {
      name:   'CareerLink Coach Dashboard',
      short:  'Coach Dashboard',
      route:  '/dashboard'
    },
    jobseekerPWA: {
      name:   'CareerLink Jobseeker PWA',
      short:  'Jobseeker App',
      route:  '/jobseeker-app'
    }
  },

  defaults: {
    weeklyTargetHours:       35,
    applicationTargetWeekly: 5,
    checkInFrequency:        'daily',
    evidenceRequired:        true,
    demoModeEnabled:         true,
    organisationName:        'CareerLink Employment Support'
  },

  theme: {
    default: 'dark',
    options: ['dark']
  },

  features: {
    sidebar:       true,
    topnav:        true,
    pwa:           true,
    routing:       true,
    auth:          true,
    ai:            true,
    offline:       true,
    notifications: true,
    demoToggle:    true,
    reports:       true,
    evidence:      true
  }
}

export default APP_CONFIG
