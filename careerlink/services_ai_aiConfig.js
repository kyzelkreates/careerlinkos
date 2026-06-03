/**
 * ============================================================
 * CareerLink OS™ — AI Configuration
 * 4P3X CareerLink Intelligence Layer™
 * Powered by 4P3X Intelligent AI — Created by Kyzel Kreates
 *
 * Central config for all AI providers and modes.
 * No live API logic here — config + constants only.
 * ============================================================
 */

// ─── AI Providers ─────────────────────────────────────────────
export const AI_PROVIDERS = {
  openai:     { name: 'OpenAI',          endpoint: 'https://api.openai.com/v1',              requiresKey: true },
  openrouter: { name: 'OpenRouter',      endpoint: 'https://openrouter.ai/api/v1',           requiresKey: true },
  ollama:     { name: 'Ollama (Local)',  endpoint: 'http://localhost:11434/api',              requiresKey: false },
  lm_studio:  { name: 'LM Studio',      endpoint: 'http://localhost:1234/v1',               requiresKey: false },
  groq:       { name: 'Groq',           endpoint: 'https://api.groq.com/openai/v1',         requiresKey: true },
  local:      { name: 'Local / Rule-based (Offline)', endpoint: null,                        requiresKey: false },
}

// ─── AI Modes (CareerLink) ────────────────────────────────────
export const AI_MODES = {
  OFF:        'off',         // AI features disabled
  LOCAL:      'local',       // Rule-based offline advisory (no key needed)
  API_READY:  'api-ready',   // Connected to external provider (key required)
}

// ─── CareerLink AI Module Names ───────────────────────────────
export const AI_MODULES = {
  JOBSEEKER_ASSISTANT: 'jobseeker_assistant',  // Jobseeker Activity PWA AI
  COACH_GUIDE:         'coach_guide',          // Coach Dashboard Guide AI
  RISK_INSIGHTS:       'risk_insights',        // Risk & support flag insights
  PROGRESS_SUMMARY:    'progress_summary',     // Weekly progress summaries
  EVIDENCE_HELPER:     'evidence_helper',      // Evidence upload guidance
}

// ─── Default AI Config ────────────────────────────────────────
export const DEFAULT_AI_CONFIG = {
  aiEnabled:                 true,
  aiMode:                    AI_MODES.LOCAL,
  providerName:              'local',
  apiEndpoint:               null,
  publicClientKeyAllowed:    false,
  maskedApiKeyStatus:        'not_configured',
  lastTestStatus:            'not_tested',
  jobseekerAssistantEnabled: true,
  coachGuideAssistantEnabled: true,
  timeout:                   30000,
  retries:                   2,
  streaming:                 false,
  fallbackEnabled:           true,
  fallbackToLocal:           true,
}

// ─── AI Disclaimer (required in all AI panels) ────────────────
export const AI_DISCLAIMER =
  'CareerLink AI provides guidance, organisation support, and dashboard help only. ' +
  'It does not replace official guidance, legal advice, medical advice, benefits advice, ' +
  'or human coach/caseworker review.'

// ─── Local rule-based responses (no API key required) ─────────
export const LOCAL_AI_RESPONSES = {
  jobseeker: {
    whatNext:       'Based on your progress, try applying for at least 2 more roles today and log the time spent. Keep your CV and cover letter up to date.',
    hoursRemaining: (logged, target) => `You have logged ${logged}h so far. Your target is ${target}h per week. You have ${Math.max(0, target - logged)}h remaining this week.`,
    planToday:      'Plan: 1) Search for 3 relevant roles. 2) Apply to at least 1. 3) Update your activity log. 4) Complete your daily check-in.',
    interviewPrep:  'Research the employer, prepare 3 STAR-format examples, check the role requirements, plan your travel or test your video link. Dress appropriately.',
    cvHelp:         'Make sure your CV includes: a clear summary, your most recent experience first, quantified achievements where possible, and is saved as a PDF.',
    evidenceUpload: 'Useful evidence includes: application confirmation emails, interview invitations, training certificates, activity screenshots, and employer correspondence.',
    needSupport:    'If you are facing barriers (childcare, transport, confidence, wellbeing), please use the Support Request screen to let your coach know.',
    explainProgress: (pct, logged, target) => `You have completed ${pct}% of your ${target}h weekly target (${logged}h logged). ${pct >= 100 ? 'Target complete — great work!' : pct >= 60 ? 'You are on track.' : 'You need to log more activity this week.'}`,
  },
  coach: {
    showAround:     'The dashboard shows an overview of all jobseekers — use the sidebar to navigate to Jobseekers, Weekly Activity, Applications, Interviews, Check-ins, Evidence, Tasks, and Reports.',
    explainMetrics: 'Metrics show: total jobseekers, active this week, at risk, weekly target average, hours logged, applications submitted, interviews booked, evidence uploaded, and missed check-ins.',
    addJobseeker:   'Go to Invite Jobseeker in the sidebar. Enter the jobseeker\'s name and details, then copy the PWA invite link to share with them.',
    sendPWALink:    'The PWA link is shown in the Invite Jobseeker screen. Copy it and send via email, SMS, or WhatsApp. The jobseeker can add it to their home screen as an app.',
    reviewProgress: 'Click on a jobseeker\'s name to view their profile. You will see weekly target progress, activity logs, applications, check-ins, and risk flags.',
    checkEvidence:  'Go to Evidence in the sidebar. Review records by jobseeker. Each record shows the evidence type, date, and file reference. Add notes where needed.',
    useReports:     'Go to Reports and select a jobseeker. You will see their full activity summary including activity logs, applications, interviews, check-ins, evidence, and coach notes.',
    riskLevels:     'Risk levels: Low = on track. Medium = slightly behind or a barrier flagged. High = significantly behind or multiple barriers. Critical = no activity or urgent welfare concern.',
    turnOffDemo:    'Go to Settings → Demo Mode. Toggle Demo Mode OFF. Demo records will be hidden and the dashboard will show only real jobseeker data.',
    checkFirst:     'Start by reviewing the At Risk section on the dashboard. Follow up with any jobseekers flagged as high or critical risk, then check for missed check-ins.',
  }
}

export default {
  AI_PROVIDERS,
  AI_MODES,
  AI_MODULES,
  DEFAULT_AI_CONFIG,
  AI_DISCLAIMER,
  LOCAL_AI_RESPONSES,
}
