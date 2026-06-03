/**
 * ============================================================
 * CareerLink OS™ — 4P3X CareerLink Intelligence Layer™
 * Dashboard AI Page
 * Hosts: 4P3X Intelligent AI 1 + 4P3X Intelligent AI 2
 * Powered by 4P3X Intelligent AI — Created by Kyzel Kreates
 * ============================================================
 */
import { useState, useEffect } from 'react'
import Icon from './components_ui_Icon'
import {
  useConfigStore, useDataStore, useAIStore, deriveJobseekerMetrics
} from './core_storage'
import { jobseekerService } from './services_careerlink_jobseekerService'
import { AI_DISCLAIMER, AI_MODES } from './services_ai_aiConfig'
import {
  ASSISTANT_KEYS, ASSISTANT_REGISTRY, EXTENDED_AI_CONFIG_DEFAULTS,
} from './services_ai_careerlinkAiRouter'
import { handleAi1Query, handleAi2Query } from './services_ai_assistantEngines'
import AssistantPanel from './modules_ai_AssistantPanel'

// ─── Resolve effective AI config ─────────────────────────────
function useEffectiveAIConfig() {
  const { config: storedConfig } = useAIStore()
  return { ...EXTENDED_AI_CONFIG_DEFAULTS, ...storedConfig }
}

// ─── Risk Insight Card (AI 2 auto-generated) ──────────────────
function AutoInsightCard({ insight }) {
  const riskColor = {
    low:      'border-emerald-700/30 bg-emerald-900/10 text-emerald-400',
    medium:   'border-amber-700/30   bg-amber-900/10   text-amber-400',
    high:     'border-red-700/30     bg-red-900/10     text-red-400',
    critical: 'border-red-600/40     bg-red-900/20     text-red-300',
  }[insight.riskLevel] || 'border-slate-700/30 bg-slate-900/20 text-slate-400'

  return (
    <div className={`rounded-xl border p-4 ${riskColor} space-y-2`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-white">{insight.jobseekerName}</div>
          <div className="text-[10px] text-slate-500">{insight.programme}</div>
        </div>
        <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border flex-shrink-0 ${riskColor}`}>
          {insight.riskLevel}
        </span>
      </div>
      <p className="text-xs text-slate-300 leading-relaxed">{insight.summary}</p>
      <div className="text-[10px] text-slate-500">
        <strong className="text-slate-400">Why:</strong> {insight.reason}
      </div>
      {insight.suggestedAction && (
        <div className="flex items-start gap-2 px-3 py-2 rounded-lg bg-slate-900/50 border border-slate-800/40">
          <Icon name="Lightbulb" size={11} className="text-purple-400 flex-shrink-0 mt-0.5" />
          <p className="text-[10px] text-slate-300 leading-relaxed">
            <strong className="text-purple-300">Coach action:</strong> {insight.suggestedAction}
          </p>
        </div>
      )}
      <div className="flex items-center gap-3 text-[10px] text-slate-600">
        <span>Confidence: <strong className="text-slate-400">{insight.confidence}</strong></span>
        <span>·</span>
        <span>Data: {insight.evidenceUsed}</span>
      </div>
      <div className="flex items-center gap-1">
        <Icon name="UserCheck" size={10} className="text-amber-500/60" />
        <p className="text-[9px] text-amber-500/50 italic">Human review required before action. — 4P3X Intelligent AI 2</p>
      </div>
    </div>
  )
}

// ─── Generate local risk insights (AI 2 auto layer) ───────────
function generateAutoInsights(jobseekers, dataStore, isDemoMode, weeklyTarget) {
  const now    = new Date()
  const monday = new Date(now); monday.setDate(now.getDate() - ((now.getDay() + 6) % 7)); monday.setHours(0,0,0,0)
  const sunday = new Date(monday); sunday.setDate(monday.getDate() + 6); sunday.setHours(23,59,59,999)
  const inWeek = d => { const t = new Date(d); return t >= monday && t <= sunday }

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
      riskLevel = 'critical'; reasons.push(`Only ${metrics.weeklyTargetPercent}% of weekly target`)
      suggestedAction = 'Contact urgently. Wellbeing check recommended.'
    } else if (metrics.weeklyTargetPercent < 50) {
      riskLevel = 'high'; reasons.push(`${metrics.weeklyTargetPercent}% of target — significantly behind`)
      suggestedAction = 'Schedule a support call. Review barriers.'
    } else if (metrics.weeklyTargetPercent < 70) {
      riskLevel = 'medium'; reasons.push(`${metrics.weeklyTargetPercent}% of target — slightly behind`)
      suggestedAction = 'Encourage more activity this week.'
    }

    if (metrics.checkInsThisWeek === 0) {
      if (riskLevel === 'low') riskLevel = 'medium'
      reasons.push('No check-in this week')
      suggestedAction = suggestedAction || 'Prompt jobseeker to complete their daily check-in.'
    }

    if (metrics.applicationCountWeek === 0) {
      if (riskLevel === 'low') riskLevel = 'medium'
      reasons.push('No applications this week')
    }

    if (flags.length > 0) {
      const maxSev = flags.some(f => f.severity === 'critical') ? 'critical'
        : flags.some(f => f.severity === 'high') ? 'high' : riskLevel
      riskLevel = maxSev
      reasons.push(`${flags.length} open support flag(s)`)
      suggestedAction = suggestedAction || 'Review open support flags and arrange support.'
    }

    if (riskLevel !== 'low') {
      insights.push({
        jobseekerId: js.id,
        jobseekerName: js.displayName,
        programme: js.programme || 'Employment Support',
        riskLevel,
        summary: `${js.displayName} is flagged ${riskLevel} risk based on this week's activity data.`,
        reason: reasons.join('. ') + '.',
        suggestedAction,
        confidence: riskLevel === 'critical' ? 'High' : riskLevel === 'high' ? 'Medium-High' : 'Medium',
        evidenceUsed: `Activity logs, check-ins, applications${flags.length > 0 ? ', support flags' : ''}.`,
      })
    }
  })

  return insights.sort((a, b) => (['critical','high','medium','low'].indexOf(a.riskLevel)) - (['critical','high','medium','low'].indexOf(b.riskLevel)))
}

// ─── AI Page ──────────────────────────────────────────────────
export default function AIPage() {
  const config       = useConfigStore(s => s.config)
  const isDemoMode   = config.demoModeEnabled
  const weeklyTarget = config.weeklyTargetHoursDefault ?? 35
  const dataStore    = useDataStore()
  const aiConfig     = useEffectiveAIConfig()

  const [jobseekers, setJobseekers] = useState([])
  const [insights,   setInsights]   = useState([])

  useEffect(() => {
    const js = isDemoMode ? jobseekerService.getAll() : jobseekerService.getRealJobseekers()
    setJobseekers(js)
    setInsights(generateAutoInsights(js, dataStore, isDemoMode, weeklyTarget))
  }, [isDemoMode, dataStore, weeklyTarget])

  // ── AI 1 context builder ──────────────────────────────────
  const ai1Context = { isDemoMode }

  // ── AI 2 context builder ──────────────────────────────────
  const ai2Context = {
    jobseekers:      isDemoMode ? jobseekerService.getAll() : jobseekerService.getRealJobseekers(),
    activityLogs:    dataStore.activityLogs    || [],
    applications:    dataStore.applications    || [],
    interviews:      dataStore.interviews      || [],
    checkIns:        dataStore.checkIns        || [],
    evidenceRecords: dataStore.evidenceRecords || [],
    supportFlags:    dataStore.supportFlags    || [],
    tasks:           dataStore.tasks           || [],
    weeklyTarget,
    isDemoMode,
  }

  const ai1 = ASSISTANT_REGISTRY[ASSISTANT_KEYS.AI_1]
  const ai2 = ASSISTANT_REGISTRY[ASSISTANT_KEYS.AI_2]
  const mode = aiConfig?.aiMode || AI_MODES.LOCAL

  return (
    <div className="p-4 md:p-6 space-y-6">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-white text-xl">4P3X CareerLink Intelligence Layer™</h1>
          <p className="text-slate-500 text-sm mt-0.5">Embedded AI Support System · Powered by 4P3X Intelligent AI</p>
        </div>
        <div className="flex items-center gap-2">
          {mode === AI_MODES.OFF && (
            <span className="text-[9px] font-bold tracking-widest uppercase px-2 py-1 rounded border text-slate-500 border-slate-700 bg-slate-800/30">AI OFF</span>
          )}
          {mode === AI_MODES.LOCAL && (
            <span className="text-[9px] font-bold tracking-widest uppercase px-2 py-1 rounded border text-emerald-400 border-emerald-700/40 bg-emerald-900/10">LOCAL / Rule-based</span>
          )}
          {mode === AI_MODES.API_READY && (
            <span className="text-[9px] font-bold tracking-widest uppercase px-2 py-1 rounded border text-[#d4af37] border-[#d4af37]/30 bg-[#d4af37]/10">API-READY</span>
          )}
          <span className="text-[10px] text-slate-600">
            {isDemoMode ? '· Demo mode ON' : '· Real data'}
          </span>
        </div>
      </div>

      {/* ── Global disclaimer ── */}
      <div className="px-4 py-3 rounded-xl border border-[#d4af37]/15 bg-[#1a1200]/30">
        <div className="flex items-start gap-2">
          <Icon name="ShieldAlert" size={12} className="text-[#d4af37]/50 flex-shrink-0 mt-0.5" />
          <p className="text-[10px] text-[#d4af37]/60 leading-relaxed">{AI_DISCLAIMER}</p>
        </div>
      </div>

      {/* ── AI 1 — Coach Dashboard Guide ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 rounded-full bg-[#d4af37]/15 border border-[#d4af37]/30 flex items-center justify-center flex-shrink-0">
            <span className="text-[9px] font-black text-[#d4af37]">1</span>
          </div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">4P3X Intelligent AI 1 — Coach Dashboard Guide</span>
        </div>
        <AssistantPanel
          assistantKey={ASSISTANT_KEYS.AI_1}
          publicName={ai1.publicName}
          displaySubtitle={ai1.displaySubtitle}
          number={1}
          quickActions={ai1.quickActions}
          onQuery={(actionId, ctx) => handleAi1Query(actionId, { ...ai1Context, ...ctx })}
          initialMessage={handleAi1Query('check_first_today', ai1Context)}
          aiConfig={aiConfig}
        />
      </div>

      {/* ── AI 2 — Coach Data Insight ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 rounded-full bg-purple-500/15 border border-purple-500/25 flex items-center justify-center flex-shrink-0">
            <span className="text-[9px] font-black text-purple-400">2</span>
          </div>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">4P3X Intelligent AI 2 — Coach Data Insight</span>
        </div>

        {/* Auto-generated risk insight cards */}
        {mode !== AI_MODES.OFF && insights.length > 0 && (
          <div className="mb-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-500 uppercase tracking-widest">Auto Risk Insights</span>
              <span className="text-[10px] text-slate-600">{insights.length} flagged · {jobseekers.length} jobseekers</span>
            </div>
            {insights.map(i => <AutoInsightCard key={i.jobseekerId} insight={i} />)}
          </div>
        )}

        {mode !== AI_MODES.OFF && insights.length === 0 && jobseekers.length > 0 && (
          <div className="mb-4 py-6 text-center bg-[#0d1426] border border-emerald-700/20 rounded-xl">
            <Icon name="ShieldCheck" size={24} className="text-emerald-500 mx-auto mb-2" />
            <p className="text-sm text-slate-400 font-medium">All jobseekers on track</p>
            <p className="text-xs text-slate-600 mt-1">No risk insights generated from available data.</p>
          </div>
        )}

        <AssistantPanel
          assistantKey={ASSISTANT_KEYS.AI_2}
          publicName={ai2.publicName}
          displaySubtitle={ai2.displaySubtitle}
          number={2}
          quickActions={ai2.quickActions}
          onQuery={(actionId, ctx) => handleAi2Query(actionId, { ...ai2Context, ...ctx })}
          initialMessage={jobseekers.length > 0 ? handleAi2Query('action_summary', ai2Context) : null}
          aiConfig={aiConfig}
        />
      </div>

      {/* ── Bottom note ── */}
      <p className="text-[10px] text-slate-700 text-center pb-2">
        4P3X CareerLink Intelligence Layer™ — CareerLink OS™ · All AI outputs require human review.
      </p>
    </div>
  )
}
