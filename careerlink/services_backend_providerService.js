/**
 * ============================================================
 * CareerLink OS™ — Backend Provider Service
 * services_backend_providerService.js
 *
 * Single routing layer for all backend operations.
 * Reads activeProvider from backendStore settings.
 * Routes Supabase actions to existing clSupabaseClient.
 * Firebase / AWS / Custom: config-only, adapter not installed.
 *
 * Safe for frontend — never uses service role keys.
 * Never crashes if provider is not configured.
 *
 * Powered by 4P3X Intelligent AI — Created by Kyzel Kreates
 * ============================================================
 */

import { getCLSupabaseClient, isCLSupabaseReady, testCLSupabaseConnection } from './services_supabase_clSupabaseClient'
import { fetchDashboardData as _fetchDashboardData } from './services_careerlink_liveDataService'

// ── Provider keys ─────────────────────────────────────────────
export const PROVIDER_KEYS = {
  SUPABASE: 'supabase',
  FIREBASE: 'firebase',
  AWS:      'aws',
  CUSTOM:   'custom',
}

// ── Provider display info ─────────────────────────────────────
export const PROVIDER_INFO = {
  supabase: {
    name:        'Supabase',
    icon:        'Database',
    color:       '#3ecf8e',
    description: 'Open-source Firebase alternative. Real-time Postgres database with RLS.',
    adapterStatus: 'live',       // real adapter is wired
    docsUrl:     'https://supabase.com/docs',
  },
  firebase: {
    name:        'Firebase',
    icon:        'Flame',
    color:       '#f59e0b',
    description: 'Google Firebase Firestore + Auth. Real-time document database.',
    adapterStatus: 'config_only', // configured but adapter not installed
    docsUrl:     'https://firebase.google.com/docs',
  },
  aws: {
    name:        'AWS / Amplify',
    icon:        'Cloud',
    color:       '#f97316',
    description: 'AWS Amplify, AppSync, or API Gateway. Use Cognito for identity.',
    adapterStatus: 'config_only',
    docsUrl:     'https://docs.amplify.aws',
  },
  custom: {
    name:        'Custom / Other',
    icon:        'Plug',
    color:       '#a855f7',
    description: 'Custom REST API, another database, or any public-safe backend endpoint.',
    adapterStatus: 'config_only',
    docsUrl:     null,
  },
}

// ── Read active provider settings from SSOT ───────────────────
function getBackendSettings() {
  try {
    const raw = localStorage.getItem('cl:config:backendSettings')
    if (!raw) return null
    return JSON.parse(raw)
  } catch { return null }
}

function getActiveProvider() {
  const s = getBackendSettings()
  return s?.activeProvider || 'supabase'
}

function getProviderConfig(providerKey) {
  const s = getBackendSettings()
  return s?.providers?.[providerKey] || {}
}

function isDemoMode() {
  try {
    const raw = localStorage.getItem('cl:config:app')
    if (!raw) return true
    return JSON.parse(raw)?.demoModeEnabled !== false
  } catch { return true }
}

// ── Provider status ───────────────────────────────────────────

/**
 * Get a full status object for a given provider.
 */
export function getProviderStatus(providerKey) {
  const info   = PROVIDER_INFO[providerKey]
  const config = getProviderConfig(providerKey)
  const demo   = isDemoMode()

  if (demo) {
    return {
      provider:       providerKey,
      name:           info?.name || providerKey,
      adapterStatus:  info?.adapterStatus || 'config_only',
      mode:           'demo',
      configured:     false,
      live:           false,
      statusLabel:    'Demo Mode ON',
      statusColor:    '#f59e0b',
      message:        'Demo mode is active. No backend required.',
    }
  }

  if (providerKey === PROVIDER_KEYS.SUPABASE) {
    const ready = isCLSupabaseReady()
    return {
      provider:      'supabase',
      name:          'Supabase',
      adapterStatus: 'live',
      mode:          'live',
      configured:    ready,
      live:          ready,
      statusLabel:   ready ? 'Supabase Connected' : 'Supabase Not Configured',
      statusColor:   ready ? '#22c55e' : '#f59e0b',
      message:       ready
        ? 'Supabase is configured and the adapter is active.'
        : 'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env, then redeploy.',
    }
  }

  // Firebase / AWS / Custom — config-only, no adapter installed yet
  const isEnabled = config?.enabled ?? false
  const hasRequiredField = providerKey === 'firebase'
    ? !!config?.apiKey
    : providerKey === 'aws'
      ? !!config?.apiEndpoint
      : !!config?.apiBaseUrl

  return {
    provider:       providerKey,
    name:           info?.name || providerKey,
    adapterStatus:  'config_only',
    mode:           'live',
    configured:     isEnabled && hasRequiredField,
    live:           false,   // adapter not installed — never pretend live
    statusLabel:    isEnabled && hasRequiredField ? 'Configured (adapter pending)' : 'Not Configured',
    statusColor:    isEnabled && hasRequiredField ? '#a855f7' : '#475569',
    message:        isEnabled && hasRequiredField
      ? `${info?.name} credentials are saved. Live adapter is not yet installed — data will not sync until the adapter is added.`
      : `${info?.name} is not configured. Fill in the settings and enable this provider.`,
  }
}

/**
 * Get status for the currently active provider.
 */
export function getActiveProviderStatus() {
  const key = getActiveProvider()
  return getProviderStatus(key)
}

// ── Connection test ───────────────────────────────────────────

/**
 * Test connection for any provider.
 * Only Supabase has a real test — others return adapter-pending.
 */
export async function testProviderConnection(providerKey) {
  if (providerKey === PROVIDER_KEYS.SUPABASE) {
    return await testCLSupabaseConnection()
  }

  const info   = PROVIDER_INFO[providerKey]
  const config = getProviderConfig(providerKey)

  // Validate that required fields are filled
  const hasField = providerKey === 'firebase'
    ? !!config?.apiKey && !!config?.projectId
    : providerKey === 'aws'
      ? !!config?.apiEndpoint
      : !!config?.apiBaseUrl

  if (!hasField) {
    return {
      ok:    false,
      error: `${info?.name} is not fully configured. Fill in the required fields first.`,
    }
  }

  return {
    ok:      null,  // null = not tested (adapter not installed)
    pending: true,
    message: `${info?.name} credentials are saved. Live adapter not installed yet — no real connection test available. Live sync will not occur until the adapter is added.`,
  }
}

// ── Data operations (routed by active provider) ───────────────

/**
 * Submit jobseeker activity to the active backend provider.
 * Only Supabase is actually wired — others return adapter-pending.
 */
export async function submitJobseekerActivity(activityRecord) {
  if (isDemoMode()) {
    return { ok: true, source: 'demo', message: 'Demo mode — activity stored locally.' }
  }

  const provider = getActiveProvider()

  if (provider === PROVIDER_KEYS.SUPABASE) {
    if (!isCLSupabaseReady()) {
      return { ok: false, error: 'Supabase not configured.', source: 'not_configured' }
    }
    try {
      const { data, error } = await getCLSupabaseClient()
        .from('activity_logs')
        .insert(activityRecord)
        .select()
        .single()
      return { ok: !error, data, error: error?.message, source: 'supabase' }
    } catch (e) {
      return { ok: false, error: e.message, source: 'error' }
    }
  }

  // Firebase / AWS / Custom — adapter not installed
  const name = PROVIDER_INFO[provider]?.name || provider
  return {
    ok:      false,
    pending: true,
    source:  provider,
    message: `${name} adapter not installed yet. Activity stored locally only.`,
  }
}

/**
 * Fetch coach dashboard data from the active backend provider.
 */
export async function fetchCoachDashboardData(opts = {}) {
  if (isDemoMode()) {
    return { data: null, source: 'demo', message: 'Demo mode — dashboard uses local data.' }
  }

  const provider = getActiveProvider()

  if (provider === PROVIDER_KEYS.SUPABASE) {
    // Delegate to existing liveDataService (imported statically below)
    return await _fetchDashboardData(opts)
  }

  const name = PROVIDER_INFO[provider]?.name || provider
  return {
    data:    null,
    pending: true,
    source:  provider,
    message: `${name} adapter not installed yet. Dashboard uses local/demo data.`,
  }
}

export default {
  PROVIDER_KEYS,
  PROVIDER_INFO,
  getActiveProvider,
  getProviderConfig,
  getProviderStatus,
  getActiveProviderStatus,
  testProviderConnection,
  submitJobseekerActivity,
  fetchCoachDashboardData,
}
