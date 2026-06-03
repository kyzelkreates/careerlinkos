/**
 * ============================================================
 * CareerLink OS™ — Jobseeker Setup / Invite Page
 * Generate invite links and instructions.
 * Powered by 4P3X Intelligent AI — Created by Kyzel Kreates
 * ============================================================
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Icon from './components_ui_Icon'
import { useConfigStore } from './core_storage'
import { jobseekerService } from './services_careerlink_jobseekerService'

export default function JobseekerSetup() {
  const navigate       = useNavigate()
  const config         = useConfigStore(s => s.config)
  const weeklyTarget   = config.weeklyTargetHoursDefault ?? 35
  const [created, setCreated]   = useState(null)
  const [copied, setCopied]     = useState(false)
  const [form, setForm]         = useState({ displayName:'', email:'', phone:'', programme:'', weeklyTargetHours: weeklyTarget })
  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  const pwaURL = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}#/jobseeker-app`
    : '#/jobseeker-app'

  const handleCreate = () => {
    if (!form.displayName.trim()) return
    const js = jobseekerService.create(form)
    setCreated(js)
  }

  const handleCopy = () => {
    navigator.clipboard?.writeText(pwaURL).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div className="min-h-screen bg-[#050810] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors">
            <Icon name="ArrowLeft" size={16}/>
          </button>
          <div>
            <h1 className="font-display font-bold text-white text-xl">Invite Jobseeker</h1>
            <p className="text-slate-500 text-xs mt-0.5">Create a profile and share the PWA link</p>
          </div>
        </div>

        {!created ? (
          <div className="bg-[#0d1426] border border-slate-800/60 rounded-2xl p-6 space-y-4">
            <div className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Step 1 — Create Jobseeker Profile</div>
            <div>
              <label className="text-xs text-slate-400 font-medium mb-1 block">Full Name <span className="text-red-400">*</span></label>
              <input value={form.displayName} onChange={e=>set('displayName',e.target.value)}
                placeholder="e.g. Jordan Mitchell"
                className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#d4af37]/50"/>
            </div>
            {[['email','Email','email'],['phone','Phone','tel'],['programme','Programme / Cohort','text']].map(([k,l,t]) => (
              <div key={k}>
                <label className="text-xs text-slate-400 font-medium mb-1 block">{l}</label>
                <input type={t} value={form[k]} onChange={e=>set(k,e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#d4af37]/50"/>
              </div>
            ))}
            <div>
              <label className="text-xs text-slate-400 font-medium mb-1 block">Weekly Target Hours</label>
              <input type="number" min="1" max="168" value={form.weeklyTargetHours} onChange={e=>set('weeklyTargetHours',+e.target.value)}
                className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#d4af37]/50"/>
            </div>
            <button onClick={handleCreate} disabled={!form.displayName.trim()}
              className="w-full py-3.5 rounded-xl bg-[#d4af37] text-black text-sm font-bold hover:bg-[#e6c34a] transition-colors disabled:opacity-50">
              Create Jobseeker Profile
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-2xl p-5 text-center">
              <Icon name="CheckCircle" size={28} className="text-emerald-400 mx-auto mb-2"/>
              <div className="text-base font-bold text-white">{created.displayName}</div>
              <div className="text-xs text-slate-500 mt-1">Profile created successfully</div>
            </div>

            <div className="bg-[#0d1426] border border-slate-800/60 rounded-2xl p-5 space-y-4">
              <div className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Step 2 — Share PWA Link</div>
              <div className="bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3 text-xs font-mono text-slate-300 break-all">
                {pwaURL}
              </div>
              <button onClick={handleCopy}
                className="w-full py-3 rounded-xl border border-[#d4af37]/40 text-[#d4af37] text-sm font-semibold hover:bg-[#d4af37]/10 transition-colors flex items-center justify-center gap-2">
                <Icon name={copied ? 'Check' : 'Copy'} size={15}/>
                {copied ? 'Copied!' : 'Copy Invite Link'}
              </button>
              <div className="px-4 py-3 rounded-xl bg-slate-900/40 border border-slate-800/40">
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Copy this link and send it to the jobseeker using your chosen communication method (email, SMS, WhatsApp, etc.).
                  When they open it, they will see their name in the list and can begin logging activity immediately.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => navigate('/jobseekers')}
                className="flex-1 py-3 rounded-xl border border-slate-700 text-slate-400 text-sm font-medium hover:text-white transition-colors">
                View Jobseekers
              </button>
              <button onClick={() => { setCreated(null); setForm({ displayName:'', email:'', phone:'', programme:'', weeklyTargetHours: weeklyTarget }) }}
                className="flex-1 py-3 rounded-xl bg-[#d4af37] text-black text-sm font-bold hover:bg-[#e6c34a] transition-colors">
                Invite Another
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
