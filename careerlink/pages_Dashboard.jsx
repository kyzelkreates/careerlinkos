/**
 * ============================================================
 * CareerLink OS™ — Coach Dashboard v2.1 (Stable)
 * Employment Support Metrics · Risk Monitor · Activity Hub
 * Powered by 4P3X Intelligent AI — Created by Kyzel Kreates
 *
 * Fix log:
 *  - Removed `dataStore` from useCallback deps (caused infinite re-render loop)
 *  - Demo seeding moved to app-level (AppCore); dashboard just reads state
 *  - Individual store selectors used (not full store object)
 *  - Fixed durationHours → durationMinutes/60 in activity feed
 *  - All icon names validated against lucide-react
 * ============================================================
 */

import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from './components_ui_Icon'
import { PlatformCreditBlock } from './components_ui_PlatformCredit'
import {
  useConfigStore, useDataStore, deriveJobseekerMetrics,
} from './core_storage'
import {
  jobseekerService, RISK_LEVEL,
} from './services_careerlink_jobseekerService'

// ─── Colour palette ───────────────────────────────────────────
const C = {
  gold:   '#d4af37',
  silver: '#b0b8c8',
  green:  '#22c55e',
  purple: '#a855f7',
  red:    '#ef4444',
  amber:  '#f59e0b',
  blue:   '#3b82f6',
}

// ─── Live Clock ───────────────────────────────────────────────
function LiveClock() {
  const [t, setT] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setT(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return (
    <div className="text-right flex-shrink-0">
      <div className="font-mono text-lg sm:text-xl md:text-2xl font-bold text-white tabular-nums tracking-tight whitespace-nowrap">
        {t.toLocaleTimeString('en-GB', { hour12: false })}
      </div>
      <div className="text-[11px] text-slate-500 mt-0.5">
        {t.toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
      </div>
    </div>
  )
}

// ─── Section Title ────────────────────────────────────────────
function SectionTitle({ icon, label, color = C.gold, onMore, moreLabel = 'View all' }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <Icon name={icon} size={13} style={{ color }} />
        <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color }}>
          {label}
        </span>
      </div>
      {onMore && (
        <button
          onClick={onMore}
          className="text-[10px] text-slate-600 hover:text-slate-300 transition-colors flex items-center gap-1"
        >
          {moreLabel} <Icon name="ChevronRight" size={10} />
        </button>
      )}
    </div>
  )
}

// ─── KPI Card ─────────────────────────────────────────────────
function KpiCard({ label, value, sub, icon, color, pulse, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl p-4 border transition-all hover:brightness-110 hover:scale-[1.02] active:scale-[0.99] relative overflow-hidden group"
      style={{ background: `linear-gradient(135deg,${color}08 0%,#09101f 100%)`, borderColor: `${color}22` }}
    >
      {pulse && (
        <span className="absolute top-3 right-3 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: C.red }} />
          <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: C.red }} />
        </span>
      )}
      <div className="flex items-start justify-between mb-3">
        <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase leading-tight pr-6">
          {label}
        </span>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform"
          style={{ background: `${color}14`, border: `1px solid ${color}28` }}
        >
          <Icon name={icon} size={14} style={{ color }} />
        </div>
      </div>
      <div
        className="font-mono text-2xl sm:text-3xl font-bold tabular-nums leading-none mt-0.5"
        style={{ color, overflowWrap: 'anywhere', wordBreak: 'break-all' }}
      >
        {value ?? '—'}
      </div>
      {sub && (
        <div className="text-[10px] text-slate-600 mt-1.5 leading-relaxed"
          style={{ overflowWrap: 'anywhere' }}>
          {sub}
        </div>
      )}
    </button>
  )
}

// ─── Risk Badge ───────────────────────────────────────────────
function RiskBadge({ level }) {
  const s = {
    low:      { color: C.green,  bg: `${C.green}10`,  border: `${C.green}22` },
    medium:   { color: C.amber,  bg: `${C.amber}10`,  border: `${C.amber}22` },
    high:     { color: C.red,    bg: `${C.red}10`,    border: `${C.red}22` },
    critical: { color: '#fca5a5',bg: `${C.red}15`,    border: `${C.red}32` },
  }[level] || { color: C.silver, bg: '#0f172a', border: '#1e293b' }
  return (
    <span
      className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border flex-shrink-0"
      style={{ color: s.color, background: s.bg, borderColor: s.border }}
    >
      {level || 'low'}
    </span>
  )
}

// ─── Status label ─────────────────────────────────────────────
function StatusLabel({ status }) {
  const s = {
    active:    { color: C.green,  label: 'Active' },
    at_risk:   { color: C.red,    label: 'At Risk' },
    inactive:  { color: C.silver, label: 'Inactive' },
    completed: { color: C.blue,   label: 'Completed' },
    on_hold:   { color: C.amber,  label: 'On Hold' },
  }[status] || { color: C.silver, label: status || '—' }
  return (
    <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: s.color }}>
      {s.label}
    </span>
  )
}

// ─── Progress Bar ─────────────────────────────────────────────
function Bar({ pct, h = 3 }) {
  const c = Math.min(100, Math.max(0, pct || 0))
  const col = c >= 100 ? C.green : c >= 60 ? C.gold : c >= 30 ? C.amber : C.red
  return (
    <div className="w-full rounded-full overflow-hidden" style={{ height: h, background: '#1e293b' }}>
      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${c}%`, background: col }} />
    </div>
  )
}

// ─── Donut spark ─────────────────────────────────────────────
function Donut({ pct, color, size = 32, stroke = 4 }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const c = Math.min(100, Math.max(0, pct || 0))
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1e293b" strokeWidth={stroke} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${(c/100)*circ} ${circ}`} strokeLinecap="round" />
    </svg>
  )
}

// ─── Empty State ──────────────────────────────────────────────
function Empty({ icon, text }) {
  return (
    <div className="flex flex-col items-center py-6 gap-2 opacity-40">
      <Icon name={icon} size={20} className="text-slate-700" />
      <span className="text-[11px] text-slate-700 text-center">{text}</span>
    </div>
  )
}

// ─── Jobseeker row ────────────────────────────────────────────
function JsRow({ js, metrics, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/4 transition-all text-left group"
    >
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold"
        style={{ background: `${C.gold}10`, border: `1px solid ${C.gold}22`, color: C.gold }}
      >
        {js.displayName?.charAt(0) || '?'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          <span className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors truncate">
            {js.displayName}
          </span>
          {js.isDemo && <span className="text-[9px] text-amber-700/70 font-mono flex-shrink-0">[DEMO]</span>}
        </div>
        <Bar pct={metrics?.weeklyTargetPercent ?? 0} h={3} />
      </div>
      <div className="text-right flex-shrink-0 mx-1">
        <div className="text-[11px] font-mono text-slate-300">
          {metrics?.weeklyHoursLogged ?? 0}h
        </div>
        <div className="text-[9px] text-slate-700">/{js.weeklyTargetHours || 35}h</div>
      </div>
      <div className="hidden sm:block flex-shrink-0">
        <StatusLabel status={js.status} />
      </div>
      <RiskBadge level={js.riskLevel || 'low'} />
    </button>
  )
}

// ─── Flag row ─────────────────────────────────────────────────
function FlagRow({ flag, jsName }) {
  const s = {
    critical: { color: '#fca5a5', bg: `${C.red}10`,   border: `${C.red}25` },
    high:     { color: C.red,     bg: `${C.red}07`,   border: `${C.red}15` },
    medium:   { color: C.amber,   bg: `${C.amber}07`, border: `${C.amber}18` },
    low:      { color: C.silver,  bg: '#0f172a',      border: '#1e293b' },
  }[flag.severity] || { color: C.silver, bg: '#0f172a', border: '#1e293b' }
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg border"
      style={{ background: s.bg, borderColor: s.border }}>
      <Icon name="AlertTriangle" size={12} style={{ color: s.color, flexShrink: 0 }} />
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold capitalize truncate" style={{ color: s.color }}>
          {flag.type?.replace(/_/g, ' ') || 'Flag'}
        </div>
        <div className="text-[10px] text-slate-600 truncate">{jsName || '—'}</div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className="text-[10px] text-slate-600 font-mono">
          {new Date(flag.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
        </div>
        <div className="text-[9px] capitalize" style={{ color: s.color }}>{flag.severity}</div>
      </div>
    </div>
  )
}

// ─── Interview card ───────────────────────────────────────────
function IvCard({ iv, jsName }) {
  const d = new Date(iv.dateTime)
  const past = d < new Date()
  const col = past ? C.silver : C.blue
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg border"
      style={{ background: `${col}06`, borderColor: `${col}20` }}>
      <div className="w-9 h-9 rounded-lg flex flex-col items-center justify-center flex-shrink-0"
        style={{ background: `${col}12`, border: `1px solid ${col}28` }}>
        <span className="text-[11px] font-bold" style={{ color: col }}>
          {d.toLocaleDateString('en-GB', { day: '2-digit' })}
        </span>
        <span className="text-[9px]" style={{ color: col + 'aa' }}>
          {d.toLocaleDateString('en-GB', { month: 'short' })}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-slate-200 truncate">{jsName || '—'}</div>
        <div className="text-[10px] text-slate-500 truncate">
          {iv.employer || 'Employer'} · {d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      <span className="text-[9px] font-bold uppercase" style={{ color: col }}>
        {past ? 'Past' : 'Soon'}
      </span>
    </div>
  )
}

// ─── Activity feed item ───────────────────────────────────────
function FeedItem({ icon, color, label, sub, timeStr }) {
  return (
    <div className="flex items-start gap-3 py-2 border-b border-slate-800/30 last:border-0">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: `${color}10`, border: `1px solid ${color}18` }}>
        <Icon name={icon} size={12} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-slate-300 truncate">{label}</div>
        {sub && <div className="text-[10px] text-slate-600 truncate">{sub}</div>}
      </div>
      <div className="text-[10px] text-slate-700 font-mono flex-shrink-0 ml-2">{timeStr}</div>
    </div>
  )
}

// ─── Quick action button ──────────────────────────────────────
function QA({ label, icon, color, onClick }) {
  return (
    <button onClick={onClick}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all hover:brightness-110 text-left group w-full"
      style={{ background: `${color}07`, border: `1px solid ${color}15` }}>
      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform"
        style={{ background: `${color}14`, border: `1px solid ${color}22` }}>
        <Icon name={icon} size={13} style={{ color }} />
      </div>
      <span className="text-xs font-semibold flex-1 truncate" style={{ color: color + 'dd' }}>{label}</span>
      <Icon name="ChevronRight" size={10} style={{ color: color + '50' }} />
    </button>
  )
}

// ─── Weekly target row ────────────────────────────────────────
function TargetRow({ js, metrics }) {
  const pct  = metrics?.weeklyTargetPercent ?? 0
  const hrs  = metrics?.weeklyHoursLogged ?? 0
  const tgt  = js.weeklyTargetHours || 35
  const col  = pct >= 100 ? C.green : pct >= 60 ? C.gold : pct >= 30 ? C.amber : C.red
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="text-[11px] text-slate-400 truncate flex-1 min-w-0">{js.displayName}</span>
      <Donut pct={pct} color={col} size={26} stroke={3} />
      <div className="text-right w-14 flex-shrink-0">
        <div className="text-[11px] font-mono font-bold" style={{ color: col }}>{hrs}h</div>
        <div className="text-[9px] text-slate-700">/{tgt}h</div>
      </div>
    </div>
  )
}

// ─── Helper: format time ──────────────────────────────────────
function fmtTime(dateStr) {
  const d = new Date(dateStr)
  const now = new Date()
  const todayStr = now.toDateString()
  if (d.toDateString() === todayStr) return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
}

// ─────────────────────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate      = useNavigate()
  const config        = useConfigStore(s => s.config)
  const isDemoMode    = config?.demoModeEnabled ?? true
  const weeklyTarget  = config?.weeklyTargetHoursDefault ?? 35

  // ── Subscribe to individual arrays (stable selectors) ──────
  // This avoids re-rendering on unrelated store updates
  const activityLogs   = useDataStore(s => s.activityLogs)
  const applications   = useDataStore(s => s.applications)
  const interviews     = useDataStore(s => s.interviews)
  const checkIns       = useDataStore(s => s.checkIns)
  const evidenceRecs   = useDataStore(s => s.evidenceRecords)
  const tasks          = useDataStore(s => s.tasks)
  const supportFlags   = useDataStore(s => s.supportFlags)

  // ── Jobseekers — computed once on mount / demo-mode change ─
  const [jobseekers, setJobseekers] = useState([])
  const [allMetrics, setAllMetrics] = useState({})
  const seededRef = useRef(false)

  useEffect(() => {
    // Load jobseekers from service (already seeded by AppCore on mount)
    const js = isDemoMode
      ? jobseekerService.getAll()
      : jobseekerService.getRealJobseekers()
    setJobseekers(js)
  }, [isDemoMode])

  // ── Compute metrics whenever underlying data changes ────────
  useEffect(() => {
    if (jobseekers.length === 0) return
    const snap = { activityLogs, applications, interviews, checkIns }
    const m = {}
    jobseekers.forEach(j => {
      m[j.id] = deriveJobseekerMetrics(j.id, snap, j.weeklyTargetHours || weeklyTarget)
    })
    setAllMetrics(m)
  }, [jobseekers, activityLogs, applications, interviews, checkIns, weeklyTarget])

  // ── Demo-mode filter helper ─────────────────────────────────
  const df = (arr) => isDemoMode ? (arr || []) : (arr || []).filter(r => !r.isDemo)

  const flags     = df(supportFlags)
  const apps      = df(applications)
  const ivs       = df(interviews)
  const evidence  = df(evidenceRecs)
  const chks      = df(checkIns)
  const tks       = df(tasks)
  const actLogs   = df(activityLogs)

  // ── Week / day helpers ──────────────────────────────────────
  const now    = new Date()
  const monday = (() => { const d = new Date(now); d.setDate(d.getDate()-((d.getDay()+6)%7)); d.setHours(0,0,0,0); return d })()
  const inWeek = d => new Date(d) >= monday
  const isToday = d => new Date(d).toDateString() === now.toDateString()

  // ── KPIs ────────────────────────────────────────────────────
  const total         = jobseekers.length
  const activeCount   = jobseekers.filter(j => j.status === 'active').length
  const inactiveCount = jobseekers.filter(j => j.status === 'inactive').length
  const atRiskCount   = jobseekers.filter(j => j.riskLevel === RISK_LEVEL.HIGH || j.riskLevel === RISK_LEVEL.CRITICAL).length
  const criticalCount = jobseekers.filter(j => j.riskLevel === RISK_LEVEL.CRITICAL).length

  const totalHrsWeek   = Object.values(allMetrics).reduce((s, m) => s + (m?.weeklyHoursLogged || 0), 0)
  const avgTargetPct   = total > 0
    ? Math.round(Object.values(allMetrics).reduce((s, m) => s + (m?.weeklyTargetPercent || 0), 0) / total)
    : 0
  const onTarget       = jobseekers.filter(j => (allMetrics[j.id]?.weeklyTargetPercent || 0) >= 80).length
  const belowTarget    = jobseekers.filter(j => (allMetrics[j.id]?.weeklyTargetPercent || 0) < 30).length

  const appsThisWeek   = apps.filter(a => inWeek(a.dateApplied || a.createdAt)).length
  const ivsUpcoming    = ivs.filter(iv => new Date(iv.dateTime) >= now)
  const ivsThisWeek    = ivs.filter(iv => inWeek(iv.dateTime)).length
  const openFlags      = flags.filter(f => f.status !== 'resolved')
  const chksToday      = chks.filter(c => isToday(c.date || c.createdAt)).length
  const chksWeek       = chks.filter(c => inWeek(c.date || c.createdAt)).length
  const pendingTasks   = tks.filter(t => t.status === 'pending' || t.status === 'in_progress').length
  const overdueTasks   = tks.filter(t => t.status === 'pending' && t.dueDate && new Date(t.dueDate) < now).length
  const evidenceGaps   = jobseekers.filter(j =>
    j.status === 'active' && evidence.filter(e => e.jobseekerId === j.id).length === 0
  ).length

  // ── Sorted & sliced lists ───────────────────────────────────
  const jsMap       = jobseekers.reduce((acc, j) => { acc[j.id] = j; return acc }, {})
  const riskOrder   = { critical: 0, high: 1, medium: 2, low: 3 }
  const byRisk      = [...jobseekers].sort((a, b) => (riskOrder[a.riskLevel] ?? 4) - (riskOrder[b.riskLevel] ?? 4)).slice(0, 8)
  const topFlags    = [...openFlags].sort((a, b) => (riskOrder[a.severity] ?? 4) - (riskOrder[b.severity] ?? 4)).slice(0, 6)
  const nextIvs     = [...ivsUpcoming].sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime)).slice(0, 4)
  const byTarget    = [...jobseekers].sort((a, b) => (allMetrics[a.id]?.weeklyTargetPercent || 0) - (allMetrics[b.id]?.weeklyTargetPercent || 0)).slice(0, 6)

  // ── Activity feed (correct field: durationMinutes not durationHours) ──
  const feedItems = [
    ...actLogs.slice(0, 6).map(a => ({
      icon: 'Clock', color: C.gold, date: a.createdAt,
      label: `${jsMap[a.jobseekerId]?.displayName || 'Jobseeker'} logged ${a.activityType || 'activity'}`,
      sub: `${Math.round((a.durationMinutes || 0) / 60 * 10) / 10}h · ${a.description || ''}`.trim().replace(/·\s*$/, ''),
    })),
    ...apps.filter(a => inWeek(a.dateApplied || a.createdAt)).slice(0, 3).map(a => ({
      icon: 'Send', color: C.blue, date: a.dateApplied || a.createdAt,
      label: `${jsMap[a.jobseekerId]?.displayName || 'Jobseeker'} applied — ${a.employer || a.roleTitle || 'role'}`,
      sub: a.roleTitle || '',
    })),
    ...chks.filter(c => inWeek(c.date || c.createdAt)).slice(0, 3).map(c => ({
      icon: 'CheckCircle2', color: C.green, date: c.date || c.createdAt,
      label: `${jsMap[c.jobseekerId]?.displayName || 'Jobseeker'} completed check-in`,
      sub: '',
    })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8)

  const avgCol = avgTargetPct >= 70 ? C.green : avgTargetPct >= 40 ? C.amber : C.red

  return (
    <div className="p-4 md:p-6 space-y-5 min-h-full">

      {/* ── HEADER ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: `${C.gold}12`, border: `1px solid ${C.gold}28` }}>
              <Icon name="LayoutDashboard" size={16} style={{ color: C.gold }} />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-tight">
                Coach Dashboard
              </h1>
              <p className="text-[11px] text-slate-600">
                {config?.organisationName || 'CareerLink Employment Support'} ·{' '}
                <span style={{ color: C.gold + '99' }}>4P3X Intelligent AI</span>
              </p>
            </div>
          </div>
        </div>
        <LiveClock />
      </div>

      {/* ── DEMO BANNER ─────────────────────────────────── */}
      {isDemoMode && (
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl"
          style={{ background: `${C.amber}07`, border: `1px solid ${C.amber}22` }}>
          <Icon name="FlaskConical" size={13} style={{ color: C.amber }} />
          <span className="text-xs" style={{ color: C.amber }}>
            Demo Mode — sample data active.{' '}
            <button onClick={() => navigate('/settings')} className="underline hover:no-underline">
              Disable in Settings
            </button>
            .
          </span>
        </div>
      )}

      {/* ── ROW 1: PRIMARY KPIs ─────────────────────────── */}
      <div>
        <SectionTitle icon="BarChart3" label="Caseload Overview" color={C.gold} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiCard label="Total Caseload"        value={total}           sub={`${activeCount} active · ${inactiveCount} inactive`}             icon="Users"          color={C.gold}   onClick={() => navigate('/jobseekers')} />
          <KpiCard label="At Risk"               value={atRiskCount}     sub={criticalCount > 0 ? `${criticalCount} critical` : 'None critical'} icon="ShieldAlert"    color={C.red}    pulse={atRiskCount > 0} onClick={() => navigate('/support-risks')} />
          <KpiCard label="Avg Weekly Progress"   value={`${avgTargetPct}%`} sub={`${onTarget} on target · ${belowTarget} below 30%`}            icon="TrendingUp"     color={avgCol}   onClick={() => navigate('/weekly-activity')} />
          <KpiCard label="Hours Logged This Week" value={`${totalHrsWeek}h`} sub={`35h target × ${total} = ${35*total}h total`}                icon="Clock"          color={C.purple} onClick={() => navigate('/weekly-activity')} />
        </div>
      </div>

      {/* ── ROW 2: ACTIVITY KPIs ────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Applications This Week" value={appsThisWeek}    sub={`${apps.length} total recorded`}        icon="Send"           color={C.blue}   onClick={() => navigate('/applications')} />
        <KpiCard label="Interviews Upcoming"    value={ivsUpcoming.length} sub={`${ivsThisWeek} this week`}          icon="CalendarCheck"  color={C.green}  onClick={() => navigate('/interviews')} />
        <KpiCard label="Check-ins Today"        value={chksToday}       sub={`${chksWeek} this week`}                icon="ClipboardCheck" color={C.gold}   onClick={() => navigate('/check-ins')} />
        <KpiCard label="Open Support Flags"     value={openFlags.length} sub={`${pendingTasks} tasks pending`}       icon="AlertTriangle"  color={openFlags.length > 0 ? C.red : C.green} pulse={openFlags.length > 0} onClick={() => navigate('/support-risks')} />
      </div>

      {/* ── ROW 3: SECONDARY KPIs ───────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard label="Evidence Gaps"     value={evidenceGaps}   sub="Active with no evidence uploaded" icon="FileWarning"  color={evidenceGaps > 0 ? C.amber : C.green} pulse={evidenceGaps > 2} onClick={() => navigate('/evidence')} />
        <KpiCard label="Overdue Tasks"     value={overdueTasks}   sub={`${pendingTasks} total open`}      icon="ListTodo"    color={overdueTasks > 0 ? C.red : C.green}   pulse={overdueTasks > 0} onClick={() => navigate('/tasks')} />
        <KpiCard label="Total Applications" value={apps.length}   sub="All time recorded"                icon="FileText"    color={C.silver} onClick={() => navigate('/applications')} />
        <KpiCard label="Evidence Records"  value={evidence.length} sub="Total uploaded"                  icon="Paperclip"   color={C.silver} onClick={() => navigate('/evidence')} />
      </div>

      {/* ── ROW 4: JOBSEEKERS + FLAGS ───────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Jobseeker risk list */}
        <div className="rounded-xl p-4" style={{ background: '#070d1a', border: `1px solid ${C.gold}14` }}>
          <SectionTitle icon="Users" label="Jobseekers by Risk" color={C.gold} onMore={() => navigate('/jobseekers')} />
          <div className="space-y-0.5">
            {byRisk.length === 0
              ? <Empty icon="Users" text="No jobseekers yet. Demo mode adds sample data." />
              : byRisk.map(js => (
                  <JsRow key={js.id} js={js} metrics={allMetrics[js.id]}
                    onClick={() => navigate(`/jobseekers/${js.id}`)} />
                ))}
          </div>
        </div>

        {/* Support flags */}
        <div className="rounded-xl p-4" style={{ background: '#070d1a', border: `1px solid ${C.red}14` }}>
          <SectionTitle icon="ShieldAlert" label="Open Support Flags" color={C.red} onMore={() => navigate('/support-risks')} />
          <div className="space-y-2">
            {topFlags.length === 0
              ? <Empty icon="ShieldCheck" text="No open support flags." />
              : topFlags.map(f => <FlagRow key={f.id} flag={f} jsName={jsMap[f.jobseekerId]?.displayName} />)}
          </div>
        </div>
      </div>

      {/* ── ROW 5: WEEKLY TARGETS + INTERVIEWS ──────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* 35h weekly targets */}
        <div className="rounded-xl p-4" style={{ background: '#070d1a', border: `1px solid ${C.purple}14` }}>
          <SectionTitle icon="Timer" label="Weekly Hour Targets (35h)" color={C.purple} onMore={() => navigate('/weekly-activity')} />
          {/* Summary */}
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-3"
            style={{ background: `${C.purple}07`, border: `1px solid ${C.purple}15` }}>
            <Donut pct={avgTargetPct} color={avgCol} size={38} stroke={5} />
            <div>
              <div className="text-sm font-bold text-white">{avgTargetPct}% avg completion this week</div>
              <div className="text-[10px] text-slate-600">{totalHrsWeek}h logged · 35h target per jobseeker</div>
            </div>
          </div>
          <div className="divide-y divide-slate-800/30">
            {byTarget.length === 0
              ? <Empty icon="Timer" text="No weekly activity logged yet." />
              : byTarget.map(js => <TargetRow key={js.id} js={js} metrics={allMetrics[js.id]} />)}
          </div>
        </div>

        {/* Upcoming interviews */}
        <div className="rounded-xl p-4" style={{ background: '#070d1a', border: `1px solid ${C.blue}14` }}>
          <SectionTitle icon="CalendarCheck" label="Upcoming Interviews" color={C.blue} onMore={() => navigate('/interviews')} />
          <div className="space-y-2">
            {nextIvs.length === 0
              ? <Empty icon="CalendarCheck" text="No upcoming interviews." />
              : nextIvs.map(iv => <IvCard key={iv.id} iv={iv} jsName={jsMap[iv.jobseekerId]?.displayName} />)}
          </div>
        </div>
      </div>

      {/* ── ROW 6: ACTIVITY FEED + QUICK ACTIONS ────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Feed — 2/3 */}
        <div className="lg:col-span-2 rounded-xl p-4" style={{ background: '#070d1a', border: `1px solid ${C.silver}10` }}>
          <SectionTitle icon="Activity" label="Recent Activity" color={C.silver} />
          {feedItems.length === 0
            ? <Empty icon="Activity" text="Activity will appear as jobseekers log their work." />
            : feedItems.map((item, i) => (
                <FeedItem key={i} icon={item.icon} color={item.color}
                  label={item.label} sub={item.sub} timeStr={fmtTime(item.date)} />
              ))}
        </div>

        {/* Quick Actions — 1/3 */}
        <div className="rounded-xl p-4 flex flex-col gap-2" style={{ background: '#070d1a', border: `1px solid ${C.gold}14` }}>
          <SectionTitle icon="Zap" label="Quick Actions" color={C.gold} />
          <QA label="Add Jobseeker"        icon="UserPlus"       color={C.gold}   onClick={() => navigate('/jobseeker-setup')} />
          <QA label="New Application"      icon="Send"           color={C.blue}   onClick={() => navigate('/applications')} />
          <QA label="Schedule Interview"   icon="CalendarPlus"   color={C.green}  onClick={() => navigate('/interviews')} />
          <QA label="Record Check-in"      icon="ClipboardCheck" color={C.gold}   onClick={() => navigate('/check-ins')} />
          <QA label="Upload Evidence"      icon="Upload"         color={C.silver} onClick={() => navigate('/evidence')} />
          <QA label="Create Task"          icon="ListPlus"       color={C.amber}  onClick={() => navigate('/tasks')} />
          <QA label="Weekly Activity"      icon="Clock"          color={C.purple} onClick={() => navigate('/weekly-activity')} />
          <QA label="View Risk Flags"      icon="ShieldAlert"    color={C.red}    onClick={() => navigate('/support-risks')} />
          <QA label="4P3X AI Insights"     icon="Brain"          color={C.purple} onClick={() => navigate('/ai')} />
          <QA label="Full Reports"         icon="BarChart2"      color={C.gold}   onClick={() => navigate('/reports')} />
        </div>
      </div>

      {/* ── FOOTER ──────────────────────────────────────── */}
      <div className="pt-1 pb-4 text-center">
        <span className="text-[10px] text-slate-800">
          CareerLink OS Powered 4P3X Intelligent AI™ Created by Kyzel Kreates™
        </span>
      </div>

    </div>
  )
}
