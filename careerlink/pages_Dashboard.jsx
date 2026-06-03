/**
 * ============================================================
 * CareerLink OS™ — Coach Dashboard (Full Rebuild v2)
 * Employment Support Metrics · Risk Monitor · Activity Hub
 * Powered by 4P3X Intelligent AI — Created by Kyzel Kreates
 * ============================================================
 */

import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from './components_ui_Icon'
import {
  useConfigStore, useDataStore, deriveJobseekerMetrics,
} from './core_storage'
import {
  jobseekerService, JOBSEEKER_STATUS, RISK_LEVEL,
} from './services_careerlink_jobseekerService'
import { loadDemoData } from './services_careerlink_demoData'
import { formatDateTime } from './utils_format'

// ─── Constants ────────────────────────────────────────────────
const GOLD   = '#d4af37'
const SILVER = '#b0b8c8'
const GREEN  = '#22c55e'
const PURPLE = '#a855f7'
const RED    = '#ef4444'
const AMBER  = '#f59e0b'
const BLUE   = '#3b82f6'

// ─── Live Clock ───────────────────────────────────────────────
function LiveClock() {
  const [t, setT] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setT(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return (
    <div className="text-right flex-shrink-0">
      <div className="font-mono text-xl md:text-2xl font-bold text-white tabular-nums tracking-tight">
        {t.toLocaleTimeString('en-GB', { hour12: false })}
      </div>
      <div className="text-[11px] text-slate-500 mt-0.5">
        {t.toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
      </div>
    </div>
  )
}

// ─── Section Title ─────────────────────────────────────────────
function SectionTitle({ icon, label, color = GOLD, action, actionLabel }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <Icon name={icon} size={14} style={{ color }} />
        <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color }}>{label}</span>
      </div>
      {action && (
        <button
          onClick={action}
          className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-1"
        >
          {actionLabel} <Icon name="ChevronRight" size={10} />
        </button>
      )}
    </div>
  )
}

// ─── KPI Card ─────────────────────────────────────────────────
function KpiCard({ label, value, sub, icon, color, glowColor, onClick, pulse, trend, trendUp }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left rounded-xl p-4 border transition-all hover:brightness-110 hover:scale-[1.01] active:scale-[0.99] relative overflow-hidden group"
      style={{
        background: `linear-gradient(135deg, ${color}08 0%, #0a0f1e 100%)`,
        borderColor: `${color}25`,
      }}
    >
      {pulse && (
        <span className="absolute top-3 right-3 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: RED }} />
          <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: RED }} />
        </span>
      )}
      <div className="flex items-start justify-between mb-3">
        <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase leading-tight pr-4">{label}</span>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform"
          style={{ background: `${color}15`, border: `1px solid ${color}30` }}
        >
          <Icon name={icon} size={14} style={{ color }} />
        </div>
      </div>
      <div className="font-mono text-3xl font-bold tabular-nums" style={{ color }}>
        {value ?? '—'}
      </div>
      <div className="flex items-center justify-between mt-1.5">
        {sub && <span className="text-[10px] text-slate-600">{sub}</span>}
        {trend != null && (
          <span className={`text-[10px] flex items-center gap-0.5 ${trendUp ? 'text-emerald-400' : 'text-red-400'}`}>
            <Icon name={trendUp ? 'TrendingUp' : 'TrendingDown'} size={10} />
            {trend}
          </span>
        )}
      </div>
    </button>
  )
}

// ─── Risk Badge ───────────────────────────────────────────────
function RiskBadge({ level }) {
  const styles = {
    low:      { color: GREEN,  bg: `${GREEN}12`,  border: `${GREEN}25` },
    medium:   { color: AMBER,  bg: `${AMBER}12`,  border: `${AMBER}25` },
    high:     { color: RED,    bg: `${RED}12`,    border: `${RED}25` },
    critical: { color: '#fca5a5', bg: `${RED}18`, border: `${RED}35` },
  }[level] || { color: SILVER, bg: '#1e293b', border: '#334155' }
  return (
    <span
      className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border flex-shrink-0"
      style={{ color: styles.color, background: styles.bg, borderColor: styles.border }}
    >
      {level || 'low'}
    </span>
  )
}

// ─── Status Badge ─────────────────────────────────────────────
function StatusBadge({ status }) {
  const styles = {
    active:       { color: GREEN,  label: 'Active' },
    at_risk:      { color: RED,    label: 'At Risk' },
    inactive:     { color: SILVER, label: 'Inactive' },
    completed:    { color: BLUE,   label: 'Completed' },
    on_hold:      { color: AMBER,  label: 'On Hold' },
  }[status] || { color: SILVER, label: status || 'Unknown' }
  return (
    <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: styles.color }}>
      {styles.label}
    </span>
  )
}

// ─── Mini Progress Bar ────────────────────────────────────────
function ProgressBar({ pct, height = 4, showLabel = false }) {
  const clamp = Math.min(100, Math.max(0, pct || 0))
  const color = clamp >= 100 ? GREEN : clamp >= 60 ? GOLD : clamp >= 30 ? AMBER : RED
  return (
    <div className="flex items-center gap-2">
      <div
        className="flex-1 rounded-full overflow-hidden"
        style={{ height, background: '#1e293b' }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${clamp}%`, background: color }}
        />
      </div>
      {showLabel && (
        <span className="text-[10px] font-mono flex-shrink-0" style={{ color }}>
          {clamp}%
        </span>
      )}
    </div>
  )
}

// ─── Donut Mini Chart ─────────────────────────────────────────
function DonutMini({ pct, color, size = 40, stroke = 5 }) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const clamp = Math.min(100, Math.max(0, pct || 0))
  const dash = (clamp / 100) * circ
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1e293b" strokeWidth={stroke} />
      <circle
        cx={size/2} cy={size/2} r={r} fill="none"
        stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
      />
    </svg>
  )
}

// ─── Jobseeker Card Row ───────────────────────────────────────
function JobseekerRow({ js, metrics, onClick, rank }) {
  const pct = metrics?.weeklyTargetPercent ?? 0
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800/40 cursor-pointer transition-all group text-left"
    >
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-xs"
        style={{ background: `${GOLD}12`, border: `1px solid ${GOLD}25`, color: GOLD }}
      >
        {js.displayName?.charAt(0) || '?'}
      </div>

      {/* Name + progress */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="text-xs font-semibold text-slate-200 group-hover:text-white transition-colors truncate">
            {js.displayName}
          </span>
          {js.isDemo && <span className="text-[9px] text-amber-600/60 font-mono flex-shrink-0">[DEMO]</span>}
        </div>
        <ProgressBar pct={pct} height={3} />
      </div>

      {/* Hours */}
      <div className="text-right flex-shrink-0 ml-2">
        <div className="text-xs font-mono text-slate-300">{metrics?.weeklyHoursLogged ?? 0}h</div>
        <div className="text-[9px] text-slate-600">of {js.weeklyTargetHours || 35}h</div>
      </div>

      {/* Status */}
      <div className="flex-shrink-0 hidden sm:block">
        <StatusBadge status={js.status} />
      </div>

      {/* Risk */}
      <RiskBadge level={js.riskLevel || 'low'} />
    </button>
  )
}

// ─── Flag Row ─────────────────────────────────────────────────
function FlagRow({ flag, jsName }) {
  const cfg = {
    critical: { color: '#fca5a5', bg: `${RED}10`,   border: `${RED}25` },
    high:     { color: RED,       bg: `${RED}07`,    border: `${RED}15` },
    medium:   { color: AMBER,     bg: `${AMBER}07`,  border: `${AMBER}18` },
    low:      { color: SILVER,    bg: '#0f172a',      border: '#1e293b' },
  }[flag.severity] || { color: SILVER, bg: '#0f172a', border: '#1e293b' }

  return (
    <div
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg border"
      style={{ background: cfg.bg, borderColor: cfg.border }}
    >
      <Icon name="AlertTriangle" size={12} style={{ color: cfg.color, flexShrink: 0 }} />
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold truncate capitalize" style={{ color: cfg.color }}>
          {flag.type?.replace(/_/g, ' ') || 'Flag'}
        </div>
        <div className="text-[10px] text-slate-600 truncate">{jsName || 'Unknown jobseeker'}</div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className="text-[10px] text-slate-600 font-mono">
          {new Date(flag.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
        </div>
        <div className="text-[9px] capitalize" style={{ color: cfg.color }}>{flag.severity}</div>
      </div>
    </div>
  )
}

// ─── Activity Item ────────────────────────────────────────────
function ActivityItem({ icon, label, sub, color, time }) {
  return (
    <div className="flex items-start gap-3 py-2">
      <div
        className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ background: `${color}12`, border: `1px solid ${color}20` }}
      >
        <Icon name={icon} size={12} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-slate-300 truncate">{label}</div>
        {sub && <div className="text-[10px] text-slate-600 truncate">{sub}</div>}
      </div>
      <div className="text-[10px] text-slate-700 font-mono flex-shrink-0">{time}</div>
    </div>
  )
}

// ─── Interview Row ────────────────────────────────────────────
function InterviewRow({ iv, jsName }) {
  const d = new Date(iv.dateTime)
  const isPast = d < new Date()
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-800/20 border border-slate-800/40">
      <div
        className="w-8 h-8 rounded-lg flex flex-col items-center justify-center flex-shrink-0"
        style={{ background: isPast ? '#1e293b' : `${BLUE}12`, border: `1px solid ${isPast ? '#334155' : BLUE + '30'}` }}
      >
        <span className="text-[10px] font-bold" style={{ color: isPast ? SILVER : BLUE }}>
          {d.toLocaleDateString('en-GB', { day: '2-digit' })}
        </span>
        <span className="text-[8px]" style={{ color: isPast ? '#475569' : BLUE }}>
          {d.toLocaleDateString('en-GB', { month: 'short' })}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-semibold text-slate-200 truncate">{jsName}</div>
        <div className="text-[10px] text-slate-500 truncate">
          {iv.employer || iv.company || 'Interview'} · {d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      <span
        className="text-[9px] font-bold uppercase tracking-wider flex-shrink-0"
        style={{ color: isPast ? SILVER : BLUE }}
      >
        {isPast ? 'Past' : 'Upcoming'}
      </span>
    </div>
  )
}

// ─── Weekly Target Row (per jobseeker) ────────────────────────
function TargetRow({ js, metrics }) {
  const pct   = metrics?.weeklyTargetPercent ?? 0
  const hours = metrics?.weeklyHoursLogged ?? 0
  const target = js.weeklyTargetHours || 35
  const color = pct >= 100 ? GREEN : pct >= 60 ? GOLD : pct >= 30 ? AMBER : RED
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span className="text-[11px] text-slate-400 truncate flex-1 min-w-0">{js.displayName}</span>
      <div className="flex items-center gap-2 flex-shrink-0">
        <DonutMini pct={pct} color={color} size={28} stroke={4} />
        <div className="text-right">
          <div className="text-[11px] font-mono font-bold" style={{ color }}>{hours}h</div>
          <div className="text-[9px] text-slate-700">/{target}h</div>
        </div>
      </div>
    </div>
  )
}

// ─── Empty State ──────────────────────────────────────────────
function EmptySlot({ icon, label }) {
  return (
    <div className="flex flex-col items-center justify-center py-6 text-center">
      <Icon name={icon} size={22} className="text-slate-800 mb-2" />
      <span className="text-[11px] text-slate-700">{label}</span>
    </div>
  )
}

// ─── Dashboard Main ───────────────────────────────────────────
export default function Dashboard() {
  const navigate     = useNavigate()
  const config       = useConfigStore(s => s.config)
  const isDemoMode   = config.demoModeEnabled
  const weeklyTarget = config.weeklyTargetHoursDefault ?? 35
  const dataStore    = useDataStore()

  const [jobseekers, setJobseekers] = useState([])
  const [allMetrics, setAllMetrics] = useState({})

  const reload = useCallback(() => {
    if (isDemoMode) loadDemoData(jobseekerService, dataStore)
    const js = isDemoMode
      ? jobseekerService.getAll()
      : jobseekerService.getRealJobseekers()
    setJobseekers(js)
    const snap = {
      activityLogs: isDemoMode ? dataStore.activityLogs : dataStore.activityLogs.filter(r => !r.isDemo),
      applications: isDemoMode ? dataStore.applications : dataStore.applications.filter(r => !r.isDemo),
      interviews:   isDemoMode ? dataStore.interviews   : dataStore.interviews.filter(r => !r.isDemo),
      checkIns:     isDemoMode ? dataStore.checkIns     : dataStore.checkIns.filter(r => !r.isDemo),
    }
    const m = {}
    js.forEach(j => { m[j.id] = deriveJobseekerMetrics(j.id, snap, j.weeklyTargetHours || weeklyTarget) })
    setAllMetrics(m)
  }, [isDemoMode, weeklyTarget, dataStore])

  useEffect(() => { reload() }, [reload])

  // ── Data slices ────────────────────────────────────────────
  const filter = (arr) => isDemoMode ? arr : arr.filter(r => !r.isDemo)
  const flags     = filter(dataStore.supportFlags  || [])
  const apps      = filter(dataStore.applications  || [])
  const ivs       = filter(dataStore.interviews    || [])
  const evidence  = filter(dataStore.evidenceRecords || [])
  const checkIns  = filter(dataStore.checkIns      || [])
  const tasks     = filter(dataStore.tasks         || [])
  const actLogs   = filter(dataStore.activityLogs  || [])
  const coachNotes = filter(dataStore.coachNotes   || [])

  // ── Week helpers ───────────────────────────────────────────
  const now    = new Date()
  const monday = (() => { const d = new Date(now); d.setDate(d.getDate() - ((d.getDay() + 6) % 7)); d.setHours(0,0,0,0); return d })()
  const inWeek = (d) => new Date(d) >= monday
  const today  = (d) => new Date(d).toDateString() === now.toDateString()

  // ── KPI computations ───────────────────────────────────────
  const total        = jobseekers.length
  const activeCount  = jobseekers.filter(j => j.status === 'active').length
  const atRiskCount  = jobseekers.filter(j => j.riskLevel === RISK_LEVEL.HIGH || j.riskLevel === RISK_LEVEL.CRITICAL).length
  const criticalCount= jobseekers.filter(j => j.riskLevel === RISK_LEVEL.CRITICAL).length
  const inactiveCount= jobseekers.filter(j => j.status === 'inactive').length

  const totalHrsWeek   = Object.values(allMetrics).reduce((s, m) => s + (m?.weeklyHoursLogged || 0), 0)
  const avgTargetPct   = total > 0
    ? Math.round(Object.values(allMetrics).reduce((s, m) => s + (m?.weeklyTargetPercent || 0), 0) / total)
    : 0
  const onTarget       = jobseekers.filter(j => (allMetrics[j.id]?.weeklyTargetPercent || 0) >= 80).length
  const belowTarget    = jobseekers.filter(j => (allMetrics[j.id]?.weeklyTargetPercent || 0) < 30).length

  const appsThisWeek   = apps.filter(a => inWeek(a.dateApplied || a.createdAt)).length
  const appsTotal      = apps.length
  const ivsUpcoming    = ivs.filter(iv => new Date(iv.dateTime) >= now)
  const ivsThisWeek    = ivs.filter(iv => inWeek(iv.dateTime)).length
  const openFlags      = flags.filter(f => f.status !== 'resolved')
  const checkInsToday  = checkIns.filter(c => today(c.date || c.createdAt)).length
  const checkInsWeek   = checkIns.filter(c => inWeek(c.date || c.createdAt)).length
  const pendingTasks   = tasks.filter(t => t.status === 'pending' || t.status === 'in_progress').length
  const overdueTasks   = tasks.filter(t => t.status === 'pending' && t.dueDate && new Date(t.dueDate) < now).length
  const evidenceGaps   = jobseekers.filter(j => {
    const jsEvidence = evidence.filter(e => e.jobseekerId === j.id)
    return jsEvidence.length === 0 && j.status === 'active'
  }).length

  // ── Sorted lists ───────────────────────────────────────────
  const jsMap        = jobseekers.reduce((acc, j) => { acc[j.id] = j; return acc }, {})
  const sortedByRisk = [...jobseekers].sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 }
    return (order[a.riskLevel] ?? 4) - (order[b.riskLevel] ?? 4)
  })
  const topFlags     = openFlags.sort((a, b) => {
    const order = { critical: 0, high: 1, medium: 2, low: 3 }
    return (order[a.severity] ?? 4) - (order[b.severity] ?? 4)
  }).slice(0, 6)
  const nextIvs      = ivsUpcoming.sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime)).slice(0, 4)
  const recentActs   = [...actLogs].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6)
  const sortedTarget = [...jobseekers].sort((a, b) =>
    (allMetrics[a.id]?.weeklyTargetPercent || 0) - (allMetrics[b.id]?.weeklyTargetPercent || 0)
  )

  // ── Recent combined activity feed ─────────────────────────
  const actFeed = [
    ...recentActs.map(a => ({
      icon: 'Clock', color: GOLD,
      label: `${jsMap[a.jobseekerId]?.displayName || 'Jobseeker'} logged ${a.activityType?.replace(/_/g, ' ') || 'activity'}`,
      sub: `${a.durationHours || 0}h · ${a.description || ''}`,
      date: a.createdAt,
    })),
    ...apps.filter(a => inWeek(a.dateApplied || a.createdAt)).slice(0, 3).map(a => ({
      icon: 'Send', color: BLUE,
      label: `${jsMap[a.jobseekerId]?.displayName || 'Jobseeker'} applied to ${a.employer || a.jobTitle || 'a role'}`,
      sub: a.jobTitle || '',
      date: a.dateApplied || a.createdAt,
    })),
    ...checkIns.filter(c => inWeek(c.date || c.createdAt)).slice(0, 3).map(c => ({
      icon: 'CheckCircle2', color: GREEN,
      label: `${jsMap[c.jobseekerId]?.displayName || 'Jobseeker'} completed check-in`,
      sub: c.mood ? `Mood: ${c.mood}` : '',
      date: c.date || c.createdAt,
    })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 8)

  return (
    <div className="p-4 md:p-6 space-y-6 min-h-full">

      {/* ── HEADER ──────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: `${GOLD}12`, border: `1px solid ${GOLD}30` }}
            >
              <Icon name="LayoutDashboard" size={15} style={{ color: GOLD }} />
            </div>
            <h1 className="font-bold text-white text-xl md:text-2xl tracking-tight">
              Coach Dashboard
            </h1>
          </div>
          <p className="text-slate-500 text-sm pl-10">
            {config.organisationName || 'CareerLink Employment Support'} ·{' '}
            <span style={{ color: GOLD + 'aa' }}>4P3X Intelligent AI</span>
          </p>
        </div>
        <LiveClock />
      </div>

      {/* ── DEMO BANNER ─────────────────────────────────── */}
      {isDemoMode && (
        <div
          className="flex items-center gap-3 px-4 py-3 rounded-xl"
          style={{ background: `${AMBER}08`, border: `1px solid ${AMBER}25` }}
        >
          <Icon name="FlaskConical" size={13} style={{ color: AMBER }} />
          <span className="text-xs font-medium" style={{ color: AMBER }}>
            Demo Mode — showing sample data. Disable in{' '}
            <button onClick={() => navigate('/settings')} className="underline hover:no-underline">
              Settings → Demo / Data
            </button>
            .
          </span>
        </div>
      )}

      {/* ── ROW 1: PRIMARY KPIs ─────────────────────────── */}
      <div>
        <SectionTitle icon="BarChart3" label="Caseload Overview" color={GOLD} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiCard
            label="Total Caseload"
            value={total}
            sub={`${activeCount} active · ${inactiveCount} inactive`}
            icon="Users"
            color={GOLD}
            onClick={() => navigate('/jobseekers')}
          />
          <KpiCard
            label="At Risk"
            value={atRiskCount}
            sub={criticalCount > 0 ? `${criticalCount} critical` : 'None critical'}
            icon="ShieldAlert"
            color={RED}
            pulse={atRiskCount > 0}
            onClick={() => navigate('/support-risks')}
          />
          <KpiCard
            label="Avg Weekly Progress"
            value={`${avgTargetPct}%`}
            sub={`${onTarget} on target · ${belowTarget} below 30%`}
            icon="TrendingUp"
            color={avgTargetPct >= 70 ? GREEN : avgTargetPct >= 40 ? AMBER : RED}
            onClick={() => navigate('/weekly-activity')}
          />
          <KpiCard
            label="Total Hours This Week"
            value={`${totalHrsWeek}h`}
            sub={`Target: ${weeklyTarget}h × ${total} = ${weeklyTarget * total}h`}
            icon="Clock"
            color={PURPLE}
            onClick={() => navigate('/weekly-activity')}
          />
        </div>
      </div>

      {/* ── ROW 2: ACTIVITY KPIs ────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard
          label="Applications This Week"
          value={appsThisWeek}
          sub={`${appsTotal} total recorded`}
          icon="Send"
          color={BLUE}
          onClick={() => navigate('/applications')}
        />
        <KpiCard
          label="Interviews Upcoming"
          value={ivsUpcoming.length}
          sub={`${ivsThisWeek} this week`}
          icon="CalendarCheck"
          color={GREEN}
          onClick={() => navigate('/interviews')}
        />
        <KpiCard
          label="Check-ins Today"
          value={checkInsToday}
          sub={`${checkInsWeek} this week`}
          icon="ClipboardCheck"
          color={GOLD}
          onClick={() => navigate('/check-ins')}
        />
        <KpiCard
          label="Open Support Flags"
          value={openFlags.length}
          sub={`${tasks.filter(t=>t.status==='pending').length} tasks pending`}
          icon="AlertTriangle"
          color={openFlags.length > 0 ? RED : GREEN}
          pulse={openFlags.length > 0}
          onClick={() => navigate('/support-risks')}
        />
      </div>

      {/* ── ROW 3: SECONDARY KPIs ───────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard
          label="Evidence Gaps"
          value={evidenceGaps}
          sub="Active jobseekers with no evidence"
          icon="FileWarning"
          color={evidenceGaps > 0 ? AMBER : GREEN}
          pulse={evidenceGaps > 2}
          onClick={() => navigate('/evidence')}
        />
        <KpiCard
          label="Overdue Tasks"
          value={overdueTasks}
          sub={`${pendingTasks} total open tasks`}
          icon="ListTodo"
          color={overdueTasks > 0 ? RED : GREEN}
          pulse={overdueTasks > 0}
          onClick={() => navigate('/tasks')}
        />
        <KpiCard
          label="Total Applications"
          value={appsTotal}
          sub="All time recorded"
          icon="FileText"
          color={SILVER}
          onClick={() => navigate('/applications')}
        />
        <KpiCard
          label="Evidence Uploaded"
          value={evidence.length}
          sub="Total evidence records"
          icon="Paperclip"
          color={SILVER}
          onClick={() => navigate('/evidence')}
        />
      </div>

      {/* ── ROW 4: JOBSEEKER LIST + FLAGS ───────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Jobseeker Risk List */}
        <div
          className="rounded-xl p-4"
          style={{ background: '#080d1a', border: `1px solid ${GOLD}18` }}
        >
          <SectionTitle
            icon="Users"
            label="Jobseekers by Risk"
            color={GOLD}
            action={() => navigate('/jobseekers')}
            actionLabel="View all"
          />
          <div className="space-y-1">
            {sortedByRisk.length === 0 && (
              <EmptySlot icon="Users" label="No jobseekers loaded yet. Enable demo mode or add real records." />
            )}
            {sortedByRisk.slice(0, 8).map(js => (
              <JobseekerRow
                key={js.id}
                js={js}
                metrics={allMetrics[js.id]}
                onClick={() => navigate(`/jobseekers/${js.id}`)}
              />
            ))}
          </div>
        </div>

        {/* Open Support Flags */}
        <div
          className="rounded-xl p-4"
          style={{ background: '#080d1a', border: `1px solid ${RED}18` }}
        >
          <SectionTitle
            icon="ShieldAlert"
            label="Open Support Flags"
            color={RED}
            action={() => navigate('/support-risks')}
            actionLabel="View all"
          />
          <div className="space-y-2">
            {topFlags.length === 0 && (
              <EmptySlot icon="ShieldCheck" label="No open support flags." />
            )}
            {topFlags.map(flag => (
              <FlagRow
                key={flag.id}
                flag={flag}
                jsName={jsMap[flag.jobseekerId]?.displayName}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── ROW 5: WEEKLY TARGETS + UPCOMING INTERVIEWS ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Weekly 35-hour targets */}
        <div
          className="rounded-xl p-4"
          style={{ background: '#080d1a', border: `1px solid ${PURPLE}18` }}
        >
          <SectionTitle
            icon="Timer"
            label="Weekly Hour Targets"
            color={PURPLE}
            action={() => navigate('/weekly-activity')}
            actionLabel="View all"
          />

          {/* Summary bar */}
          <div
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-3"
            style={{ background: `${PURPLE}08`, border: `1px solid ${PURPLE}18` }}
          >
            <DonutMini pct={avgTargetPct} color={avgTargetPct >= 70 ? GREEN : avgTargetPct >= 40 ? AMBER : RED} size={36} stroke={5} />
            <div>
              <div className="text-sm font-bold text-white">{avgTargetPct}% avg target completion</div>
              <div className="text-[10px] text-slate-600">{totalHrsWeek}h total · {weeklyTarget}h target per jobseeker</div>
            </div>
          </div>

          <div className="space-y-1 divide-y divide-slate-800/30">
            {sortedTarget.length === 0 && (
              <EmptySlot icon="Timer" label="No weekly activity logged yet." />
            )}
            {sortedTarget.slice(0, 6).map(js => (
              <TargetRow key={js.id} js={js} metrics={allMetrics[js.id]} />
            ))}
          </div>
        </div>

        {/* Upcoming Interviews */}
        <div
          className="rounded-xl p-4"
          style={{ background: '#080d1a', border: `1px solid ${BLUE}18` }}
        >
          <SectionTitle
            icon="CalendarCheck"
            label="Upcoming Interviews"
            color={BLUE}
            action={() => navigate('/interviews')}
            actionLabel="View all"
          />
          <div className="space-y-2">
            {nextIvs.length === 0 && (
              <EmptySlot icon="CalendarCheck" label="No upcoming interviews." />
            )}
            {nextIvs.map(iv => (
              <InterviewRow
                key={iv.id}
                iv={iv}
                jsName={jsMap[iv.jobseekerId]?.displayName || 'Unknown'}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── ROW 6: ACTIVITY FEED + QUICK ACTIONS ────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Activity feed — 2/3 width */}
        <div
          className="lg:col-span-2 rounded-xl p-4"
          style={{ background: '#080d1a', border: `1px solid ${SILVER}15` }}
        >
          <SectionTitle icon="Activity" label="Recent Activity" color={SILVER} />
          <div className="divide-y divide-slate-800/40">
            {actFeed.length === 0 && (
              <EmptySlot icon="Activity" label="No recent activity. Activity will appear as jobseekers log their work." />
            )}
            {actFeed.map((a, i) => (
              <ActivityItem
                key={i}
                icon={a.icon}
                label={a.label}
                sub={a.sub}
                color={a.color}
                time={(() => {
                  const d = new Date(a.date)
                  if (today(a.date)) return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
                  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })
                })()}
              />
            ))}
          </div>
        </div>

        {/* Quick Actions — 1/3 width */}
        <div
          className="rounded-xl p-4 flex flex-col gap-2"
          style={{ background: '#080d1a', border: `1px solid ${GOLD}18` }}
        >
          <SectionTitle icon="Zap" label="Quick Actions" color={GOLD} />

          {[
            { label: 'Add Jobseeker',        icon: 'UserPlus',        route: '/jobseeker-setup',   color: GOLD   },
            { label: 'Log Activity',          icon: 'PenLine',         route: '/weekly-activity',   color: PURPLE },
            { label: 'New Application',       icon: 'Send',            route: '/applications',      color: BLUE   },
            { label: 'Schedule Interview',    icon: 'CalendarPlus',    route: '/interviews',        color: GREEN  },
            { label: 'Upload Evidence',       icon: 'Upload',          route: '/evidence',          color: SILVER },
            { label: 'Record Check-in',       icon: 'ClipboardCheck',  route: '/check-ins',         color: GOLD   },
            { label: 'Create Task',           icon: 'ListPlus',        route: '/tasks',             color: AMBER  },
            { label: 'View Risk Report',      icon: 'ShieldAlert',     route: '/support-risks',     color: RED    },
            { label: '4P3X AI Insights',      icon: 'Brain',           route: '/ai',                color: PURPLE },
            { label: 'Full Reports',          icon: 'BarChart2',       route: '/reports',           color: GOLD   },
          ].map(qa => (
            <button
              key={qa.label}
              onClick={() => navigate(qa.route)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all hover:brightness-110 text-left group"
              style={{ background: `${qa.color}08`, border: `1px solid ${qa.color}18` }}
            >
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform"
                style={{ background: `${qa.color}15`, border: `1px solid ${qa.color}25` }}
              >
                <Icon name={qa.icon} size={13} style={{ color: qa.color }} />
              </div>
              <span className="text-xs font-semibold truncate" style={{ color: qa.color + 'dd' }}>
                {qa.label}
              </span>
              <Icon name="ChevronRight" size={10} className="ml-auto flex-shrink-0 opacity-30 group-hover:opacity-70 transition-opacity" style={{ color: qa.color }} />
            </button>
          ))}
        </div>
      </div>

      {/* ── FOOTER BRAND LINE ───────────────────────────── */}
      <div className="pt-2 pb-4 text-center">
        <span className="text-[10px] text-slate-700">
          CareerLink OS™ · Powered by 4P3X Intelligent AI · Created by Kyzel Kreates
        </span>
      </div>

    </div>
  )
}
