/**
 * ============================================================
 * CareerLink OS™ — Coach Dashboard (Overview)
 * Employment support metrics, at-risk alerts, activity feed.
 * Powered by 4P3X Intelligent AI — Created by Kyzel Kreates
 * ============================================================
 */

import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from './components_ui_Icon'
import { useConfigStore, useDataStore, deriveJobseekerMetrics } from './core_storage'
import { jobseekerService, JOBSEEKER_STATUS, RISK_LEVEL } from './services_careerlink_jobseekerService'
import { loadDemoData } from './services_careerlink_demoData'
import { formatDateTime } from './utils_format'

// ─── Live Clock ───────────────────────────────────────────────
function LiveClock() {
  const [time, setTime] = useState(new Date())
  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(id)
  }, [])
  return (
    <div className="text-right">
      <div className="font-mono text-2xl font-bold text-white tabular-nums tracking-tight">
        {time.toLocaleTimeString('en-GB', { hour12: false })}
      </div>
      <div className="text-xs text-slate-500 mt-0.5">
        {time.toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
      </div>
    </div>
  )
}

// ─── KPI Card ─────────────────────────────────────────────────
function KpiCard({ label, value, sub, icon, color, bg, border, pulse, onClick }) {
  return (
    <div onClick={onClick}
      className={`${bg} border ${border} rounded-xl p-4 cursor-pointer hover:brightness-110 transition-all group relative overflow-hidden`}>
      {pulse && <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-red-400 animate-pulse" />}
      <div className="flex items-center justify-between mb-3">
        <span className="text-[10px] text-slate-500 font-semibold tracking-widest uppercase">{label}</span>
        <div className={`w-8 h-8 rounded-lg ${bg} border ${border} flex items-center justify-center group-hover:scale-105 transition-transform`}>
          <Icon name={icon} size={14} className={color} />
        </div>
      </div>
      <div className={`font-mono text-3xl font-bold ${color} tabular-nums`}>{value ?? '—'}</div>
      {sub && <div className="text-[10px] text-slate-600 mt-1.5">{sub}</div>}
    </div>
  )
}

// ─── Risk Badge ───────────────────────────────────────────────
function RiskBadge({ level }) {
  const cfg = {
    low:      'text-emerald-400 bg-emerald-500/8 border-emerald-500/20',
    medium:   'text-amber-400 bg-amber-500/8 border-amber-500/20',
    high:     'text-red-400 bg-red-500/8 border-red-500/20',
    critical: 'text-red-300 bg-red-500/15 border-red-500/30',
  }[level] || 'text-slate-400 bg-slate-800/30 border-slate-800/60'
  return (
    <span className={`text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded border ${cfg}`}>
      {level}
    </span>
  )
}

// ─── Progress Bar ─────────────────────────────────────────────
function ProgressBar({ pct }) {
  const color = pct >= 100 ? 'bg-emerald-500' : pct >= 60 ? 'bg-[#d4af37]' : pct >= 30 ? 'bg-amber-500' : 'bg-red-500'
  return (
    <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${Math.min(100, pct)}%` }} />
    </div>
  )
}

// ─── Jobseeker Row ────────────────────────────────────────────
function JobseekerRow({ jobseeker, metrics, onClick }) {
  return (
    <div onClick={onClick}
      className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800/40 cursor-pointer transition-colors group">
      <div className="w-7 h-7 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/20 flex items-center justify-center flex-shrink-0">
        <span className="text-[#d4af37] text-xs font-bold">{jobseeker.displayName?.charAt(0) || '?'}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-xs font-semibold text-white group-hover:text-[#d4af37] transition-colors truncate">
            {jobseeker.displayName}
          </span>
          {jobseeker.isDemo && <span className="text-[9px] text-amber-500/60 font-mono">[DEMO]</span>}
        </div>
        <ProgressBar pct={metrics?.weeklyTargetPercent ?? 0} />
      </div>
      <div className="text-right flex-shrink-0">
        <div className="text-xs font-mono text-slate-300">{metrics?.weeklyHoursLogged ?? 0}h</div>
        <div className="text-[10px] text-slate-600">this week</div>
      </div>
      <RiskBadge level={jobseeker.riskLevel || 'low'} />
    </div>
  )
}

// ─── Support Flag Row ─────────────────────────────────────────
function FlagRow({ flag, jobseekersMap }) {
  const js = jobseekersMap[flag.jobseekerId]
  const severity = {
    critical: 'text-red-300 bg-red-500/8 border-red-500/25',
    high:     'text-red-400 bg-red-500/5 border-red-500/10',
    medium:   'text-amber-400 bg-amber-500/5 border-amber-500/20',
    low:      'text-slate-400 bg-slate-800/30 border-slate-800/60',
  }[flag.severity] || 'text-slate-400 bg-slate-800/30 border-slate-800/60'
  return (
    <div className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border ${severity}`}>
      <Icon name="AlertTriangle" size={12} className="flex-shrink-0" />
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium truncate capitalize">{flag.type?.replace(/_/g, ' ')}</div>
        <div className="text-[10px] text-slate-600 truncate">{js?.displayName || 'Unknown'}</div>
      </div>
      <span className="text-[10px] text-slate-600 flex-shrink-0 font-mono">
        {new Date(flag.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
      </span>
    </div>
  )
}

// ─── Dashboard Main ───────────────────────────────────────────
export default function Dashboard() {
  const navigate    = useNavigate()
  const config      = useConfigStore(s => s.config)
  const isDemoMode  = config.demoModeEnabled
  const weeklyTarget = config.weeklyTargetHoursDefault ?? 35
  const dataStore   = useDataStore()

  const [jobseekers, setJobseekers] = useState([])
  const [allMetrics, setAllMetrics] = useState({})

  const reload = useCallback(() => {
    // Load demo data if demo mode is on and it's not yet loaded
    if (isDemoMode) {
      loadDemoData(jobseekerService, dataStore)
    }
    const js = isDemoMode
      ? jobseekerService.getAll()
      : jobseekerService.getRealJobseekers()
    setJobseekers(js)

    // Compute per-jobseeker metrics
    const storeSnap = {
      activityLogs: isDemoMode ? dataStore.activityLogs : dataStore.activityLogs.filter(r => !r.isDemo),
      applications: isDemoMode ? dataStore.applications : dataStore.applications.filter(r => !r.isDemo),
      interviews:   isDemoMode ? dataStore.interviews   : dataStore.interviews.filter(r => !r.isDemo),
      checkIns:     isDemoMode ? dataStore.checkIns     : dataStore.checkIns.filter(r => !r.isDemo),
    }
    const metrics = {}
    js.forEach(j => {
      metrics[j.id] = deriveJobseekerMetrics(j.id, storeSnap, j.weeklyTargetHours || weeklyTarget)
    })
    setAllMetrics(metrics)
  }, [isDemoMode, weeklyTarget, dataStore])

  useEffect(() => { reload() }, [reload])

  // ── Global metrics ──────────────────────────────────────────
  const supportFlags = isDemoMode ? dataStore.supportFlags : dataStore.supportFlags.filter(r => !r.isDemo)
  const applications = isDemoMode ? dataStore.applications : dataStore.applications.filter(r => !r.isDemo)
  const interviews   = isDemoMode ? dataStore.interviews   : dataStore.interviews.filter(r => !r.isDemo)
  const evidenceRecords = isDemoMode ? dataStore.evidenceRecords : dataStore.evidenceRecords.filter(r => !r.isDemo)
  const checkIns     = isDemoMode ? dataStore.checkIns     : dataStore.checkIns.filter(r => !r.isDemo)

  const now     = new Date()
  const monday  = new Date(now); monday.setDate(now.getDate() - ((now.getDay() + 6) % 7)); monday.setHours(0,0,0,0)
  const inWeek  = (d) => new Date(d) >= monday

  const activeThisWeek = jobseekers.filter(j => {
    const m = allMetrics[j.id]
    return m && (m.weeklyHoursLogged > 0 || m.checkInsThisWeek > 0)
  }).length

  const atRisk = jobseekers.filter(j =>
    j.riskLevel === RISK_LEVEL.HIGH || j.riskLevel === RISK_LEVEL.CRITICAL
  ).length

  const totalHoursWeek = Object.values(allMetrics).reduce((s, m) => s + (m?.weeklyHoursLogged || 0), 0)

  const avgTargetPct = jobseekers.length > 0
    ? Math.round(Object.values(allMetrics).reduce((s, m) => s + (m?.weeklyTargetPercent || 0), 0) / jobseekers.length)
    : 0

  const appsThisWeek  = applications.filter(a => inWeek(a.dateApplied || a.createdAt)).length
  const ivsUpcoming   = interviews.filter(iv => new Date(iv.dateTime) >= now).length
  const openFlags     = supportFlags.filter(f => f.status !== 'resolved').length
  const checkInsWeek  = checkIns.filter(c => inWeek(c.date || c.createdAt)).length

  const jsMap = jobseekers.reduce((acc, j) => { acc[j.id] = j; return acc }, {})
  const recentFlags = [...supportFlags].filter(f => f.status !== 'resolved').slice(0, 5)

  return (
    <div className="p-4 md:p-6 space-y-6 min-h-full">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-white text-xl md:text-2xl">CareerLink Coach Dashboard</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {config.organisationName || 'Employment Support'} · {config.brandLine}
          </p>
        </div>
        <LiveClock />
      </div>

      {/* Demo Banner */}
      {isDemoMode && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-amber-500/8 border border-amber-500/25">
          <Icon name="FlaskConical" size={14} className="text-amber-400 flex-shrink-0" />
          <span className="text-xs text-amber-400">
            <strong>Demo Mode ON</strong> — Showing presentation data. Turn off in{' '}
            <button onClick={() => navigate('/settings/demo')} className="underline hover:text-amber-300">Settings → Demo</button>
          </span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        <KpiCard label="Total Jobseekers" value={jobseekers.length} icon="Users"
          color="text-[#d4af37]" bg="bg-[#1a1200]/60" border="border-[#2a1f00]"
          onClick={() => navigate('/jobseekers')} />
        <KpiCard label="Active This Week" value={activeThisWeek} icon="Activity"
          color="text-emerald-400" bg="bg-emerald-900/20" border="border-emerald-800/30"
          onClick={() => navigate('/weekly-activity')} />
        <KpiCard label="At Risk" value={atRisk} icon="ShieldAlert"
          color="text-red-400" bg="bg-red-900/20" border="border-red-800/30" pulse={atRisk > 0}
          onClick={() => navigate('/support-risks')} />
        <KpiCard label="Avg Target %" value={`${avgTargetPct}%`} icon="Target"
          color="text-purple-400" bg="bg-purple-900/20" border="border-purple-800/30"
          sub={`${weeklyTarget}h weekly default`} onClick={() => navigate('/weekly-activity')} />
        <KpiCard label="Hours This Week" value={`${Math.round(totalHoursWeek * 10) / 10}h`} icon="Clock"
          color="text-cyan-400" bg="bg-cyan-900/20" border="border-cyan-800/30"
          onClick={() => navigate('/weekly-activity')} />
        <KpiCard label="Applications" value={appsThisWeek} icon="FileText"
          color="text-[#d4af37]" bg="bg-[#1a1200]/60" border="border-[#2a1f00]"
          sub="this week" onClick={() => navigate('/applications')} />
        <KpiCard label="Interviews" value={ivsUpcoming} icon="CalendarCheck"
          color="text-purple-400" bg="bg-purple-900/20" border="border-purple-800/30"
          sub="upcoming" onClick={() => navigate('/interviews')} />
        <KpiCard label="Evidence Uploads" value={evidenceRecords.length} icon="Paperclip"
          color="text-cyan-400" bg="bg-cyan-900/20" border="border-cyan-800/30"
          onClick={() => navigate('/evidence')} />
        <KpiCard label="Check-ins This Week" value={checkInsWeek} icon="CheckSquare"
          color="text-emerald-400" bg="bg-emerald-900/20" border="border-emerald-800/30"
          onClick={() => navigate('/check-ins')} />
        <KpiCard label="Open Support Flags" value={openFlags} icon="Flag"
          color="text-red-400" bg="bg-red-900/20" border="border-red-800/30" pulse={openFlags > 0}
          onClick={() => navigate('/support-risks')} />
      </div>

      {/* Main content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Jobseeker List */}
        <div className="lg:col-span-2 bg-[#0d1426] border border-slate-800/60 rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/40">
            <div className="flex items-center gap-2">
              <Icon name="Users" size={14} className="text-[#d4af37]" />
              <span className="text-sm font-semibold text-white">Jobseekers</span>
              <span className="text-[10px] text-slate-600 font-mono ml-1">{jobseekers.length}</span>
            </div>
            <button onClick={() => navigate('/jobseekers')}
              className="text-xs text-slate-500 hover:text-[#d4af37] transition-colors flex items-center gap-1">
              View all <Icon name="ArrowRight" size={12} />
            </button>
          </div>
          <div className="divide-y divide-slate-800/20">
            {jobseekers.length === 0 ? (
              <div className="px-4 py-8 text-center">
                <Icon name="Users" size={24} className="text-slate-700 mx-auto mb-2" />
                <p className="text-xs text-slate-600">No jobseekers yet.</p>
                <button onClick={() => navigate('/jobseeker-setup')}
                  className="mt-3 text-xs text-[#d4af37] hover:underline">
                  + Invite a jobseeker
                </button>
              </div>
            ) : (
              jobseekers.slice(0, 8).map(js => (
                <JobseekerRow
                  key={js.id}
                  jobseeker={js}
                  metrics={allMetrics[js.id]}
                  onClick={() => navigate(`/jobseekers/${js.id}`)}
                />
              ))
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Support Flags */}
          <div className="bg-[#0d1426] border border-slate-800/60 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/40">
              <div className="flex items-center gap-2">
                <Icon name="Flag" size={14} className="text-red-400" />
                <span className="text-sm font-semibold text-white">Support Flags</span>
              </div>
              <button onClick={() => navigate('/support-risks')}
                className="text-xs text-slate-500 hover:text-red-400 transition-colors">
                View all
              </button>
            </div>
            <div className="p-3 space-y-2">
              {recentFlags.length === 0 ? (
                <p className="text-xs text-slate-600 text-center py-4">No open support flags.</p>
              ) : (
                recentFlags.map(f => <FlagRow key={f.id} flag={f} jobseekersMap={jsMap} />)
              )}
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-[#0d1426] border border-slate-800/60 rounded-xl p-4">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">Quick Actions</div>
            <div className="space-y-2">
              {[
                { label: 'Log Activity', icon: 'Clock', route: '/weekly-activity' },
                { label: 'Add Application', icon: 'FileText', route: '/applications' },
                { label: 'New Check-in', icon: 'CheckSquare', route: '/check-ins' },
                { label: 'View Reports', icon: 'BarChart3', route: '/reports' },
                { label: 'Invite Jobseeker', icon: 'UserPlus', route: '/jobseeker-setup' },
              ].map(a => (
                <button key={a.route} onClick={() => navigate(a.route)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-800/40 hover:bg-slate-800/70 transition-colors text-left group">
                  <Icon name={a.icon} size={14} className="text-[#d4af37] flex-shrink-0" />
                  <span className="text-xs text-slate-300 group-hover:text-white transition-colors">{a.label}</span>
                  <Icon name="ChevronRight" size={12} className="text-slate-700 ml-auto" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-[10px] text-slate-700 text-center pb-2">
        CareerLink OS™ supports job-search tracking, evidence organisation, and employment support workflows.
        It does not replace official guidance, legal advice, benefits advice, medical advice, or human decision-making.
      </p>
    </div>
  )
}
