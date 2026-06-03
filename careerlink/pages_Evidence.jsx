/**
 * ============================================================
 * CareerLink OS™ — Evidence Records Page
 * Local placeholder evidence system (no fake cloud upload).
 * Powered by 4P3X Intelligent AI — Created by Kyzel Kreates
 * ============================================================
 */
import { useState, useEffect } from 'react'
import Icon from './components_ui_Icon'
import { useConfigStore, useDataStore } from './core_storage'
import { jobseekerService } from './services_careerlink_jobseekerService'

const EVIDENCE_TYPES = [
  'Application confirmation','Interview confirmation','Training certificate',
  'CV / Cover letter','Employer correspondence','Job search screenshot',
  'Activity log export','Attendance record','Other',
]

function EvidenceModal({ existing, jobseekers, onClose, onSaved }) {
  const dataStore = useDataStore()
  const [form, setForm] = useState({
    jobseekerId:'', title:'', evidenceType:'Application confirmation',
    date: new Date().toISOString().split('T')[0],
    filePlaceholderName:'', notes:''
  })
  const [saving, setSaving] = useState(false)
  useEffect(() => { if (existing) setForm(f => ({...f,...existing})) }, [existing])
  const set = (k,v) => setForm(f => ({...f,[k]:v}))

  const handleSave = () => {
    if (!form.jobseekerId || !form.title) return
    setSaving(true)
    if (existing?.id) dataStore.updateEvidence(existing.id, form)
    else dataStore.addEvidence(form)
    setSaving(false); onSaved?.(); onClose?.()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#0d1426] border border-slate-800/60 rounded-2xl overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/40">
          <span className="font-semibold text-white">{existing?.id ? 'Edit Evidence Record' : 'Add Evidence Record'}</span>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><Icon name="X" size={18}/></button>
        </div>
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Info banner */}
          <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-cyan-900/20 border border-cyan-800/30">
            <Icon name="Info" size={13} className="text-cyan-400 flex-shrink-0 mt-0.5"/>
            <p className="text-[10px] text-cyan-300/80 leading-relaxed">
              Evidence is stored as a local record. Enter the file name or title — keep the actual file safe on your device or in your secure storage.
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
          <div>
            <label className="text-xs text-slate-400 font-medium mb-1 block">Title / Description <span className="text-red-400">*</span></label>
            <input value={form.title} onChange={e => set('title', e.target.value)}
              placeholder="e.g. Horizon Ltd Application Confirmation"
              className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#d4af37]/50"/>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 font-medium mb-1 block">Evidence Type</label>
              <select value={form.evidenceType} onChange={e => set('evidenceType', e.target.value)}
                className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]/50">
                {EVIDENCE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 font-medium mb-1 block">Date</label>
              <input type="date" value={form.date} onChange={e => set('date', e.target.value)}
                className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]/50"/>
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 font-medium mb-1 block">File Name (reference)</label>
            <input value={form.filePlaceholderName} onChange={e => set('filePlaceholderName', e.target.value)}
              placeholder="e.g. application_confirmation.pdf"
              className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#d4af37]/50"/>
          </div>
          <div>
            <label className="text-xs text-slate-400 font-medium mb-1 block">Notes</label>
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={2}
              className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#d4af37]/50 resize-none"/>
          </div>
        </div>
        <div className="px-5 py-4 border-t border-slate-800/40 flex gap-2">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-lg border border-slate-700 text-sm text-slate-400 hover:text-white transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving || !form.jobseekerId || !form.title}
            className="flex-1 px-4 py-2.5 rounded-lg bg-[#d4af37] text-black text-sm font-semibold hover:bg-[#e6c34a] transition-colors disabled:opacity-50">
            {saving ? 'Saving…' : 'Save Record'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Evidence() {
  const config     = useConfigStore(s => s.config)
  const isDemoMode = config.demoModeEnabled
  const dataStore  = useDataStore()
  const [jobseekers, setJobseekers] = useState([])
  const [modal, setModal]           = useState(null)

  useEffect(() => {
    setJobseekers(isDemoMode ? jobseekerService.getAll() : jobseekerService.getRealJobseekers())
  }, [isDemoMode])

  const records = isDemoMode ? dataStore.evidenceRecords : dataStore.evidenceRecords.filter(r => !r.isDemo)
  const jsMap   = jobseekers.reduce((a,j) => ({...a,[j.id]:j}), {})

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-white text-xl">Evidence Records</h1>
          <p className="text-slate-500 text-sm mt-0.5">{records.length} records stored</p>
        </div>
        <button onClick={() => setModal({})}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#d4af37] text-black text-sm font-semibold hover:bg-[#e6c34a] transition-colors">
          <Icon name="Plus" size={15}/> Add Evidence
        </button>
      </div>

      <div className="bg-[#0d1426] border border-slate-800/60 rounded-xl overflow-hidden">
        {records.length === 0 ? (
          <div className="py-12 text-center">
            <Icon name="Paperclip" size={28} className="text-slate-700 mx-auto mb-3"/>
            <p className="text-sm text-slate-600">No evidence records yet.</p>
            <button onClick={() => setModal({})} className="mt-3 text-sm text-[#d4af37] hover:underline">+ Add first record</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800/60">
                  {['Jobseeker','Title','Type','Date','File Reference','Notes'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] text-slate-600 font-semibold uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {records.map(r => (
                  <tr key={r.id} onClick={() => setModal(r)}
                    className="border-b border-slate-800/20 hover:bg-slate-800/20 cursor-pointer transition-colors">
                    <td className="px-4 py-3 text-xs text-white">
                      {jsMap[r.jobseekerId]?.displayName || '—'}
                      {r.isDemo && <span className="text-[9px] text-amber-500/50 ml-1">[DEMO]</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-white font-medium">{r.title}</td>
                    <td className="px-4 py-3 text-xs text-cyan-400">{r.evidenceType}</td>
                    <td className="px-4 py-3 text-xs font-mono text-slate-400">{r.date}</td>
                    <td className="px-4 py-3 text-xs text-slate-500 font-mono">{r.filePlaceholderName || '—'}</td>
                    <td className="px-4 py-3 text-xs text-slate-500 max-w-[140px] truncate">{r.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal !== null && <EvidenceModal jobseekers={jobseekers} existing={modal} onClose={() => setModal(null)} onSaved={() => {}}/>}
    </div>
  )
}
