/**
 * ============================================================
 * CareerLink OS™ — Applications Page
 * Powered by 4P3X Intelligent AI — Created by Kyzel Kreates
 * ============================================================
 */

import { useState, useEffect } from 'react'
import Icon from './components_ui_Icon'
import { useConfigStore, useDataStore } from './core_storage'
import { jobseekerService } from './services_careerlink_jobseekerService'

const STATUSES = ['Drafting','Applied','Awaiting response','Interview offered','Interview completed','Rejected','Offer received','Withdrawn']
const SOURCES  = ['Indeed','Reed','LinkedIn','Total Jobs','Jobsite','Company website','Referral','Recruitment agency','Work coach','Other']

const STATUS_COLORS = {
  'Drafting':            'text-slate-400   border-slate-700',
  'Applied':             'text-blue-400    border-blue-700',
  'Awaiting response':   'text-amber-400   border-amber-700',
  'Interview offered':   'text-purple-400  border-purple-700',
  'Interview completed': 'text-cyan-400    border-cyan-700',
  'Rejected':            'text-red-400     border-red-700',
  'Offer received':      'text-emerald-400 border-emerald-700',
  'Withdrawn':           'text-slate-500   border-slate-800',
}

function AppModal({ existing, jobseekers, onClose, onSaved }) {
  const dataStore = useDataStore()
  const [form, setForm] = useState({
    jobseekerId: '', employer: '', roleTitle: '', source: 'Indeed',
    dateApplied: new Date().toISOString().split('T')[0],
    status: 'Applied', notes: '',
  })
  const [saving, setSaving] = useState(false)
  useEffect(() => { if (existing) setForm(f => ({ ...f, ...existing })) }, [existing])
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = () => {
    if (!form.jobseekerId || !form.employer || !form.roleTitle) return
    setSaving(true)
    if (existing?.id) dataStore.updateApplication(existing.id, form)
    else dataStore.addApplication(form)
    setSaving(false); onSaved?.(); onClose?.()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#0d1426] border border-slate-800/60 rounded-2xl overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/40">
          <span className="font-semibold text-white">{existing?.id ? 'Edit Application' : 'Add Application'}</span>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><Icon name="X" size={18} /></button>
        </div>
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="text-xs text-slate-400 font-medium mb-1 block">Jobseeker <span className="text-red-400">*</span></label>
            <select value={form.jobseekerId} onChange={e => set('jobseekerId', e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]/50">
              <option value="">Select…</option>
              {jobseekers.map(js => <option key={js.id} value={js.id}>{js.displayName}{js.isDemo ? ' [DEMO]' : ''}</option>)}
            </select>
          </div>
          {[['employer','Employer / Company',true],['roleTitle','Role Title',true]].map(([k, label, req]) => (
            <div key={k}>
              <label className="text-xs text-slate-400 font-medium mb-1 block">{label}{req && <span className="text-red-400 ml-1">*</span>}</label>
              <input value={form[k]} onChange={e => set(k, e.target.value)}
                className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]/50" />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 font-medium mb-1 block">Job Board / Source</label>
              <select value={form.source} onChange={e => set('source', e.target.value)}
                className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]/50">
                {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 font-medium mb-1 block">Date Applied</label>
              <input type="date" value={form.dateApplied} onChange={e => set('dateApplied', e.target.value)}
                className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]/50" />
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 font-medium mb-1 block">Status</label>
            <select value={form.status} onChange={e => set('status', e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]/50">
              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 font-medium mb-1 block">Notes</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2}
              className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#d4af37]/50 resize-none" />
          </div>
        </div>
        <div className="px-5 py-4 border-t border-slate-800/40 flex gap-2">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-lg border border-slate-700 text-sm text-slate-400 hover:text-white transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving || !form.jobseekerId || !form.employer || !form.roleTitle}
            className="flex-1 px-4 py-2.5 rounded-lg bg-[#d4af37] text-black text-sm font-semibold hover:bg-[#e6c34a] transition-colors disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Application'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Applications() {
  const config     = useConfigStore(s => s.config)
  const isDemoMode = config.demoModeEnabled
  const dataStore  = useDataStore()
  const [jobseekers, setJobseekers] = useState([])
  const [modal, setModal]           = useState(null)
  const [filterStatus, setFilterStatus] = useState('')

  useEffect(() => {
    const js = isDemoMode ? jobseekerService.getAll() : jobseekerService.getRealJobseekers()
    setJobseekers(js)
  }, [isDemoMode])

  const apps   = isDemoMode ? dataStore.applications : dataStore.applications.filter(r => !r.isDemo)
  const jsMap  = jobseekers.reduce((acc, j) => { acc[j.id] = j; return acc }, {})
  const filtered = filterStatus ? apps.filter(a => a.status === filterStatus) : apps

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-white text-xl">Applications</h1>
          <p className="text-slate-500 text-sm mt-0.5">{apps.length} applications tracked</p>
        </div>
        <button onClick={() => setModal({})}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#d4af37] text-black text-sm font-semibold hover:bg-[#e6c34a] transition-colors">
          <Icon name="Plus" size={15} />
          Add Application
        </button>
      </div>

      <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
        className="bg-[#0d1426] border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#d4af37]/50">
        <option value="">All Statuses</option>
        {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
      </select>

      <div className="bg-[#0d1426] border border-slate-800/60 rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <Icon name="FileText" size={28} className="text-slate-700 mx-auto mb-3" />
            <p className="text-sm text-slate-600">No applications yet.</p>
            <button onClick={() => setModal({})} className="mt-3 text-sm text-[#d4af37] hover:underline">+ Add first application</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800/60">
                  {['Jobseeker','Employer','Role','Source','Date','Status','Notes'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] text-slate-600 font-semibold uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(a => (
                  <tr key={a.id} onClick={() => setModal(a)}
                    className="border-b border-slate-800/20 hover:bg-slate-800/20 cursor-pointer transition-colors">
                    <td className="px-4 py-3 text-xs text-white">
                      {jsMap[a.jobseekerId]?.displayName || '—'}
                      {a.isDemo && <span className="text-[9px] text-amber-500/50 ml-1">[DEMO]</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-white">{a.employer}</td>
                    <td className="px-4 py-3 text-xs text-slate-300">{a.roleTitle}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{a.source}</td>
                    <td className="px-4 py-3 text-xs font-mono text-slate-400">{a.dateApplied}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${STATUS_COLORS[a.status] || 'text-slate-400 border-slate-700'}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 max-w-[140px] truncate">{a.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal !== null && (
        <AppModal jobseekers={jobseekers} existing={modal} onClose={() => setModal(null)} onSaved={() => {}} />
      )}
    </div>
  )
}
