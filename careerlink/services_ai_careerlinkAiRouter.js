/**
 * ============================================================
 * CareerLink OS™ — 4P3X CareerLink Intelligence Layer™
 * AI Router + Assistant Registry
 * Powered by 4P3X Intelligent AI — Created by Kyzel Kreates
 *
 * FOUR SEPARATED EMBEDDED AI ASSISTANTS:
 *   AI 1 — Coach Dashboard Guide        (dashboard_help)
 *   AI 2 — Coach Data Insight           (dashboard_data_insight)
 *   AI 3 — Jobseeker PWA Guide          (pwa_help)
 *   AI 4 — Jobseeker Support & Encouragement (jobseeker_support)
 *
 * LOCAL / RULE-BASED mode — no API keys required.
 * Advisory only. Human review required for all decisions.
 * ============================================================
 */

import { AI_DISCLAIMER, AI_MODES } from './services_ai_aiConfig'

// ─── Assistant Keys (internal routing identifiers — NOT secrets, NOT API keys) ─
export const ASSISTANT_KEYS = {
  AI_1: 'cl-ai-1-dashboard-guide',
  AI_2: 'cl-ai-2-coach-insight',
  AI_3: 'cl-ai-3-pwa-guide',
  AI_4: 'cl-ai-4-jobseeker-support',
}

// ─── Extended AI Config Defaults (4-assistant layer) ──────────
export const EXTENDED_AI_CONFIG_DEFAULTS = {
  aiEnabled:                   true,
  aiMode:                      'local',
  providerName:                'local',
  apiEndpoint:                 null,
  maskedApiKeyStatus:          'not_configured',
  lastTestStatus:              'not_tested',
  fourp3xAi1Enabled:           true,
  fourp3xAi2Enabled:           true,
  fourp3xAi3Enabled:           true,
  fourp3xAi4Enabled:           true,
  showConfidence:              true,
  showDataUsed:                true,
  requireHumanReviewNote:      true,
  enforceAssistantSeparation:  true,
  allowCrossAssistantHandoff:  true,
}

// ─── Assistant Registry ───────────────────────────────────────
export const ASSISTANT_REGISTRY = {
  'cl-ai-1-dashboard-guide': {
    assistantKey:    'cl-ai-1-dashboard-guide',
    publicName:      '4P3X Intelligent AI 1',
    displaySubtitle: 'Coach Dashboard Guide',
    number:          1,
    location:        'dashboard',
    category:        'dashboard_help',
    purpose:         'Coach/caseworker dashboard tour, usage help, settings guidance, reports guidance.',
    forbiddenScope:  ['jobseeker_support','data_correlation','risk_prioritisation','clinical_advice','legal_advice','benefit_decisions'],
    handoffTo: {
      data_insight:  'cl-ai-2-coach-insight',
      jobseeker_pwa: 'cl-ai-3-pwa-guide',
      encouragement: 'cl-ai-4-jobseeker-support',
    },
    enabledConfigKey: 'fourp3xAi1Enabled',
    quickActions: [
      { id:'show_around',       label:'Show me around' },
      { id:'explain_dashboard', label:'Explain the dashboard' },
      { id:'explain_metrics',   label:'Explain these metrics' },
      { id:'add_jobseeker',     label:'How do I add a jobseeker?' },
      { id:'open_profile',      label:'How do I open a jobseeker profile?' },
      { id:'send_pwa_link',     label:'How do I send the PWA link?' },
      { id:'review_progress',   label:'How do I review weekly progress?' },
      { id:'check_evidence',    label:'How do I check evidence?' },
      { id:'use_reports',       label:'How do I use reports?' },
      { id:'risk_levels',       label:'What do risk levels mean?' },
      { id:'turn_off_demo',     label:'How do I turn demo data off?' },
      { id:'check_first_today', label:'What should I check first today?' },
    ],
  },

  'cl-ai-2-coach-insight': {
    assistantKey:    'cl-ai-2-coach-insight',
    publicName:      '4P3X Intelligent AI 2',
    displaySubtitle: 'Coach Data Insight',
    number:          2,
    location:        'dashboard',
    category:        'dashboard_data_insight',
    purpose:         'Coach-facing data correlation: weekly progress, evidence gaps, applications, interviews, check-ins, support flags, priority actions.',
    forbiddenScope:  ['dashboard_tour','pwa_tutorial','jobseeker_motivation','legal_advice','benefit_decisions','medical_advice'],
    handoffTo: {
      dashboard_help: 'cl-ai-1-dashboard-guide',
      pwa_help:       'cl-ai-3-pwa-guide',
      encouragement:  'cl-ai-4-jobseeker-support',
    },
    enabledConfigKey: 'fourp3xAi2Enabled',
    quickActions: [
      { id:'attention_today',     label:'Who needs attention today?' },
      { id:'at_risk_week',        label:'Who is at risk this week?' },
      { id:'evidence_gaps',       label:'Show evidence gaps' },
      { id:'missed_checkins',     label:'Show missed check-ins' },
      { id:'low_activity',        label:'Show low activity jobseekers' },
      { id:'upcoming_interviews', label:'Show upcoming interviews' },
      { id:'summarise_js',        label:'Summarise this jobseeker' },
      { id:'explain_risk_flag',   label:'Explain this risk flag' },
      { id:'what_next_coach',     label:'What should I do next?' },
      { id:'action_summary',      label:'Create coach action summary' },
    ],
  },

  'cl-ai-3-pwa-guide': {
    assistantKey:    'cl-ai-3-pwa-guide',
    publicName:      '4P3X Intelligent AI 3',
    displaySubtitle: 'Jobseeker PWA Guide',
    number:          3,
    location:        'jobseeker_pwa',
    category:        'pwa_help',
    purpose:         'Jobseeker PWA tour: how to log activity, add applications/interviews/evidence/check-ins, install the PWA.',
    forbiddenScope:  ['coach_insights','risk_prioritisation','coach_notes','legal_advice','benefit_decisions','deep_motivation'],
    handoffTo: {
      encouragement: 'cl-ai-4-jobseeker-support',
      coach_insight: 'cl-ai-2-coach-insight',
    },
    enabledConfigKey: 'fourp3xAi3Enabled',
    quickActions: [
      { id:'show_around',       label:'Show me around' },
      { id:'log_time',          label:'How do I log job-search time?' },
      { id:'add_application',   label:'How do I add an application?' },
      { id:'add_interview',     label:'How do I add an interview?' },
      { id:'complete_checkin',  label:'How do I complete my check-in?' },
      { id:'add_evidence',      label:'How do I add evidence?' },
      { id:'request_support',   label:'How do I request support?' },
      { id:'see_progress',      label:'How do I see my weekly progress?' },
      { id:'progress_bar',      label:'What does my progress bar mean?' },
      { id:'install_app',       label:'How do I install this app?' },
    ],
  },

  'cl-ai-4-jobseeker-support': {
    assistantKey:    'cl-ai-4-jobseeker-support',
    publicName:      '4P3X Intelligent AI 4',
    displaySubtitle: 'Jobseeker Support & Encouragement',
    number:          4,
    location:        'jobseeker_pwa',
    category:        'jobseeker_support',
    purpose:         'Jobseeker support, encouragement, weekly planning, next steps, confidence, barriers, interview prep, evidence reminders.',
    forbiddenScope:  ['coach_dashboard','coach_data_correlation','official_compliance_decisions','legal_advice','medical_advice','other_jobseekers'],
    handoffTo: {
      pwa_help:    'cl-ai-3-pwa-guide',
      coach_guide: 'cl-ai-1-dashboard-guide',
    },
    enabledConfigKey: 'fourp3xAi4Enabled',
    quickActions: [
      { id:'what_next',           label:'What should I do next?' },
      { id:'plan_today',          label:'Help me plan today' },
      { id:'hours_remaining',     label:'How many hours do I still need?' },
      { id:'small_steps',         label:'Break this into small steps' },
      { id:'interview_prep',      label:'Help me prepare for an interview' },
      { id:'improve_application', label:'Help me improve my application' },
      { id:'evidence_advice',     label:'What evidence should I add?' },
      { id:'feel_stuck',          label:'I feel stuck' },
      { id:'need_support',        label:'I need support' },
      { id:'encourage_me',        label:'Encourage me' },
    ],
  },
}

// ─── Response builder ─────────────────────────────────────────
export function buildAIResponse({
  assistantKey, title, summary, suggestion, reason,
  dataUsed, confidence = 'Medium', urgency = null,
  handoffTarget = null, nextActions = [],
}) {
  const assistant = ASSISTANT_REGISTRY[assistantKey]
  return {
    assistantKey,
    assistantName:       assistant ? assistant.publicName    : assistantKey,
    displaySubtitle:     assistant ? assistant.displaySubtitle : '',
    title:               title      || '',
    summary:             summary    || '',
    suggestion:          suggestion || '',
    reason:              reason     || '',
    dataUsed:            dataUsed   || 'Stored CareerLink activity data.',
    confidence,
    urgency,
    humanReviewRequired: true,
    humanReviewNote:     'All important decisions should be reviewed by a coach/caseworker or appropriate human support person.',
    disclaimer:          AI_DISCLAIMER,
    handoffTarget,
    nextActions,
    generatedAt:         new Date().toISOString(),
  }
}

// ─── Scope guard ──────────────────────────────────────────────
export function validateAssistantScope(assistantKey, actionCategory) {
  const assistant = ASSISTANT_REGISTRY[assistantKey]
  if (!assistant) return { allowed: false, reason: 'Unknown assistant.' }
  if (assistant.forbiddenScope.includes(actionCategory)) {
    return { allowed: false, reason: `Outside ${assistant.publicName} scope.` }
  }
  return { allowed: true }
}

// ─── Handoff message ──────────────────────────────────────────
export function buildHandoffMessage(fromKey, toKey, reason) {
  const from = ASSISTANT_REGISTRY[fromKey]
  const to   = ASSISTANT_REGISTRY[toKey]
  if (!from || !to) return buildAIResponse({
    assistantKey: fromKey || ASSISTANT_KEYS.AI_1,
    title: 'Handoff', summary: 'Please use the correct assistant.',
    suggestion: '', reason: '', dataUsed: 'None.', confidence: 'High',
  })
  return buildAIResponse({
    assistantKey: fromKey,
    title:        'Outside My Area',
    summary:      `That question is better handled by ${to.publicName} (${to.displaySubtitle}).`,
    suggestion:   `Please ask ${to.publicName} — ${to.displaySubtitle}${to.location === 'jobseeker_pwa' ? ' in the Jobseeker PWA' : ' on the Coach Dashboard'}.`,
    reason:       reason || `${from.publicName} handles ${from.purpose.split('.')[0].toLowerCase()} only.`,
    dataUsed:     'None — scope guard triggered.',
    confidence:   'High',
    handoffTarget: toKey,
    nextActions:  [`Switch to ${to.publicName}`],
  })
}

// ─── Utility functions ────────────────────────────────────────
export function getAssistantByKey(assistantKey) {
  return ASSISTANT_REGISTRY[assistantKey] || null
}

export function getHandoffTarget(assistantKey, targetCategory) {
  const assistant = ASSISTANT_REGISTRY[assistantKey]
  if (!assistant) return null
  return assistant.handoffTo ? assistant.handoffTo[targetCategory] : null
}

export function isAssistantEnabled(assistantKey, aiConfig) {
  const assistant = ASSISTANT_REGISTRY[assistantKey]
  if (!assistant) return false
  const mode = (aiConfig && aiConfig.aiMode) ? aiConfig.aiMode : 'local'
  if (mode === 'off') return false
  if (aiConfig && aiConfig.aiEnabled === false) return false
  const configKey = assistant.enabledConfigKey
  return !(aiConfig && aiConfig[configKey] === false)
}

export default {
  ASSISTANT_KEYS, ASSISTANT_REGISTRY, EXTENDED_AI_CONFIG_DEFAULTS,
  buildAIResponse, validateAssistantScope, buildHandoffMessage,
  getAssistantByKey, getHandoffTarget, isAssistantEnabled,
}
