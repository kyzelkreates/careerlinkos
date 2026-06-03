/**
 * ============================================================
 * CareerLink OS™ — Supabase Live Backend Setup
 * pages_SupabaseSetup.jsx
 *
 * Route: /#/supabase-setup
 *
 * Dedicated page for configuring the Supabase live backend.
 * Explains demo vs live mode, required env vars, forbidden secrets,
 * setup checklist, SQL schema reference, and connection test.
 *
 * Safe for frontend — never uses service role key.
 * Missing Supabase config shows helpful guidance, never crashes.
 *
 * Powered by 4P3X Intelligent AI — Created by Kyzel Kreates
 * ============================================================
 */

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from './components_ui_Icon'
import { useConfigStore } from './core_storage'
import { getCLSupabaseStatus, testCLSupabaseConnection } from './services_supabase_clSupabaseClient'

// ── Palette ───────────────────────────────────────────────────
const GOLD   = '#d4af37'
const GREEN  = '#22c55e'
const RED    = '#ef4444'
const BLUE   = '#3b82f6'
const PURPLE = '#a855f7'
const AMBER  = '#f59e0b'
const SILVER = '#b0b8c8'

// ── Card wrapper ──────────────────────────────────────────────
function Card({ children, border = `${SILVER}12`, style = {} }) {
  return (
    <div className="rounded-2xl p-5 md:p-6"
      style={{ background: '#070d1a', border: `1px solid ${border}`, ...style }}>
      {children}
    </div>
  )
}

// ── Section heading ───────────────────────────────────────────
function SH({ icon, label, color = GOLD, step }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      {step && (
        <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs"
          style={{ background: `${color}15`, border: `1px solid ${color}30`, color }}>
          {step}
        </div>
      )}
      {!step && (
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: `${color}12`, border: `1px solid ${color}25` }}>
          <Icon name={icon} size={13} style={{ color }} />
        </div>
      )}
      <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color }}>
        {label}
      </span>
    </div>
  )
}

// ── Code block ────────────────────────────────────────────────
function Code({ children, color = AMBER }) {
  return (
    <pre className="rounded-xl px-4 py-3 text-xs font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap break-all"
      style={{ background: '#060b16', border: '1px solid #1a2035', color }}>
      {children}
    </pre>
  )
}

// ── Status badge ──────────────────────────────────────────────
function Badge({ ok, labelYes = 'Yes', labelNo = 'No' }) {
  return (
    <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-lg"
      style={{
        background: ok ? `${GREEN}10` : `${RED}10`,
        border:     `1px solid ${ok ? GREEN : RED}28`,
        color:      ok ? GREEN : RED,
      }}>
      <Icon name={ok ? 'CheckCircle2' : 'XCircle'} size={11} style={{ color: ok ? GREEN : RED }} />
      {ok ? labelYes : labelNo}
    </span>
  )
}

// ── Row ───────────────────────────────────────────────────────
function Row({ label, sub, right }) {
  return (
    <div className="flex items-center justify-between py-3.5 border-b border-slate-800/40 last:border-0">
      <div className="min-w-0 flex-1 mr-4">
        <div className="text-sm font-medium text-white">{label}</div>
        {sub && <div className="text-xs text-slate-500 mt-0.5">{sub}</div>}
      </div>
      <div className="flex-shrink-0">{right}</div>
    </div>
  )
}

// ── Checklist item ────────────────────────────────────────────
function CheckItem({ label, done = false }) {
  return (
    <div className="flex items-start gap-3 py-2">
      <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{
          background: done ? `${GREEN}15` : '#0f172a',
          border: `1px solid ${done ? GREEN : '#1e293b'}28`,
        }}>
        {done && <Icon name="Check" size={11} style={{ color: GREEN }} />}
      </div>
      <span className={`text-sm leading-relaxed ${done ? 'line-through text-slate-600' : 'text-slate-300'}`}>
        {label}
      </span>
    </div>
  )
}

// ── Nav button ────────────────────────────────────────────────
function NavBtn({ label, icon, color = SILVER, onClick }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all hover:brightness-110 active:scale-[0.98]"
      style={{ background: `${color}10`, border: `1px solid ${color}25`, color }}>
      <Icon name={icon} size={14} style={{ color }} />
      {label}
    </button>
  )
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────
export default function SupabaseSetup() {
  const navigate   = useNavigate()
  const config     = useConfigStore(s => s.config)
  const isDemoMode = config?.demoModeEnabled ?? true

  const [sbStatus,    setSbStatus]    = useState(() => getCLSupabaseStatus())
  const [testing,     setTesting]     = useState(false)
  const [testResult,  setTestResult]  = useState(null)
  const [checkedAt,   setCheckedAt]   = useState(null)

  // Re-read status on mount
  useEffect(() => {
    setSbStatus(getCLSupabaseStatus())
    setCheckedAt(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
  }, [])

  async function handleTest() {
    setTesting(true)
    setTestResult(null)
    const result = await testCLSupabaseConnection()
    setTestResult(result)
    setSbStatus(getCLSupabaseStatus())
    setCheckedAt(new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
    setTesting(false)
  }

  const isConfigured = sbStatus?.configured ?? false
  const statusColor  = isConfigured ? GREEN : AMBER

  return (
    <div className="min-h-screen bg-[#050810]">

      {/* ── TOP NAV ────────────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-[#050810]/95 backdrop-blur border-b border-slate-800/60 px-4 md:px-6 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/live-backend-settings')}
              className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors">
              <Icon name="ArrowLeft" size={16} />
            </button>
            <div>
              <div className="text-base font-bold text-white">Supabase Setup</div>
              <div className="text-[10px]" style={{ color: GOLD + '80' }}>
                Powered by 4P3X Intelligent AI — Created by Kyzel Kreates
              </div>
            </div>
          </div>
          <span className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-lg"
            style={{ background: `${statusColor}10`, border: `1px solid ${statusColor}22`, color: statusColor }}>
            <Icon name={isConfigured ? 'Wifi' : 'WifiOff'} size={11} />
            {isConfigured ? 'Supabase Ready' : 'Not Configured'}
          </span>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 space-y-5">

        {/* ── HEADER ─────────────────────────────────────── */}
        <Card border={`${GOLD}20`}>
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${GOLD}10`, border: `1px solid ${GOLD}25` }}>
              <Icon name="Database" size={22} style={{ color: GOLD }} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white mb-1">
                CareerLink OS™ — Live Backend Setup
              </h1>
              <p className="text-sm text-slate-500 leading-relaxed">
                Connect your Supabase project to enable live data sync between the
                Jobseeker PWA and the Coach Dashboard.
              </p>
              <div className="mt-3 text-[11px] font-semibold" style={{ color: GOLD + '99' }}>
                Powered by 4P3X Intelligent AI — Created by Kyzel Kreates
              </div>
            </div>
          </div>
        </Card>

        {/* ── DEMO vs LIVE EXPLANATION ────────────────────── */}
        <Card border={`${PURPLE}18`}>
          <SH icon="Info" label="Demo Mode vs Live Mode" color={PURPLE} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl p-4 space-y-2"
              style={{ background: `${AMBER}07`, border: `1px solid ${AMBER}20` }}>
              <div className="flex items-center gap-2 mb-2">
                <Icon name="FlaskConical" size={14} style={{ color: AMBER }} />
                <span className="text-sm font-bold" style={{ color: AMBER }}>Demo Mode ON</span>
                {isDemoMode && <span className="text-[9px] font-bold px-2 py-0.5 rounded" style={{ background: `${AMBER}18`, color: AMBER }}>ACTIVE</span>}
              </div>
              <ul className="space-y-1.5">
                {[
                  'Uses local sample data only',
                  'Supabase is optional — not required',
                  'PWA writes to localStorage',
                  'Dashboard reads local demo records',
                  'Safe for demos and presentations',
                ].map((t, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                    <Icon name="Check" size={10} style={{ color: AMBER, marginTop: 2, flexShrink: 0 }} />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl p-4 space-y-2"
              style={{ background: `${GREEN}07`, border: `1px solid ${GREEN}20` }}>
              <div className="flex items-center gap-2 mb-2">
                <Icon name="Wifi" size={14} style={{ color: GREEN }} />
                <span className="text-sm font-bold" style={{ color: GREEN }}>Demo Mode OFF (Live)</span>
                {!isDemoMode && <span className="text-[9px] font-bold px-2 py-0.5 rounded" style={{ background: `${GREEN}18`, color: GREEN }}>ACTIVE</span>}
              </div>
              <ul className="space-y-1.5">
                {[
                  'Requires Supabase to be configured',
                  'Jobseeker PWA submits to Supabase',
                  'Coach Dashboard reads live Supabase data',
                  'Weekly hours auto-calculated in DB',
                  'Shows "not configured" if keys missing',
                ].map((t, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-400">
                    <Icon name="Check" size={10} style={{ color: GREEN, marginTop: 2, flexShrink: 0 }} />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Card>

        {/* ── SUPABASE STATUS PANEL ───────────────────────── */}
        <Card border={`${statusColor}20`}>
          <SH icon="Activity" label="Supabase Status" color={statusColor} />
          <Row
            label="Supabase URL"
            sub={sbStatus?.urlMasked || '(not set)'}
            right={<Badge ok={sbStatus?.configured} labelYes="Configured" labelNo="Missing" />}
          />
          <Row
            label="Anon Key (VITE_SUPABASE_ANON_KEY)"
            sub={sbStatus?.keyMasked || '(not set)'}
            right={<Badge ok={sbStatus?.configured} labelYes="Configured" labelNo="Missing" />}
          />
          <Row
            label="Service Role Key in Frontend"
            sub="Must never be exposed in frontend code"
            right={
              sbStatus?.warnings?.length > 0
                ? <Badge ok={false} labelNo="DETECTED — REMOVE" />
                : <Badge ok={true} labelYes="Not Detected ✓" />
            }
          />
          <Row
            label="Connection Status"
            sub={checkedAt ? `Last checked: ${checkedAt}` : 'Not yet tested this session'}
            right={
              <Badge
                ok={isConfigured}
                labelYes={testResult?.ok === true ? 'Connected ✓' : 'Configured'}
                labelNo="Not Configured"
              />
            }
          />
          <Row
            label="Current Data Mode"
            sub="Controlled by Demo Mode toggle in Settings → Demo Mode"
            right={
              <span className="text-xs font-bold px-3 py-1 rounded-lg"
                style={{
                  background: isDemoMode ? `${AMBER}10` : `${GREEN}10`,
                  border: `1px solid ${isDemoMode ? AMBER : GREEN}25`,
                  color: isDemoMode ? AMBER : GREEN,
                }}>
                {isDemoMode ? 'Demo Mode ON' : 'Live Mode'}
              </span>
            }
          />

          {/* Security warnings */}
          {sbStatus?.warnings?.length > 0 && (
            <div className="mt-3 space-y-2">
              {sbStatus.warnings.map((w, i) => (
                <div key={i} className="flex items-start gap-2 px-3 py-2.5 rounded-lg text-xs"
                  style={{ background: `${RED}08`, border: `1px solid ${RED}20`, color: RED }}>
                  <Icon name="ShieldAlert" size={12} style={{ color: RED, marginTop: 1, flexShrink: 0 }} />
                  {w}
                </div>
              ))}
            </div>
          )}

          {/* Test connection button */}
          <div className="mt-4 flex items-center gap-3 flex-wrap">
            <button onClick={handleTest} disabled={testing}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all hover:brightness-110 disabled:opacity-50"
              style={{ background: `${GOLD}15`, border: `1px solid ${GOLD}35`, color: GOLD }}>
              <Icon name={testing ? 'Loader' : 'Zap'} size={14} style={{ color: GOLD }}
                className={testing ? 'animate-spin' : ''} />
              {testing ? 'Testing connection…' : 'Test Supabase Connection'}
            </button>
            {!isConfigured && !testing && (
              <span className="text-xs text-slate-600">
                Add env vars first — see setup steps below
              </span>
            )}
          </div>

          {/* Test result */}
          {testResult && (
            <div className="mt-3 flex items-start gap-2 px-4 py-3 rounded-xl text-sm"
              style={{
                background: testResult.ok ? `${GREEN}08` : `${RED}08`,
                border: `1px solid ${testResult.ok ? GREEN : RED}25`,
                color: testResult.ok ? GREEN : RED,
              }}>
              <Icon name={testResult.ok ? 'CheckCircle2' : 'AlertCircle'} size={15} style={{ color: testResult.ok ? GREEN : RED, marginTop: 1, flexShrink: 0 }} />
              <div>
                {testResult.ok
                  ? 'Connection successful — Supabase is reachable and responding.'
                  : testResult.error || 'Connection failed. Check your URL and anon key.'}
              </div>
            </div>
          )}
        </Card>

        {/* ── SETUP CHECKLIST ────────────────────────────── */}
        <Card border={`${BLUE}18`}>
          <SH icon="ListChecks" label="Setup Checklist" color={BLUE} />
          <div className="space-y-0.5">
            <CheckItem label="Create a Supabase project at supabase.com" done={isConfigured} />
            <CheckItem label="Copy your Supabase Project URL from Settings → API" done={isConfigured} />
            <CheckItem label="Copy your Supabase anon public key from Settings → API" done={isConfigured} />
            <CheckItem label="Add VITE_SUPABASE_URL to your .env or Vercel environment variables" done={isConfigured} />
            <CheckItem label="Add VITE_SUPABASE_ANON_KEY to your .env or Vercel environment variables" done={isConfigured} />
            <CheckItem label="Run supabase_careerlinkos_schema.sql in the Supabase SQL Editor" />
            <CheckItem label="Redeploy app (so VITE_ env vars are baked in)" />
            <CheckItem label="Return to this page and press 'Test Supabase Connection'" done={testResult?.ok === true} />
            <CheckItem label="Turn Demo Mode OFF in Settings → Demo Mode" done={!isDemoMode} />
            <CheckItem label="Go to Jobseeker Setup → create a jobseeker → share their PWA link" />
            <CheckItem label="Submit test activity from the Jobseeker PWA" />
            <CheckItem label="Confirm Coach Dashboard shows the submitted activity" />
          </div>
        </Card>

        {/* ── ENVIRONMENT VARIABLES ──────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Required */}
          <Card border={`${GREEN}18`}>
            <SH icon="Key" label="Required Frontend Env Vars" color={GREEN} />
            <p className="text-xs text-slate-500 mb-3 leading-relaxed">
              Add these to your <code className="text-amber-400 bg-slate-900/50 px-1 rounded">.env</code> file
              or Vercel project environment variables. These are the <strong className="text-slate-300">only</strong> Supabase keys permitted in frontend code.
            </p>
            <Code color={GREEN}>
{`VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...`}
            </Code>
            <div className="mt-3 text-xs text-slate-600">
              After adding, redeploy your app so Vite can bake these into the bundle.
            </div>
          </Card>

          {/* Forbidden */}
          <Card border={`${RED}18`}>
            <SH icon="ShieldX" label="NEVER in Frontend .env" color={RED} />
            <p className="text-xs text-slate-500 mb-3 leading-relaxed">
              These are backend-only secrets. Placing them in frontend code or{' '}
              <code className="text-red-400 bg-slate-900/50 px-1 rounded">VITE_</code> env vars
              exposes them publicly and is a critical security risk.
            </p>
            <Code color={RED}>
{`# ❌ NEVER expose in frontend:
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
JWT_SECRET=
PRIVATE_KEY=
OPENAI_API_KEY=
GROQ_API_KEY=
STRIPE_SECRET_KEY=
WEBHOOK_SECRET=`}
            </Code>
          </Card>
        </div>

        {/* ── SQL SCHEMA SECTION ──────────────────────────── */}
        <Card border={`${PURPLE}18`}>
          <SH icon="Code2" label="SQL Schema — Run in Supabase SQL Editor" color={PURPLE} />
          <p className="text-sm text-slate-400 leading-relaxed mb-4">
            CareerLink OS™ requires a Supabase database schema with RLS enabled on all tables.
            The full SQL is provided in <code className="text-amber-400 bg-slate-900/50 px-1 rounded">supabase_careerlinkos_schema.sql</code> in the project source.
            Run it once in your Supabase SQL Editor — not from the frontend.
          </p>
          <div className="space-y-2 mb-4">
            <div className="text-xs text-slate-500 font-semibold mb-2">Tables created by the schema:</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {[
                'organisations','coaches','jobseekers',
                'pwa_access_links','activity_logs','weekly_activity_totals',
                'applications','interviews','check_ins',
                'evidence_records','dashboard_events','ai_insight_snapshots',
              ].map(t => (
                <div key={t} className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg"
                  style={{ background: `${PURPLE}07`, border: `1px solid ${PURPLE}15`, color: PURPLE + 'cc' }}>
                  <Icon name="Table2" size={10} style={{ color: PURPLE, flexShrink: 0 }} />
                  <span className="font-mono truncate">{t}</span>
                </div>
              ))}
            </div>
          </div>
          <Code color={SILVER}>
{`-- SQL execution order in supabase_careerlinkos_schema.sql:
-- 1. Extensions (uuid-ossp, pgcrypto)
-- 2. Tables
-- 3. Indexes
-- 4. Functions (updated_at trigger, weekly total calculator)
-- 5. Triggers
-- 6. ALTER TABLE ... ENABLE ROW LEVEL SECURITY;
-- 7. RLS Policies (MVP access-token mode)
-- 8. Verification queries

-- Open: Supabase Dashboard → SQL Editor → paste → Run`}
          </Code>
          <div className="mt-3 flex items-start gap-2 px-3 py-2.5 rounded-xl text-xs"
            style={{ background: `${AMBER}07`, border: `1px solid ${AMBER}20`, color: AMBER }}>
            <Icon name="AlertTriangle" size={12} style={{ color: AMBER, marginTop: 1, flexShrink: 0 }} />
            RLS is enabled on all 12 tables. Do not disable RLS policies in production.
          </div>
        </Card>

        {/* ── SAFETY WARNING ──────────────────────────────── */}
        <div className="flex items-start gap-3 px-5 py-4 rounded-2xl"
          style={{ background: `${RED}07`, border: `1px solid ${RED}20` }}>
          <Icon name="ShieldAlert" size={18} style={{ color: RED, marginTop: 1, flexShrink: 0 }} />
          <div>
            <div className="text-sm font-bold mb-1" style={{ color: RED }}>
              Security Warning — Before Production Client Use
            </div>
            <div className="text-xs leading-relaxed text-slate-400">
              Protect admin and backend setup access before handling sensitive client data.
              Ensure Supabase RLS policies are enabled and tested. This MVP uses access-token
              mode for jobseeker PWA writes. Before deploying at scale with real personal data,
              implement Supabase Auth (phone/email OTP for jobseekers, email/password for coaches)
              and replace RLS policies with <code className="text-slate-300">auth.uid()</code>-based rules.
              See the SQL schema comments for details.
            </div>
          </div>
        </div>

        {/* ── NAVIGATION ──────────────────────────────────── */}
        <Card border={`${SILVER}12`}>
          <SH icon="Navigation" label="Navigation" color={SILVER} />
          <div className="flex flex-wrap gap-3">
            <NavBtn label="Back to Settings" icon="Settings"      color={SILVER} onClick={() => navigate('/settings/backend')} />
            <NavBtn label="Coach Dashboard"  icon="LayoutDashboard" color={GOLD}  onClick={() => navigate('/dashboard')} />
            <NavBtn label="Jobseeker PWA"    icon="Smartphone"    color={PURPLE} onClick={() => navigate('/jobseeker-app')} />
            <NavBtn label="Landing Page"     icon="Home"          color={BLUE}   onClick={() => navigate('/')} />
            <NavBtn label="Demo Mode"        icon="FlaskConical"  color={AMBER}  onClick={() => navigate('/settings/demo')} />
            <NavBtn label="Jobseeker Setup"  icon="UserPlus"      color={GREEN}  onClick={() => navigate('/jobseeker-setup')} />
          </div>
        </Card>

        {/* ── FOOTER ──────────────────────────────────────── */}
        <div className="text-center py-4 text-[11px] text-slate-800">
          CareerLink OS™ — Live Backend Setup · Powered by 4P3X Intelligent AI — Created by Kyzel Kreates
        </div>

      </div>
    </div>
  )
}
