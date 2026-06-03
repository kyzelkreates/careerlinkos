/**
 * ============================================================
 * CareerLink OS™ — 4P3X API Config Guard™
 * services_supabase_apiConfigGuard.js
 *
 * Blocks known backend-only secrets from ever appearing in
 * frontend code or localStorage. Safe for all environments.
 * Powered by 4P3X Intelligent AI — Created by Kyzel Kreates
 * ============================================================
 */

// ── Forbidden key names — backend-only secrets ────────────────
const FORBIDDEN_KEYS = [
  'SUPABASE_SERVICE_ROLE_KEY',
  'SERVICE_ROLE_KEY',
  'DATABASE_URL',
  'JWT_SECRET',
  'PRIVATE_KEY',
  'OPENAI_API_KEY',
  'GROQ_API_KEY',
  'ANTHROPIC_API_KEY',
  'STRIPE_SECRET_KEY',
  'WEBHOOK_SECRET',
  'ADMIN_TOKEN',
  'ADMIN_SECRET',
  'SECRET_KEY',
]

// ── Detect if a value looks like a real Supabase service role key ──
// Service role JWTs are longer than anon keys and contain "service_role"
function looksLikeServiceRoleKey(value) {
  if (typeof value !== 'string') return false
  if (value.length < 100) return false
  try {
    const payload = JSON.parse(atob(value.split('.')[1] || ''))
    return payload?.role === 'service_role'
  } catch { return false }
}

/**
 * Validate a frontend config object.
 * Returns { safe: boolean, warnings: string[] }
 */
export function validateFrontendConfig(config = {}) {
  const warnings = []

  for (const [key, value] of Object.entries(config)) {
    // Block forbidden key names
    if (FORBIDDEN_KEYS.some(fk => key.toUpperCase().includes(fk))) {
      warnings.push(`BLOCKED: "${key}" is a backend-only secret and must not be in frontend config.`)
      continue
    }
    // Block service role JWTs even if key name looks innocent
    if (looksLikeServiceRoleKey(value)) {
      warnings.push(`BLOCKED: "${key}" value looks like a Supabase service role JWT. Remove immediately.`)
    }
  }

  return {
    safe:     warnings.length === 0,
    warnings,
  }
}

/**
 * Validate the two allowed frontend Supabase env vars.
 * Returns { configured: boolean, url: string|null, anonKey: string|null, warnings: string[] }
 */
export function getValidatedSupabaseEnv() {
  const warnings = []

  const url     = import.meta?.env?.VITE_SUPABASE_URL     || ''
  const anonKey = import.meta?.env?.VITE_SUPABASE_ANON_KEY || ''

  // Warn if service role key accidentally appears in VITE_ vars
  const allViteKeys = Object.keys(import.meta?.env || {})
  for (const k of allViteKeys) {
    if (FORBIDDEN_KEYS.some(fk => k.toUpperCase().includes(fk))) {
      warnings.push(`SECURITY WARNING: "${k}" looks like a backend secret in VITE_ env vars. Remove immediately.`)
    }
    const val = import.meta.env[k]
    if (looksLikeServiceRoleKey(val)) {
      warnings.push(`SECURITY WARNING: "${k}" value looks like a service role JWT. Remove from frontend env.`)
    }
  }

  const urlOk  = typeof url === 'string' && url.trim().startsWith('https://')
  const keyOk  = typeof anonKey === 'string' && anonKey.trim().length > 20
  const configured = urlOk && keyOk

  return {
    configured,
    url:     configured ? url.trim()     : null,
    anonKey: configured ? anonKey.trim() : null,
    warnings,
  }
}

/**
 * Mask a key/url for safe display in UI (never expose full value)
 */
export function maskSecret(value, visibleChars = 8) {
  if (!value || typeof value !== 'string') return '(not set)'
  if (value.length <= visibleChars) return '••••••••'
  return value.slice(0, visibleChars) + '••••••••'
}

export default { validateFrontendConfig, getValidatedSupabaseEnv, maskSecret }
