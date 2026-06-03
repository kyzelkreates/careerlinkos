/**
 * ============================================================
 * CareerLink OS™ — Jobseeker PWA
 * Mobile-first standalone app for jobseekers.
 * Offline-friendly. No fleet/driver wording.
 * Powered by 4P3X Intelligent AI — Created by Kyzel Kreates
 * ============================================================
 */
import { useState, useEffect, useCallback } from 'react'
import Icon from './components_ui_Icon'
import { useDataStore, useConfigStore, deriveJobseekerMetrics, STORAGE_KEYS } from './core_storage'
import { jobseekerService } from './services_careerlink_jobseekerService'
import { CHECK_IN_QUESTIONS_DEFAULT } from './services_careerlink_demoData'
import { LOCAL_AI_RESPONSES, AI_DISCLAIMER } from './services_ai_aiConfig'

const ACTIVITY_TYPES = [
  'Job search','Job application','CV update','Cover letter',
  'Interview preparation','Interview attended','Employer contact',
  'Training / course','Work coach appointment','Portfolio update',
  'Networking','Other employment activity',
]
const APPLICATION_STATUSES = ['Drafting','Applied','Awaiting response','Interview offered','Interview completed','Rejected','Offer received','Withdrawn']
const BARRIER_TYPES = [
  'confidence_issue','mental_wellbeing_concern','transport_barrier','childcare_barrier',
  'digital_access_issue','cv_application_support','interview_support','housing_financial_pressure','other'
]

// ─── Auth guard ───────────────────────────────────────────────
function PINGate({ onAuth }) {
  const [pin,     setPin]     = useState('')
  const [jsId,    setJsId]    = useState('')
  const [error,   setError]   = useState('')
  const [jobseekers, setJobseekers] = useState([])

  useEffect(() => {
    const all = jobseekerService.getAll()
    setJobseekers(all)
    // Auto-fill if session exists
    const session = JSON.parse(localStorage.getItem(STORAGE_KEYS.JOBSEEKER_SESSION) || 'null')
    if (session?.jobseekerId) {
      const js = all.find(j => j.id === session.jobseekerId)
      if (js) { onAuth(js); return }
    }
  }, [onAuth])

  const handleLogin = () => {
    setError('')
    if (!jsId) { setError('Please select your name.'); return }
    const js = jobseekers.find(j => j.id === jsId)
    if (!js) { setError('Jobseeker not found.'); return }
    // PIN is last 4 of id for demo — in real deployment would be set by coach
    localStorage.setItem(STORAGE_KEYS.JOBSEEKER_SESSION, JSON.stringify({ jobseekerId: jsId, ts: Date.now() }))
    onAuth(js)
  }

  return (
    <div className="min-h-screen bg-[#050810] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#d4af37]/10 border border-[#d4af37]/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="font-display font-bold text-[#d4af37] text-xl">CL</span>
          </div>
          <h1 className="font-display font-bold text-white text-2xl">CareerLink</h1>
          <p className="text-slate-500 text-sm mt-1">Jobseeker Activity App</p>
          <p className="text-[10px] text-[#d4af37]/60 mt-1">Powered by 4P3X Intelligent AI</p>
        </div>
        <div className="bg-[#0d1426] border border-slate-800/60 rounded-2xl p-6 space-y-4">
          <div>
            <label className="text-xs text-slate-400 font-medium mb-2 block">Select your name</label>
            <select value={jsId} onChange={e => setJsId(e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#d4af37]/50">
              <option value="">Choose your name…</option>
              {jobseekers.map(js => <option key={js.id} value={js.id}>{js.displayName}</option>)}
            </select>
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button onClick={handleLogin}
            className="w-full py-3 rounded-xl bg-[#d4af37] text-black text-sm font-bold hover:bg-[#e6c34a] transition-colors">
            Open My CareerLink
          </button>
          {jobseekers.length === 0 && (
            <p className="text-[10px] text-slate-600 text-center leading-relaxed">
              No jobseekers set up yet. Ask your employment coach to set up your account.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Progress Ring ────────────────────────────────────────────
function ProgressRing({ pct, size = 80, label }) {
  const r = (size - 8) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  const color = pct >= 100 ? '#34d399' : pct >= 60 ? '#d4af37' : pct >= 30 ? '#f59e0b' : '#f87171'
  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} style={{transform:'rotate(-90deg)'}}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1a2035" strokeWidth="7"/>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="7"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{transition:'stroke-dashoffset 0.5s ease'}}/>
      </svg>
      <div style={{marginTop:`-${size/2+4}px`, marginBottom:`${size/2-12}px`}} className="text-center">
        <div className="font-mono font-bold text-white" style={{fontSize: size > 60 ? '1.2rem' : '0.9rem'}} >{pct}%</div>
      </div>
      {label && <div className="text-[10px] text-slate-500 text-center mt-1">{label}</div>}
    </div>
  )
}

// ─── Tab screens ─────────────────────────────────────────────

// ─── Jobseeker AI Support Assistant ─────────────────────────
function JobseekerAI({ jobseeker, metrics, weeklyTarget }) {
  const [open, setOpen]     = useState(false)
  const [input, setInput]   = useState('')
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)

  const QUICK_ACTIONS = [
    'What should I do next?',
    'How many hours do I still need this week?',
    'Help me plan today',
    'Help me prepare for an interview',
    'Help me improve my CV/application',
    'What evidence should I upload?',
    'I need support',
    'Explain my weekly progress',
  ]

  const handleQuery = (q) => {
    const text = (q || input).trim()
    if (!text) return
    setInput('')
    setHistory(h => [...h, { role: 'user', content: text }])
    setLoading(true)
    setTimeout(() => {
      let response
      const tl = text.toLowerCase()
      const r  = LOCAL_AI_RESPONSES.jobseeker
      const logged  = metrics?.weeklyHoursLogged ?? 0
      const target  = jobseeker?.weeklyTargetHours ?? weeklyTarget
      const pct     = metrics?.weeklyTargetPercent ?? 0

      if (tl.includes('what should') || tl.includes('next'))         response = r.whatNext
      else if (tl.includes('hours') || tl.includes('remaining'))      response = r.hoursRemaining(logged, target)
      else if (tl.includes('plan today') || tl.includes('plan my'))   response = r.planToday
      else if (tl.includes('interview'))                               response = r.interviewPrep
      else if (tl.includes('cv') || tl.includes('application'))       response = r.cvHelp
      else if (tl.includes('evidence') || tl.includes('upload'))      response = r.evidenceUpload
      else if (tl.includes('support') || tl.includes('barrier'))      response = r.needSupport
      else if (tl.includes('progress') || tl.includes('explain'))     response = r.explainProgress(pct, logged, target)
      else response = r.explainProgress(pct, logged, target)

      setHistory(h => [...h, { role: 'ai', content: response }])
      setLoading(false)
    }, 400)
  }

  if (!open) return (
    <button onClick={() => setOpen(true)}
      className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#1a1200]/60 border border-[#d4af37]/20 hover:border-[#d4af37]/40 transition-colors">
      <div className="w-8 h-8 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/30 flex items-center justify-center flex-shrink-0">
        <Icon name="Brain" size={14} className="text-[#d4af37]" />
      </div>
      <div className="text-left">
        <div className="text-sm font-semibold text-[#d4af37]">CareerLink AI Assistant</div>
        <div className="text-[10px] text-slate-500">4P3X Intelligent AI · Advisory only</div>
      </div>
      <Icon name="ChevronRight" size={14} className="text-slate-600 ml-auto" />
    </button>
  )

  return (
    <div className="bg-[#0d1426] border border-[#d4af37]/20 rounded-2xl overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/40">
        <div className="flex items-center gap-2">
          <Icon name="Brain" size={14} className="text-[#d4af37]" />
          <span className="text-sm font-semibold text-[#d4af37]">CareerLink AI Assistant</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setHistory([])} className="text-[10px] text-slate-600 hover:text-slate-400">Reset</button>
          <button onClick={() => setOpen(false)} className="text-slate-600 hover:text-white"><Icon name="X" size={13} /></button>
        </div>
      </div>
      <div className="px-4 py-2 border-b border-slate-800/30 flex flex-wrap gap-1.5">
        {QUICK_ACTIONS.map((qa, i) => (
          <button key={i} onClick={() => handleQuery(qa)}
            className="text-[10px] px-2 py-1 rounded-full bg-slate-800/60 border border-slate-700/40 text-slate-400 hover:text-[#d4af37] hover:border-[#d4af37]/30 transition-colors">
            {qa}
          </button>
        ))}
      </div>
      <div className="p-3 space-y-2 min-h-[120px] max-h-[220px] overflow-y-auto">
        {history.length === 0 && (
          <p className="text-xs text-slate-600 text-center mt-4">Ask me anything about your job search progress…</p>
        )}
        {history.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed ${m.role === 'user' ? 'bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/20' : 'bg-slate-800/60 text-slate-300 border border-slate-700/40'}`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/40 flex gap-1">
              {[0,1,2].map(i=><div key={i} className="w-1.5 h-1.5 rounded-full bg-[#d4af37]/50 animate-bounce" style={{animationDelay:`${i*0.15}s`}}/>)}
            </div>
          </div>
        )}
      </div>
      <div className="px-3 pb-2 flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleQuery()}
          placeholder="Ask your CareerLink AI…"
          className="flex-1 bg-slate-900/60 border border-slate-700/50 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#d4af37]/50" />
        <button onClick={() => handleQuery()} disabled={!input.trim() || loading}
          className="px-3 py-2 rounded-xl bg-[#d4af37] text-black font-semibold disabled:opacity-40">
          <Icon name="Send" size={13}/>
        </button>
      </div>
      <p className="text-[9px] text-slate-700 px-4 pb-3 leading-relaxed">{AI_DISCLAIMER}</p>
    </div>
  )
}

function HomeScreen({ jobseeker, metrics, weeklyTarget, onQuickLog, navigate }) {
  const status = metrics.progressStatus
  const statusMsg = {
    target_complete: '🎉 Weekly target complete! Great work.',
    on_track:        '✅ You\'re on track this week. Keep it up.',
    needs_attention: '⚠️ You\'re a bit behind this week. Try to log more activity.',
    high_risk:       '🚨 You\'re significantly behind your target. Please log activity or contact your coach.',
  }[status] || 'Log activity to track your weekly progress.'

  return (
    <div className="p-4 space-y-5">
      <div>
        <h2 className="text-base font-semibold text-white">Hi, {jobseeker.displayName.split(' ')[0]} 👋</h2>
        <p className="text-xs text-slate-500">{new Date().toLocaleDateString('en-GB',{weekday:'long',day:'2-digit',month:'long'})}</p>
      </div>

      {/* Weekly Progress */}
      <div className="bg-[#0d1426] border border-slate-800/60 rounded-2xl p-5">
        <div className="text-xs text-slate-500 font-semibold uppercase tracking-widest mb-4">Weekly Progress</div>
        <div className="flex items-center justify-around gap-4">
          <ProgressRing pct={metrics.weeklyTargetPercent} size={80} label="Target"/>
          <div className="space-y-3 flex-1">
            <div className="flex justify-between">
              <span className="text-xs text-slate-400">Hours logged</span>
              <span className="text-xs font-mono text-white">{metrics.weeklyHoursLogged}h / {jobseeker.weeklyTargetHours || weeklyTarget}h</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-slate-400">Applications</span>
              <span className="text-xs font-mono text-white">{metrics.applicationCountWeek}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-slate-400">Interviews</span>
              <span className="text-xs font-mono text-white">{metrics.interviewsUpcoming} upcoming</span>
            </div>
            <div className="flex justify-between">
              <span className="text-xs text-slate-400">Check-ins</span>
              <span className="text-xs font-mono text-white">{metrics.checkInsThisWeek} this week</span>
            </div>
          </div>
        </div>
        <div className={`mt-4 px-3 py-2 rounded-lg text-xs leading-relaxed ${status==='high_risk'?'bg-red-900/20 border border-red-700/30 text-red-300':status==='target_complete'?'bg-emerald-900/20 border border-emerald-700/30 text-emerald-300':status==='needs_attention'?'bg-amber-900/20 border border-amber-700/30 text-amber-300':'bg-slate-800/40 border border-slate-700/30 text-slate-400'}`}>
          {statusMsg}
        </div>
      </div>

      {/* Quick action */}
      <button onClick={onQuickLog}
        className="w-full py-4 rounded-2xl bg-[#d4af37] text-black text-base font-bold hover:bg-[#e6c34a] transition-colors flex items-center justify-center gap-2">
        <Icon name="Plus" size={20}/>
        Log Activity Now
      </button>

      {/* Next steps */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { label:'Check In', icon:'CheckSquare', tab:'checkin', color:'text-emerald-400' },
          { label:'Add Application', icon:'FileText', tab:'applications', color:'text-[#d4af37]' },
          { label:'View Progress', icon:'BarChart3', tab:'progress', color:'text-purple-400' },
          { label:'Request Support', icon:'HelpCircle', tab:'support', color:'text-red-400' },
        ].map(a => (
          <button key={a.tab} onClick={() => navigate(a.tab)}
            className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#0d1426] border border-slate-800/60 hover:border-slate-700 transition-colors">
            <Icon name={a.icon} size={16} className={a.color}/>
            <span className="text-xs font-medium text-slate-300">{a.label}</span>
          </button>
        ))}
      </div>

      {/* Jobseeker AI Support Assistant */}
      <JobseekerAI jobseeker={jobseeker} metrics={metrics} weeklyTarget={weeklyTarget}/>
    </div>
  )
}

function LogActivityScreen({ jobseeker, onBack, onSaved }) {
  const dataStore = useDataStore()
  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime:'', endTime:'', durationMinutes:60,
    activityType:'Job search', description:'', evidenceAttached:false, notes:''
  })
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const set = (k,v) => setForm(f=>({...f,[k]:v}))

  const calcDur = (s,e) => {
    if(!s||!e) return
    const [sh,sm]=s.split(':').map(Number), [eh,em]=e.split(':').map(Number)
    const m=(eh*60+em)-(sh*60+sm)
    if(m>0) set('durationMinutes',m)
  }

  const handleSave = () => {
    if (!form.activityType) return
    setSaving(true)
    dataStore.addActivityLog({ ...form, jobseekerId: jobseeker.id })
    setSaving(false)
    setSuccess(true)
    setTimeout(() => { onSaved?.(); onBack() }, 1200)
  }

  if (success) return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mb-4">
        <Icon name="Check" size={28} className="text-emerald-400"/>
      </div>
      <h3 className="text-lg font-bold text-white">Activity Logged!</h3>
      <p className="text-slate-500 text-sm mt-1">Your job-search time has been recorded.</p>
    </div>
  )

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors">
          <Icon name="ArrowLeft" size={16}/>
        </button>
        <h2 className="font-semibold text-white">Log Job-Search Activity</h2>
      </div>

      <div>
        <label className="text-xs text-slate-400 font-medium mb-1 block">Date</label>
        <input type="date" value={form.date} onChange={e => set('date',e.target.value)}
          className="w-full bg-[#0d1426] border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#d4af37]/50"/>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-slate-400 font-medium mb-1 block">Start</label>
          <input type="time" value={form.startTime} onChange={e=>{set('startTime',e.target.value);calcDur(e.target.value,form.endTime)}}
            className="w-full bg-[#0d1426] border border-slate-700/50 rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-[#d4af37]/50"/>
        </div>
        <div>
          <label className="text-xs text-slate-400 font-medium mb-1 block">End</label>
          <input type="time" value={form.endTime} onChange={e=>{set('endTime',e.target.value);calcDur(form.startTime,e.target.value)}}
            className="w-full bg-[#0d1426] border border-slate-700/50 rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-[#d4af37]/50"/>
        </div>
        <div>
          <label className="text-xs text-slate-400 font-medium mb-1 block">Mins</label>
          <input type="number" min="1" value={form.durationMinutes} onChange={e=>set('durationMinutes',+e.target.value)}
            className="w-full bg-[#0d1426] border border-slate-700/50 rounded-xl px-3 py-3 text-sm text-white focus:outline-none focus:border-[#d4af37]/50"/>
        </div>
      </div>
      <div>
        <label className="text-xs text-slate-400 font-medium mb-1 block">Activity Type</label>
        <select value={form.activityType} onChange={e=>set('activityType',e.target.value)}
          className="w-full bg-[#0d1426] border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#d4af37]/50">
          {ACTIVITY_TYPES.map(t=><option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div>
        <label className="text-xs text-slate-400 font-medium mb-1 block">Description (optional)</label>
        <textarea value={form.description} onChange={e=>set('description',e.target.value)} rows={3}
          className="w-full bg-[#0d1426] border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#d4af37]/50 resize-none"/>
      </div>
      <label className="flex items-center gap-3 cursor-pointer">
        <input type="checkbox" checked={form.evidenceAttached} onChange={e=>set('evidenceAttached',e.target.checked)} className="accent-[#d4af37] w-4 h-4"/>
        <span className="text-sm text-slate-400">I have evidence for this activity</span>
      </label>
      <button onClick={handleSave} disabled={saving}
        className="w-full py-4 rounded-xl bg-[#d4af37] text-black text-base font-bold hover:bg-[#e6c34a] transition-colors disabled:opacity-50">
        {saving ? 'Saving…' : 'Save Activity'}
      </button>
    </div>
  )
}

function CheckInScreen({ jobseeker, onBack }) {
  const dataStore = useDataStore()
  const [answers, setAnswers] = useState({})
  const [hours, setHours]     = useState(0)
  const [confidence, setConf] = useState(7)
  const [barriers, setBarriers] = useState([])
  const [submitted, setSubmitted] = useState(false)

  const toggle = (b) => setBarriers(p => p.includes(b) ? p.filter(x=>x!==b) : [...p,b])

  const handleSubmit = () => {
    const supportNeeded = barriers.length > 0 || confidence < 5
    dataStore.addCheckIn({
      jobseekerId: jobseeker.id,
      date: new Date().toISOString().split('T')[0],
      answers, hoursReported: +hours, confidenceScore: +confidence,
      supportNeeded, barrierFlags: barriers
    })
    if (supportNeeded) {
      barriers.forEach(b => {
        dataStore.addSupportFlag({ jobseekerId: jobseeker.id, type: b,
          severity: confidence < 4 ? 'high' : 'medium',
          description: `Flagged by jobseeker via daily check-in. Confidence: ${confidence}/10.`, status: 'open' })
      })
    }
    setSubmitted(true)
  }

  if (submitted) return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mb-4">
        <Icon name="CheckCircle" size={28} className="text-emerald-400"/>
      </div>
      <h3 className="text-lg font-bold text-white">Check-in Complete</h3>
      <p className="text-slate-500 text-sm mt-1">Your responses have been recorded.</p>
      <button onClick={onBack} className="mt-6 px-6 py-3 rounded-xl bg-[#d4af37] text-black text-sm font-bold">
        Back to Home
      </button>
    </div>
  )

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors">
          <Icon name="ArrowLeft" size={16}/>
        </button>
        <h2 className="font-semibold text-white">Daily Check-in</h2>
      </div>
      <div className="space-y-3">
        {CHECK_IN_QUESTIONS_DEFAULT.map((q, i) => (
          <div key={i} className="bg-[#0d1426] border border-slate-800/60 rounded-xl p-4">
            <p className="text-xs text-slate-300 mb-2 leading-relaxed"><span className="text-[#d4af37] font-bold mr-1">{i+1}.</span>{q}</p>
            <input value={answers[i]||''} onChange={e => setAnswers(a=>({...a,[i]:e.target.value}))}
              placeholder="Your answer…"
              className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#d4af37]/50"/>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-slate-400 font-medium mb-1 block">Hours today</label>
          <input type="number" min="0" max="24" step="0.5" value={hours} onChange={e=>setHours(e.target.value)}
            className="w-full bg-[#0d1426] border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#d4af37]/50"/>
        </div>
        <div>
          <label className="text-xs text-slate-400 font-medium mb-1 block">Confidence (1–10)</label>
          <input type="number" min="1" max="10" value={confidence} onChange={e=>setConf(e.target.value)}
            className="w-full bg-[#0d1426] border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#d4af37]/50"/>
        </div>
      </div>
      <div>
        <label className="text-xs text-slate-400 font-medium mb-2 block">Any barriers today? (optional)</label>
        <div className="flex flex-wrap gap-2">
          {BARRIER_TYPES.map(b => (
            <button key={b} onClick={() => toggle(b)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${barriers.includes(b) ? 'bg-red-900/30 border-red-500/40 text-red-300' : 'bg-slate-900/40 border-slate-700 text-slate-500 hover:text-white'}`}>
              {b.replace(/_/g,' ')}
            </button>
          ))}
        </div>
      </div>
      <button onClick={handleSubmit}
        className="w-full py-4 rounded-xl bg-[#d4af37] text-black text-base font-bold hover:bg-[#e6c34a] transition-colors">
        Submit Check-in
      </button>
    </div>
  )
}

function SupportScreen({ jobseeker, onBack }) {
  const dataStore = useDataStore()
  const [selected, setSelected] = useState([])
  const [message, setMessage]   = useState('')
  const [submitted, setSubmitted] = useState(false)

  const toggle = (b) => setSelected(p => p.includes(b) ? p.filter(x=>x!==b) : [...p,b])

  const handleSubmit = () => {
    if (selected.length === 0 && !message.trim()) return
    selected.forEach(type => {
      dataStore.addSupportFlag({ jobseekerId: jobseeker.id, type, severity: 'medium',
        description: message || 'Support requested by jobseeker via PWA.', status: 'open' })
    })
    if (selected.length === 0 && message.trim()) {
      dataStore.addSupportFlag({ jobseekerId: jobseeker.id, type: 'other_barrier', severity: 'medium',
        description: message, status: 'open' })
    }
    setSubmitted(true)
  }

  if (submitted) return (
    <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-16 h-16 rounded-full bg-[#d4af37]/20 border border-[#d4af37]/40 flex items-center justify-center mb-4">
        <Icon name="Heart" size={28} className="text-[#d4af37]"/>
      </div>
      <h3 className="text-lg font-bold text-white">Support Request Sent</h3>
      <p className="text-slate-400 text-sm mt-2 max-w-xs leading-relaxed">Your coach has been notified. Please reach out directly if you need urgent support.</p>
      <p className="text-[10px] text-slate-600 mt-3">CareerLink is not a crisis service. If you need urgent help, please contact a professional.</p>
      <button onClick={onBack} className="mt-6 px-6 py-3 rounded-xl bg-[#d4af37] text-black text-sm font-bold">Back to Home</button>
    </div>
  )

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition-colors">
          <Icon name="ArrowLeft" size={16}/>
        </button>
        <h2 className="font-semibold text-white">Request Support</h2>
      </div>
      <div className="px-4 py-3 rounded-xl border border-amber-700/30 bg-amber-900/10">
        <p className="text-xs text-amber-300/80 leading-relaxed">
          Select what you need help with. Your coach will be notified. This is not a crisis service — if you need urgent support, please contact a professional directly.
        </p>
      </div>
      <div className="space-y-2">
        {BARRIER_TYPES.map(b => (
          <button key={b} onClick={() => toggle(b)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-colors ${selected.includes(b) ? 'bg-[#d4af37]/10 border-[#d4af37]/30 text-[#d4af37]' : 'bg-[#0d1426] border-slate-800/60 text-slate-400 hover:text-white'}`}>
            <Icon name={selected.includes(b) ? 'CheckCircle' : 'Circle'} size={14} className="flex-shrink-0"/>
            <span className="text-sm capitalize">{b.replace(/_/g,' ')}</span>
          </button>
        ))}
      </div>
      <div>
        <label className="text-xs text-slate-400 font-medium mb-1 block">Additional message (optional)</label>
        <textarea value={message} onChange={e=>setMessage(e.target.value)} rows={3}
          className="w-full bg-[#0d1426] border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#d4af37]/50 resize-none"/>
      </div>
      <button onClick={handleSubmit} disabled={selected.length === 0 && !message.trim()}
        className="w-full py-4 rounded-xl bg-[#d4af37] text-black text-base font-bold hover:bg-[#e6c34a] transition-colors disabled:opacity-50">
        Send Support Request
      </button>
    </div>
  )
}

// ─── Bottom Navigation ────────────────────────────────────────
function BottomNav({ current, onNav }) {
  const tabs = [
    { id:'home',         icon:'Home',        label:'Home' },
    { id:'log',          icon:'Clock',        label:'Log Time' },
    { id:'applications', icon:'FileText',     label:'Apply' },
    { id:'checkin',      icon:'CheckSquare',  label:'Check In' },
    { id:'progress',     icon:'BarChart3',    label:'Progress' },
  ]
  return (
    <nav className="fixed bottom-0 left-0 right-0 flex bg-[#090e1c] border-t border-slate-800/60 z-50 pb-safe">
      {tabs.map(t => (
        <button key={t.id} onClick={() => onNav(t.id)}
          className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors ${current===t.id ? 'text-[#d4af37]' : 'text-slate-600 hover:text-slate-400'}`}>
          <Icon name={t.icon} size={18}/>
          <span className="text-[9px] font-medium">{t.label}</span>
        </button>
      ))}
    </nav>
  )
}

// ─── Applications Screen ─────────────────────────────────────
function ApplicationsScreen({ jobseeker, dataStore, onBack }) {
  const [modal, setModal] = useState(null)
  const [form, setForm]   = useState({ employer:'', roleTitle:'', source:'Indeed', dateApplied: new Date().toISOString().split('T')[0], status:'Applied', notes:'' })
  const set = (k,v) => setForm(f=>({...f,[k]:v}))
  const apps = dataStore.applications.filter(a => a.jobseekerId === jobseeker.id && !a.isDemo)

  const handleSave = () => {
    dataStore.addApplication({ ...form, jobseekerId: jobseeker.id })
    setModal(null)
    setForm({ employer:'', roleTitle:'', source:'Indeed', dateApplied: new Date().toISOString().split('T')[0], status:'Applied', notes:'' })
  }

  return (
    <div className="p-4 pb-24 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-white">My Applications</h2>
        <button onClick={() => setModal(true)}
          className="flex items-center gap-1 px-3 py-2 rounded-lg bg-[#d4af37] text-black text-xs font-bold">
          <Icon name="Plus" size={13}/> Add
        </button>
      </div>
      {apps.length === 0 ? (
        <div className="py-8 text-center">
          <Icon name="FileText" size={24} className="text-slate-700 mx-auto mb-2"/>
          <p className="text-xs text-slate-600">No applications yet. Tap + to add one.</p>
        </div>
      ) : apps.map(a => (
        <div key={a.id} className="bg-[#0d1426] border border-slate-800/60 rounded-xl p-4">
          <div className="flex justify-between items-start gap-2">
            <div>
              <div className="text-sm font-semibold text-white">{a.roleTitle}</div>
              <div className="text-xs text-slate-500">{a.employer} · {a.source}</div>
            </div>
            <span className="text-[10px] font-semibold text-[#d4af37] border border-[#d4af37]/30 px-2 py-0.5 rounded flex-shrink-0">{a.status}</span>
          </div>
          <div className="text-[10px] text-slate-600 mt-1">{a.dateApplied}</div>
        </div>
      ))}

      {modal && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm">
          <div className="w-full bg-[#0d1426] border border-slate-800/60 rounded-t-2xl p-5 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-white">Add Application</span>
              <button onClick={() => setModal(null)} className="text-slate-500"><Icon name="X" size={18}/></button>
            </div>
            {[['employer','Employer'],['roleTitle','Role Title']].map(([k,l]) => (
              <div key={k}>
                <label className="text-xs text-slate-400 mb-1 block">{l}</label>
                <input value={form[k]} onChange={e=>set(k,e.target.value)}
                  className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#d4af37]/50"/>
              </div>
            ))}
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Status</label>
              <select value={form.status} onChange={e=>set('status',e.target.value)}
                className="w-full bg-slate-900/60 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#d4af37]/50">
                {APPLICATION_STATUSES.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <button onClick={handleSave} disabled={!form.employer||!form.roleTitle}
              className="w-full py-3 rounded-xl bg-[#d4af37] text-black text-sm font-bold hover:bg-[#e6c34a] disabled:opacity-50">
              Save Application
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Progress Screen ─────────────────────────────────────────
function ProgressScreen({ jobseeker, metrics, weeklyTarget }) {
  return (
    <div className="p-4 pb-24 space-y-5">
      <h2 className="font-semibold text-white">My Progress</h2>
      <div className="bg-[#0d1426] border border-slate-800/60 rounded-2xl p-5 flex flex-col items-center gap-4">
        <ProgressRing pct={metrics.weeklyTargetPercent} size={100} label={`of ${jobseeker.weeklyTargetHours||weeklyTarget}h weekly target`}/>
        <div className="w-full space-y-2">
          {[
            ['Hours this week', `${metrics.weeklyHoursLogged}h`,'text-[#d4af37]'],
            ['Target', `${jobseeker.weeklyTargetHours||weeklyTarget}h`,'text-slate-400'],
            ['Applications this week', metrics.applicationCountWeek,'text-purple-400'],
            ['Interviews upcoming', metrics.interviewsUpcoming,'text-cyan-400'],
            ['Check-ins this week', metrics.checkInsThisWeek,'text-emerald-400'],
          ].map(([l,v,c]) => (
            <div key={l} className="flex justify-between py-2 border-b border-slate-800/30 last:border-0">
              <span className="text-xs text-slate-500">{l}</span>
              <span className={`text-xs font-mono font-bold ${c}`}>{v}</span>
            </div>
          ))}
        </div>
      </div>
      <p className="text-[10px] text-slate-700 text-center leading-relaxed px-2">
        Progress is based on activity you have logged. Contact your employment coach if you need help or have questions about your target.
      </p>
    </div>
  )
}

// ─── Main App ─────────────────────────────────────────────────
export default function JobseekerApp() {
  const [jobseeker, setJobseeker] = useState(null)
  const [tab, setTab]             = useState('home')
  const config     = useConfigStore(s => s.config)
  const weeklyTarget = config.weeklyTargetHoursDefault ?? 35
  const dataStore  = useDataStore()

  const snap = {
    activityLogs: dataStore.activityLogs,
    applications: dataStore.applications,
    interviews:   dataStore.interviews,
    checkIns:     dataStore.checkIns,
  }

  const metrics = jobseeker
    ? deriveJobseekerMetrics(jobseeker.id, snap, jobseeker.weeklyTargetHours || weeklyTarget)
    : null

  if (!jobseeker) {
    return <PINGate onAuth={setJobseeker}/>
  }

  const renderTab = () => {
    switch(tab) {
      case 'log':          return <LogActivityScreen jobseeker={jobseeker} onBack={() => setTab('home')} onSaved={() => {}}/>
      case 'checkin':      return <CheckInScreen jobseeker={jobseeker} onBack={() => setTab('home')}/>
      case 'applications': return <ApplicationsScreen jobseeker={jobseeker} dataStore={dataStore} onBack={() => setTab('home')}/>
      case 'progress':     return <ProgressScreen jobseeker={jobseeker} metrics={metrics} weeklyTarget={weeklyTarget}/>
      case 'support':      return <SupportScreen jobseeker={jobseeker} onBack={() => setTab('home')}/>
      default:             return (
        <HomeScreen jobseeker={jobseeker} metrics={metrics} weeklyTarget={weeklyTarget}
          onQuickLog={() => setTab('log')} navigate={setTab}/>
      )
    }
  }

  return (
    <div className="min-h-screen bg-[#050810] text-white pb-20">
      {/* PWA header */}
      <div className="sticky top-0 z-40 flex items-center justify-between px-4 py-3 bg-[#090e1c]/95 backdrop-blur-md border-b border-slate-800/60">
        <div>
          <span className="font-display font-bold text-[#d4af37] text-sm">CareerLink</span>
          <span className="text-[10px] text-slate-600 ml-2">Jobseeker App</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/30 flex items-center justify-center">
            <span className="text-[#d4af37] text-[10px] font-bold">{jobseeker.displayName.charAt(0)}</span>
          </div>
          <button onClick={() => {
            localStorage.removeItem(STORAGE_KEYS.JOBSEEKER_SESSION)
            setJobseeker(null)
          }} className="text-[10px] text-slate-600 hover:text-slate-400">Sign out</button>
        </div>
      </div>

      {renderTab()}
      <BottomNav current={tab} onNav={setTab}/>
    </div>
  )
}
