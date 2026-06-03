/**
 * ============================================================
 * CareerLink OS™ — Safe Supabase Client
 * services_supabase_clSupabaseClient.js
 *
 * Safe wrapper around @supabase/supabase-js.
 * Only initialises when VITE_SUPABASE_URL + VITE_SUPABASE_ANON_KEY exist.
 * Never throws an app-breaking error if keys are missing.
 * Never uses service role key.
 *
 * Powered by 4P3X Intelligent AI — Created by Kyzel Kreates
 * ============================================================
 */

import { createClient } from '@supabase/supabase-js'
import { getValidatedSupabaseEnv, maskSecret } from './services_supabase_apiConfigGuard'

// ── Singleton ─────────────────────────────────────────────────
let _client = null
let _status = 'unchecked' // 'unchecked' | 'configured' | 'not_configured' | 'error'
let _lastCheck = null

/**
 * Get (or create) the CareerLink Supabase client.
 * Returns null if env keys are missing or invalid — never throws.
 */
export function getCLSupabaseClient() {
  if (_client) return _client

  const env = getValidatedSupabaseEnv()

  if (env.warnings.length > 0) {
    env.warnings.forEach(w => console.warn('[CareerLink:Supabase]', w))
  }

  if (!env.configured) {
    _status = 'not_configured'
    return null
  }

  try {
    _client = createClient(env.url, env.anonKey, {
      auth: {
        persistSession:     false,  // No session persistence — PWA uses access tokens
        autoRefreshToken:   false,
        detectSessionInUrl: false,
      },
    })
    _status    = 'configured'
    _lastCheck = new Date().toISOString()
    console.info('[CareerLink:Supabase] ✓ Client ready', { url: maskSecret(env.url, 30) })
    return _client
  } catch (e) {
    _status = 'error'
    console.error('[CareerLink:Supabase] Client creation failed:', e.message)
    return null
  }
}

/**
 * Quick boolean — is the client ready?
 */
export function isCLSupabaseReady() {
  return getCLSupabaseClient() !== null
}

/**
 * Status object for display in Settings / status panels.
 */
export function getCLSupabaseStatus() {
  const env = getValidatedSupabaseEnv()
  getCLSupabaseClient() // trigger init if not done
  return {
    status:      _status,
    configured:  env.configured,
    urlMasked:   env.url ? maskSecret(env.url, 32) : '(not set)',
    keyMasked:   env.anonKey ? maskSecret(env.anonKey, 8) : '(not set)',
    lastCheck:   _lastCheck,
    warnings:    env.warnings,
  }
}

/**
 * Live connection test — safe, returns { ok, error } never throws.
 */
export async function testCLSupabaseConnection() {
  const client = getCLSupabaseClient()
  if (!client) return { ok: false, error: 'Supabase not configured — add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.' }

  try {
    const { error } = await client
      .from('organisations')
      .select('id')
      .limit(1)

    // These codes mean the server is reachable (schema/RLS issue, not network)
    const reachable = ['42P01', 'PGRST116', '42501', 'PGRST301', 'PGRST200']
    if (!error || reachable.includes(error.code)) {
      _status    = 'configured'
      _lastCheck = new Date().toISOString()
      return { ok: true, lastCheck: _lastCheck }
    }
    return { ok: false, error: error.message || 'Query failed' }
  } catch (e) {
    return { ok: false, error: e.message || 'Connection failed' }
  }
}

export default { getCLSupabaseClient, isCLSupabaseReady, getCLSupabaseStatus, testCLSupabaseConnection }
