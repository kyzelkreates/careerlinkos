/**
 * ============================================================
 * CareerLink OS™ — Reports & Evidence Packs
 * Weekly activity summary per jobseeker.
 * Powered by 4P3X Intelligent AI — Created by Kyzel Kreates
 * ============================================================
 */
import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Icon from './components_ui_Icon'
import { useConfigStore, useDataStore, deriveJobseekerMetrics } from './core_storage'
import { jobseekerService } from './services_careerlink_jobseekerService'

function ReportView({ jobseeker, dataStore, isDemoMode, weeklyTarget }) {
  const navigate = useNavigate()
  const snap = {
    activityLogs: isDemoMode ? dataStore.activityLogs : dataStore.activityLogs.filter(r=>!r.isDemo),
    applications: isDemoMode ? dataStore.applications : dataStore.applications.filter(r=>!r.isDemo),
    interviews:   isDemoMode ? dataStore.interviews   : dataStore.interviews.filter(r=>!r.isDemo),
    checkIns:     isDemoMode ? dataStore.checkIns     : dataStore.checkIns.filter(r=>!r.isDemo),
  }
  const metrics = deriveJobseekerMetrics(jobseeker.id, snap, jobseeker.weeklyTargetHours || weeklyTarget)
  const logs     = snap.activityLogs.filter(r=>r.jobseekerId===jobseeker.id)
  const apps     = snap.applications.filter(r=>r.jobseekerId===jobseeker.id)
  const ivs      = snap.interviews.filter(r=>r.jobseekerId===jobseeker.id)
  const cis      = snap.checkIns.filter(r=>r.jobseekerId===jobseeker.id)
  const evidence = (isDemoMode ? dataStore.evidenceRecords : dataStore.evidenceRecords.filter(r=>!r.isDemo)).filter(r=>r.jobseekerId===jobseeker.id)
  const flags    = (isDemoMode ? dataStore.supportFlags    : dataStore.supportFlags.filter(r=>!r.isDemo)).filter(r=>r.jobseekerId===jobseeker.id)
  const notes    = (isDemoMode ? dataStore.coachNotes      : dataStore.coachNotes.filter(r=>!r.isDemo)).filter(r=>r.jobseekerId===jobseeker.id)
  const tasks    = (isDemoMode ? dataStore.tasks           : dataStore.tasks.filter(r=>!r.isDemo)).filter(r=>r.jobseekerId===jobseeker.id)

  const Section = ({ title, icon, children }) => (
    <div className="bg-[#0d1426] border border-slate-800/60 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-800/40 flex items-center gap-2">
        <Icon name={icon} size={13} className="text-[#d4af37]"/>
        <span className="text-sm font-semibold text-white">{title}</span>
      </div>
      <div className="p-4">{children}</div>
    </div>
  )

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate('/reports')} className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors">
          <Icon name="ArrowLeft" size={16}/>
        </button>
        <div>
          <h2 className="font-display font-bold text-white text-xl">{jobseeker.displayName}</h2>
          <p className="text-slate-500 text-xs">Report generated {new Date().toLocaleDateString('en-GB',{weekday:'long',day:'2-digit',month:'long',year:'numeric'})}</p>
        </div>
        {jobseeker.isDemo && <span className="text-[10px] text-amber-500/60 font-mono">[DEMO]</span>}
      </div>

      <div className="px-4 py-3 rounded-xl border border-amber-700/30 bg-amber-900/10">
        <p className="text-[10px] text-amber-300/80 leading-relaxed">
          <strong>Disclaimer:</strong> This report is a support and evidence summary only. It does not guarantee eligibility, compliance, benefit entitlement, employment outcome, or government acceptance. Figures are based on self-reported activity logs.
        </p>
      </div>

      {/* Summary */}
      <Section title="Weekly Activity Summary" icon="BarChart3">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            ['Hours Logged', `${metrics.weeklyHoursLogged}h`,'text-[#d4af37]'],
            ['Target Progress', `${metrics.weeklyTargetPercent}%`,'text-emerald-400'],
            ['Applications', metrics.applicationCountWeek,'text-purple-400'],
            ['Upcoming Interviews', metrics.interviewsUpcoming,'text-cyan-400'],
          ].map(([l,v,c]) => (
            <div key={l} className="bg-slate-900/40 rounded-lg p-3 text-center">
              <div className={`text-2xl font-mono font-bold ${c}`}>{v}</div>
              <div className="text-[10px] text-slate-600 mt-1">{l}</div>
            </div>
          ))}
        </div>
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-slate-500">Progress to {jobseeker.weeklyTargetHours||weeklyTarget}h weekly target</span>
            <span className="text-xs font-mono text-slate-400">{metrics.weeklyTargetPercent}%</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div className={`h-full rounded-full ${metrics.weeklyTargetPercent>=100?'bg-emerald-500':metrics.weeklyTargetPercent>=60?'bg-[#d4af37]':'bg-red-500'}`}
              style={{width:`${Math.min(100,metrics.weeklyTargetPercent)}%`}}/>
          </div>
        </div>
      </Section>

      {/* Activity Logs */}
      <Section title={`Activity Logs (${logs.length})`} icon="Clock">
        {logs.length === 0 ? <p className="text-xs text-slate-600">No activity logged.</p> :
          <div className="space-y-2">
            {logs.map(l => (
              <div key={l.id} className="flex items-center gap-3 border-b border-slate-800/20 pb-2 last:border-0">
                <div className="flex-1 min-w-0">
                  <span className="text-xs font-medium text-white">{l.activityType}</span>
                  <span className="text-[10px] text-slate-600 ml-2">{l.date}</span>
                </div>
                <span className="text-xs font-mono text-[#d4af37]">{Math.round(l.durationMinutes/6)/10}h</span>
              </div>
            ))}
          </div>
        }
      </Section>

      {/* Applications */}
      <Section title={`Applications (${apps.length})`} icon="FileText">
        {apps.length === 0 ? <p className="text-xs text-slate-600">No applications recorded.</p> :
          <div className="space-y-2">
            {apps.map(a => (
              <div key={a.id} className="flex items-center gap-3 border-b border-slate-800/20 pb-2 last:border-0">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-white">{a.roleTitle} at {a.employer}</div>
                  <div className="text-[10px] text-slate-600">{a.source} · {a.dateApplied}</div>
                </div>
                <span className="text-[10px] text-slate-400">{a.status}</span>
              </div>
            ))}
          </div>
        }
      </Section>

      {/* Interviews */}
      <Section title={`Interviews (${ivs.length})`} icon="CalendarCheck">
        {ivs.length === 0 ? <p className="text-xs text-slate-600">No interviews recorded.</p> :
          ivs.map(iv => (
            <div key={iv.id} className="border-b border-slate-800/20 pb-2 mb-2 last:border-0 last:mb-0">
              <div className="text-xs font-medium text-white">{iv.roleTitle} at {iv.employer}</div>
              <div className="text-[10px] text-slate-600">{new Date(iv.dateTime).toLocaleDateString('en-GB')} · {iv.outcome || 'Outcome pending'}</div>
            </div>
          ))
        }
      </Section>

      {/* Check-ins */}
      <Section title={`Check-ins (${cis.length})`} icon="CheckSquare">
        {cis.length === 0 ? <p className="text-xs text-slate-600">No check-ins recorded.</p> :
          cis.slice(0,5).map(ci => (
            <div key={ci.id} className="border-b border-slate-800/20 pb-2 mb-2 last:border-0 last:mb-0">
              <div className="flex justify-between">
                <span className="text-xs text-white">{ci.date}</span>
                <span className="text-[10px] text-slate-500">{ci.hoursReported}h · Confidence {ci.confidenceScore}/10</span>
              </div>
              {ci.supportNeeded && <div className="text-[10px] text-red-400 mt-0.5">Support needed · Barriers: {ci.barrierFlags?.join(', ')}</div>}
            </div>
          ))
        }
      </Section>

      {/* Evidence */}
      <Section title={`Evidence (${evidence.length})`} icon="Paperclip">
        {evidence.length === 0 ? <p className="text-xs text-slate-600">No evidence records.</p> :
          evidence.map(e => (
            <div key={e.id} className="flex gap-3 border-b border-slate-800/20 pb-2 mb-2 last:border-0 last:mb-0">
              <Icon name="FileCheck" size={12} className="text-cyan-400 mt-0.5 flex-shrink-0"/>
              <div>
                <div className="text-xs text-white">{e.title}</div>
                <div className="text-[10px] text-slate-600">{e.evidenceType} · {e.date}</div>
              </div>
            </div>
          ))
        }
      </Section>

      {/* Support Flags */}
      {flags.length > 0 && (
        <Section title={`Support Flags (${flags.length})`} icon="AlertTriangle">
          {flags.map(f => (
            <div key={f.id} className="border-b border-slate-800/20 pb-2 mb-2 last:border-0 last:mb-0">
              <div className="flex justify-between">
                <span className="text-xs font-medium text-white capitalize">{f.type.replace(/_/g,' ')}</span>
                <span className={`text-[10px] font-semibold uppercase ${f.severity==='critical'?'text-red-300':f.severity==='high'?'text-red-400':'text-amber-400'}`}>{f.severity}</span>
              </div>
              <div className="text-[10px] text-slate-600">{f.description}</div>
            </div>
          ))}
        </Section>
      )}

      {/* Coach Notes */}
      {notes.length > 0 && (
        <Section title={`Coach Notes (${notes.length})`} icon="StickyNote">
          {notes.map(n => (
            <div key={n.id} className="border-b border-slate-800/20 pb-3 mb-3 last:border-0 last:mb-0">
              <p className="text-xs text-slate-300 leading-relaxed">{n.note}</p>
              <span className="text-[10px] text-slate-600 mt-1 block">{new Date(n.createdAt).toLocaleDateString('en-GB')}</span>
            </div>
          ))}
        </Section>
      )}

      {/* Tasks */}
      {tasks.length > 0 && (
        <Section title={`Action Plan / Tasks (${tasks.length})`} icon="ListChecks">
          {tasks.map(t => (
            <div key={t.id} className="flex gap-3 border-b border-slate-800/20 pb-2 mb-2 last:border-0 last:mb-0">
              <Icon name={t.status==='completed'?'CheckCircle':'Circle'} size={12} className={t.status==='completed'?'text-emerald-400':'text-slate-600'} />
              <div>
                <div className={`text-xs ${t.status==='completed'?'text-slate-500 line-through':'text-white'}`}>{t.title}</div>
                <div className="text-[10px] text-slate-600">Due {t.dueDate} · {t.status.replace('_',' ')}</div>
              </div>
            </div>
          ))}
        </Section>
      )}

      <p className="text-[10px] text-slate-700 text-center pb-4">
        CareerLink OS™ · Generated {new Date().toLocaleString('en-GB')} · This is a support and evidence summary only. Created by Kyzel Kreates.
      </p>
    </div>
  )
}

export default function Reports() {
  const { jobseekerId } = useParams()
  const navigate   = useNavigate()
  const config     = useConfigStore(s => s.config)
  const isDemoMode = config.demoModeEnabled
  const weeklyTarget = config.weeklyTargetHoursDefault ?? 35
  const dataStore  = useDataStore()
  const [jobseekers, setJobseekers] = useState([])

  useEffect(() => {
    setJobseekers(isDemoMode ? jobseekerService.getAll() : jobseekerService.getRealJobseekers())
  }, [isDemoMode])

  const selected = jobseekerId ? jobseekers.find(j => j.id === jobseekerId) : null

  if (selected) {
    return <ReportView jobseeker={selected} dataStore={dataStore} isDemoMode={isDemoMode} weeklyTarget={weeklyTarget}/>
  }

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div>
        <h1 className="font-display font-bold text-white text-xl">Reports</h1>
        <p className="text-slate-500 text-sm mt-0.5">Select a jobseeker to view their activity report.</p>
      </div>
      {jobseekers.length === 0 ? (
        <div className="py-12 text-center bg-[#0d1426] border border-slate-800/60 rounded-xl">
          <Icon name="BarChart3" size={28} className="text-slate-700 mx-auto mb-3"/>
          <p className="text-sm text-slate-600">No jobseekers found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {jobseekers.map(js => (
            <button key={js.id} onClick={() => navigate(`/reports/${js.id}`)}
              className="bg-[#0d1426] border border-slate-800/60 rounded-xl p-4 text-left hover:border-[#d4af37]/30 hover:bg-[#1a1200]/40 transition-all group">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-full bg-[#d4af37]/10 border border-[#d4af37]/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-[#d4af37] text-sm font-bold">{js.displayName.charAt(0)}</span>
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-semibold text-white group-hover:text-[#d4af37] transition-colors truncate">{js.displayName}</div>
                  <div className="text-[10px] text-slate-600">{js.programme || 'No programme'}</div>
                </div>
              </div>
              {js.isDemo && <span className="text-[9px] text-amber-500/50">[DEMO]</span>}
              <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-600">
                <Icon name="FileText" size={10}/>
                <span>View full report →</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
