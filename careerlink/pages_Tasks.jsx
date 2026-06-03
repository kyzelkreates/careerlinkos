/**
 * ============================================================
 * CareerLink OS™ — Tasks / Action Plan
 * Powered by 4P3X Intelligent AI — Created by Kyzel Kreates
 * ============================================================
 */
import { useState, useEffect } from 'react'
import Icon from './components_ui_Icon'
import { useConfigStore, useDataStore } from './core_storage'
import { jobseekerService } from './services_careerlink_jobseekerService'

const TASK_STATUSES = ['pending','in_progress','completed','overdue']
const STATUS_STYLE = {
  pending:     'text-amber-400 border-amber-700 bg-amber-900/20',
  in_progress: 'text-blue-400  border-blue-700  bg-blue-900/20',
  completed:   'text-emerald-400 border-emerald-700 bg-emerald-900/20',
  overdue:     'text-red-400   border-red-700   bg-red-900/20',
}

function TaskModal({ existing, jobseekers, onClose, onSaved }) {
  const dataStore = useDataStore()
  const [form, setForm] = useState({
    jobseekerId:'', title:'', description:'',
    dueDate: new Date(Date.now()+7*86400000).toISOString().split('T')[0],
    status:'pending', assignedBy:'coach'
  })
  const [saving, setSaving] = useState(false)
  useEffect(() => { if (existing) setForm(f => ({...f,...existing})) }, [existing])
  const set = (k,v) => setForm(f => ({...f,[k]:v}))

  const handleSave = () => {
    if (!form.jobseekerId || !form.title) return
    setSaving(true)
    if (existing?.id) dataStore.updateTask(existing.id, form)
    else dataStore.addTask(form)
    setSaving(false); onSaved?.(); onClose?.()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#0d1426] border border-slate-800/60 rounded-2xl overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/40">
          <span className="font-semibold text-white">{existing?.id ? 'Edit Task' : 'New Task'}</span>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><Icon name="X" size={18}/></button>
        </div>
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="text-xs text-slate-400 font-medium mb-1 block">Jobseeker <span className="text-red-400">*</span></label>
            <select value={form.jobseekerId} onChange={e => set('jobseekerId', e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]/50">
              <option value="">Select…</option>
              {jobseekers.map(js => <option key={js.id} value={js.id}>{js.displayName}{js.isDemo?' [DEMO]':''}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 font-medium mb-1 block">Task Title <span className="text-red-400">*</span></label>
            <input value={form.title} onChange={e => set('title', e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]/50"/>
          </div>
          <div>
            <label className="text-xs text-slate-400 font-medium mb-1 block">Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3}
              className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#d4af37]/50 resize-none"/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 font-medium mb-1 block">Due Date</label>
              <input type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)}
                className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]/50"/>
            </div>
            <div>
              <label className="text-xs text-slate-400 font-medium mb-1 block">Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)}
                className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]/50">
                {TASK_STATUSES.map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="px-5 py-4 border-t border-slate-800/40 flex gap-2">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-lg border border-slate-700 text-sm text-slate-400 hover:text-white transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving || !form.jobseekerId || !form.title}
            className="flex-1 px-4 py-2.5 rounded-lg bg-[#d4af37] text-black text-sm font-semibold hover:bg-[#e6c34a] transition-colors disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Task'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Tasks() {
  const config     = useConfigStore(s => s.config)
  const isDemoMode = config.demoModeEnabled
  const dataStore  = useDataStore()
  const [jobseekers, setJobseekers] = useState([])
  const [modal, setModal]           = useState(null)
  const [filterStatus, setFilterStatus] = useState('')

  useEffect(() => {
    setJobseekers(isDemoMode ? jobseekerService.getAll() : jobseekerService.getRealJobseekers())
  }, [isDemoMode])

  const tasks  = isDemoMode ? dataStore.tasks : dataStore.tasks.filter(r => !r.isDemo)
  const jsMap  = jobseekers.reduce((a,j) => ({...a,[j.id]:j}), {})
  const filtered = filterStatus ? tasks.filter(t => t.status === filterStatus) : tasks
  const now = new Date()

  const markDone = (id) => { dataStore.updateTask(id, { status: 'completed' }) }

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-white text-xl">Tasks & Action Plan</h1>
          <p className="text-slate-500 text-sm mt-0.5">{tasks.filter(t=>t.status!=='completed').length} outstanding · {tasks.filter(t=>t.status==='completed').length} completed</p>
        </div>
        <button onClick={() => setModal({})}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#d4af37] text-black text-sm font-semibold hover:bg-[#e6c34a] transition-colors">
          <Icon name="Plus" size={15}/> New Task
        </button>
      </div>

      <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
        className="bg-[#0d1426] border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#d4af37]/50">
        <option value="">All Statuses</option>
        {TASK_STATUSES.map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
      </select>

      <div className="bg-[#0d1426] border border-slate-800/60 rounded-xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-12 text-center">
            <Icon name="ListChecks" size={28} className="text-slate-700 mx-auto mb-3"/>
            <p className="text-sm text-slate-600">No tasks yet.</p>
            <button onClick={() => setModal({})} className="mt-3 text-sm text-[#d4af37] hover:underline">+ Create first task</button>
          </div>
        ) : filtered.map(t => {
          const overdue = t.status !== 'completed' && new Date(t.dueDate) < now
          return (
            <div key={t.id} className="border-b border-slate-800/20 px-4 py-3 flex items-center gap-3 hover:bg-slate-800/20 transition-colors">
              <button onClick={() => markDone(t.id)}
                className={`w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${t.status === 'completed' ? 'bg-emerald-500/20 border-emerald-500/50' : 'border-slate-700 hover:border-[#d4af37]'}`}>
                {t.status === 'completed' && <Icon name="Check" size={10} className="text-emerald-400"/>}
              </button>
              <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setModal(t)}>
                <div className={`text-xs font-medium ${t.status === 'completed' ? 'text-slate-500 line-through' : 'text-white'} truncate`}>{t.title}</div>
                <div className="text-[10px] text-slate-600">{jsMap[t.jobseekerId]?.displayName || '—'} · Due {t.dueDate}</div>
                {t.isDemo && <span className="text-[9px] text-amber-500/50">[DEMO]</span>}
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border flex-shrink-0 ${overdue && t.status !== 'completed' ? 'text-red-400 border-red-700 bg-red-900/20' : STATUS_STYLE[t.status] || ''}`}>
                {overdue && t.status !== 'completed' ? 'overdue' : t.status.replace('_',' ')}
              </span>
            </div>
          )
        })}
      </div>
      {modal !== null && <TaskModal jobseekers={jobseekers} existing={modal} onClose={() => setModal(null)} onSaved={() => {}}/>}
    </div>
  )
}
