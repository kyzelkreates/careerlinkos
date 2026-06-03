/**
 * ============================================================
 * CareerLink OS™ — Live Backend Settings
 * pages_LiveBackendSettings.jsx
 *
 * Route: /#/live-backend-settings
 *
 * Multi-provider backend configuration panel.
 * Supports: Supabase (live), Firebase, AWS, Custom (config-only).
 *
 * Security:
 *   - Never stores backend-only secrets.
 *   - All field values are checked via checkFieldSafety() before save.
 *   - Service role keys, IAM secrets, service accounts blocked.
 *   - Masks stored values in UI.
 *
 * CareerLink OS Powered 4P3X Intelligent AI™ Created by Kyzel Kreates™
 * ============================================================
 */

import React, { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from './components_ui_Icon'
import PlatformCredit, { PlatformCreditBlock } from './components_ui_PlatformCredit'
import { useConfigStore, useBackendStore } from './core_storage'
import { checkFieldSafety, maskSecret } from './services_supabase_apiConfigGuard'
import { getCLSupabaseStatus, testCLSupabaseConnection } from './services_supabase_clSupabaseClient'
import { PROVIDER_INFO, getProviderStatus, testProviderConnection } from './services_backend_providerService'

// ── Palette ──────────────────────────────────────────────────
const GOLD    = '#d4af37'
const GREEN   = '#22c55e'
const RED     = '#ef4444'
const BLUE    = '#3b82f6'
const PURPLE  = '#a855f7'
const AMBER   = '#f59e0b'
const SILVER  = '#b0b8c8'
const SB_COL  = '#3ecf8e'
const FB_COL  = '#f59e0b'
const AWS_COL = '#f97316'

// ── UI helpers ────────────────────────────────────────────────
function Card({ children, border = `${SILVER}12`, pad = 'p-5 md:p-6' }) {
  return (
    <div className={`rounded-2xl ${pad}`}
      style={{ background: '#070d1a', border: `1px solid ${border}` }}>
      {children}
    </div>
  )
}

function SH({ icon, label, color = GOLD }) {
  return (
    <div className="flex items-center gap-2.5 mb-4">
      <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}12`, border: `1px solid ${color}25` }}>
        <Icon name={icon} size={12} style={{ color }} />
      </div>
      <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color }}>{label}</span>
    </div>
  )
}

function Label({ children, required }) {
  return (
    <label className="text-xs text-slate-400 font-medium mb-1.5 block">
      {children}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  )
}

function TextInput({ value, onChange, placeholder, type = 'text', warn }) {
  return (
    <div>
      <input
        type={type} value={value} onChange={onChange} placeholder={placeholder}
        className={`w-full bg-slate-900/60 border rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-700
          focus:outline-none focus:border-[#d4af37]/50 transition-colors
          ${warn ? 'border-red-500/60' : 'border-slate-700/50'}`}
      />
      {warn && (
        <div className="mt-1.5 flex items-start gap-1.5 text-xs" style={{ color: RED }}>
          <Icon name="ShieldAlert" size={11} style={{ color: RED, marginTop: 1, flexShrink: 0 }} />
          {warn}
        </div>
      )}
    </div>
  )
}

function Toggle({ value, onChange, label }) {
  return (
    <div className="flex items-center gap-3">
      <button onClick={() => onChange(!value)}
        className="relative flex-shrink-0 rounded-full border transition-all"
        style={{
          width: 40, height: 22,
          background: value ? `${GOLD}25` : '#1e293b',
          borderColor: value ? `${GOLD}50` : '#334155',
        }}>
        <span className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-all"
          style={{ transform: value ? 'translateX(18px)' : 'none', background: value ? GOLD : '#475569' }} />
      </button>
      {label && <span className="text-sm text-slate-300">{label}</span>}
    </div>
  )
}

function SaveBtn({ onClick, saved, disabled, color = GOLD }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:brightness-110 disabled:opacity-40"
      style={{ background: `${color}15`, border: `1px solid ${color}30`, color }}>
      <Icon name={saved ? 'CheckCircle2' : 'Save'} size={14} style={{ color }} />
      {saved ? 'Saved!' : 'Save Settings'}
    </button>
  )
}

function TestBtn({ onClick, testing, result, color = GREEN }) {
  return (
    <div className="flex flex-col gap-2">
      <button onClick={onClick} disabled={testing}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:brightness-110 disabled:opacity-40"
        style={{ background: `${color}12`, border: `1px solid ${color}25`, color }}>
        <Icon name={testing ? 'Loader' : 'Zap'} size={14} style={{ color }}
          className={testing ? 'animate-spin' : ''} />
        {testing ? 'Testing…' : 'Test Connection'}
      </button>
      {result && (
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl text-xs"
          style={{
            background: result.ok === true ? `${GREEN}08` : result.pending ? `${PURPLE}08` : `${RED}08`,
            border: `1px solid ${result.ok === true ? GREEN : result.pending ? PURPLE : RED}22`,
            color:  result.ok === true ? GREEN : result.pending ? PURPLE : RED,
          }}>
          <Icon name={result.ok === true ? 'CheckCircle2' : result.pending ? 'Info' : 'AlertCircle'} size={12}
            style={{ flexShrink: 0, marginTop: 1,
              color: result.ok === true ? GREEN : result.pending ? PURPLE : RED }} />
          {result.message || result.error || (result.ok ? 'Connected successfully.' : 'Connection failed.')}
        </div>
      )}
    </div>
  )
}

function StatusBadge({ status }) {
  const cfg = {
    live:            { color: GREEN,  icon: 'Wifi',       label: 'Live' },
    configured:      { color: GREEN,  icon: 'CheckCircle2',label: 'Configured' },
    config_pending:  { color: PURPLE, icon: 'Clock',      label: 'Config Pending' },
    not_configured:  { color: '#475569', icon: 'WifiOff', label: 'Not Configured' },
    demo:            { color: AMBER,  icon: 'FlaskConical',label: 'Demo Mode' },
    error:           { color: RED,    icon: 'AlertCircle',label: 'Error' },
  }[status] || { color: '#475569', icon: 'HelpCircle', label: status || '—' }
  return (
    <span className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg"
      style={{ background: `${cfg.color}10`, border: `1px solid ${cfg.color}22`, color: cfg.color }}>
      <Icon name={cfg.icon} size={10} style={{ color: cfg.color }} />
      {cfg.label}
    </span>
  )
}

function NotInstalled({ name }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3 rounded-xl text-sm"
      style={{ background: `${PURPLE}07`, border: `1px solid ${PURPLE}20`, color: PURPLE }}>
      <Icon name="Info" size={14} style={{ color: PURPLE, marginTop: 1, flexShrink: 0 }} />
      <div>
        <strong>{name} adapter not installed yet.</strong> You can save your {name} credentials here now.
        Live data sync will not occur until the {name} adapter package is added to the project.
        The app will continue using local/demo data in the meantime.
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// PROVIDER TABS
// ─────────────────────────────────────────────────────────────
const PROVIDERS = [
  { key: 'supabase', label: 'Supabase', color: SB_COL,  icon: 'Database' },
  { key: 'firebase', label: 'Firebase', color: FB_COL,  icon: 'Flame'    },
  { key: 'aws',      label: 'AWS',      color: AWS_COL, icon: 'Cloud'    },
  { key: 'custom',   label: 'Custom',   color: PURPLE,  icon: 'Plug'     },
]

// ─────────────────────────────────────────────────────────────
// SUPABASE PANEL
// ─────────────────────────────────────────────────────────────
function SupabasePanel({ settings, onUpdate }) {
  const p       = settings?.providers?.supabase || {}
  const sbLive  = getCLSupabaseStatus()
  const [form, setForm]   = useState({ url: p.url || '', anonKey: p.anonKey || '', projectRef: p.projectRef || '' })
  const [warns, setWarns] = useState({})
  const [saved, setSaved] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)

  function setField(k, v) {
    const check = checkFieldSafety(k === 'anonKey' ? 'VITE_SUPABASE_ANON_KEY' : k, v)
    setWarns(w => ({ ...w, [k]: check.warning }))
    if (check.safe) setForm(f => ({ ...f, [k]: v }))
  }

  function handleSave() {
    const anyWarn = Object.values(warns).some(Boolean)
    if (anyWarn) return
    onUpdate('supabase', { ...p, url: form.url, anonKey: form.anonKey, projectRef: form.projectRef, enabled: !!(form.url && form.anonKey) })
    setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  async function handleTest() {
    setTesting(true); setTestResult(null)
    const r = await testProviderConnection('supabase')
    setTestResult(r); setTesting(false)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3 flex-wrap">
        <StatusBadge status={sbLive.configured ? 'live' : 'not_configured'} />
        {sbLive.configured && (
          <span className="text-xs text-slate-500">URL: {sbLive.urlMasked}</span>
        )}
      </div>

      <div className="rounded-xl px-4 py-3 text-xs leading-relaxed"
        style={{ background: `${SB_COL}07`, border: `1px solid ${SB_COL}20`, color: '#6b7a94' }}>
        Supabase is the primary live backend for CareerLink OS™.
        Add <code className="text-amber-400 bg-slate-900/50 px-1 rounded">VITE_SUPABASE_URL</code> and{' '}
        <code className="text-amber-400 bg-slate-900/50 px-1 rounded">VITE_SUPABASE_ANON_KEY</code> to your
        Vercel / .env environment variables, then redeploy for them to take effect.
        These values cannot be stored in-app due to Vite's build-time env resolution.
      </div>

      {/* Env var display — current configured values */}
      <div className="space-y-3">
        <div>
          <Label>VITE_SUPABASE_URL</Label>
          <div className="rounded-xl px-4 py-2.5 font-mono text-xs break-all"
            style={{ background: '#060b16', border: '1px solid #1a2035', color: sbLive.configured ? SB_COL : '#334155' }}>
            {sbLive.configured ? sbLive.urlMasked : '(not set — add to .env or Vercel)'}
          </div>
        </div>
        <div>
          <Label>VITE_SUPABASE_ANON_KEY</Label>
          <div className="rounded-xl px-4 py-2.5 font-mono text-xs"
            style={{ background: '#060b16', border: '1px solid #1a2035', color: sbLive.configured ? SB_COL : '#334155' }}>
            {sbLive.configured ? sbLive.keyMasked : '(not set — add to .env or Vercel)'}
          </div>
        </div>
      </div>

      {/* Optional local storage fields (project ref etc) */}
      <div>
        <Label>Project Reference (optional)</Label>
        <TextInput value={form.projectRef} onChange={e => setField('projectRef', e.target.value)}
          placeholder="e.g. abcxyzproject123" warn={warns.projectRef} />
        <div className="mt-1 text-[10px] text-slate-700">
          Optional. Used for display and Supabase dashboard deep-links only.
        </div>
      </div>

      {/* Forbidden notice */}
      <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl text-xs"
        style={{ background: `${RED}07`, border: `1px solid ${RED}18`, color: RED }}>
        <Icon name="ShieldX" size={11} style={{ color: RED, marginTop: 1, flexShrink: 0 }} />
        Never enter SUPABASE_SERVICE_ROLE_KEY here. It must only exist in secure server-side environments.
      </div>

      <div className="flex gap-3 flex-wrap">
        <SaveBtn onClick={handleSave} saved={saved} />
        <TestBtn onClick={handleTest} testing={testing} result={testResult} color={SB_COL} />
      </div>

      <div className="pt-2">
        <button
          onClick={() => window.location.hash = '#/supabase-setup'}
          className="text-xs underline underline-offset-2 transition-colors hover:opacity-80"
          style={{ color: SB_COL + '90' }}>
          Full Supabase setup guide →
        </button>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// FIREBASE PANEL
// ─────────────────────────────────────────────────────────────
function FirebasePanel({ settings, onUpdate }) {
  const p = settings?.providers?.firebase || {}
  const [form, setForm] = useState({
    apiKey: p.apiKey || '', authDomain: p.authDomain || '',
    projectId: p.projectId || '', storageBucket: p.storageBucket || '',
    messagingSenderId: p.messagingSenderId || '', appId: p.appId || '',
    enabled: p.enabled ?? false,
  })
  const [warns, setWarns] = useState({})
  const [saved, setSaved] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)

  const FIELDS = [
    { key: 'apiKey',            label: 'VITE_FIREBASE_API_KEY',              guardKey: 'FIREBASE_SERVICE_ACCOUNT' },
    { key: 'authDomain',        label: 'VITE_FIREBASE_AUTH_DOMAIN',          guardKey: null },
    { key: 'projectId',         label: 'VITE_FIREBASE_PROJECT_ID',           guardKey: null },
    { key: 'storageBucket',     label: 'VITE_FIREBASE_STORAGE_BUCKET',       guardKey: null },
    { key: 'messagingSenderId', label: 'VITE_FIREBASE_MESSAGING_SENDER_ID',  guardKey: null },
    { key: 'appId',             label: 'VITE_FIREBASE_APP_ID',               guardKey: null },
  ]

  function setField(k, v) {
    const check = checkFieldSafety(k, v)
    setWarns(w => ({ ...w, [k]: check.warning }))
    if (check.safe) setForm(f => ({ ...f, [k]: v }))
  }

  function handleSave() {
    if (Object.values(warns).some(Boolean)) return
    onUpdate('firebase', { ...form, status: form.enabled && form.apiKey ? 'not_configured' : 'not_configured' })
    setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  async function handleTest() {
    setTesting(true); setTestResult(null)
    const r = await testProviderConnection('firebase')
    setTestResult(r); setTesting(false)
  }

  return (
    <div className="space-y-4">
      <NotInstalled name="Firebase" />
      <Toggle value={form.enabled} onChange={v => setForm(f => ({ ...f, enabled: v }))}
        label="Enable Firebase provider (saves config, adapter required for live sync)" />
      {FIELDS.map(f => (
        <div key={f.key}>
          <Label>{f.label}</Label>
          <TextInput value={form[f.key]} onChange={e => setField(f.key, e.target.value)}
            placeholder={`Enter ${f.label}`} warn={warns[f.key]} />
        </div>
      ))}
      <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl text-xs"
        style={{ background: `${RED}07`, border: `1px solid ${RED}18`, color: RED }}>
        <Icon name="ShieldX" size={11} style={{ color: RED, marginTop: 1, flexShrink: 0 }} />
        Never enter FIREBASE_SERVICE_ACCOUNT or GOOGLE_APPLICATION_CREDENTIALS here. Backend-only secrets only.
      </div>
      <div className="flex gap-3 flex-wrap">
        <SaveBtn onClick={handleSave} saved={saved} color={FB_COL} />
        <TestBtn onClick={handleTest} testing={testing} result={testResult} color={FB_COL} />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// AWS PANEL
// ─────────────────────────────────────────────────────────────
function AwsPanel({ settings, onUpdate }) {
  const p = settings?.providers?.aws || {}
  const [form, setForm] = useState({
    region: p.region || '', projectId: p.projectId || '',
    apiEndpoint: p.apiEndpoint || '', enabled: p.enabled ?? false,
  })
  const [warns, setWarns] = useState({})
  const [saved, setSaved] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)

  function setField(k, v) {
    const check = checkFieldSafety(k, v)
    setWarns(w => ({ ...w, [k]: check.warning }))
    if (check.safe) setForm(f => ({ ...f, [k]: v }))
  }

  function handleSave() {
    if (Object.values(warns).some(Boolean)) return
    onUpdate('aws', { ...form })
    setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  async function handleTest() {
    setTesting(true); setTestResult(null)
    const r = await testProviderConnection('aws')
    setTestResult(r); setTesting(false)
  }

  return (
    <div className="space-y-4">
      <NotInstalled name="AWS" />
      <div className="rounded-xl px-4 py-3 text-xs leading-relaxed"
        style={{ background: `${AWS_COL}07`, border: `1px solid ${AWS_COL}18`, color: '#6b7a94' }}>
        Use Cognito, Amplify public config, API Gateway, or a secure backend proxy.
        Do not store IAM user secrets (AWS_SECRET_ACCESS_KEY, AWS_ACCESS_KEY_ID) in frontend config.
      </div>
      <Toggle value={form.enabled} onChange={v => setForm(f => ({ ...f, enabled: v }))}
        label="Enable AWS provider (saves config, adapter required for live sync)" />
      <div>
        <Label>VITE_AWS_REGION</Label>
        <TextInput value={form.region} onChange={e => setField('region', e.target.value)}
          placeholder="e.g. eu-west-2" warn={warns.region} />
      </div>
      <div>
        <Label>VITE_AWS_PROJECT_ID / Amplify App ID (optional)</Label>
        <TextInput value={form.projectId} onChange={e => setField('projectId', e.target.value)}
          placeholder="e.g. d1abc2xyz" warn={warns.projectId} />
      </div>
      <div>
        <Label>VITE_AWS_API_ENDPOINT (API Gateway / AppSync)</Label>
        <TextInput value={form.apiEndpoint} onChange={e => setField('apiEndpoint', e.target.value)}
          placeholder="https://api.example.com" warn={warns.apiEndpoint} />
      </div>
      <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl text-xs"
        style={{ background: `${RED}07`, border: `1px solid ${RED}18`, color: RED }}>
        <Icon name="ShieldX" size={11} style={{ color: RED, marginTop: 1, flexShrink: 0 }} />
        Never enter AWS_SECRET_ACCESS_KEY, AWS_ACCESS_KEY_ID, or AWS_SESSION_TOKEN here.
      </div>
      <div className="flex gap-3 flex-wrap">
        <SaveBtn onClick={handleSave} saved={saved} color={AWS_COL} />
        <TestBtn onClick={handleTest} testing={testing} result={testResult} color={AWS_COL} />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// CUSTOM PANEL
// ─────────────────────────────────────────────────────────────
function CustomPanel({ settings, onUpdate }) {
  const p = settings?.providers?.custom || {}
  const [form, setForm] = useState({
    providerName: p.providerName || '', apiBaseUrl: p.apiBaseUrl || '',
    publicClientKey: p.publicClientKey || '', authMode: p.authMode || 'none',
    enabled: p.enabled ?? false,
  })
  const [warns, setWarns] = useState({})
  const [saved, setSaved] = useState(false)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState(null)

  function setField(k, v) {
    const check = checkFieldSafety(k, v)
    setWarns(w => ({ ...w, [k]: check.warning }))
    if (check.safe) setForm(f => ({ ...f, [k]: v }))
  }

  function handleSave() {
    if (Object.values(warns).some(Boolean)) return
    onUpdate('custom', { ...form })
    setSaved(true); setTimeout(() => setSaved(false), 2000)
  }

  async function handleTest() {
    setTesting(true); setTestResult(null)
    const r = await testProviderConnection('custom')
    setTestResult(r); setTesting(false)
  }

  return (
    <div className="space-y-4">
      <NotInstalled name="Custom" />
      <Toggle value={form.enabled} onChange={v => setForm(f => ({ ...f, enabled: v }))}
        label="Enable custom backend provider" />
      <div>
        <Label>Provider Name</Label>
        <TextInput value={form.providerName} onChange={e => setField('providerName', e.target.value)}
          placeholder="e.g. My API, MongoDB Atlas, PocketBase" warn={warns.providerName} />
      </div>
      <div>
        <Label>Public API Base URL</Label>
        <TextInput value={form.apiBaseUrl} onChange={e => setField('apiBaseUrl', e.target.value)}
          placeholder="https://api.example.com" warn={warns.apiBaseUrl} />
      </div>
      <div>
        <Label>Public Client Key (optional)</Label>
        <TextInput value={form.publicClientKey} onChange={e => setField('publicClientKey', e.target.value)}
          placeholder="Public/anon key only — not a secret" warn={warns.publicClientKey} />
      </div>
      <div>
        <Label>Auth Mode</Label>
        <select value={form.authMode} onChange={e => setForm(f => ({ ...f, authMode: e.target.value }))}
          className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#d4af37]/50">
          <option value="none">None — public endpoint</option>
          <option value="public_token">Public token</option>
          <option value="user_auth">User authentication</option>
          <option value="secure_proxy">Future secure proxy</option>
        </select>
      </div>
      <div className="flex gap-3 flex-wrap">
        <SaveBtn onClick={handleSave} saved={saved} color={PURPLE} />
        <TestBtn onClick={handleTest} testing={testing} result={testResult} color={PURPLE} />
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────
export default function LiveBackendSettings() {
  const navigate            = useNavigate()
  const config              = useConfigStore(s => s.config)
  const isDemoMode          = config?.demoModeEnabled ?? true
  const { settings, updateProvider, setActiveProvider } = useBackendStore()
  const [activeTab, setActiveTab] = useState(settings?.activeProvider || 'supabase')

  const handleSetProvider = (key) => {
    setActiveTab(key)
    setActiveProvider(key)
  }

  const handleUpdateProvider = useCallback((key, patch) => {
    updateProvider(key, patch)
  }, [updateProvider])

  const info  = PROVIDER_INFO[activeTab]
  const color = info?.color || GOLD

  return (
    <div className="min-h-screen bg-[#050810]">

      {/* ── TOP NAV ─────────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-[#050810]/95 backdrop-blur border-b border-slate-800/60 px-4 md:px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/settings/backend')}
              className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors">
              <Icon name="ArrowLeft" size={16} />
            </button>
            <div>
              <div className="text-base font-bold text-white">Live Backend Settings</div>
              <PlatformCredit opacity={0.5} />
            </div>
          </div>
          <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg"
            style={{
              background: isDemoMode ? `${AMBER}10` : `${GREEN}10`,
              border:     `1px solid ${isDemoMode ? AMBER : GREEN}22`,
              color:      isDemoMode ? AMBER : GREEN,
            }}>
            <Icon name={isDemoMode ? 'FlaskConical' : 'Wifi'} size={11} />
            {isDemoMode ? 'Demo Mode ON' : 'Live Mode'}
          </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 space-y-5">

        {/* ── HEADER CARD ─────────────────────────────────── */}
        <Card border={`${GOLD}18`}>
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${GOLD}10`, border: `1px solid ${GOLD}25` }}>
              <Icon name="Database" size={20} style={{ color: GOLD }} />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-lg md:text-xl font-bold text-white mb-1">Live Backend Settings</h1>
              <p className="text-sm text-slate-500 leading-relaxed">
                Configure the backend provider for CareerLink OS™ live data sync.
                Demo Mode uses local data — no backend required.
                Live Mode routes through your selected backend provider.
              </p>
              <div className="mt-3">
                <PlatformCredit size="xs" opacity={0.5} />
              </div>
            </div>
          </div>
        </Card>

        {/* ── PURPOSE / MODE EXPLANATION ──────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl p-4"
            style={{ background: isDemoMode ? `${AMBER}07` : '#0a101f', border: `1px solid ${isDemoMode ? AMBER : '#1e293b'}22` }}>
            <div className="flex items-center gap-2 mb-2">
              <Icon name="FlaskConical" size={13} style={{ color: AMBER }} />
              <span className="text-sm font-bold" style={{ color: AMBER }}>Demo Mode ON</span>
              {isDemoMode && <span className="text-[9px] px-1.5 py-0.5 rounded font-bold" style={{ background: `${AMBER}18`, color: AMBER }}>ACTIVE</span>}
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              All data is local sample data. No backend required.
              Jobseeker PWA writes to localStorage. App works fully offline.
            </p>
          </div>
          <div className="rounded-xl p-4"
            style={{ background: !isDemoMode ? `${GREEN}07` : '#0a101f', border: `1px solid ${!isDemoMode ? GREEN : '#1e293b'}22` }}>
            <div className="flex items-center gap-2 mb-2">
              <Icon name="Wifi" size={13} style={{ color: GREEN }} />
              <span className="text-sm font-bold" style={{ color: GREEN }}>Live Mode</span>
              {!isDemoMode && <span className="text-[9px] px-1.5 py-0.5 rounded font-bold" style={{ background: `${GREEN}18`, color: GREEN }}>ACTIVE</span>}
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Routes through the selected active backend. Supabase is the only live
              adapter wired. Firebase/AWS/Custom save config for future adapters.
            </p>
          </div>
        </div>

        {/* ── ACTIVE PROVIDER SELECTOR ────────────────────── */}
        <Card border={`${GOLD}15`}>
          <SH icon="Layers" label="Select Active Provider" color={GOLD} />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {PROVIDERS.map(p => {
              const isActive  = settings?.activeProvider === p.key
              const pInfo     = PROVIDER_INFO[p.key]
              return (
                <button key={p.key} onClick={() => handleSetProvider(p.key)}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl transition-all hover:brightness-110"
                  style={{
                    background: isActive ? `${p.color}12` : '#0a101f',
                    border:     `1px solid ${isActive ? p.color : '#1e293b'}${isActive ? '35' : '50'}`,
                  }}>
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: `${p.color}15`, border: `1px solid ${p.color}25` }}>
                    <Icon name={p.icon} size={17} style={{ color: p.color }} />
                  </div>
                  <div className="text-xs font-bold" style={{ color: isActive ? p.color : '#6b7a94' }}>
                    {p.label}
                  </div>
                  <div className="text-[9px] px-2 py-0.5 rounded font-semibold"
                    style={{
                      background: pInfo?.adapterStatus === 'live' ? `${GREEN}12` : `${PURPLE}10`,
                      color:      pInfo?.adapterStatus === 'live' ? GREEN : PURPLE,
                    }}>
                    {pInfo?.adapterStatus === 'live' ? 'Live ✓' : 'Config only'}
                  </div>
                </button>
              )
            })}
          </div>
          <div className="mt-3 text-[10px] text-slate-700">
            Only <strong className="text-slate-600">Supabase</strong> has a live adapter installed.
            Firebase, AWS, and Custom save configuration for future adapter installation.
          </div>
        </Card>

        {/* ── PROVIDER CONFIG TABS ────────────────────────── */}
        <div>
          {/* Tab headers */}
          <div className="flex gap-1 mb-0 overflow-x-auto pb-px">
            {PROVIDERS.map(p => (
              <button key={p.key} onClick={() => setActiveTab(p.key)}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-t-xl text-xs font-bold whitespace-nowrap transition-all"
                style={{
                  background: activeTab === p.key ? '#070d1a' : 'transparent',
                  border:     activeTab === p.key ? `1px solid ${p.color}25` : '1px solid transparent',
                  borderBottom: activeTab === p.key ? '1px solid #070d1a' : '1px solid transparent',
                  color:      activeTab === p.key ? p.color : '#475569',
                  marginBottom: activeTab === p.key ? '-1px' : '0',
                }}>
                <Icon name={p.icon} size={12} style={{ color: activeTab === p.key ? p.color : '#475569' }} />
                {p.label}
              </button>
            ))}
          </div>
          {/* Tab body */}
          <div className="rounded-b-2xl rounded-tr-2xl p-5 md:p-6"
            style={{ background: '#070d1a', border: `1px solid ${color}20` }}>
            <SH icon={info?.icon || 'Database'} label={`${info?.name || ''} Settings`} color={color} />
            {activeTab === 'supabase' && <SupabasePanel settings={settings} onUpdate={handleUpdateProvider} />}
            {activeTab === 'firebase' && <FirebasePanel settings={settings} onUpdate={handleUpdateProvider} />}
            {activeTab === 'aws'      && <AwsPanel      settings={settings} onUpdate={handleUpdateProvider} />}
            {activeTab === 'custom'   && <CustomPanel   settings={settings} onUpdate={handleUpdateProvider} />}
          </div>
        </div>

        {/* ── GLOBAL SECRET GUARD NOTICE ──────────────────── */}
        <Card border={`${RED}15`}>
          <SH icon="ShieldX" label="Forbidden Frontend Secrets" color={RED} />
          <p className="text-xs text-slate-500 mb-3 leading-relaxed">
            The following are backend-only secrets. Entering them in any frontend form is a critical
            security risk — they will be blocked and not saved.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {[
              'SUPABASE_SERVICE_ROLE_KEY','DATABASE_URL','JWT_SECRET','PRIVATE_KEY',
              'AWS_SECRET_ACCESS_KEY','AWS_ACCESS_KEY_ID','AWS_SESSION_TOKEN',
              'FIREBASE_SERVICE_ACCOUNT','GOOGLE_APPLICATION_CREDENTIALS',
              'OPENAI_API_KEY','STRIPE_SECRET_KEY','WEBHOOK_SECRET',
            ].map(k => (
              <div key={k} className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg font-mono text-[10px]"
                style={{ background: `${RED}06`, border: `1px solid ${RED}15`, color: RED + '99' }}>
                <Icon name="X" size={9} style={{ color: RED, flexShrink: 0 }} />
                {k}
              </div>
            ))}
          </div>
        </Card>

        {/* ── SAFETY WARNING ──────────────────────────────── */}
        <div className="flex items-start gap-3 px-5 py-4 rounded-2xl"
          style={{ background: `${AMBER}06`, border: `1px solid ${AMBER}18` }}>
          <Icon name="AlertTriangle" size={17} style={{ color: AMBER, marginTop: 1, flexShrink: 0 }} />
          <div className="text-xs leading-relaxed text-slate-500">
            <strong className="text-amber-400">Before production client use:</strong> Protect backend settings access,
            enable Supabase RLS, and validate all provider configurations.
            Missing credentials will not crash the app — it will show a "not configured" state.
          </div>
        </div>

        {/* ── NAVIGATION ──────────────────────────────────── */}
        <Card border={`${SILVER}12`}>
          <SH icon="Navigation" label="Navigate" color={SILVER} />
          <div className="flex flex-wrap gap-3">
            {[
              { label: 'Settings',         icon: 'Settings',       color: SILVER, to: '/settings/backend'  },
              { label: 'Coach Dashboard',  icon: 'LayoutDashboard', color: GOLD,   to: '/dashboard'         },
              { label: 'Jobseeker Setup',  icon: 'UserPlus',       color: GREEN,  to: '/jobseeker-setup'   },
              { label: 'Supabase Guide',   icon: 'ExternalLink',   color: SB_COL, to: '/supabase-setup'    },
              { label: 'Landing Page',     icon: 'Home',           color: BLUE,   to: '/'                  },
              { label: 'Demo Mode',        icon: 'FlaskConical',   color: AMBER,  to: '/settings/demo'     },
            ].map(b => (
              <button key={b.to} onClick={() => navigate(b.to)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:brightness-110"
                style={{ background: `${b.color}08`, border: `1px solid ${b.color}20`, color: b.color }}>
                <Icon name={b.icon} size={13} style={{ color: b.color }} />
                {b.label}
              </button>
            ))}
          </div>
        </Card>

        {/* ── FOOTER ──────────────────────────────────────── */}
        <div className="py-4">
          <PlatformCreditBlock align="center" opacity={0.3} />
        </div>

      </div>
    </div>
  )
}
