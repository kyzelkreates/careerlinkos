/**
 * ============================================================
 * CareerLink OS™ — Jobseekers Page
 * Full jobseeker table + detail profile panel.
 * Powered by 4P3X Intelligent AI — Created by Kyzel Kreates
 * ============================================================
 */

import { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import Icon from './components_ui_Icon'
import { useConfigStore, useDataStore, deriveJobseekerMetrics } from './core_storage'
import { jobseekerService, JOBSEEKER_STATUS, RISK_LEVEL } from './services_careerlink_jobseekerService'

const STATUS_COLORS = {
  active:    'text-emerald-400 border-emerald-500/30 bg-emerald-900/20',
  inactive:  'text-slate-400  border-slate-700/30   bg-slate-800/20',
  at_risk:   'text-red-400    border-red-500/30     bg-red-900/20',
  on_hold:   'text-amber-400  border-amber-500/30   bg-amber-900/20',
  completed: 'text-blue-400   border-blue-500/30    bg-blue-900/20',
  placed:    'text-purple-400 border-purple-500/30  bg-purple-900/20',
}

const RISK_COLORS = {
  low:      'text-emerald-400',
  medium:   'text-amber-400',
  high:     'text-red-400',
  critical: 'text-red-300',
}

function StatusBadge({ status }) {
  return (
    <span className={`text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded border ${STATUS_COLORS[status] || 'text-slate-400 border-slate-700'}`}>
      {status?.replace('_', ' ')}
    </span>
  )
}

function ProgressRing({ pct, size = 40 }) {
  const r = (size - 6) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  const color = pct >= 100 ? '#34d399' : pct >= 60 ? '#d4af37' : pct >= 30 ? '#f59e0b' : '#f87171'
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1a2035" strokeWidth="5" />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="5"
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="middle"
        fill={color} fontSize="9" fontWeight="700" style={{ transform: 'rotate(90deg)', transformOrigin: `${size/2}px ${size/2}px` }}>
        {pct}%
      </text>
    </svg>
  )
}

// ─── New/Edit Jobseeker Modal ─────────────────────────────────
function JobseekerModal({ existing, onClose, onSaved, weeklyTarget }) {
  const [form, setForm] = useState({
    displayName: '', email: '', phone: '', programme: '',
    weeklyTargetHours: weeklyTarget, status: 'active', riskLevel: 'low', notes: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => { if (existing) setForm(f => ({ ...f, ...existing })) }, [existing])
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = () => {
    if (!form.displayName.trim()) return
    setSaving(true)
    if (existing?.id) jobseekerService.update(existing.id, form)
    else jobseekerService.create(form)
    setSaving(false)
    onSaved?.()
    onClose?.()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#0d1426] border border-slate-800/60 rounded-2xl overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/40">
          <span className="font-semibold text-white">{existing?.id ? 'Edit Jobseeker' : 'New Jobseeker'}</span>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><Icon name="X" size={18} /></button>
        </div>
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {[
            ['displayName','Display Name','text',true],
            ['email','Email','email',false],
            ['phone','Phone','text',false],
            ['programme','Programme / Cohort','text',false],
          ].map(([k, label, type, req]) => (
            <div key={k}>
              <label className="text-xs text-slate-400 font-medium mb-1 block">{label}{req && <span className="text-red-400 ml-1">*</span>}</label>
              <input type={type} value={form[k]} onChange={e => set(k, e.target.value)}
                className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#d4af37]/50" />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 font-medium mb-1 block">Weekly Target (hours)</label>
              <input type="number" min="1" max="168" value={form.weeklyTargetHours} onChange={e => set('weeklyTargetHours', +e.target.value)}
                className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]/50" />
            </div>
            <div>
              <label className="text-xs text-slate-400 font-medium mb-1 block">Risk Level</label>
              <select value={form.riskLevel} onChange={e => set('riskLevel', e.target.value)}
                className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]/50">
                {Object.values(RISK_LEVEL).map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 font-medium mb-1 block">Status</label>
            <select value={form.status} onChange={e => set('status', e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]/50">
              {Object.values(JOBSEEKER_STATUS).map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 font-medium mb-1 block">Notes</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3}
              className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#d4af37]/50 resize-none" />
          </div>
        </div>
        <div className="px-5 py-4 border-t border-slate-800/40 flex gap-2">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-lg border border-slate-700 text-sm text-slate-400 hover:text-white transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving || !form.displayName.trim()}
            className="flex-1 px-4 py-2.5 rounded-lg bg-[#d4af37] text-black text-sm font-semibold hover:bg-[#e6c34a] transition-colors disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Jobseeker'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Jobseeker Detail Panel ───────────────────────────────────
function JobseekerDetail({ jobseeker, onBack, onEdit, weeklyTarget, dataStore, isDemoMode }) {
  const [noteText, setNoteText] = useState('')
  const dataSnap = {
    activityLogs: isDemoMode ? dataStore.activityLogs : dataStore.activityLogs.filter(r => !r.isDemo),
    applications: isDemoMode ? dataStore.applications : dataStore.applications.filter(r => !r.isDemo),
    interviews:   isDemoMode ? dataStore.interviews   : dataStore.interviews.filter(r => !r.isDemo),
    checkIns:     isDemoMode ? dataStore.checkIns     : dataStore.checkIns.filter(r => !r.isDemo),
  }
  const metrics = deriveJobseekerMetrics(jobseeker.id, dataSnap, jobseeker.weeklyTargetHours || weeklyTarget)

  const recentApps = dataSnap.applications.filter(a => a.jobseekerId === jobseeker.id).slice(0, 5)
  const recentIvs  = dataSnap.interviews.filter(iv => iv.jobseekerId === jobseeker.id).slice(0, 3)
  const recentCIs  = dataSnap.checkIns.filter(ci => ci.jobseekerId === jobseeker.id).slice(0, 5)
  const evidence   = (isDemoMode ? dataStore.evidenceRecords : dataStore.evidenceRecords.filter(r => !r.isDemo))
    .filter(e => e.jobseekerId === jobseeker.id).slice(0, 5)
  const notes = (isDemoMode ? dataStore.coachNotes : dataStore.coachNotes.filter(r => !r.isDemo))
    .filter(n => n.jobseekerId === jobseeker.id)
  const flags = (isDemoMode ? dataStore.supportFlags : dataStore.supportFlags.filter(r => !r.isDemo))
    .filter(f => f.jobseekerId === jobseeker.id)

  const addNote = () => {
    if (!noteText.trim()) return
    dataStore.addCoachNote({ jobseekerId: jobseeker.id, note: noteText, createdBy: 'coach' })
    setNoteText('')
  }

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors">
          <Icon name="ArrowLeft" size={16} />
        </button>
        <div>
          <h2 className="font-display font-bold text-white text-lg">{jobseeker.displayName}</h2>
          <p className="text-slate-500 text-xs">{jobseeker.programme || 'No programme set'}</p>
        </div>
        {jobseeker.isDemo && <span className="text-[10px] text-amber-500/60 font-mono ml-2">[DEMO]</span>}
        <div className="ml-auto flex gap-2">
          <button onClick={onEdit} className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs text-slate-400 hover:text-white transition-colors">
            Edit Profile
          </button>
        </div>
      </div>

      {/* Weekly Progress */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Weekly Hours', value: `${metrics.weeklyHoursLogged}h`, sub: `of ${jobseeker.weeklyTargetHours || weeklyTarget}h target`, color: 'text-[#d4af37]' },
          { label: 'Target Progress', value: `${metrics.weeklyTargetPercent}%`, sub: metrics.progressStatus.replace('_', ' '), color: 'text-emerald-400' },
          { label: 'Apps This Week', value: metrics.applicationCountWeek, sub: 'applications', color: 'text-purple-400' },
          { label: 'Upcoming Interviews', value: metrics.interviewsUpcoming, sub: 'scheduled', color: 'text-cyan-400' },
        ].map(c => (
          <div key={c.label} className="bg-[#0d1426] border border-slate-800/60 rounded-xl p-3">
            <div className="text-[10px] text-slate-600 uppercase tracking-widest mb-1">{c.label}</div>
            <div className={`text-2xl font-mono font-bold ${c.color}`}>{c.value}</div>
            <div className="text-[10px] text-slate-600 mt-0.5">{c.sub}</div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="bg-[#0d1426] border border-slate-800/60 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-white">Weekly Activity Progress</span>
          <span className="text-xs text-slate-500">{metrics.weeklyHoursLogged}h / {jobseeker.weeklyTargetHours || weeklyTarget}h</span>
        </div>
        <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
          <div className={`h-full rounded-full transition-all ${metrics.weeklyTargetPercent >= 100 ? 'bg-emerald-500' : metrics.weeklyTargetPercent >= 60 ? 'bg-[#d4af37]' : metrics.weeklyTargetPercent >= 30 ? 'bg-amber-500' : 'bg-red-500'}`}
            style={{ width: `${Math.min(100, metrics.weeklyTargetPercent)}%` }} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Applications */}
        <div className="bg-[#0d1426] border border-slate-800/60 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800/40 flex items-center gap-2">
            <Icon name="FileText" size={13} className="text-[#d4af37]" />
            <span className="text-sm font-semibold text-white">Applications</span>
            <span className="text-[10px] text-slate-600 ml-1">{recentApps.length}</span>
          </div>
          <div className="divide-y divide-slate-800/20">
            {recentApps.length === 0 ? (
              <p className="text-xs text-slate-600 text-center py-4">No applications yet.</p>
            ) : recentApps.map(a => (
              <div key={a.id} className="px-4 py-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-white truncate">{a.roleTitle}</span>
                  <span className="text-[10px] text-slate-500 ml-2 flex-shrink-0">{a.status}</span>
                </div>
                <div className="text-[10px] text-slate-600">{a.employer}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Check-ins */}
        <div className="bg-[#0d1426] border border-slate-800/60 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800/40 flex items-center gap-2">
            <Icon name="CheckSquare" size={13} className="text-emerald-400" />
            <span className="text-sm font-semibold text-white">Recent Check-ins</span>
          </div>
          <div className="divide-y divide-slate-800/20">
            {recentCIs.length === 0 ? (
              <p className="text-xs text-slate-600 text-center py-4">No check-ins yet.</p>
            ) : recentCIs.map(ci => (
              <div key={ci.id} className="px-4 py-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-white">{new Date(ci.date || ci.createdAt).toLocaleDateString('en-GB')}</span>
                  <span className={`text-[10px] font-medium ${ci.supportNeeded ? 'text-red-400' : 'text-emerald-400'}`}>
                    {ci.supportNeeded ? 'Support needed' : 'OK'}
                  </span>
                </div>
                <div className="text-[10px] text-slate-600">{ci.hoursReported}h reported · Confidence: {ci.confidenceScore}/10</div>
              </div>
            ))}
          </div>
        </div>

        {/* Support Flags */}
        {flags.length > 0 && (
          <div className="bg-[#0d1426] border border-red-800/30 rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-800/40 flex items-center gap-2">
              <Icon name="AlertTriangle" size={13} className="text-red-400" />
              <span className="text-sm font-semibold text-white">Support Flags</span>
            </div>
            <div className="divide-y divide-slate-800/20">
              {flags.map(f => (
                <div key={f.id} className="px-4 py-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-white capitalize">{f.type.replace(/_/g, ' ')}</span>
                    <span className={`text-[10px] uppercase font-semibold ${f.severity === 'critical' ? 'text-red-300' : f.severity === 'high' ? 'text-red-400' : 'text-amber-400'}`}>{f.severity}</span>
                  </div>
                  <div className="text-[10px] text-slate-600 truncate">{f.description}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Coach Notes */}
        <div className="bg-[#0d1426] border border-slate-800/60 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800/40 flex items-center gap-2">
            <Icon name="StickyNote" size={13} className="text-purple-400" />
            <span className="text-sm font-semibold text-white">Coach Notes</span>
          </div>
          <div className="p-3 space-y-2">
            <div className="flex gap-2">
              <input value={noteText} onChange={e => setNoteText(e.target.value)}
                placeholder="Add a coach note…"
                onKeyDown={e => e.key === 'Enter' && addNote()}
                className="flex-1 bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#d4af37]/50" />
              <button onClick={addNote} className="px-3 py-2 rounded-lg bg-[#d4af37]/15 text-[#d4af37] text-xs hover:bg-[#d4af37]/25 transition-colors">
                Add
              </button>
            </div>
            {notes.slice(0, 4).map(n => (
              <div key={n.id} className="bg-slate-800/30 rounded-lg px-3 py-2">
                <p className="text-xs text-slate-300 leading-relaxed">{n.note}</p>
                <span className="text-[10px] text-slate-600 mt-1 block">{new Date(n.createdAt).toLocaleDateString('en-GB')}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Evidence */}
      <div className="bg-[#0d1426] border border-slate-800/60 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-800/40 flex items-center gap-2">
          <Icon name="Paperclip" size={13} className="text-cyan-400" />
          <span className="text-sm font-semibold text-white">Evidence Records</span>
        </div>
        <div className="divide-y divide-slate-800/20">
          {evidence.length === 0 ? (
            <p className="text-xs text-slate-600 text-center py-4">No evidence records.</p>
          ) : evidence.map(e => (
            <div key={e.id} className="px-4 py-2.5 flex items-center gap-3">
              <Icon name="FileCheck" size={12} className="text-cyan-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-white truncate">{e.title}</div>
                <div className="text-[10px] text-slate-600">{e.evidenceType} · {new Date(e.date).toLocaleDateString('en-GB')}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Jobseekers Page Root ─────────────────────────────────────
export default function Jobseekers() {
  const { jobseekerId } = useParams()
  const navigate   = useNavigate()
  const config     = useConfigStore(s => s.config)
  const isDemoMode = config.demoModeEnabled
  const weeklyTarget = config.weeklyTargetHoursDefault ?? 35
  const dataStore  = useDataStore()

  const [jobseekers, setJobseekers] = useState([])
  const [modal, setModal]           = useState(null) // null | 'new' | jobseeker
  const [search, setSearch]         = useState('')

  const reload = useCallback(() => {
    const js = isDemoMode ? jobseekerService.getAll() : jobseekerService.getRealJobseekers()
    setJobseekers(js)
  }, [isDemoMode])

  useEffect(() => { reload() }, [reload])

  const selected = jobseekerId ? jobseekers.find(j => j.id === jobseekerId) : null

  const filtered = jobseekers.filter(j =>
    j.displayName.toLowerCase().includes(search.toLowerCase()) ||
    (j.programme || '').toLowerCase().includes(search.toLowerCase())
  )

  if (selected) {
    return (
      <>
        <JobseekerDetail
          jobseeker={selected}
          onBack={() => navigate('/jobseekers')}
          onEdit={() => setModal(selected)}
          weeklyTarget={weeklyTarget}
          dataStore={dataStore}
          isDemoMode={isDemoMode}
        />
        {modal && typeof modal === 'object' && (
          <JobseekerModal
            existing={modal} weeklyTarget={weeklyTarget}
            onClose={() => setModal(null)} onSaved={reload}
          />
        )}
      </>
    )
  }

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-white text-xl">Jobseekers</h1>
          <p className="text-slate-500 text-sm mt-0.5">{jobseekers.length} total · weekly target: {weeklyTarget}h</p>
        </div>
        <button onClick={() => setModal('new')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#d4af37] text-black text-sm font-semibold hover:bg-[#e6c34a] transition-colors">
          <Icon name="UserPlus" size={15} />
          New Jobseeker
        </button>
      </div>

      <input value={search} onChange={e => setSearch(e.target.value)}
        placeholder="Search jobseekers…"
        className="w-full bg-[#0d1426] border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#d4af37]/50" />

      <div className="bg-[#0d1426] border border-slate-800/60 rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <Icon name="Users" size={28} className="text-slate-700 mx-auto mb-3" />
            <p className="text-sm text-slate-600">No jobseekers found.</p>
            <button onClick={() => setModal('new')} className="mt-3 text-sm text-[#d4af37] hover:underline">
              + Add a jobseeker
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800/60">
                  {['Name','Status','Weekly Hours','Target %','Applications','Risk','Last Check-in'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] text-slate-600 font-semibold uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(js => {
                  const snap = {
                    activityLogs: (isDemoMode ? dataStore.activityLogs : dataStore.activityLogs.filter(r => !r.isDemo)),
                    applications: (isDemoMode ? dataStore.applications : dataStore.applications.filter(r => !r.isDemo)),
                    interviews:   (isDemoMode ? dataStore.interviews   : dataStore.interviews.filter(r => !r.isDemo)),
                    checkIns:     (isDemoMode ? dataStore.checkIns     : dataStore.checkIns.filter(r => !r.isDemo)),
                  }
                  const m = deriveJobseekerMetrics(js.id, snap, js.weeklyTargetHours || weeklyTarget)
                  return (
                    <tr key={js.id}
                      onClick={() => navigate(`/jobseekers/${js.id}`)}
                      className="border-b border-slate-800/20 hover:bg-slate-800/30 cursor-pointer transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-white">{js.displayName}</div>
                        <div className="text-[10px] text-slate-600">{js.programme || '—'}</div>
                        {js.isDemo && <span className="text-[9px] text-amber-500/50">[DEMO]</span>}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-semibold uppercase tracking-widest px-2 py-0.5 rounded border ${STATUS_COLORS[js.status] || 'text-slate-400 border-slate-700'}`}>
                          {js.status?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-white">{m.weeklyHoursLogged}h</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${m.weeklyTargetPercent >= 100 ? 'bg-emerald-500' : m.weeklyTargetPercent >= 60 ? 'bg-[#d4af37]' : 'bg-red-500'}`}
                              style={{ width: `${Math.min(100, m.weeklyTargetPercent)}%` }} />
                          </div>
                          <span className="text-xs font-mono text-slate-400">{m.weeklyTargetPercent}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-white">{m.applicationCountWeek}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-semibold uppercase ${RISK_COLORS[js.riskLevel] || 'text-slate-400'}`}>{js.riskLevel}</span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {m.lastCheckIn ? new Date(m.lastCheckIn).toLocaleDateString('en-GB') : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal === 'new' && (
        <JobseekerModal weeklyTarget={weeklyTarget} onClose={() => setModal(null)} onSaved={reload} />
      )}
    </div>
  )
}
