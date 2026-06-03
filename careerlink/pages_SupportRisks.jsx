/**
 * ============================================================
 * CareerLink OS™ — Support Risks Page
 * Coach-overridable risk flags and support needs.
 * Powered by 4P3X Intelligent AI — Created by Kyzel Kreates
 * ============================================================
 */
import { useState, useEffect } from 'react'
import Icon from './components_ui_Icon'
import { useConfigStore, useDataStore } from './core_storage'
import { jobseekerService } from './services_careerlink_jobseekerService'

const FLAG_TYPES = [
  'confidence_issue','mental_wellbeing_concern','transport_barrier','childcare_barrier',
  'digital_access_issue','cv_application_support','interview_support',
  'housing_financial_pressure','other_barrier'
]
const SEVERITIES = ['low','medium','high','critical']
const SEVERITY_STYLE = {
  low:      'text-slate-400 border-slate-700 bg-slate-800/20',
  medium:   'text-amber-400 border-amber-700 bg-amber-900/20',
  high:     'text-red-400   border-red-700   bg-red-900/20',
  critical: 'text-red-300   border-red-600   bg-red-900/30',
}

function FlagModal({ existing, jobseekers, onClose, onSaved }) {
  const dataStore = useDataStore()
  const [form, setForm] = useState({
    jobseekerId:'', type:'confidence_issue', severity:'medium', description:'', status:'open'
  })
  const [saving, setSaving] = useState(false)
  useEffect(() => { if (existing) setForm(f => ({...f,...existing})) }, [existing])
  const set = (k,v) => setForm(f => ({...f,[k]:v}))

  const handleSave = () => {
    if (!form.jobseekerId) return
    setSaving(true)
    if (existing?.id) dataStore.updateSupportFlag(existing.id, form)
    else dataStore.addSupportFlag(form)
    setSaving(false); onSaved?.(); onClose?.()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#0d1426] border border-slate-800/60 rounded-2xl overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/40">
          <span className="font-semibold text-white">{existing?.id ? 'Edit Support Flag' : 'Raise Support Flag'}</span>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><Icon name="X" size={18}/></button>
        </div>
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="px-3 py-2.5 rounded-lg bg-amber-900/15 border border-amber-700/30">
            <p className="text-[10px] text-amber-300/80 leading-relaxed">
              Support flags are advisory. They do not replace professional guidance, medical advice, or official assessments.
              Coaches and caseworkers should review and act on flags using their professional judgement.
            </p>
          </div>
          <div>
            <label className="text-xs text-slate-400 font-medium mb-1 block">Jobseeker <span className="text-red-400">*</span></label>
            <select value={form.jobseekerId} onChange={e => set('jobseekerId', e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]/50">
              <option value="">Select…</option>
              {jobseekers.map(js => <option key={js.id} value={js.id}>{js.displayName}{js.isDemo?' [DEMO]':''}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 font-medium mb-1 block">Type</label>
              <select value={form.type} onChange={e => set('type', e.target.value)}
                className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]/50">
                {FLAG_TYPES.map(t => <option key={t} value={t}>{t.replace(/_/g,' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 font-medium mb-1 block">Severity</label>
              <select value={form.severity} onChange={e => set('severity', e.target.value)}
                className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]/50">
                {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 font-medium mb-1 block">Description</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3}
              className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#d4af37]/50 resize-none"/>
          </div>
          <div>
            <label className="text-xs text-slate-400 font-medium mb-1 block">Status</label>
            <select value={form.status} onChange={e => set('status', e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]/50">
              {['open','in_review','escalated','resolved'].map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
            </select>
          </div>
        </div>
        <div className="px-5 py-4 border-t border-slate-800/40 flex gap-2">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-lg border border-slate-700 text-sm text-slate-400 hover:text-white transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving || !form.jobseekerId}
            className="flex-1 px-4 py-2.5 rounded-lg bg-[#d4af37] text-black text-sm font-semibold hover:bg-[#e6c34a] transition-colors disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Flag'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function SupportRisks() {
  const config     = useConfigStore(s => s.config)
  const isDemoMode = config.demoModeEnabled
  const dataStore  = useDataStore()
  const [jobseekers, setJobseekers] = useState([])
  const [modal, setModal]           = useState(null)

  useEffect(() => {
    setJobseekers(isDemoMode ? jobseekerService.getAll() : jobseekerService.getRealJobseekers())
  }, [isDemoMode])

  const flags  = isDemoMode ? dataStore.supportFlags : dataStore.supportFlags.filter(r => !r.isDemo)
  const jsMap  = jobseekers.reduce((a,j) => ({...a,[j.id]:j}), {})
  const open   = flags.filter(f => f.status !== 'resolved')
  const resolved = flags.filter(f => f.status === 'resolved')

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-white text-xl">Support Risks</h1>
          <p className="text-slate-500 text-sm mt-0.5">{open.length} open flags · {resolved.length} resolved</p>
        </div>
        <button onClick={() => setModal({})}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600/80 text-white text-sm font-semibold hover:bg-red-600 transition-colors">
          <Icon name="Plus" size={15}/> Raise Flag
        </button>
      </div>

      <div className="px-4 py-3 rounded-xl bg-slate-900/50 border border-slate-800/40">
        <p className="text-[10px] text-slate-500 leading-relaxed">
          <strong className="text-slate-400">Human override required.</strong> All risk flags are advisory. Employment coaches and caseworkers must review, override, correct, and annotate any flag using professional judgement. This system does not replace official guidance or professional decision-making.
        </p>
      </div>

      {open.length === 0 ? (
        <div className="py-12 text-center bg-[#0d1426] border border-slate-800/60 rounded-xl">
          <Icon name="ShieldCheck" size={28} className="text-emerald-500 mx-auto mb-3"/>
          <p className="text-sm text-slate-400 font-medium">No open support flags</p>
          <p className="text-xs text-slate-600 mt-1">All jobseekers are currently flagged as low risk.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {open.map(f => (
            <div key={f.id} onClick={() => setModal(f)}
              className={`flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-4 rounded-xl border cursor-pointer hover:brightness-110 transition-all ${SEVERITY_STYLE[f.severity] || ''}`}>
              <Icon name="AlertTriangle" size={16} className="flex-shrink-0"/>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold capitalize">{f.type.replace(/_/g,' ')}</span>
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${SEVERITY_STYLE[f.severity]}`}>{f.severity}</span>
                  <span className="text-[10px] text-slate-500">{f.status.replace('_',' ')}</span>
                </div>
                <p className="text-xs text-slate-400 mt-1 truncate">{f.description}</p>
                <p className="text-[10px] text-slate-600 mt-0.5">{jsMap[f.jobseekerId]?.displayName || '—'} · {new Date(f.createdAt).toLocaleDateString('en-GB')}</p>
                {f.isDemo && <span className="text-[9px] text-amber-500/50">[DEMO]</span>}
              </div>
              <button className="flex-shrink-0 px-3 py-1.5 rounded-lg border border-current text-[10px] font-semibold hover:bg-current/10 transition-colors">
                Review
              </button>
            </div>
          ))}
        </div>
      )}

      {resolved.length > 0 && (
        <div>
          <p className="text-xs text-slate-600 uppercase tracking-widest font-semibold mb-2">Resolved</p>
          <div className="space-y-2">
            {resolved.map(f => (
              <div key={f.id} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-800/30 bg-slate-900/20 opacity-60">
                <Icon name="CheckCircle" size={13} className="text-emerald-500 flex-shrink-0"/>
                <div className="flex-1 min-w-0">
                  <span className="text-xs text-slate-400 capitalize">{f.type.replace(/_/g,' ')}</span>
                  <span className="text-[10px] text-slate-600 ml-2">{jsMap[f.jobseekerId]?.displayName || '—'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {modal !== null && <FlagModal jobseekers={jobseekers} existing={modal} onClose={() => setModal(null)} onSaved={() => {}}/>}
    </div>
  )
}
