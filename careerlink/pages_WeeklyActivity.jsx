/**
 * ============================================================
 * CareerLink OS™ — Weekly Activity Page
 * Log and view job-search activity sessions.
 * Powered by 4P3X Intelligent AI — Created by Kyzel Kreates
 * ============================================================
 */

import { useState, useEffect, useCallback } from 'react'
import Icon from './components_ui_Icon'
import { useConfigStore, useDataStore } from './core_storage'
import { jobseekerService } from './services_careerlink_jobseekerService'

const ACTIVITY_TYPES = [
  'Job search', 'Job application', 'CV update', 'Cover letter',
  'Interview preparation', 'Interview attended', 'Employer contact',
  'Training / course', 'Work coach appointment', 'Portfolio update',
  'Networking', 'Other employment activity',
]

function ActivityModal({ existing, jobseekers, onClose, onSaved }) {
  const [form, setForm] = useState({
    jobseekerId: '', date: new Date().toISOString().split('T')[0],
    startTime: '', endTime: '', durationMinutes: 60,
    activityType: 'Job search', description: '', evidenceAttached: false,
    relatedApplication: false, notes: '',
  })
  const [saving, setSaving] = useState(false)
  const dataStore = useDataStore()

  useEffect(() => { if (existing) setForm(f => ({ ...f, ...existing })) }, [existing])
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const calcDuration = (start, end) => {
    if (!start || !end) return
    const [sh, sm] = start.split(':').map(Number)
    const [eh, em] = end.split(':').map(Number)
    const mins = (eh * 60 + em) - (sh * 60 + sm)
    if (mins > 0) set('durationMinutes', mins)
  }

  const handleSave = () => {
    if (!form.jobseekerId || !form.activityType) return
    setSaving(true)
    if (existing?.id) dataStore.updateActivityLog(existing.id, form)
    else dataStore.addActivityLog(form)
    setSaving(false)
    onSaved?.()
    onClose?.()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#0d1426] border border-slate-800/60 rounded-2xl overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/40">
          <span className="font-semibold text-white">{existing?.id ? 'Edit Activity' : 'Log Job-Search Activity'}</span>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><Icon name="X" size={18} /></button>
        </div>
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="text-xs text-slate-400 font-medium mb-1 block">Jobseeker <span className="text-red-400">*</span></label>
            <select value={form.jobseekerId} onChange={e => set('jobseekerId', e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]/50">
              <option value="">Select jobseeker…</option>
              {jobseekers.map(js => <option key={js.id} value={js.id}>{js.displayName}{js.isDemo ? ' [DEMO]' : ''}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 font-medium mb-1 block">Date</label>
            <input type="date" value={form.date} onChange={e => set('date', e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]/50" />
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-3 gap-2 sm:gap-3">
            <div>
              <label className="text-xs text-slate-400 font-medium mb-1 block">Start</label>
              <input type="time" value={form.startTime} onChange={e => { set('startTime', e.target.value); calcDuration(e.target.value, form.endTime) }}
                className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]/50" />
            </div>
            <div>
              <label className="text-xs text-slate-400 font-medium mb-1 block">End</label>
              <input type="time" value={form.endTime} onChange={e => { set('endTime', e.target.value); calcDuration(form.startTime, e.target.value) }}
                className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]/50" />
            </div>
            <div>
              <label className="text-xs text-slate-400 font-medium mb-1 block">Duration (mins)</label>
              <input type="number" min="1" value={form.durationMinutes} onChange={e => set('durationMinutes', +e.target.value)}
                className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]/50" />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 font-medium mb-1 block">Activity Type <span className="text-red-400">*</span></label>
            <select value={form.activityType} onChange={e => set('activityType', e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]/50">
              {ACTIVITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 font-medium mb-1 block">Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={2}
              className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#d4af37]/50 resize-none" />
          </div>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.evidenceAttached} onChange={e => set('evidenceAttached', e.target.checked)} className="accent-[#d4af37]" />
              <span className="text-xs text-slate-400">Evidence attached</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.relatedApplication} onChange={e => set('relatedApplication', e.target.checked)} className="accent-[#d4af37]" />
              <span className="text-xs text-slate-400">Related to application</span>
            </label>
          </div>
          <div>
            <label className="text-xs text-slate-400 font-medium mb-1 block">Notes</label>
            <input value={form.notes} onChange={e => set('notes', e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#d4af37]/50" />
          </div>
        </div>
        <div className="px-5 py-4 border-t border-slate-800/40 flex gap-2">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-lg border border-slate-700 text-sm text-slate-400 hover:text-white transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving || !form.jobseekerId}
            className="flex-1 px-4 py-2.5 rounded-lg bg-[#d4af37] text-black text-sm font-semibold hover:bg-[#e6c34a] transition-colors disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Activity'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function WeeklyActivity() {
  const config     = useConfigStore(s => s.config)
  const isDemoMode = config.demoModeEnabled
  const weeklyTarget = config.weeklyTargetHoursDefault ?? 35
  const dataStore  = useDataStore()

  const [jobseekers, setJobseekers] = useState([])
  const [modal, setModal]           = useState(null)
  const [filterJs, setFilterJs]     = useState('')

  useEffect(() => {
    const js = isDemoMode ? jobseekerService.getAll() : jobseekerService.getRealJobseekers()
    setJobseekers(js)
  }, [isDemoMode])

  const logs = isDemoMode ? dataStore.activityLogs : dataStore.activityLogs.filter(r => !r.isDemo)
  const filtered = filterJs ? logs.filter(l => l.jobseekerId === filterJs) : logs
  const jsMap = jobseekers.reduce((acc, j) => { acc[j.id] = j; return acc }, {})

  const totalHours = logs.reduce((s, l) => s + (l.durationMinutes || 0) / 60, 0)

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-white text-xl">Weekly Activity</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {logs.length} activity sessions · {Math.round(totalHours * 10) / 10}h total · {weeklyTarget}h weekly target
          </p>
        </div>
        <button onClick={() => setModal({})}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#d4af37] text-black text-sm font-semibold hover:bg-[#e6c34a] transition-colors">
          <Icon name="Plus" size={15} />
          Log Activity
        </button>
      </div>

      <select value={filterJs} onChange={e => setFilterJs(e.target.value)}
        className="bg-[#0d1426] border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#d4af37]/50">
        <option value="">All Jobseekers</option>
        {jobseekers.map(js => <option key={js.id} value={js.id}>{js.displayName}{js.isDemo ? ' [DEMO]' : ''}</option>)}
      </select>

      <div className="bg-[#0d1426] border border-slate-800/60 rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <Icon name="Clock" size={28} className="text-slate-700 mx-auto mb-3" />
            <p className="text-sm text-slate-600">No activity logs yet.</p>
            <button onClick={() => setModal({})} className="mt-3 text-sm text-[#d4af37] hover:underline">+ Log first activity</button>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800/60">
                  {['Jobseeker','Date','Activity Type','Duration','Description','Evidence'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] text-slate-600 font-semibold uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 50).map(log => (
                  <tr key={log.id} className="border-b border-slate-800/20 hover:bg-slate-800/20 transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium text-white">{jsMap[log.jobseekerId]?.displayName || '—'}</span>
                      {log.isDemo && <span className="text-[9px] text-amber-500/50 ml-1">[DEMO]</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400 font-mono">{log.date}</td>
                    <td className="px-4 py-3 text-xs text-[#d4af37]">{log.activityType}</td>
                    <td className="px-4 py-3 text-xs font-mono text-white">{Math.round(log.durationMinutes / 6) / 10}h</td>
                    <td className="px-4 py-3 text-xs text-slate-400 max-w-xs truncate">{log.description || '—'}</td>
                    <td className="px-4 py-3">
                      {log.evidenceAttached
                        ? <Icon name="CheckCircle" size={12} className="text-emerald-400" />
                        : <Icon name="Circle" size={12} className="text-slate-700" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal !== null && (
        <ActivityModal jobseekers={jobseekers} existing={modal} onClose={() => setModal(null)} onSaved={() => {}} />
      )}
    </div>
  )
}
