/**
 * ============================================================
 * CareerLink OS™ — Jobseeker PWA (Link-Based Entry)
 * pages_JobseekerPwa.jsx
 *
 * Route: /#/pwa/:publicLinkId
 *
 * Resolves a jobseeker from their unique PWA link token.
 * In DEMO mode: resolves from localStorage.
 * In LIVE mode: resolves from Supabase pwa_access_links.
 * All submission forms write to Supabase when live.
 *
 * CareerLink OS Powered 4P3X Intelligent AI™ Created by Kyzel Kreates™ — Created by Kyzel Kreates
 * ============================================================
 */

import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import Icon from './components_ui_Icon'
import { PlatformCreditBlock } from './components_ui_PlatformCredit'
import { useDataStore, useConfigStore, deriveJobseekerMetrics } from './core_storage'
import { jobseekerService } from './services_careerlink_jobseekerService'
import { isCLSupabaseReady } from './services_supabase_clSupabaseClient'
import {
  resolveJobseekerFromLink,
  insertActivityLog,
  insertApplication,
  insertInterview,
  insertCheckIn,
  insertEvidenceRecord,
  normaliseJobseeker,
  generatePwaLinkId,
} from './services_careerlink_liveDataService'
import { getCLSupabaseClient } from './services_supabase_clSupabaseClient'

// ── Constants ─────────────────────────────────────────────────
const GOLD   = '#d4af37'
const GREEN  = '#22c55e'
const RED    = '#ef4444'
const BLUE   = '#3b82f6'
const PURPLE = '#a855f7'
const AMBER  = '#f59e0b'

const ACTIVITY_TYPES = [
  'Job search','Job application','CV update','Cover letter',
  'Interview preparation','Interview attended','Employer contact',
  'Training / course','Work coach appointment','Portfolio update',
  'Networking','Other employment activity',
]

const APP_STATUSES = [
  'Drafting','Applied','Awaiting response','Interview offered',
  'Interview completed','Rejected','Offer received','Withdrawn',
]

// ── Small UI helpers ──────────────────────────────────────────
function Btn({ label, icon, color = GOLD, onClick, disabled, full }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed ${full ? 'w-full' : ''}`}
      style={{ background: `${color}18`, border: `1px solid ${color}35`, color }}
    >
      {icon && <Icon name={icon} size={15} style={{ color }} />}
      {label}
    </button>
  )
}

function Field({ label, children, required }) {
  return (
    <div>
      <label className="text-xs text-slate-400 font-medium mb-1.5 block">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
    </div>
  )
}

function Input({ value, onChange, placeholder, type = 'text', ...rest }) {
  return (
    <input type={type} value={value} onChange={onChange} placeholder={placeholder} {...rest}
      className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#d4af37]/50" />
  )
}

function Textarea({ value, onChange, placeholder, rows = 3 }) {
  return (
    <textarea value={value} onChange={onChange} placeholder={placeholder} rows={rows}
      className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#d4af37]/50 resize-none" />
  )
}

function Select({ value, onChange, children }) {
  return (
    <select value={value} onChange={onChange}
      className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#d4af37]/50">
      {children}
    </select>
  )
}

function SyncBadge({ source }) {
  const cfg = {
    supabase:      { color: GREEN,  icon: 'Wifi',        label: 'Live' },
    local:         { color: AMBER,  icon: 'Database',    label: 'Local' },
    not_configured:{ color: '#475569', icon: 'WifiOff',  label: 'Offline' },
    error:         { color: RED,    icon: 'AlertCircle', label: 'Error' },
  }[source] || { color: '#475569', icon: 'HelpCircle', label: source || '—' }
  return (
    <span className="flex items-center gap-1 text-[10px] font-semibold"
      style={{ color: cfg.color }}>
      <Icon name={cfg.icon} size={10} style={{ color: cfg.color }} />
      {cfg.label}
    </span>
  )
}

// ── Tabs ──────────────────────────────────────────────────────
const TABS = [
  { id: 'home',        label: 'Home',        icon: 'Home' },
  { id: 'log',         label: 'Log Activity',icon: 'Clock' },
  { id: 'application', label: 'Application', icon: 'Send' },
  { id: 'interview',   label: 'Interview',   icon: 'CalendarCheck' },
  { id: 'checkin',     label: 'Check-in',    icon: 'ClipboardCheck' },
  { id: 'evidence',    label: 'Evidence',    icon: 'Paperclip' },
]

// ── Submit helper ─────────────────────────────────────────────
async function liveSubmit(fn, fallbackFn) {
  if (isCLSupabaseReady()) {
    return await fn()
  }
  fallbackFn?.()
  return { data: null, error: null, source: 'local' }
}

// ─────────────────────────────────────────────────────────────
// MAIN
// ─────────────────────────────────────────────────────────────
export default function JobseekerPwa() {
  const { publicLinkId } = useParams()
  const config            = useConfigStore(s => s.config)
  const isDemoMode        = config?.demoModeEnabled ?? true
  const dataStore         = useDataStore()

  const [jobseeker, setJobseeker] = useState(null)
  const [metrics,   setMetrics]   = useState(null)
  const [status,    setStatus]    = useState('loading') // loading|found|not_found|error
  const [tab,       setTab]       = useState('home')
  const [submitMsg, setSubmitMsg] = useState(null) // {type:'success'|'error', text}
  const [dataSource, setDataSource] = useState('local')

  // ── Resolve jobseeker from link ───────────────────────────
  useEffect(() => {
    async function resolve() {
      setStatus('loading')

      if (isDemoMode) {
        // Demo mode: resolve from localStorage links or first matching ID
        try {
          const local = JSON.parse(localStorage.getItem('cl:pwa:links') || '{}')
          let jsId = local[publicLinkId]?.jobseekerId
          if (!jsId) {
            // Fallback: maybe publicLinkId IS the jobseeker id directly (legacy)
            const all = jobseekerService.getAll()
            const direct = all.find(j => j.id === publicLinkId || generatePwaLinkId(j.id) === publicLinkId)
            jsId = direct?.id
          }
          if (jsId) {
            const js = jobseekerService.getById(jsId)
            if (js) { setJobseeker(js); setStatus('found'); setDataSource('local'); return }
          }
        } catch {}
        setStatus('not_found')
        return
      }

      // Live mode
      if (!isCLSupabaseReady()) {
        setStatus('not_found')
        setDataSource('not_configured')
        return
      }

      const { jobseekerId, source } = await resolveJobseekerFromLink(publicLinkId)
      setDataSource(source)

      if (!jobseekerId) { setStatus('not_found'); return }

      // Fetch full jobseeker record from Supabase
      try {
        const { data, error } = await getCLSupabaseClient()
          .from('jobseekers').select('*').eq('id', jobseekerId).single()
        if (error || !data) { setStatus('not_found'); return }
        setJobseeker(normaliseJobseeker(data))
        setStatus('found')
      } catch {
        setStatus('error')
      }
    }
    if (publicLinkId) resolve()
    else setStatus('not_found')
  }, [publicLinkId, isDemoMode])

  // ── Compute metrics ────────────────────────────────────────
  useEffect(() => {
    if (!jobseeker) return
    const snap = {
      activityLogs: (dataStore.activityLogs || []).filter(r => isDemoMode ? true : !r.isDemo),
      applications: (dataStore.applications || []).filter(r => isDemoMode ? true : !r.isDemo),
      interviews:   (dataStore.interviews   || []).filter(r => isDemoMode ? true : !r.isDemo),
      checkIns:     (dataStore.checkIns     || []).filter(r => isDemoMode ? true : !r.isDemo),
    }
    setMetrics(deriveJobseekerMetrics(jobseeker.id, snap, jobseeker.weeklyTargetHours || 35))
  }, [jobseeker, dataStore, isDemoMode])

  // ── Submit result flash ────────────────────────────────────
  function flashMsg(type, text) {
    setSubmitMsg({ type, text })
    setTimeout(() => setSubmitMsg(null), 4000)
  }

  if (status === 'loading') return <LoadingScreen />
  if (status === 'not_found') return <InvalidLinkScreen linkId={publicLinkId} isSupabase={isCLSupabaseReady()} isDemoMode={isDemoMode} />
  if (status === 'error') return <ErrorScreen />

  return (
    <div className="min-h-screen bg-[#050810] flex flex-col max-w-lg mx-auto">

      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#050810]/95 backdrop-blur border-b border-slate-800/60 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: `${GOLD}12`, border: `1px solid ${GOLD}28` }}>
              <span className="text-xs font-bold" style={{ color: GOLD }}>CL</span>
            </div>
            <div>
              <div className="text-sm font-bold text-white">CareerLink</div>
              <div className="text-[10px] text-slate-600">{jobseeker?.displayName || '—'}</div>
            </div>
          </div>
          <SyncBadge source={dataSource} />
        </div>
      </div>

      {/* Submit flash */}
      {submitMsg && (
        <div className={`mx-4 mt-3 px-4 py-2.5 rounded-xl text-xs font-medium flex items-center gap-2`}
          style={{
            background: submitMsg.type === 'success' ? `${GREEN}12` : `${RED}12`,
            border: `1px solid ${submitMsg.type === 'success' ? GREEN : RED}30`,
            color: submitMsg.type === 'success' ? GREEN : RED,
          }}>
          <Icon name={submitMsg.type === 'success' ? 'CheckCircle2' : 'AlertCircle'} size={13} />
          {submitMsg.text}
        </div>
      )}

      {/* Tab content */}
      <div className="flex-1 overflow-auto px-4 py-4 pb-24">
        {tab === 'home'        && <HomeTab js={jobseeker} metrics={metrics} />}
        {tab === 'log'         && <LogActivityTab js={jobseeker} dataStore={dataStore} isDemoMode={isDemoMode} publicLinkId={publicLinkId} onResult={flashMsg} />}
        {tab === 'application' && <ApplicationTab js={jobseeker} dataStore={dataStore} isDemoMode={isDemoMode} publicLinkId={publicLinkId} onResult={flashMsg} />}
        {tab === 'interview'   && <InterviewTab   js={jobseeker} dataStore={dataStore} isDemoMode={isDemoMode} publicLinkId={publicLinkId} onResult={flashMsg} />}
        {tab === 'checkin'     && <CheckInTab      js={jobseeker} dataStore={dataStore} isDemoMode={isDemoMode} publicLinkId={publicLinkId} onResult={flashMsg} />}
        {tab === 'evidence'    && <EvidenceTab     js={jobseeker} dataStore={dataStore} isDemoMode={isDemoMode} publicLinkId={publicLinkId} onResult={flashMsg} />}
      </div>

      {/* Bottom tabs */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-lg bg-[#070d1a] border-t border-slate-800/70 px-1 py-1 z-20">
        <div className="grid grid-cols-6 gap-0.5">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className="flex flex-col items-center gap-0.5 py-2 rounded-lg transition-all"
              style={{ background: tab === t.id ? `${GOLD}10` : 'transparent' }}>
              <Icon name={t.icon} size={16} style={{ color: tab === t.id ? GOLD : '#475569' }} />
              <span className="text-[9px] font-medium"
                style={{ color: tab === t.id ? GOLD : '#475569' }}>
                {t.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// HOME TAB
// ─────────────────────────────────────────────────────────────
function HomeTab({ js, metrics }) {
  const pct = metrics?.weeklyTargetPercent ?? 0
  const hrs = metrics?.weeklyHoursLogged ?? 0
  const tgt = js?.weeklyTargetHours || 35
  const rem = Math.max(0, tgt - hrs)
  const col = pct >= 100 ? GREEN : pct >= 60 ? GOLD : pct >= 30 ? AMBER : RED
  return (
    <div className="space-y-4">
      {/* Weekly target */}
      <div className="rounded-2xl p-5" style={{ background: '#070d1a', border: `1px solid ${GOLD}18` }}>
        <div className="text-[11px] text-slate-600 uppercase tracking-widest font-bold mb-3">Weekly Progress</div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-3xl font-mono font-bold" style={{ color: col }}>{hrs}h</div>
            <div className="text-[11px] text-slate-600">of {tgt}h target</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-mono font-bold" style={{ color: col }}>{pct}%</div>
            <div className="text-[11px] text-slate-600">{rem > 0 ? `${rem}h remaining` : 'Target reached!'}</div>
          </div>
        </div>
        <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: '#1e293b' }}>
          <div className="h-full rounded-full transition-all duration-700"
            style={{ width: `${Math.min(100, pct)}%`, background: col }} />
        </div>
        <div className="mt-2 text-[10px] text-slate-700 text-center">
          Supports tracking progress toward a 35-hour weekly job-search activity requirement.
          Final compliance decisions remain the responsibility of the relevant coach, caseworker, or authority.
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Apps this week',     value: metrics?.applicationCountWeek ?? 0, color: BLUE,   icon: 'Send' },
          { label: 'Upcoming interviews',value: metrics?.interviewsUpcoming ?? 0,   color: GREEN,  icon: 'CalendarCheck' },
          { label: 'Check-ins this week',value: metrics?.checkInsThisWeek ?? 0,     color: GOLD,   icon: 'ClipboardCheck' },
          { label: 'Progress status',    value: (metrics?.progressStatus || 'on_track').replace(/_/g,' '), color: col, icon: 'TrendingUp' },
        ].map(s => (
          <div key={s.label} className="rounded-xl p-3.5"
            style={{ background: `${s.color}07`, border: `1px solid ${s.color}18` }}>
            <Icon name={s.icon} size={14} style={{ color: s.color }} />
            <div className="text-lg font-bold font-mono mt-1.5 capitalize" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[10px] text-slate-600 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* AI disclaimer */}
      <div className="rounded-xl px-4 py-3 text-[10px] text-slate-700"
        style={{ background: `${PURPLE}07`, border: `1px solid ${PURPLE}15` }}>
        <strong className="text-slate-500">CareerLink AI</strong> provides guidance and organisation support only.
        It does not replace official guidance, legal advice, medical advice, benefits advice, or human caseworker review.
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// LOG ACTIVITY TAB
// ─────────────────────────────────────────────────────────────
function LogActivityTab({ js, dataStore, isDemoMode, publicLinkId, onResult }) {
  const today = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState({
    date: today, startTime: '', endTime: '',
    activityType: 'Job search', description: '', notes: '',
    durationMinutes: 0,
  })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  function calcDuration() {
    if (!form.startTime || !form.endTime) return
    const [sh, sm] = form.startTime.split(':').map(Number)
    const [eh, em] = form.endTime.split(':').map(Number)
    const mins = (eh * 60 + em) - (sh * 60 + sm)
    if (mins > 0) set('durationMinutes', mins)
  }

  async function handleSubmit() {
    if (!form.activityType || !form.date) { onResult('error', 'Date and activity type are required.'); return }
    setSaving(true)
    try {
      const record = {
        jobseeker_id:     js.id,
        pwa_link_id:      publicLinkId,
        date:             form.date,
        start_time:       form.startTime,
        end_time:         form.endTime,
        duration_minutes: form.durationMinutes || 0,
        activity_type:    form.activityType,
        description:      form.description,
        notes:            form.notes,
      }
      if (!isDemoMode && isCLSupabaseReady()) {
        const { error } = await insertActivityLog(record)
        if (error) { onResult('error', `Failed to save: ${error}`); return }
      } else {
        // Local / demo write
        dataStore.addActivityLog({ ...form, jobseekerId: js.id, isDemo: false })
      }
      onResult('success', 'Activity logged successfully.')
      setForm({ date: today, startTime: '', endTime: '', activityType: 'Job search', description: '', notes: '', durationMinutes: 0 })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-white font-bold text-base">Log Job-Search Activity</h2>
      <Field label="Date" required><Input type="date" value={form.date} onChange={e => set('date', e.target.value)} /></Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Start Time"><Input type="time" value={form.startTime} onChange={e => { set('startTime', e.target.value); }} onBlur={calcDuration} /></Field>
        <Field label="End Time"><Input type="time" value={form.endTime} onChange={e => { set('endTime', e.target.value); }} onBlur={calcDuration} /></Field>
      </div>
      {form.durationMinutes > 0 && (
        <div className="text-xs font-semibold" style={{ color: GOLD }}>
          Duration: {Math.floor(form.durationMinutes/60)}h {form.durationMinutes%60}m
        </div>
      )}
      <Field label="Activity Type" required>
        <Select value={form.activityType} onChange={e => set('activityType', e.target.value)}>
          {ACTIVITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </Select>
      </Field>
      <Field label="Description"><Textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="What did you do?" /></Field>
      <Field label="Notes"><Textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Any additional notes…" rows={2} /></Field>
      <Btn label={saving ? 'Saving…' : 'Save Activity'} icon="Save" color={GOLD} onClick={handleSubmit} disabled={saving} full />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// APPLICATION TAB
// ─────────────────────────────────────────────────────────────
function ApplicationTab({ js, dataStore, isDemoMode, publicLinkId, onResult }) {
  const today = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState({ employer: '', roleTitle: '', source: '', dateApplied: today, status: 'Applied', notes: '' })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit() {
    if (!form.employer || !form.roleTitle) { onResult('error', 'Employer and role title are required.'); return }
    setSaving(true)
    try {
      const record = {
        jobseeker_id: js.id, pwa_link_id: publicLinkId,
        employer: form.employer, role_title: form.roleTitle,
        source: form.source, date_applied: form.dateApplied,
        status: form.status, notes: form.notes,
      }
      if (!isDemoMode && isCLSupabaseReady()) {
        const { error } = await insertApplication(record)
        if (error) { onResult('error', `Failed to save: ${error}`); return }
      } else {
        dataStore.addApplication({ ...form, jobseekerId: js.id, isDemo: false })
      }
      onResult('success', 'Application logged.')
      setForm({ employer: '', roleTitle: '', source: '', dateApplied: today, status: 'Applied', notes: '' })
    } finally { setSaving(false) }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-white font-bold text-base">Log Job Application</h2>
      <Field label="Employer / Company" required><Input value={form.employer} onChange={e => set('employer', e.target.value)} placeholder="e.g. Horizon Ltd" /></Field>
      <Field label="Role Title" required><Input value={form.roleTitle} onChange={e => set('roleTitle', e.target.value)} placeholder="e.g. Customer Service Advisor" /></Field>
      <Field label="Job Board / Source"><Input value={form.source} onChange={e => set('source', e.target.value)} placeholder="Indeed, Reed, LinkedIn…" /></Field>
      <Field label="Date Applied"><Input type="date" value={form.dateApplied} onChange={e => set('dateApplied', e.target.value)} /></Field>
      <Field label="Status">
        <Select value={form.status} onChange={e => set('status', e.target.value)}>
          {APP_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
        </Select>
      </Field>
      <Field label="Notes"><Textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Any notes about this application…" rows={2} /></Field>
      <Btn label={saving ? 'Saving…' : 'Save Application'} icon="Send" color={BLUE} onClick={handleSubmit} disabled={saving} full />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// INTERVIEW TAB
// ─────────────────────────────────────────────────────────────
function InterviewTab({ js, dataStore, isDemoMode, publicLinkId, onResult }) {
  const [form, setForm] = useState({ employer: '', roleTitle: '', dateTime: '', locationOrLink: '', preparationTasks: '', outcome: '', notes: '' })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit() {
    if (!form.employer || !form.dateTime) { onResult('error', 'Employer and date/time are required.'); return }
    setSaving(true)
    try {
      const record = {
        jobseeker_id: js.id, pwa_link_id: publicLinkId,
        employer: form.employer, role_title: form.roleTitle,
        interview_date: form.dateTime, location_or_link: form.locationOrLink,
        preparation_tasks: form.preparationTasks, outcome: form.outcome, notes: form.notes,
      }
      if (!isDemoMode && isCLSupabaseReady()) {
        const { error } = await insertInterview(record)
        if (error) { onResult('error', `Failed to save: ${error}`); return }
      } else {
        dataStore.addInterview({ ...form, jobseekerId: js.id, isDemo: false })
      }
      onResult('success', 'Interview logged.')
      setForm({ employer: '', roleTitle: '', dateTime: '', locationOrLink: '', preparationTasks: '', outcome: '', notes: '' })
    } finally { setSaving(false) }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-white font-bold text-base">Log Interview</h2>
      <Field label="Employer / Company" required><Input value={form.employer} onChange={e => set('employer', e.target.value)} placeholder="e.g. Horizon Ltd" /></Field>
      <Field label="Role Title"><Input value={form.roleTitle} onChange={e => set('roleTitle', e.target.value)} placeholder="e.g. Customer Service Advisor" /></Field>
      <Field label="Date & Time" required><Input type="datetime-local" value={form.dateTime} onChange={e => set('dateTime', e.target.value)} /></Field>
      <Field label="Location / Online Link"><Input value={form.locationOrLink} onChange={e => set('locationOrLink', e.target.value)} placeholder="Address or Zoom/Teams link" /></Field>
      <Field label="Preparation Tasks"><Textarea value={form.preparationTasks} onChange={e => set('preparationTasks', e.target.value)} placeholder="What are you preparing?" rows={2} /></Field>
      <Field label="Outcome (if completed)"><Input value={form.outcome} onChange={e => set('outcome', e.target.value)} placeholder="e.g. Awaiting response" /></Field>
      <Field label="Notes"><Textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Any notes…" rows={2} /></Field>
      <Btn label={saving ? 'Saving…' : 'Save Interview'} icon="CalendarCheck" color={GREEN} onClick={handleSubmit} disabled={saving} full />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// CHECK-IN TAB
// ─────────────────────────────────────────────────────────────
const CI_QUESTIONS = [
  'Did you complete job-search activity today?',
  'How many hours did you spend on job-search activity?',
  'Did you apply for any jobs today?',
  'Did you contact any employers or recruiters?',
  'Did you update your CV, cover letter, or portfolio?',
  'Do you have any interviews coming up?',
  'Are there any barriers stopping you from job searching?',
  'Do you need support from your coach or advisor?',
  'How confident do you feel about your progress today? (1–10)',
  'What is your priority for tomorrow?',
]

function CheckInTab({ js, dataStore, isDemoMode, publicLinkId, onResult }) {
  const today = new Date().toISOString().split('T')[0]
  const [answers, setAnswers] = useState({})
  const [hoursReported, setHoursReported] = useState('')
  const [supportNeeded, setSupportNeeded] = useState(false)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSubmit() {
    setSaving(true)
    try {
      const record = {
        jobseeker_id:   js.id,
        pwa_link_id:    publicLinkId,
        check_in_date:  today,
        answers,
        hours_reported: parseFloat(hoursReported) || 0,
        support_needed: supportNeeded,
        barrier_flags:  [],
        notes,
      }
      if (!isDemoMode && isCLSupabaseReady()) {
        const { error } = await insertCheckIn(record)
        if (error) { onResult('error', `Failed to save: ${error}`); return }
      } else {
        dataStore.addCheckIn({ jobseekerId: js.id, date: today, answers, hoursReported: parseFloat(hoursReported)||0, supportNeeded, notes, isDemo: false })
      }
      onResult('success', 'Check-in submitted.')
      setAnswers({}); setHoursReported(''); setSupportNeeded(false); setNotes('')
    } finally { setSaving(false) }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-white font-bold text-base">Daily Check-in</h2>
      <div className="text-xs text-slate-500">{new Date().toLocaleDateString('en-GB', { weekday:'long', day:'2-digit', month:'long' })}</div>
      {CI_QUESTIONS.map((q, i) => (
        <div key={i} className="rounded-xl p-3" style={{ background: '#0a101f', border: '1px solid #1e293b' }}>
          <div className="text-xs text-slate-300 mb-2 font-medium">{q}</div>
          <Input value={answers[i] || ''} onChange={e => setAnswers(a => ({ ...a, [i]: e.target.value }))} placeholder="Your answer…" />
        </div>
      ))}
      <Field label="Hours on job-search today">
        <Input type="number" min="0" max="24" step="0.5" value={hoursReported} onChange={e => setHoursReported(e.target.value)} placeholder="e.g. 3.5" />
      </Field>
      <div className="flex items-center gap-3">
        <input type="checkbox" id="support" checked={supportNeeded} onChange={e => setSupportNeeded(e.target.checked)} className="w-4 h-4 accent-amber-400" />
        <label htmlFor="support" className="text-xs text-slate-300">I need support from my coach / advisor</label>
      </div>
      <Field label="Additional notes"><Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Anything else to share with your coach…" rows={2} /></Field>
      <Btn label={saving ? 'Saving…' : 'Submit Check-in'} icon="ClipboardCheck" color={GOLD} onClick={handleSubmit} disabled={saving} full />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// EVIDENCE TAB
// ─────────────────────────────────────────────────────────────
function EvidenceTab({ js, dataStore, isDemoMode, publicLinkId, onResult }) {
  const today = new Date().toISOString().split('T')[0]
  const [form, setForm] = useState({ title: '', evidenceType: 'note', evidenceDate: today, notes: '', fileUrl: '' })
  const [saving, setSaving] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  async function handleSubmit() {
    if (!form.title) { onResult('error', 'Evidence title is required.'); return }
    setSaving(true)
    try {
      const record = {
        jobseeker_id: js.id, pwa_link_id: publicLinkId,
        title: form.title, evidence_type: form.evidenceType,
        evidence_date: form.evidenceDate, notes: form.notes,
        file_url: form.fileUrl,
      }
      if (!isDemoMode && isCLSupabaseReady()) {
        const { error } = await insertEvidenceRecord(record)
        if (error) { onResult('error', `Failed to save: ${error}`); return }
      } else {
        dataStore.addEvidenceRecord({ ...form, jobseekerId: js.id, isDemo: false })
      }
      onResult('success', 'Evidence recorded.')
      setForm({ title: '', evidenceType: 'note', evidenceDate: today, notes: '', fileUrl: '' })
    } finally { setSaving(false) }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-white font-bold text-base">Add Evidence Record</h2>
      <Field label="Title / Description" required><Input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Screenshot of application confirmation" /></Field>
      <Field label="Evidence Type">
        <Select value={form.evidenceType} onChange={e => set('evidenceType', e.target.value)}>
          {['note','screenshot','url','document','email','other'].map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
        </Select>
      </Field>
      <Field label="Date"><Input type="date" value={form.evidenceDate} onChange={e => set('evidenceDate', e.target.value)} /></Field>
      <Field label="Link / URL (optional)"><Input value={form.fileUrl} onChange={e => set('fileUrl', e.target.value)} placeholder="https://…" /></Field>
      <Field label="Notes"><Textarea value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Describe this evidence…" rows={3} /></Field>
      <Btn label={saving ? 'Saving…' : 'Save Evidence'} icon="Paperclip" color={PURPLE} onClick={handleSubmit} disabled={saving} full />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// LOADING / ERROR SCREENS
// ─────────────────────────────────────────────────────────────
function LoadingScreen() {
  return (
    <div className="min-h-screen bg-[#050810] flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse"
          style={{ background: `${GOLD}12`, border: `1px solid ${GOLD}25` }}>
          <span className="font-bold text-sm" style={{ color: GOLD }}>CL</span>
        </div>
        <div className="text-slate-500 text-sm">Loading your CareerLink…</div>
      </div>
    </div>
  )
}

function InvalidLinkScreen({ linkId, isSupabase, isDemoMode }) {
  return (
    <div className="min-h-screen bg-[#050810] flex items-center justify-center p-6">
      <div className="w-full max-w-sm text-center space-y-5">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto"
          style={{ background: `${RED}10`, border: `1px solid ${RED}25` }}>
          <Icon name="LinkX" size={24} style={{ color: RED }} />
        </div>
        <div>
          <h2 className="text-white font-bold text-xl mb-2">Invalid or Expired Link</h2>
          <p className="text-slate-500 text-sm leading-relaxed">
            This CareerLink PWA link is invalid, expired, or has not been set up yet.
          </p>
        </div>
        {!isSupabase && !isDemoMode && (
          <div className="rounded-xl px-4 py-3 text-xs text-left"
            style={{ background: `${AMBER}08`, border: `1px solid ${AMBER}20`, color: AMBER }}>
            Supabase is not configured. Ask your coach to check the CareerLink settings.
          </div>
        )}
        <div className="text-[10px] text-slate-700 font-mono">Link ID: {linkId || '(none)'}</div>
        <div className="text-[10px] text-slate-700">
          Please ask your work coach or employment advisor for a valid link.
        </div>
      </div>
    </div>
  )
}

function ErrorScreen() {
  return (
    <div className="min-h-screen bg-[#050810] flex items-center justify-center p-6">
      <div className="text-center space-y-3">
        <Icon name="AlertCircle" size={32} style={{ color: RED }} />
        <div className="text-white font-bold">Something went wrong</div>
        <div className="text-slate-500 text-sm">Please try again or contact your coach.</div>
        <button onClick={() => window.location.reload()}
          className="text-xs px-4 py-2 rounded-xl border text-slate-400 border-slate-700 hover:text-white transition-colors">
          Reload
        </button>
      </div>
    </div>
  )
}
