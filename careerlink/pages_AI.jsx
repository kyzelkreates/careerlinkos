/**
 * ============================================================
 * CareerLink OS™ — 4P3X CareerLink Intelligence Layer™
 * Coach Dashboard Guide AI + CareerLink Support AI
 * Advisory only. Human review required.
 * Powered by 4P3X Intelligent AI — Created by Kyzel Kreates
 * ============================================================
 */
import { useState, useEffect, useRef } from 'react'
import Icon from './components_ui_Icon'
import { useConfigStore, useDataStore, deriveJobseekerMetrics } from './core_storage'
import { jobseekerService } from './services_careerlink_jobseekerService'
import { AI_DISCLAIMER, LOCAL_AI_RESPONSES, AI_MODES } from './services_ai_aiConfig'

// ─── Disclaimer Banner ────────────────────────────────────────
function DisclaimerBanner() {
  return (
    <div className="px-4 py-3 rounded-xl border border-[#d4af37]/20 bg-[#1a1200]/40">
      <div className="flex items-start gap-2">
        <Icon name="ShieldAlert" size={12} className="text-[#d4af37]/60 flex-shrink-0 mt-0.5" />
        <p className="text-[10px] text-[#d4af37]/70 leading-relaxed">
          <strong className="text-[#d4af37]">4P3X CareerLink Intelligence Layer™</strong> — {AI_DISCLAIMER}
        </p>
      </div>
    </div>
  )
}

// ─── AI Mode Badge ────────────────────────────────────────────
function AIModeBadge({ mode }) {
  const cfg = {
    [AI_MODES.OFF]:       { label: 'AI OFF',          cls: 'text-slate-500 border-slate-700 bg-slate-800/30' },
    [AI_MODES.LOCAL]:     { label: 'LOCAL / Rule-based', cls: 'text-emerald-400 border-emerald-700/40 bg-emerald-900/10' },
    [AI_MODES.API_READY]: { label: 'API-READY',       cls: 'text-[#d4af37] border-[#d4af37]/30 bg-[#d4af37]/10' },
  }[mode] || { label: 'LOCAL', cls: 'text-emerald-400 border-emerald-700/40 bg-emerald-900/10' }
  return (
    <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${cfg.cls}`}>
      {cfg.label}
    </span>
  )
}

// ─── Risk Insight Card ────────────────────────────────────────
function InsightCard({ insight }) {
  const riskColor = {
    low:      'border-emerald-700/30 bg-emerald-900/10 text-emerald-400',
    medium:   'border-amber-700/30   bg-amber-900/10   text-amber-400',
    high:     'border-red-700/30     bg-red-900/10     text-red-400',
    critical: 'border-red-600/40     bg-red-900/20     text-red-300',
  }[insight.riskLevel] || 'border-slate-700/30 bg-slate-900/20 text-slate-400'

  return (
    <div className={`rounded-xl border p-4 ${riskColor}`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <div className="text-sm font-semibold text-white">{insight.jobseekerName}</div>
          <div className="text-[10px] text-slate-500">{insight.programme}</div>
        </div>
        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border flex-shrink-0 ${riskColor}`}>
          {insight.riskLevel}
        </span>
      </div>
      <p className="text-xs text-slate-300 leading-relaxed mb-2">{insight.summary}</p>
      <div className="text-[10px] text-slate-500 mb-2">
        <strong className="text-slate-400">Why flagged:</strong> {insight.reason}
      </div>
      {insight.suggestedAction && (
        <div className="flex items-start gap-2 mt-2 px-3 py-2 rounded-lg bg-slate-900/50 border border-slate-800/40">
          <Icon name="Lightbulb" size={11} className="text-[#d4af37] flex-shrink-0 mt-0.5" />
          <p className="text-[10px] text-slate-300 leading-relaxed">
            <strong className="text-[#d4af37]">Suggested action:</strong> {insight.suggestedAction}
          </p>
        </div>
      )}
      <div className="flex items-center gap-3 mt-3 text-[10px] text-slate-600">
        <span>Confidence: <strong className="text-slate-400">{insight.confidence}</strong></span>
        <span>·</span>
        <span>Data used: {insight.evidenceUsed}</span>
      </div>
      <div className="flex items-center gap-1 mt-2">
        <Icon name="UserCheck" size={10} className="text-amber-500/60" />
        <p className="text-[9px] text-amber-500/50 italic">Human review required before action.</p>
      </div>
    </div>
  )
}

// ─── Generate local rule-based insights ──────────────────────
function generateInsights(jobseekers, dataStore, isDemoMode, weeklyTarget) {
  const insights = []
  const snap = {
    activityLogs: isDemoMode ? dataStore.activityLogs : dataStore.activityLogs.filter(r => !r.isDemo),
    applications: isDemoMode ? dataStore.applications : dataStore.applications.filter(r => !r.isDemo),
    interviews:   isDemoMode ? dataStore.interviews   : dataStore.interviews.filter(r => !r.isDemo),
    checkIns:     isDemoMode ? dataStore.checkIns     : dataStore.checkIns.filter(r => !r.isDemo),
  }

  jobseekers.forEach(js => {
    const metrics = deriveJobseekerMetrics(js.id, snap, js.weeklyTargetHours || weeklyTarget)
    const flags = (isDemoMode ? dataStore.supportFlags : dataStore.supportFlags.filter(r => !r.isDemo))
      .filter(f => f.jobseekerId === js.id && f.status !== 'resolved')

    let riskLevel = 'low'
    const reasons = []
    let suggestedAction = ''

    if (metrics.weeklyTargetPercent < 20) {
      riskLevel = 'critical'
      reasons.push(`Only ${metrics.weeklyTargetPercent}% of weekly target completed`)
      suggestedAction = 'Contact jobseeker urgently. Check for barriers. Consider wellbeing check.'
    } else if (metrics.weeklyTargetPercent < 50) {
      riskLevel = 'high'
      reasons.push(`${metrics.weeklyTargetPercent}% of weekly target — significantly below expected`)
      suggestedAction = 'Schedule a support call. Review barriers and adjust action plan.'
    } else if (metrics.weeklyTargetPercent < 70) {
      riskLevel = 'medium'
      reasons.push(`${metrics.weeklyTargetPercent}% of weekly target — slightly behind`)
      suggestedAction = 'Encourage jobseeker to log additional activity this week.'
    }

    if (metrics.checkInsThisWeek === 0) {
      if (riskLevel === 'low') riskLevel = 'medium'
      reasons.push('No check-in recorded this week')
      suggestedAction = suggestedAction || 'Prompt jobseeker to complete daily check-in.'
    }

    if (metrics.applicationCountWeek === 0) {
      if (riskLevel === 'low') riskLevel = 'medium'
      reasons.push('No applications submitted this week')
    }

    if (flags.length > 0) {
      const maxSev = flags.some(f => f.severity === 'critical') ? 'critical'
        : flags.some(f => f.severity === 'high') ? 'high' : riskLevel
      riskLevel = maxSev
      reasons.push(`${flags.length} open support flag(s): ${flags.map(f => f.type.replace(/_/g, ' ')).join(', ')}`)
      suggestedAction = suggestedAction || 'Review open support flags and arrange appropriate support.'
    }

    if (riskLevel !== 'low') {
      insights.push({
        jobseekerId:   js.id,
        jobseekerName: js.displayName,
        programme:     js.programme || 'Unknown programme',
        riskLevel,
        summary:       `${js.displayName} is flagged as ${riskLevel} risk based on this week's activity data.`,
        reason:        reasons.join('. ') + '.',
        suggestedAction,
        confidence:    riskLevel === 'critical' ? 'High' : riskLevel === 'high' ? 'Medium-High' : 'Medium',
        evidenceUsed:  `Activity logs, check-ins, applications${flags.length > 0 ? ', support flags' : ''}.`,
      })
    }
  })

  const order = { critical: 0, high: 1, medium: 2, low: 3 }
  return insights.sort((a, b) => (order[a.riskLevel] || 3) - (order[b.riskLevel] || 3))
}

// ─── AI Chat Panel ────────────────────────────────────────────
function AIChatPanel({ title, icon, placeholder, quickActions, onQuery, initialMessage, chatKey }) {
  const [input, setInput]           = useState('')
  const [history, setHistory]       = useState([])
  const [loading, setLoading]       = useState(false)
  const [dismissed, setDismissed]   = useState(false)
  const bottomRef                   = useRef(null)

  useEffect(() => {
    if (initialMessage && history.length === 0) {
      setHistory([{ role: 'ai', content: initialMessage }])
    }
  }, [initialMessage]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [history])

  const send = (text) => {
    const q = (text || input).trim()
    if (!q || loading) return
    setInput('')
    setHistory(h => [...h, { role: 'user', content: q }])
    setLoading(true)
    setTimeout(() => {
      const response = onQuery(q)
      setHistory(h => [...h, { role: 'ai', content: response }])
      setLoading(false)
    }, 500)
  }

  if (dismissed) return (
    <button onClick={() => setDismissed(false)}
      className="w-full py-3 rounded-xl border border-[#d4af37]/20 text-xs text-[#d4af37]/60 hover:text-[#d4af37] hover:border-[#d4af37]/40 transition-colors flex items-center justify-center gap-2">
      <Icon name={icon} size={13} />
      Show {title}
    </button>
  )

  return (
    <div className="bg-[#0d1426] border border-slate-800/60 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-slate-800/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name={icon} size={13} className="text-[#d4af37]" />
          <span className="text-sm font-semibold text-white">{title}</span>
          <AIModeBadge mode={AI_MODES.LOCAL} />
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setHistory(initialMessage ? [{ role: 'ai', content: initialMessage }] : [])}
            className="text-[10px] text-slate-600 hover:text-slate-400 transition-colors">
            Reset
          </button>
          <button onClick={() => setDismissed(true)}
            className="text-slate-600 hover:text-slate-400 transition-colors">
            <Icon name="X" size={13} />
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 py-3 border-b border-slate-800/30 flex flex-wrap gap-2">
        {quickActions.map((qa, i) => (
          <button key={i} onClick={() => send(qa.label)}
            className="text-[10px] px-2.5 py-1 rounded-full bg-slate-800/60 border border-slate-700/40 text-slate-400 hover:text-[#d4af37] hover:border-[#d4af37]/30 transition-colors">
            {qa.label}
          </button>
        ))}
      </div>

      {/* Chat history */}
      <div className="p-4 space-y-3 min-h-[180px] max-h-[280px] overflow-y-auto">
        {history.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
              m.role === 'user'
                ? 'bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/20'
                : 'bg-slate-800/60 text-slate-300 border border-slate-700/40'
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/40 flex gap-1">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#d4af37]/50 animate-bounce"
                  style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="p-3 border-t border-slate-800/40 flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          placeholder={placeholder}
          className="flex-1 bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#d4af37]/50" />
        <button onClick={() => send()} disabled={!input.trim() || loading}
          className="px-3 py-2 rounded-lg bg-[#d4af37] text-black text-sm font-semibold hover:bg-[#e6c34a] transition-colors disabled:opacity-40">
          <Icon name="Send" size={14} />
        </button>
      </div>

      {/* Disclaimer */}
      <div className="px-4 pb-3">
        <p className="text-[9px] text-slate-700 leading-relaxed">{AI_DISCLAIMER}</p>
      </div>
    </div>
  )
}

// ─── Coach Guide query handler ────────────────────────────────
function handleCoachQuery(query, insights, jobseekers) {
  const q = query.toLowerCase()
  const r = LOCAL_AI_RESPONSES.coach

  if (q.includes('show me around') || q.includes('tour') || q.includes('help me start')) return r.showAround
  if (q.includes('explain') && q.includes('metric')) return r.explainMetrics
  if (q.includes('add a jobseeker') || q.includes('how do i add')) return r.addJobseeker
  if (q.includes('pwa') || q.includes('invite') || q.includes('send the link')) return r.sendPWALink
  if (q.includes('review') && q.includes('progress')) return r.reviewProgress
  if (q.includes('evidence')) return r.checkEvidence
  if (q.includes('report')) return r.useReports
  if (q.includes('risk') || q.includes('risk level')) return r.riskLevels
  if (q.includes('demo') || q.includes('turn off')) return r.turnOffDemo
  if (q.includes('check first') || q.includes('today') || q.includes('start')) return r.checkFirst
  if (q.includes('at risk') || q.includes('flagged')) {
    const highRisk = insights.filter(i => i.riskLevel === 'high' || i.riskLevel === 'critical')
    if (highRisk.length === 0) return 'No jobseekers are currently flagged as high or critical risk based on available data.'
    return `${highRisk.length} jobseeker(s) are flagged: ${highRisk.map(i => `${i.jobseekerName} (${i.riskLevel})`).join(', ')}. ${highRisk[0].suggestedAction}`
  }
  return `The CareerLink Coach AI can help with: metrics, jobseeker progress, risk flags, evidence, reports, demo mode, and the PWA invite link. There are ${jobseekers.length} jobseekers tracked and ${insights.length} active risk insight(s). All suggestions require your professional review.`
}

// ─── Main AI Page ─────────────────────────────────────────────
export default function AIPage() {
  const config       = useConfigStore(s => s.config)
  const isDemoMode   = config.demoModeEnabled
  const weeklyTarget = config.weeklyTargetHoursDefault ?? 35
  const dataStore    = useDataStore()

  const [jobseekers, setJobseekers] = useState([])
  const [insights,   setInsights]   = useState([])

  useEffect(() => {
    const js = isDemoMode ? jobseekerService.getAll() : jobseekerService.getRealJobseekers()
    setJobseekers(js)
    setInsights(generateInsights(js, dataStore, isDemoMode, weeklyTarget))
  }, [isDemoMode, dataStore, weeklyTarget])

  const COACH_QUICK_ACTIONS = [
    { label: 'Show me around' },
    { label: 'Explain these metrics' },
    { label: 'How do I add a jobseeker?' },
    { label: 'How do I send the PWA link?' },
    { label: 'How do I review weekly progress?' },
    { label: 'How do I check evidence?' },
    { label: 'How do I use reports?' },
    { label: 'What do risk levels mean?' },
    { label: 'How do I turn demo data off?' },
    { label: 'What should I check first today?' },
  ]

  return (
    <div className="p-4 md:p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display font-bold text-white text-xl">4P3X CareerLink Intelligence Layer™</h1>
          <p className="text-slate-500 text-sm mt-0.5">Advisory risk insights + AI assistant · Powered by 4P3X Intelligent AI</p>
        </div>
        <AIModeBadge mode={AI_MODES.LOCAL} />
      </div>

      <DisclaimerBanner />

      {/* Risk Insights */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white">AI Risk Insights</h2>
          <span className="text-[10px] text-slate-600">{insights.length} flagged · {jobseekers.length} jobseekers</span>
        </div>
        {insights.length === 0 ? (
          <div className="py-10 text-center bg-[#0d1426] border border-slate-800/60 rounded-xl">
            <Icon name="ShieldCheck" size={28} className="text-emerald-500 mx-auto mb-3" />
            <p className="text-sm text-slate-400 font-medium">No risk insights at this time</p>
            <p className="text-xs text-slate-600 mt-1">All jobseekers appear on track based on available data.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {insights.map(i => <InsightCard key={i.jobseekerId} insight={i} />)}
          </div>
        )}
      </div>

      {/* Coach Guide AI */}
      <AIChatPanel
        title="Coach Dashboard Guide AI"
        icon="BookOpen"
        placeholder="Ask the Coach AI…"
        chatKey="coach"
        quickActions={COACH_QUICK_ACTIONS}
        initialMessage={LOCAL_AI_RESPONSES.coach.checkFirst}
        onQuery={(q) => handleCoachQuery(q, insights, jobseekers)}
      />
    </div>
  )
}
