/**
 * ============================================================
 * CareerLink OS™ — Settings
 * Programme config, weekly target, demo toggle, AI, security.
 * Powered by 4P3X Intelligent AI — Created by Kyzel Kreates
 * ============================================================
 */
import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Icon from './components_ui_Icon'
import { useConfigStore, useAuthStore, useAIStore } from './core_storage'
import { jobseekerService } from './services_careerlink_jobseekerService'
import { loadDemoData, removeDemoData } from './services_careerlink_demoData'
import { useDataStore } from './core_storage'
import { AI_PROVIDERS, AI_MODES, AI_DISCLAIMER, DEFAULT_AI_CONFIG } from './services_ai_aiConfig'
import { getCLSupabaseStatus, testCLSupabaseConnection } from './services_supabase_clSupabaseClient'

const TABS = [
  { key: 'profile',    label: 'Profile',      icon: 'User' },
  { key: 'programme',  label: 'Programme',    icon: 'Target' },
  { key: 'demo',       label: 'Demo Mode',    icon: 'FlaskConical' },
  { key: 'ai',         label: 'AI Providers', icon: 'Brain' },
  { key: 'security',   label: 'Security',     icon: 'Shield' },
  { key: 'backend',    label: 'Live Backend',  icon: 'Database' },
]

function SettingRow({ label, sub, children }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-slate-800/40 last:border-0">
      <div className="min-w-0 flex-1 mr-6">
        <div className="text-sm font-medium text-white">{label}</div>
        {sub && <div className="text-xs text-slate-500 mt-0.5">{sub}</div>}
      </div>
      <div className="flex-shrink-0">{children}</div>
    </div>
  )
}

function Toggle({ value, onChange }) {
  return (
    <button onClick={() => onChange(!value)}
      className={`relative w-10 rounded-full border transition-all ${value ? 'bg-[#d4af37]/20 border-[#d4af37]/40' : 'bg-slate-800 border-slate-700'}`}
      style={{height:'22px'}}>
      <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full transition-all ${value ? 'translate-x-4 bg-[#d4af37]' : 'bg-slate-600'}`}/>
    </button>
  )
}

function SectionHead({ label }) {
  return <div className="text-[10px] text-slate-600 tracking-widest uppercase font-semibold mb-3 mt-6 first:mt-0">{label}</div>
}

// ── Programme Panel ──────────────────────────────────────────
function ProgrammePanel() {
  const { config, updateConfig } = useConfigStore()
  const [form, setForm] = useState({ ...config })
  const [saved, setSaved] = useState(false)

  const set = (k, v) => setForm(f => ({...f, [k]: v}))

  const handleSave = () => {
    updateConfig(form)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      <SectionHead label="Organisation" />
      <SettingRow label="Organisation Name" sub="Displayed throughout the dashboard">
        <input value={form.organisationName} onChange={e => set('organisationName', e.target.value)}
          className="bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-1.5 text-sm text-white w-56 focus:outline-none focus:border-[#d4af37]/50"/>
      </SettingRow>

      <SectionHead label="Weekly Target" />
      <SettingRow label="Default Weekly Target Hours" sub="Applied to all new jobseekers. Individual targets can be overridden per jobseeker.">
        <input type="number" min="1" max="168" value={form.weeklyTargetHoursDefault}
          onChange={e => set('weeklyTargetHoursDefault', +e.target.value)}
          className="bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-1.5 text-sm text-white w-24 focus:outline-none focus:border-[#d4af37]/50"/>
      </SettingRow>
      <SettingRow label="Default Applications Target (weekly)" sub="Minimum weekly applications to flag if not met">
        <input type="number" min="0" max="50" value={form.applicationTargetDefault}
          onChange={e => set('applicationTargetDefault', +e.target.value)}
          className="bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-1.5 text-sm text-white w-24 focus:outline-none focus:border-[#d4af37]/50"/>
      </SettingRow>

      <SectionHead label="Check-ins" />
      <SettingRow label="Check-in Frequency" sub="How often jobseekers should complete a check-in">
        <select value={form.checkInFrequency} onChange={e => set('checkInFrequency', e.target.value)}
          className="bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#d4af37]/50">
          <option value="daily">Daily</option>
          <option value="twice_weekly">Twice weekly</option>
          <option value="weekly">Weekly</option>
        </select>
      </SettingRow>
      <SettingRow label="Evidence Required" sub="Flag jobseekers who have not uploaded supporting evidence">
        <Toggle value={form.evidenceRequired} onChange={v => set('evidenceRequired', v)}/>
      </SettingRow>

      <div className="mt-6 flex gap-3">
        <button onClick={handleSave}
          className="px-5 py-2.5 rounded-lg bg-[#d4af37] text-black text-sm font-semibold hover:bg-[#e6c34a] transition-colors">
          {saved ? '✓ Saved' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}

// ── Demo Panel ───────────────────────────────────────────────
function DemoPanel() {
  const { config, setDemoMode } = useConfigStore()
  const dataStore  = useDataStore()
  const isDemoMode = config.demoModeEnabled
  const [loading, setLoading] = useState(false)
  const [msg, setMsg]         = useState('')

  const handleToggle = (on) => {
    setLoading(true)
    setMsg('')
    setTimeout(() => {
      if (on) {
        loadDemoData(jobseekerService, dataStore)
        setDemoMode(true)
        setMsg('Demo mode ON — presentation data loaded.')
      } else {
        removeDemoData(jobseekerService, dataStore)
        setDemoMode(false)
        setMsg('Demo mode OFF — demo records removed. Real data mode active.')
      }
      setLoading(false)
    }, 400)
  }

  return (
    <div>
      <SectionHead label="Demo Mode"/>
      <div className="bg-[#0d1426] border border-slate-800/60 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-white">Demo Mode</div>
            <div className="text-xs text-slate-500 mt-0.5">
              {isDemoMode ? 'ON — showing demo/presentation data' : 'OFF — real data mode active'}
            </div>
          </div>
          <Toggle value={isDemoMode} onChange={handleToggle}/>
        </div>

        {isDemoMode ? (
          <div className="px-3 py-2.5 rounded-lg bg-amber-900/15 border border-amber-700/30">
            <p className="text-xs text-amber-300/80 leading-relaxed">
              <strong>Demo Mode is ON.</strong> Sample jobseekers and activity data are visible throughout the dashboard and PWA. All demo records are clearly marked [DEMO]. Turn off to switch to real data mode.
            </p>
          </div>
        ) : (
          <div className="px-3 py-2.5 rounded-lg bg-emerald-900/15 border border-emerald-700/30">
            <p className="text-xs text-emerald-300/80 leading-relaxed">
              <strong>Demo Mode is OFF.</strong> Only real data is shown. The dashboard will show empty states until real jobseekers and activity are added.
            </p>
          </div>
        )}

        {msg && (
          <div className="px-3 py-2 rounded-lg bg-slate-800/40 text-xs text-slate-300">{msg}</div>
        )}

        <div className="text-[10px] text-slate-600 leading-relaxed">
          Demo records are always marked with [DEMO] and are never mixed with real data in exports or reports.
          Turning demo mode off permanently removes all demo records from views — the underlying demo data can be reloaded at any time.
        </div>
      </div>
    </div>
  )
}

// ── Profile Panel ────────────────────────────────────────────
function ProfilePanel() {
  const user = useAuthStore(s => s.user)
  const [form, setForm] = useState({ full_name: user?.full_name || '', email: user?.email || '', username: user?.username || '' })
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    useAuthStore.getState().setUser({ ...user, ...form })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div>
      <SectionHead label="Coach / Advisor Profile"/>
      {[['full_name','Full Name'],['email','Email'],['username','Username']].map(([k,label]) => (
        <SettingRow key={k} label={label}>
          <input value={form[k]} onChange={e => setForm(f => ({...f,[k]:e.target.value}))}
            className="bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-1.5 text-sm text-white w-56 focus:outline-none focus:border-[#d4af37]/50"/>
        </SettingRow>
      ))}
      <div className="mt-6">
        <button onClick={handleSave}
          className="px-5 py-2.5 rounded-lg bg-[#d4af37] text-black text-sm font-semibold hover:bg-[#e6c34a] transition-colors">
          {saved ? '✓ Saved' : 'Save Profile'}
        </button>
      </div>
    </div>
  )
}

// ── AI Panel ─────────────────────────────────────────────────
function AIPanel() {
  const { provider, setProvider, config: aiConfig, setConfig } = useAIStore()
  const [aiMode, setAiMode] = useState(
    aiConfig?.aiMode ?? AI_MODES.LOCAL
  )
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    setConfig({ ...aiConfig, aiMode, providerName: provider })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const modeDesc = {
    [AI_MODES.OFF]:       'AI features are disabled. No insights, risk analysis, or AI chat.',
    [AI_MODES.LOCAL]:     'Local / Rule-based mode. Works fully offline. No API key required. Provides advisory insights and responses based on activity data.',
    [AI_MODES.API_READY]: 'API-Ready mode. Connects to your chosen provider when an API key is configured. Falls back to local mode if no key is set.',
  }[aiMode] || ''

  return (
    <div>
      <SectionHead label="4P3X CareerLink Intelligence Layer™"/>

      <SettingRow label="AI Mode" sub="Controls how CareerLink AI works">
        <select value={aiMode} onChange={e => setAiMode(e.target.value)}
          className="bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#d4af37]/50">
          <option value={AI_MODES.OFF}>OFF — Disabled</option>
          <option value={AI_MODES.LOCAL}>LOCAL / Rule-based (Offline, no key needed)</option>
          <option value={AI_MODES.API_READY}>API-READY (External provider)</option>
        </select>
      </SettingRow>

      {aiMode !== AI_MODES.OFF && (
        <SettingRow label="AI Provider" sub="Used only in API-READY mode">
          <select value={provider} onChange={e => setProvider(e.target.value)}
            className="bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-[#d4af37]/50">
            {Object.entries(AI_PROVIDERS).map(([k, v]) => (
              <option key={k} value={k}>{v.name}</option>
            ))}
          </select>
        </SettingRow>
      )}

      <div className="mt-3 px-4 py-3 rounded-xl bg-slate-900/40 border border-slate-800/40">
        <p className="text-[10px] text-slate-400 leading-relaxed font-medium mb-1">Current mode: <span className="text-[#d4af37]">{aiMode.toUpperCase().replace('-', ' ')}</span></p>
        <p className="text-[10px] text-slate-600 leading-relaxed">{modeDesc}</p>
      </div>

      <div className="mt-3 px-4 py-3 rounded-xl bg-amber-900/10 border border-amber-700/20">
        <p className="text-[10px] text-amber-300/70 leading-relaxed">{AI_DISCLAIMER}</p>
      </div>

      <div className="mt-4">
        <button onClick={handleSave}
          className="px-5 py-2.5 rounded-lg bg-[#d4af37] text-black text-sm font-semibold hover:bg-[#e6c34a] transition-colors">
          {saved ? '✓ Saved' : 'Save AI Settings'}
        </button>
      </div>
    </div>
  )
}

// ── Security Panel ───────────────────────────────────────────
function SecurityPanel() {
  const navigate = useNavigate()
  const handleLogout = () => {
    useAuthStore.getState().clearAuth()
    navigate('/auth/login')
  }
  return (
    <div>
      <SectionHead label="Session"/>
      <SettingRow label="Sign Out" sub="End your current coach session">
        <button onClick={handleLogout}
          className="px-4 py-2 rounded-lg bg-red-900/30 border border-red-700/40 text-red-400 text-sm font-medium hover:bg-red-900/50 transition-colors">
          Sign Out
        </button>
      </SettingRow>
      <SectionHead label="System"/>
      <div className="py-4 text-xs text-slate-500">
        <div>CareerLink OS™ v1.0.0</div>
        <div className="mt-1 text-[10px] text-slate-700">Powered by 4P3X Intelligent AI · Created by Kyzel Kreates</div>
        <div className="mt-3 leading-relaxed text-[10px] text-slate-700">
          CareerLink OS™ supports job-search tracking, evidence organisation, and employment support workflows.
          It does not replace official guidance, legal advice, benefits advice, medical advice, or human decision-making.
        </div>
      </div>
    </div>
  )
}

// ── Supabase / Live Backend Panel ───────────────────────────
function BackendPanel() {
  const navigate = useNavigate()
  const [status, setStatus] = React.useState(() => getCLSupabaseStatus())
  const [testing, setTesting] = React.useState(false)
  const [testResult, setTestResult] = React.useState(null)

  const GREEN  = '#22c55e'
  const RED    = '#ef4444'
  const AMBER  = '#f59e0b'
  const GOLD   = '#d4af37'

  async function handleTest() {
    setTesting(true)
    setTestResult(null)
    const result = await testCLSupabaseConnection()
    setTestResult(result)
    setStatus(getCLSupabaseStatus())
    setTesting(false)
  }

  const isConfigured = status.configured
  const statusColor  = isConfigured ? GREEN : AMBER

  return (
    <div>
      <SectionHead label="Supabase Live Backend"/>

      {/* Status */}
      <div className="flex items-center justify-between py-4 border-b border-slate-800/40">
        <div>
          <div className="text-sm font-medium text-white">Connection Status</div>
          <div className="text-xs text-slate-500 mt-0.5">
            {isConfigured ? 'Supabase is configured and ready.' : 'Supabase not configured — running in local / demo mode.'}
          </div>
        </div>
        <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg"
          style={{ background: `${statusColor}10`, border: `1px solid ${statusColor}25`, color: statusColor }}>
          <Icon name={isConfigured ? 'Wifi' : 'WifiOff'} size={11} />
          {isConfigured ? 'Configured' : 'Not Configured'}
        </span>
      </div>

      {/* URL */}
      <div className="flex items-center justify-between py-4 border-b border-slate-800/40">
        <div>
          <div className="text-sm font-medium text-white">Supabase URL</div>
          <div className="text-xs font-mono text-slate-500 mt-0.5">{status.urlMasked}</div>
        </div>
        <span className="text-[10px] text-slate-600">VITE_SUPABASE_URL</span>
      </div>

      {/* Anon key */}
      <div className="flex items-center justify-between py-4 border-b border-slate-800/40">
        <div>
          <div className="text-sm font-medium text-white">Anon Key</div>
          <div className="text-xs font-mono text-slate-500 mt-0.5">{status.keyMasked}</div>
        </div>
        <span className="text-[10px] text-slate-600">VITE_SUPABASE_ANON_KEY</span>
      </div>

      {/* Test connection */}
      <div className="py-4 border-b border-slate-800/40">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-medium text-white">Test Connection</div>
          <button onClick={handleTest} disabled={testing || !isConfigured}
            className="px-4 py-2 rounded-lg text-xs font-bold transition-all disabled:opacity-40"
            style={{ background: `${GOLD}12`, border: `1px solid ${GOLD}28`, color: GOLD }}>
            {testing ? 'Testing…' : 'Test Now'}
          </button>
        </div>
        {testResult && (
          <div className="px-3 py-2 rounded-lg text-xs"
            style={{
              background: testResult.ok ? `${GREEN}10` : `${RED}10`,
              border: `1px solid ${testResult.ok ? GREEN : RED}25`,
              color: testResult.ok ? GREEN : RED,
            }}>
            {testResult.ok ? '✓ Connection successful' : `✗ ${testResult.error}`}
          </div>
        )}
      </div>

      {/* Security warnings */}
      {status.warnings?.length > 0 && (
        <div className="py-4 border-b border-slate-800/40">
          <div className="text-sm font-medium mb-2" style={{ color: RED }}>Security Warnings</div>
          {status.warnings.map((w, i) => (
            <div key={i} className="text-xs px-3 py-2 rounded-lg mb-2"
              style={{ background: `${RED}08`, border: `1px solid ${RED}20`, color: RED }}>
              {w}
            </div>
          ))}
        </div>
      )}

      {/* How to configure */}
      {!isConfigured && (
        <div className="py-4">
          <div className="text-sm font-medium text-white mb-2">How to Enable Live Mode</div>
          <div className="text-xs text-slate-500 space-y-2 leading-relaxed">
            <p>1. Create a <strong className="text-slate-400">Supabase</strong> project at supabase.com</p>
            <p>2. Run <code className="text-amber-400 bg-slate-900/60 px-1 rounded">supabase_careerlinkos_schema.sql</code> in the SQL Editor</p>
            <p>3. Add to your <code className="text-amber-400 bg-slate-900/60 px-1 rounded">.env</code> file:</p>
            <div className="rounded-xl px-3 py-2 font-mono text-[11px]"
              style={{ background: '#060b16', border: '1px solid #1a2035', color: '#7dd3fc' }}>
              VITE_SUPABASE_URL=https://your-project.supabase.co<br/>
              VITE_SUPABASE_ANON_KEY=eyJhbG...
            </div>
            <p>4. Turn off Demo Mode in <strong className="text-slate-400">Settings → Demo Mode</strong></p>
            <p className="text-amber-500">⚠ Never add SUPABASE_SERVICE_ROLE_KEY to frontend .env files.</p>
          </div>
        </div>
      )}

      {/* Data source status */}
      <SectionHead label="Data Source"/>
      <div className="py-3 space-y-2">
        {[
          { label: 'Demo Mode ON',   desc: 'All data is local sample data. Supabase optional.',  active: !isConfigured },
          { label: 'Local Mode',     desc: 'Real data stored in localStorage. No Supabase.',      active: false },
          { label: 'Live Supabase',  desc: 'Real data synced to/from Supabase in real time.',      active: isConfigured },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
            style={{
              background: s.active ? `${GOLD}07` : '#070d1a',
              border: `1px solid ${s.active ? GOLD + '20' : '#1a2035'}`,
            }}>
            <div className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: s.active ? GOLD : '#334155' }} />
            <div>
              <div className="text-xs font-semibold" style={{ color: s.active ? GOLD : '#475569' }}>{s.label}</div>
              <div className="text-[10px] text-slate-700">{s.desc}</div>
            </div>
          </div>
        ))}
      </div>

      {/* MVP security note */}
      <div className="mt-4 rounded-xl px-4 py-3 text-[10px] leading-relaxed"
        style={{ background: '#070d1a', border: '1px solid #1a2035', color: '#475569' }}>
        <strong className="text-slate-500">MVP Access-Token Mode:</strong> CareerLink OS uses
        public PWA link tokens for jobseeker writes. Before handling sensitive live personal data
        at production scale, implement Supabase Auth (phone/email OTP) for stronger identity
        verification. See the SQL schema RLS policy comments for details.
      </div>

      {/* Full setup page link */}
      <div className="mt-4">
        <button
          onClick={() => navigate('/supabase-setup')}
          className="w-full flex items-center justify-between px-4 py-3.5 rounded-xl font-bold text-sm transition-all hover:brightness-110"
          style={{ background: '#d4af3715', border: '1px solid #d4af3730', color: '#d4af37' }}
        >
          <div className="flex items-center gap-2">
            <Icon name="ExternalLink" size={15} style={{ color: '#d4af37' }} />
            Live Backend Setup — Full Guide
          </div>
          <Icon name="ChevronRight" size={14} style={{ color: '#d4af3780' }} />
        </button>
      </div>
    </div>
  )
}

export default function Settings() {
  const { section } = useParams()
  const navigate    = useNavigate()
  const activeTab   = section || 'profile'

  const panels = { profile: ProfilePanel, programme: ProgrammePanel, demo: DemoPanel, ai: AIPanel, security: SecurityPanel, backend: BackendPanel }
  const Panel  = panels[activeTab] || ProfilePanel

  return (
    <div className="p-4 md:p-6 flex flex-col gap-5">
      <div>
        <h1 className="font-display font-bold text-white text-xl">Settings</h1>
        <p className="text-slate-500 text-sm mt-0.5">Programme configuration, demo data, and system settings.</p>
      </div>

      <div className="flex flex-wrap gap-1 p-1 bg-slate-900/60 border border-slate-800/40 rounded-xl">
        {TABS.map(t => (
          <button key={t.key} onClick={() => navigate(`/settings/${t.key}`)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${activeTab===t.key ? 'bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30' : 'text-slate-400 hover:text-white'}`}>
            <Icon name={t.icon} size={12}/>
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-[#0d1426] border border-slate-800/60 rounded-xl p-5">
        <Panel/>
      </div>
    </div>
  )
}
