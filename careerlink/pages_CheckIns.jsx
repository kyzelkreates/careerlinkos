/**
 * ============================================================
 * CareerLink OS™ — Check-ins Page
 * 10 configurable daily check-in questions.
 * Powered by 4P3X Intelligent AI — Created by Kyzel Kreates
 * ============================================================
 */
import { useState, useEffect } from 'react'
import Icon from './components_ui_Icon'
import { useConfigStore, useDataStore } from './core_storage'
import { jobseekerService } from './services_careerlink_jobseekerService'
import { CHECK_IN_QUESTIONS_DEFAULT } from './services_careerlink_demoData'

function CheckInModal({ jobseekers, onClose, onSaved }) {
  const dataStore = useDataStore()
  const [jobseekerId, setJobseekerId] = useState('')
  const [answers, setAnswers]         = useState({})
  const [barrierFlags, setBarrierFlags] = useState([])
  const [hoursReported, setHoursReported] = useState(0)
  const [confidenceScore, setConfidenceScore] = useState(7)
  const [notes, setNotes]             = useState('')
  const [saving, setSaving]           = useState(false)

  const BARRIERS = [
    'confidence_issue','mental_wellbeing_concern','transport_barrier','childcare_barrier',
    'digital_access_issue','cv_application_support','interview_support','housing_financial_pressure','other'
  ]

  const toggleBarrier = (b) => setBarrierFlags(prev =>
    prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b]
  )

  const handleSave = () => {
    if (!jobseekerId) return
    setSaving(true)
    const supportNeeded = barrierFlags.length > 0 || confidenceScore < 5
    dataStore.addCheckIn({
      jobseekerId, date: new Date().toISOString().split('T')[0],
      answers, hoursReported: +hoursReported, supportNeeded,
      confidenceScore: +confidenceScore, barrierFlags, notes
    })
    if (supportNeeded) {
      barrierFlags.forEach(b => {
        dataStore.addSupportFlag({ jobseekerId, type: b, severity: confidenceScore < 4 ? 'high' : 'medium',
          description: `Flagged via daily check-in. Confidence: ${confidenceScore}/10.`, status: 'open' })
      })
    }
    setSaving(false); onSaved?.(); onClose?.()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#0d1426] border border-slate-800/60 rounded-2xl overflow-hidden animate-slide-up">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/40">
          <span className="font-semibold text-white">Daily Check-in</span>
          <button onClick={onClose} className="text-slate-500 hover:text-white"><Icon name="X" size={18}/></button>
        </div>
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          <div>
            <label className="text-xs text-slate-400 font-medium mb-1 block">Jobseeker <span className="text-red-400">*</span></label>
            <select value={jobseekerId} onChange={e => setJobseekerId(e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]/50">
              <option value="">Select…</option>
              {jobseekers.map(js => <option key={js.id} value={js.id}>{js.displayName}{js.isDemo?' [DEMO]':''}</option>)}
            </select>
          </div>

          <div className="space-y-3">
            {CHECK_IN_QUESTIONS_DEFAULT.map((q, i) => (
              <div key={i} className="bg-slate-900/40 rounded-lg p-3">
                <p className="text-xs text-slate-300 mb-2 leading-relaxed"><span className="text-[#d4af37] font-semibold mr-1">{i+1}.</span>{q}</p>
                <input value={answers[i] || ''} onChange={e => setAnswers(a => ({...a,[i]:e.target.value}))}
                  placeholder="Your answer…"
                  className="w-full bg-slate-900/60 border border-slate-700/50 rounded px-2.5 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-[#d4af37]/50"/>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 font-medium mb-1 block">Hours reported today</label>
              <input type="number" min="0" max="24" step="0.5" value={hoursReported} onChange={e => setHoursReported(e.target.value)}
                className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]/50"/>
            </div>
            <div>
              <label className="text-xs text-slate-400 font-medium mb-1 block">Confidence score (1–10)</label>
              <input type="number" min="1" max="10" value={confidenceScore} onChange={e => setConfidenceScore(e.target.value)}
                className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]/50"/>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 font-medium mb-2 block">Barrier flags (select all that apply)</label>
            <div className="flex flex-wrap gap-2">
              {BARRIERS.map(b => (
                <button key={b} onClick={() => toggleBarrier(b)}
                  className={`text-[10px] px-2 py-1 rounded border transition-colors ${barrierFlags.includes(b) ? 'bg-red-900/30 border-red-500/40 text-red-300' : 'bg-slate-900/40 border-slate-700/40 text-slate-500 hover:text-slate-300'}`}>
                  {b.replace(/_/g,' ')}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 font-medium mb-1 block">Additional notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
              className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#d4af37]/50 resize-none"/>
          </div>
        </div>
        <div className="px-5 py-4 border-t border-slate-800/40 flex gap-2">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 rounded-lg border border-slate-700 text-sm text-slate-400 hover:text-white transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving || !jobseekerId}
            className="flex-1 px-4 py-2.5 rounded-lg bg-[#d4af37] text-black text-sm font-semibold hover:bg-[#e6c34a] transition-colors disabled:opacity-50">
            {saving ? 'Saving…' : 'Submit Check-in'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function CheckIns() {
  const config     = useConfigStore(s => s.config)
  const isDemoMode = config.demoModeEnabled
  const dataStore  = useDataStore()
  const [jobseekers, setJobseekers] = useState([])
  const [modal, setModal]           = useState(false)

  useEffect(() => {
    setJobseekers(isDemoMode ? jobseekerService.getAll() : jobseekerService.getRealJobseekers())
  }, [isDemoMode])

  const checkIns = isDemoMode ? dataStore.checkIns : dataStore.checkIns.filter(r => !r.isDemo)
  const jsMap    = jobseekers.reduce((a,j) => ({...a,[j.id]:j}), {})

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-white text-xl">Check-ins</h1>
          <p className="text-slate-500 text-sm mt-0.5">{checkIns.length} check-ins recorded</p>
        </div>
        <button onClick={() => setModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#d4af37] text-black text-sm font-semibold hover:bg-[#e6c34a] transition-colors">
          <Icon name="Plus" size={15}/> New Check-in
        </button>
      </div>

      <div className="bg-[#0d1426] border border-slate-800/60 rounded-xl overflow-hidden">
        {checkIns.length === 0 ? (
          <div className="py-12 text-center">
            <Icon name="CheckSquare" size={28} className="text-slate-700 mx-auto mb-3"/>
            <p className="text-sm text-slate-600">No check-ins yet.</p>
            <button onClick={() => setModal(true)} className="mt-3 text-sm text-[#d4af37] hover:underline">+ Record first check-in</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800/60">
                  {['Jobseeker','Date','Hours','Confidence','Support Needed','Barriers','Notes'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] text-slate-600 font-semibold uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {checkIns.map(ci => (
                  <tr key={ci.id} className="border-b border-slate-800/20 hover:bg-slate-800/20 transition-colors">
                    <td className="px-4 py-3 text-xs text-white">
                      {jsMap[ci.jobseekerId]?.displayName || '—'}
                      {ci.isDemo && <span className="text-[9px] text-amber-500/50 ml-1">[DEMO]</span>}
                    </td>
                    <td className="px-4 py-3 text-xs font-mono text-slate-400">{ci.date}</td>
                    <td className="px-4 py-3 text-xs font-mono text-white">{ci.hoursReported}h</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-mono font-bold ${ci.confidenceScore >= 7 ? 'text-emerald-400' : ci.confidenceScore >= 5 ? 'text-amber-400' : 'text-red-400'}`}>
                        {ci.confidenceScore}/10
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {ci.supportNeeded
                        ? <span className="text-[10px] px-2 py-0.5 rounded border text-red-400 border-red-700 bg-red-900/20">Yes</span>
                        : <span className="text-[10px] text-slate-600">—</span>}
                    </td>
                    <td className="px-4 py-3 text-[10px] text-slate-500 max-w-[120px]">
                      {ci.barrierFlags?.length > 0 ? ci.barrierFlags.map(b => b.replace(/_/g,' ')).join(', ') : '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 max-w-[140px] truncate">{ci.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal && <CheckInModal jobseekers={jobseekers} onClose={() => setModal(false)} onSaved={() => {}}/>}
    </div>
  )
}
