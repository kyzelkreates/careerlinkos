/**
 * ============================================================
 * CareerLink OS™ — CareerLink Support AI
 * Advisory-only insights. Human override required.
 * Powered by 4P3X Intelligent AI — Created by Kyzel Kreates
 * ============================================================
 */
import { useState, useEffect, useCallback } from 'react'
import Icon from './components_ui_Icon'
import { useConfigStore, useDataStore, deriveJobseekerMetrics } from './core_storage'
import { jobseekerService } from './services_careerlink_jobseekerService'
import { useAIChat } from './modules_ai_useAIChat'
import { AI_MODULES } from './services_ai_aiConfig'

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
        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border flex-shrink-0 ${riskColor}`}>
          {insight.riskLevel}
        </span>
      </div>
      <p className="text-xs text-slate-300 leading-relaxed mb-2">{insight.summary}</p>
      <div className="text-[10px] text-slate-500 mb-2">
        <strong className="text-slate-400">Why flagged:</strong> {insight.reason}
      </div>
      {insight.suggestedAction && (
        <div className="flex items-start gap-2 mt-2 px-3 py-2 rounded-lg bg-slate-900/50 border border-slate-800/40">
          <Icon name="Lightbulb" size={11} className="text-[#d4af37] flex-shrink-0 mt-0.5"/>
          <p className="text-[10px] text-slate-300 leading-relaxed"><strong className="text-[#d4af37]">Suggested action:</strong> {insight.suggestedAction}</p>
        </div>
      )}
      <div className="flex items-center gap-3 mt-3 text-[10px] text-slate-600">
        <span>Confidence: <strong className="text-slate-400">{insight.confidence}</strong></span>
        <span>·</span>
        <span>Based on: {insight.evidenceUsed}</span>
      </div>
      <p className="text-[9px] text-slate-700 mt-2 italic">
        This insight is advisory only. Coaches must review and apply professional judgement before acting.
      </p>
    </div>
  )
}

function generateInsights(jobseekers, dataStore, isDemoMode, weeklyTarget) {
  const insights = []
  const snap = {
    activityLogs: isDemoMode ? dataStore.activityLogs : dataStore.activityLogs.filter(r=>!r.isDemo),
    applications: isDemoMode ? dataStore.applications : dataStore.applications.filter(r=>!r.isDemo),
    interviews:   isDemoMode ? dataStore.interviews   : dataStore.interviews.filter(r=>!r.isDemo),
    checkIns:     isDemoMode ? dataStore.checkIns     : dataStore.checkIns.filter(r=>!r.isDemo),
  }

  jobseekers.forEach(js => {
    const metrics = deriveJobseekerMetrics(js.id, snap, js.weeklyTargetHours || weeklyTarget)
    const flags   = (isDemoMode ? dataStore.supportFlags : dataStore.supportFlags.filter(r=>!r.isDemo))
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
      reasons.push(`${metrics.weeklyTargetPercent}% of weekly target — significantly below expected progress`)
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
      const maxSeverity = flags.some(f=>f.severity==='critical') ? 'critical'
        : flags.some(f=>f.severity==='high') ? 'high' : riskLevel
      riskLevel = maxSeverity
      reasons.push(`${flags.length} open support flag(s): ${flags.map(f=>f.type.replace(/_/g,' ')).join(', ')}`)
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
        evidenceUsed:  `Activity logs, check-ins, applications${flags.length>0?', support flags':''}.`,
      })
    }
  })

  // Sort by severity
  const order = { critical:0, high:1, medium:2, low:3 }
  return insights.sort((a,b) => (order[a.riskLevel]||3) - (order[b.riskLevel]||3))
}

export default function AIPage() {
  const config     = useConfigStore(s => s.config)
  const isDemoMode = config.demoModeEnabled
  const weeklyTarget = config.weeklyTargetHoursDefault ?? 35
  const dataStore  = useDataStore()

  const [jobseekers, setJobseekers] = useState([])
  const [insights,   setInsights]   = useState([])
  const [chatInput,  setChatInput]  = useState('')
  const [chatHistory, setChatHistory] = useState([])
  const [loading, setLoading]       = useState(false)

  const { sendMessage, isStreaming } = useAIChat?.({ module: AI_MODULES?.SAFETY }) || {}

  useEffect(() => {
    const js = isDemoMode ? jobseekerService.getAll() : jobseekerService.getRealJobseekers()
    setJobseekers(js)
    setInsights(generateInsights(js, dataStore, isDemoMode, weeklyTarget))
  }, [isDemoMode, dataStore, weeklyTarget])

  const handleChat = async () => {
    if (!chatInput.trim()) return
    const userMsg = chatInput.trim()
    setChatInput('')
    setChatHistory(h => [...h, { role:'user', content: userMsg }])
    setLoading(true)

    // Simple local advisory response (no external API required)
    const response = generateLocalAIResponse(userMsg, insights, jobseekers)
    setTimeout(() => {
      setChatHistory(h => [...h, { role:'ai', content: response }])
      setLoading(false)
    }, 600)
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div>
        <h1 className="font-display font-bold text-white text-xl">CareerLink Support AI</h1>
        <p className="text-slate-500 text-sm mt-0.5">Advisory insights · Powered by 4P3X Intelligent AI</p>
      </div>

      <div className="px-4 py-3 rounded-xl border border-[#d4af37]/20 bg-[#1a1200]/40">
        <p className="text-[10px] text-[#d4af37]/70 leading-relaxed">
          <strong className="text-[#d4af37]">CareerLink Support AI</strong> provides guidance and prioritisation support only.
          It does not make legal, benefits, employment, medical, or government decisions.
          All insights require human review and professional judgement before any action is taken.
        </p>
      </div>

      {/* Insights */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-white">AI Risk Insights</h2>
          <span className="text-[10px] text-slate-600">{insights.length} flagged</span>
        </div>
        {insights.length === 0 ? (
          <div className="py-10 text-center bg-[#0d1426] border border-slate-800/60 rounded-xl">
            <Icon name="ShieldCheck" size={28} className="text-emerald-500 mx-auto mb-3"/>
            <p className="text-sm text-slate-400 font-medium">No risk insights at this time</p>
            <p className="text-xs text-slate-600 mt-1">All jobseekers appear on track based on available data.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {insights.map(i => <InsightCard key={i.jobseekerId} insight={i}/>)}
          </div>
        )}
      </div>

      {/* AI Chat */}
      <div className="bg-[#0d1426] border border-slate-800/60 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-800/40 flex items-center gap-2">
          <Icon name="MessageSquare" size={13} className="text-[#d4af37]"/>
          <span className="text-sm font-semibold text-white">Ask CareerLink AI</span>
          <span className="text-[10px] text-slate-600 ml-1">Advisory only</span>
        </div>
        <div className="p-4 space-y-3 min-h-[200px] max-h-[300px] overflow-y-auto">
          {chatHistory.length === 0 && (
            <p className="text-xs text-slate-600 text-center mt-8">Ask about jobseeker progress, risk patterns, or suggested actions…</p>
          )}
          {chatHistory.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] px-3 py-2 rounded-xl text-xs leading-relaxed ${m.role === 'user' ? 'bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/20' : 'bg-slate-800/60 text-slate-300 border border-slate-700/40'}`}>
                {m.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/40">
                <div className="flex gap-1">
                  {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-[#d4af37]/50 animate-bounce" style={{animationDelay:`${i*0.15}s`}}/>)}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="p-3 border-t border-slate-800/40 flex gap-2">
          <input value={chatInput} onChange={e => setChatInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleChat()}
            placeholder="Ask CareerLink AI…"
            className="flex-1 bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-[#d4af37]/50"/>
          <button onClick={handleChat} disabled={!chatInput.trim() || loading}
            className="px-4 py-2 rounded-lg bg-[#d4af37] text-black text-sm font-semibold hover:bg-[#e6c34a] transition-colors disabled:opacity-40">
            <Icon name="Send" size={14}/>
          </button>
        </div>
      </div>
    </div>
  )
}

function generateLocalAIResponse(query, insights, jobseekers) {
  const q = query.toLowerCase()
  if (q.includes('risk') || q.includes('at risk')) {
    const highRisk = insights.filter(i => i.riskLevel === 'high' || i.riskLevel === 'critical')
    if (highRisk.length === 0) return 'No jobseekers are currently flagged as high or critical risk based on available activity data.'
    return `There are ${highRisk.length} jobseeker(s) flagged as high or critical risk: ${highRisk.map(i=>i.jobseekerName).join(', ')}. Key concerns include: ${highRisk.map(i=>i.reason).join(' | ')}. Suggested: ${highRisk[0].suggestedAction}`
  }
  if (q.includes('check-in') || q.includes('checkin')) {
    return `Check-ins provide key welfare and progress data. Missed check-ins are a risk signal. Ensure all active jobseekers complete at least one check-in per week. Repeated missed check-ins should be escalated to a support call.`
  }
  if (q.includes('application') || q.includes('apply')) {
    return `Applications are a core activity metric. The default target supports at least ${5} applications per week where appropriate. Low application counts combined with low activity hours may indicate engagement barriers that need addressing.`
  }
  if (q.includes('target') || q.includes('hours')) {
    return `The weekly job-search activity target is configurable in Settings. The default is 35 hours per week. Individual targets can be set per jobseeker based on their programme requirements. Jobseekers below 60% of target should be contacted to identify barriers.`
  }
  if (q.includes('barrier') || q.includes('support')) {
    return `Common barriers include childcare, transport, digital access, and confidence. When barriers are flagged via check-in, a support flag is automatically raised. Coaches should review open flags and arrange appropriate support within their organisation's protocols.`
  }
  if (q.includes('interview')) {
    return `Interviews are a strong positive signal. Ensure jobseekers prepare adequately — review preparation tasks in the interview record. Post-interview, update the outcome to track progress. Repeated rejections may indicate a need for interview coaching.`
  }
  return `CareerLink Support AI can help with risk analysis, activity patterns, support planning, and target monitoring. I'm working from the data currently in the system — ${jobseekers.length} jobseeker(s) tracked, ${insights.length} risk insight(s) active. Please note: all suggestions require your professional review before action.`
}
