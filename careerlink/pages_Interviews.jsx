/**
 * ============================================================
 * CareerLink OS™ — Interviews Page
 * Powered by 4P3X Intelligent AI — Created by Kyzel Kreates
 * ============================================================
 */
import { useState, useEffect } from 'react'
import Icon from './components_ui_Icon'
import { useConfigStore, useDataStore } from './core_storage'
import { jobseekerService } from './services_careerlink_jobseekerService'

const OUTCOMES = ['','Awaiting','Positive — progressing','Offered','Rejected','Withdrawn','Not attended']

function InterviewModal({ existing, jobseekers, onClose, onSaved }) {
  const dataStore = useDataStore()
  const [form, setForm] = useState({
    jobseekerId:'', employer:'', roleTitle:'',
    dateTime: new Date(Date.now()+86400000).toISOString().slice(0,16),
    locationOrLink:'', preparationTasks:'', outcome:'', notes:''
  })
  const [saving, setSaving] = useState(false)
  useEffect(() => { if (existing) setForm(f => ({...f,...existing})) }, [existing])
  const set = (k,v) => setForm(f => ({...f,[k]:v}))

  const handleSave = () => {
    if (!form.jobseekerId || !form.employer) return
    setSaving(true)
    if (existing?.id) dataStore.updateInterview(existing.id, form)
    else dataStore.addInterview(form)
    setSaving(false); onSaved?.(); onClose?.()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#0d1426] border border-slate-800/60 rounded-2xl overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/40">
          <span className="font-semibold text-white">{existing?.id ? 'Edit Interview' : 'Add Interview'}</span>
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
          {[['employer','Employer / Company',true],['roleTitle','Role Title',false]].map(([k,label,req]) => (
            <div key={k}>
              <label className="text-xs text-slate-400 font-medium mb-1 block">{label}{req&&<span className="text-red-400 ml-1">*</span>}</label>
              <input value={form[k]} onChange={e => set(k, e.target.value)}
                className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]/50"/>
            </div>
          ))}
          <div>
            <label className="text-xs text-slate-400 font-medium mb-1 block">Date & Time</label>
            <input type="datetime-local" value={form.dateTime} onChange={e => set('dateTime', e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]/50"/>
          </div>
          <div>
            <label className="text-xs text-slate-400 font-medium mb-1 block">Location or Online Link</label>
            <input value={form.locationOrLink} onChange={e => set('locationOrLink', e.target.value)}
              placeholder="e.g. 10 High Street or https://teams.microsoft.com/..."
              className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#d4af37]/50"/>
          </div>
          <div>
            <label className="text-xs text-slate-400 font-medium mb-1 block">Preparation Tasks</label>
            <textarea value={form.preparationTasks} onChange={e => set('preparationTasks', e.target.value)} rows={2}
              className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#d4af37]/50 resize-none"/>
          </div>
          <div>
            <label className="text-xs text-slate-400 font-medium mb-1 block">Outcome</label>
            <select value={form.outcome} onChange={e => set('outcome', e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]/50">
              {OUTCOMES.map(o => <option key={o} value={o}>{o || '— Pending —'}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 font-medium mb-1 block">Notes</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2}
              className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#d4af37]/50 resize-none"/>
          </div>
        </div>
        <div className="px-5 py-4 border-t border-slate-800/40 flex gap-2">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-lg border border-slate-700 text-sm text-slate-400 hover:text-white transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving || !form.jobseekerId || !form.employer}
            className="flex-1 px-4 py-2.5 rounded-lg bg-[#d4af37] text-black text-sm font-semibold hover:bg-[#e6c34a] transition-colors disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Interview'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Interviews() {
  const config     = useConfigStore(s => s.config)
  const isDemoMode = config.demoModeEnabled
  const dataStore  = useDataStore()
  const [jobseekers, setJobseekers] = useState([])
  const [modal, setModal]           = useState(null)

  useEffect(() => {
    setJobseekers(isDemoMode ? jobseekerService.getAll() : jobseekerService.getRealJobseekers())
  }, [isDemoMode])

  const interviews = isDemoMode ? dataStore.interviews : dataStore.interviews.filter(r => !r.isDemo)
  const jsMap = jobseekers.reduce((a,j) => ({...a,[j.id]:j}), {})
  const now   = new Date()
  const upcoming = interviews.filter(iv => new Date(iv.dateTime) >= now).sort((a,b) => new Date(a.dateTime)-new Date(b.dateTime))
  const past     = interviews.filter(iv => new Date(iv.dateTime) < now).sort((a,b) => new Date(b.dateTime)-new Date(a.dateTime))

  const Section = ({ title, items, icon, color }) => (
    <div className="bg-[#0d1426] border border-slate-800/60 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-slate-800/40 flex items-center gap-2">
        <Icon name={icon} size={13} className={color}/>
        <span className="text-sm font-semibold text-white">{title}</span>
        <span className="text-[10px] text-slate-600 ml-1">{items.length}</span>
      </div>
      {items.length === 0 ? (
        <p className="text-xs text-slate-600 text-center py-6">None.</p>
      ) : items.map(iv => (
        <div key={iv.id} onClick={() => setModal(iv)}
          className="border-b border-slate-800/20 px-4 py-3 hover:bg-slate-800/20 cursor-pointer transition-colors">
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white truncate">{iv.roleTitle || iv.employer}</div>
              <div className="text-[10px] text-slate-500">{iv.employer} · {jsMap[iv.jobseekerId]?.displayName || '—'}</div>
            </div>
            <div className="text-right flex-shrink-0">
              <div className="text-xs font-mono text-[#d4af37]">{new Date(iv.dateTime).toLocaleDateString('en-GB')}</div>
              <div className="text-[10px] text-slate-600">{new Date(iv.dateTime).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'})}</div>
            </div>
          </div>
          {iv.outcome && <div className="text-[10px] text-emerald-400 mt-1">{iv.outcome}</div>}
          {iv.isDemo && <span className="text-[9px] text-amber-500/50">[DEMO]</span>}
        </div>
      ))}
    </div>
  )

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-white text-xl">Interviews</h1>
          <p className="text-slate-500 text-sm mt-0.5">{upcoming.length} upcoming · {past.length} past</p>
        </div>
        <button onClick={() => setModal({})}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#d4af37] text-black text-sm font-semibold hover:bg-[#e6c34a] transition-colors">
          <Icon name="Plus" size={15}/>
          Add Interview
        </button>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Section title="Upcoming Interviews" items={upcoming} icon="CalendarCheck" color="text-purple-400"/>
        <Section title="Past Interviews" items={past} icon="History" color="text-slate-400"/>
      </div>
      {modal !== null && <InterviewModal jobseekers={jobseekers} existing={modal} onClose={() => setModal(null)} onSaved={() => {}}/>}
    </div>
  )
}
