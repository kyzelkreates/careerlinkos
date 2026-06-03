/**
 * ============================================================
 * CareerLink OS™ — 4P3X CareerLink Intelligence Layer™
 * Individual Assistant Rule-Based Engines
 * Powered by 4P3X Intelligent AI — Created by Kyzel Kreates
 *
 * Four separated engines — no shared logic between assistants.
 *
 * AI 1 — handleAi1Query     (dashboard_help only)
 * AI 2 — handleAi2Query     (coach_data_insight only)
 * AI 3 — handleAi3Query     (pwa_help only)
 * AI 4 — handleAi4Query     (jobseeker_support only)
 *
 * Advisory only. No API calls. No secrets.
 * Human review required for all outputs.
 * ============================================================
 */

import {
  ASSISTANT_KEYS,
  buildAIResponse,
  buildHandoffMessage,
  getHandoffTarget,
} from './services_ai_careerlinkAiRouter'

// ─── HUMAN REVIEW NOTE ───────────────────────────────────────
const HRN = 'All important decisions should be reviewed by a coach/caseworker or appropriate human support person.'

// ============================================================
// AI 1 — Coach Dashboard Guide
// Handles: dashboard navigation, section explanations, metrics,
//          settings, reports, demo toggle, PWA invite flow.
// Forbidden: data analysis, jobseeker risk, motivation, legal.
// ============================================================

const AI1_RESPONSES = {
  show_around: () => buildAIResponse({
    assistantKey: ASSISTANT_KEYS.AI_1,
    title:        'Dashboard Overview',
    summary:      'Welcome to the CareerLink OS™ Coach Dashboard. Here is a quick tour of what you can do.',
    suggestion:   'Start with the Overview screen. You can see key metrics at the top — total jobseekers, active this week, at-risk, hours logged, applications, interviews, evidence, and check-ins. Use the left sidebar to navigate to each section.',
    reason:       'The dashboard is your central hub for managing jobseeker employment support.',
    dataUsed:     'Dashboard structure and navigation labels.',
    confidence:   'High',
    nextActions:  ['Explore the Jobseekers section', 'Review weekly activity', 'Check Support Flags'],
  }),

  explain_dashboard: () => buildAIResponse({
    assistantKey: ASSISTANT_KEYS.AI_1,
    title:        'How the Dashboard Works',
    summary:      'The CareerLink OS™ Coach Dashboard gives you a full view of all jobseekers and their job-search activity in one place.',
    suggestion:   'The dashboard has 5 sections in the sidebar: Overview, Employment Support (jobseekers, activity, applications, interviews, check-ins, evidence, tasks), AI & Risk, Reports & Evidence, and System. Click any section to navigate.',
    reason:       'Everything is organised so you can quickly find and manage jobseeker data.',
    dataUsed:     'Dashboard navigation structure.',
    confidence:   'High',
    nextActions:  ['Go to Jobseekers', 'Go to Weekly Activity'],
  }),

  explain_metrics: () => buildAIResponse({
    assistantKey: ASSISTANT_KEYS.AI_1,
    title:        'Understanding Dashboard Metrics',
    summary:      'The 10 metric cards at the top of the Overview screen show key performance indicators for all jobseekers.',
    suggestion:   'Total Jobseekers = everyone on the system. Active This Week = those who have logged activity. At Risk = high/critical risk level. Avg Target % = average weekly target completion. Hours This Week = total hours logged across all jobseekers. Applications, Interviews, Evidence Uploads, Check-ins, and Open Support Flags round out the view.',
    reason:       'These metrics help you quickly spot who needs attention without opening individual profiles.',
    dataUsed:     'Dashboard metric card definitions.',
    confidence:   'High',
    nextActions:  ['Click a metric to navigate to that section', 'Use 4P3X Intelligent AI 2 for data correlation'],
  }),

  add_jobseeker: () => buildAIResponse({
    assistantKey: ASSISTANT_KEYS.AI_1,
    title:        'Adding a Jobseeker',
    summary:      'To add a new jobseeker, go to Invite Jobseeker in the sidebar under Employment Support.',
    suggestion:   'Click "Invite Jobseeker" in the left sidebar. Enter the jobseeker\'s name and details. Once created, copy the Jobseeker PWA invite link and share it with them via email, SMS, or WhatsApp.',
    reason:       'The invite link lets the jobseeker access their personal activity tracking PWA on their phone.',
    dataUsed:     'Dashboard navigation — Invite Jobseeker screen.',
    confidence:   'High',
    nextActions:  ['Go to Invite Jobseeker', 'Copy the PWA link once created'],
  }),

  open_profile: () => buildAIResponse({
    assistantKey: ASSISTANT_KEYS.AI_1,
    title:        'Opening a Jobseeker Profile',
    summary:      'Click on any jobseeker\'s name in the Jobseekers table to open their full profile.',
    suggestion:   'Go to Jobseekers in the sidebar. You will see the jobseeker list. Click on a name to open the profile. Inside you will find weekly target progress, activity logs, applications, interviews, check-ins, evidence records, support barriers, coach notes, and risk flags.',
    reason:       'The profile gives you the full picture of that jobseeker\'s job-search activity.',
    dataUsed:     'Jobseekers screen layout.',
    confidence:   'High',
    nextActions:  ['Go to Jobseekers', 'Click a jobseeker name to open their profile'],
  }),

  send_pwa_link: () => buildAIResponse({
    assistantKey: ASSISTANT_KEYS.AI_1,
    title:        'Sending the Jobseeker PWA Link',
    summary:      'The PWA invite link lets jobseekers access CareerLink OS™ on their mobile phone.',
    suggestion:   'Go to Invite Jobseeker in the sidebar. Select or create the jobseeker. Copy the PWA link shown on screen. Send it via email, SMS, WhatsApp, or any messaging app. The jobseeker can open the link in their browser and tap "Add to Home Screen" to install it as an app.',
    reason:       'The PWA works offline so jobseekers can log activity anywhere.',
    dataUsed:     'Invite Jobseeker screen — PWA link flow.',
    confidence:   'High',
    nextActions:  ['Go to Invite Jobseeker', 'Copy and share the PWA link'],
  }),

  review_progress: () => buildAIResponse({
    assistantKey: ASSISTANT_KEYS.AI_1,
    title:        'Reviewing Weekly Progress',
    summary:      'You can review any jobseeker\'s weekly progress from the dashboard, the Jobseekers table, Weekly Activity screen, or their individual profile.',
    suggestion:   'The quickest way is to open a jobseeker profile (click their name in Jobseekers). The profile shows a progress bar, hours logged vs target, percentage complete, and a status label (on track, needs attention, high risk, target complete). For a full week view, go to Weekly Activity in the sidebar.',
    reason:       'Progress tracking helps you identify who to prioritise each week.',
    dataUsed:     'Jobseeker profile layout and Weekly Activity screen.',
    confidence:   'High',
    nextActions:  ['Go to Jobseekers', 'Go to Weekly Activity'],
  }),

  check_evidence: () => buildAIResponse({
    assistantKey: ASSISTANT_KEYS.AI_1,
    title:        'Checking Evidence Records',
    summary:      'Evidence records are uploaded or created by jobseekers and reviewed here.',
    suggestion:   'Go to Evidence in the sidebar (under Employment Support). You can filter by jobseeker and evidence type. Each record shows the evidence title, type, linked record, date, and notes. Use the Reports section to generate a full evidence pack per jobseeker.',
    reason:       'Evidence records support compliance verification and progress reporting.',
    dataUsed:     'Evidence screen layout.',
    confidence:   'High',
    nextActions:  ['Go to Evidence', 'Go to Reports for full evidence packs'],
  }),

  use_reports: () => buildAIResponse({
    assistantKey: ASSISTANT_KEYS.AI_1,
    title:        'Using Reports',
    summary:      'Reports generate a full activity summary per jobseeker for compliance and review.',
    suggestion:   'Go to Reports in the sidebar. Select a jobseeker from the list. The report shows all activity logs, applications, interviews, check-ins, evidence records, and coach notes. You can print or export the report. Remember: reports are support summaries only and do not guarantee compliance or benefit entitlement.',
    reason:       'Reports help you evidence job-search activity for programme reviews.',
    dataUsed:     'Reports screen layout.',
    confidence:   'High',
    nextActions:  ['Go to Reports', 'Select a jobseeker to generate their report'],
  }),

  risk_levels: () => buildAIResponse({
    assistantKey: ASSISTANT_KEYS.AI_1,
    title:        'Understanding Risk Levels',
    summary:      'Risk levels are assigned to each jobseeker based on their activity data.',
    suggestion:   'Low = on track, meeting weekly targets. Medium = slightly behind or a barrier has been flagged. High = significantly behind target or multiple barriers. Critical = no activity logged or an urgent welfare concern exists. You can change risk levels manually in a jobseeker\'s profile. Use 4P3X Intelligent AI 2 to get data-based insight into why a risk level has changed.',
    reason:       'Risk levels help you prioritise which jobseekers need your attention first.',
    dataUsed:     'Risk level definitions from CareerLink OS™ settings.',
    confidence:   'High',
    nextActions:  ['Review at-risk jobseekers on the dashboard', 'Ask 4P3X Intelligent AI 2 for risk analysis'],
  }),

  turn_off_demo: () => buildAIResponse({
    assistantKey: ASSISTANT_KEYS.AI_1,
    title:        'Turning Demo Data Off',
    summary:      'Demo Mode shows sample jobseeker data for presentations and training. Turn it off to use real data only.',
    suggestion:   'Go to Settings in the sidebar (bottom). Click "Demo Mode" in the settings menu. Toggle Demo Mode OFF. The dashboard will now show only real jobseeker data. If you have not added any real jobseekers yet, you will see empty states — this is expected.',
    reason:       'Demo mode prevents you from confusing sample data with real client data.',
    dataUsed:     'Settings screen — Demo Mode toggle.',
    confidence:   'High',
    nextActions:  ['Go to Settings', 'Find the Demo Mode toggle'],
  }),

  check_first_today: () => buildAIResponse({
    assistantKey: ASSISTANT_KEYS.AI_1,
    title:        'Starting Your Day on the Dashboard',
    summary:      'Here is a recommended daily starting routine for coaches using CareerLink OS™.',
    suggestion:   'Step 1: Review the At Risk metric card on the Overview — follow up with any high/critical jobseekers. Step 2: Check Open Support Flags for urgent welfare concerns. Step 3: Review missed check-ins. Step 4: Look at upcoming interviews and send preparation reminders. Step 5: Check evidence gaps before any review meetings. For data-based prioritisation, ask 4P3X Intelligent AI 2.',
    reason:       'A consistent daily routine ensures no jobseeker falls through the gaps.',
    dataUsed:     'Dashboard overview layout and workflow guidance.',
    confidence:   'High',
    nextActions:  ['Check At Risk on the Overview', 'Open Support Flags', 'Use 4P3X Intelligent AI 2 for today\'s priority list'],
  }),

  // Walkthrough step responses
  step_1: () => buildAIResponse({
    assistantKey: ASSISTANT_KEYS.AI_1,
    title:        'Step 1 — Overview Metrics',
    summary:      'The Overview is your dashboard home screen. The 10 KPI cards at the top give you an instant snapshot of all jobseeker activity this week.',
    suggestion:   'Look at the cards: Total Jobseekers, Active This Week, At Risk, Avg Target %, Hours This Week, Applications, Interviews, Evidence Uploads, Check-ins, and Open Flags. Click any card to jump to that section.',
    reason:       'Overview metrics show your team\'s weekly performance at a glance.',
    dataUsed:     'Dashboard KPI cards.',
    confidence:   'High',
    nextActions:  ['Move to Step 2: Jobseeker List'],
  }),
  step_2: () => buildAIResponse({
    assistantKey: ASSISTANT_KEYS.AI_1,
    title:        'Step 2 — Jobseeker List',
    summary:      'Below the KPI cards is the jobseeker table. Each row shows a jobseeker\'s name, weekly progress bar, hours logged, and risk level.',
    suggestion:   'Click any jobseeker name to open their full profile. Use the search or filter in the Jobseekers screen for larger caseloads.',
    reason:       'The jobseeker list helps you quickly scan who is on track and who needs follow-up.',
    dataUsed:     'Dashboard jobseeker table layout.',
    confidence:   'High',
    nextActions:  ['Move to Step 3: Weekly Activity'],
  }),
}

export function handleAi1Query(actionId, context = {}) {
  // Scope guard — if this looks like a data/insight question, handoff to AI 2
  const insightActions = ['at_risk_week', 'attention_today', 'evidence_gaps', 'missed_checkins', 'low_activity']
  if (insightActions.includes(actionId)) {
    return buildHandoffMessage(
      ASSISTANT_KEYS.AI_1,
      ASSISTANT_KEYS.AI_2,
      '4P3X Intelligent AI 2 handles data correlation and risk insight analysis. 4P3X Intelligent AI 1 covers dashboard navigation and usage help only.'
    )
  }
  // Scope guard — motivation/encouragement → AI 4
  const encourageActions = ['encourage_me', 'feel_stuck', 'i_need_support']
  if (encourageActions.includes(actionId)) {
    return buildHandoffMessage(
      ASSISTANT_KEYS.AI_1,
      ASSISTANT_KEYS.AI_4,
      'That is better handled by 4P3X Intelligent AI 4 — Jobseeker Support & Encouragement in the Jobseeker PWA.'
    )
  }

  const handler = AI1_RESPONSES[actionId]
  if (handler) return handler(context)

  // Freeform text fallback — keyword matching
  const q = (context.query || '').toLowerCase()
  if (q.includes('show') && (q.includes('around') || q.includes('tour'))) return AI1_RESPONSES.show_around()
  if (q.includes('metric') || q.includes('kpi') || q.includes('card')) return AI1_RESPONSES.explain_metrics()
  if (q.includes('add') && q.includes('jobseeker')) return AI1_RESPONSES.add_jobseeker()
  if (q.includes('pwa') || q.includes('link') || q.includes('invite')) return AI1_RESPONSES.send_pwa_link()
  if (q.includes('evidence')) return AI1_RESPONSES.check_evidence()
  if (q.includes('report')) return AI1_RESPONSES.use_reports()
  if (q.includes('risk')) return AI1_RESPONSES.risk_levels()
  if (q.includes('demo')) return AI1_RESPONSES.turn_off_demo()
  if (q.includes('progress')) return AI1_RESPONSES.review_progress()
  if (q.includes('profile')) return AI1_RESPONSES.open_profile()

  // Data-type questions → handoff
  if (q.includes('who') || q.includes('behind') || q.includes('missing') || q.includes('gap')) {
    return buildHandoffMessage(
      ASSISTANT_KEYS.AI_1,
      ASSISTANT_KEYS.AI_2,
      'That sounds like a data insight question. 4P3X Intelligent AI 2 handles jobseeker data analysis and coach insights.'
    )
  }

  return buildAIResponse({
    assistantKey: ASSISTANT_KEYS.AI_1,
    title:        'Dashboard Help',
    summary:      'I can help you navigate and use the CareerLink OS™ Coach Dashboard.',
    suggestion:   'Try one of the quick actions above, or ask me about: navigating the dashboard, understanding metrics, adding jobseekers, sending PWA links, checking evidence, using reports, risk levels, or demo data.',
    reason:       '4P3X Intelligent AI 1 covers dashboard navigation and usage guidance.',
    dataUsed:     'Dashboard help library.',
    confidence:   'High',
    nextActions:  ['Use a quick action button', 'Ask about a specific dashboard feature'],
  })
}

// ============================================================
// AI 2 — Coach Data Insight
// Handles: data correlation, weekly progress, evidence gaps,
//          missed check-ins, risk flags, applications, interviews.
// Forbidden: dashboard tour, PWA tutorial, motivation, legal.
// ============================================================

function getWeekBounds() {
  const now    = new Date()
  const monday = new Date(now)
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7))
  monday.setHours(0, 0, 0, 0)
  const sunday = new Date(monday)
  sunday.setDate(monday.getDate() + 6)
  sunday.setHours(23, 59, 59, 999)
  return { monday, sunday }
}

function inThisWeek(dateStr, { monday, sunday }) {
  const d = new Date(dateStr)
  return d >= monday && d <= sunday
}

function computeJobseekerInsights(js, stores, weeklyTarget, week) {
  const logs    = (stores.activityLogs    || []).filter(r => r.jobseekerId === js.id && !r.isDemo)
  const apps    = (stores.applications    || []).filter(r => r.jobseekerId === js.id && !r.isDemo)
  const ivs     = (stores.interviews      || []).filter(r => r.jobseekerId === js.id && !r.isDemo)
  const cis     = (stores.checkIns        || []).filter(r => r.jobseekerId === js.id && !r.isDemo)
  const evs     = (stores.evidenceRecords || []).filter(r => r.jobseekerId === js.id && !r.isDemo)
  const flags   = (stores.supportFlags    || []).filter(r => r.jobseekerId === js.id && !r.isDemo && r.status !== 'resolved')
  const tasks   = (stores.tasks           || []).filter(r => r.jobseekerId === js.id && !r.isDemo && r.status !== 'done')
  const target  = js.weeklyTargetHours || weeklyTarget

  const weekLogs   = logs.filter(r => inThisWeek(r.date || r.createdAt, week))
  const weekHours  = weekLogs.reduce((s, r) => s + ((r.durationMinutes || 0) / 60), 0)
  const weekApps   = apps.filter(r => inThisWeek(r.dateApplied || r.createdAt, week))
  const weekCIs    = cis.filter(r => inThisWeek(r.date || r.createdAt, week))
  const upcoming   = ivs.filter(r => new Date(r.dateTime) >= new Date())
  const pct        = Math.min(100, Math.round((weekHours / target) * 100))
  const remaining  = Math.max(0, Math.round((target - weekHours) * 10) / 10)

  let status = 'on_track'
  if (pct >= 100)     status = 'target_complete'
  else if (pct >= 60) status = 'on_track'
  else if (pct >= 30) status = 'needs_attention'
  else                status = 'high_risk'

  return {
    js, target, weekHours: Math.round(weekHours * 10) / 10, pct, remaining, status,
    weekApps, weekCIs, upcoming, evs, flags, tasks,
    hasEvidenceGap: apps.length > 0 && evs.length === 0,
    hasMissedCheckIn: weekCIs.length === 0,
    hasOpenFlags: flags.length > 0,
    hasUpcomingInterview: upcoming.length > 0,
  }
}

export function handleAi2Query(actionId, context = {}) {
  // Scope guard — dashboard tour questions → handoff to AI 1
  const tourActions = ['show_around', 'explain_dashboard', 'how_to_use', 'turn_off_demo', 'send_pwa_link']
  if (tourActions.includes(actionId)) {
    return buildHandoffMessage(
      ASSISTANT_KEYS.AI_2,
      ASSISTANT_KEYS.AI_1,
      'That is a dashboard usage question. 4P3X Intelligent AI 1 — Coach Dashboard Guide can help with that.'
    )
  }
  // Motivation → handoff to AI 4
  if (['encourage_me', 'feel_stuck'].includes(actionId)) {
    return buildHandoffMessage(
      ASSISTANT_KEYS.AI_2,
      ASSISTANT_KEYS.AI_4,
      'Jobseeker encouragement is handled by 4P3X Intelligent AI 4 in the Jobseeker PWA.'
    )
  }

  const {
    jobseekers = [], activityLogs = [], applications = [], interviews = [],
    checkIns = [], evidenceRecords = [], supportFlags = [], tasks = [],
    weeklyTarget = 35, isDemoMode = false, targetJobseeker = null,
    query = '',
  } = context

  const q = query.toLowerCase()
  const week = getWeekBounds()

  // Filter based on demo mode
  const activeJobseekers = isDemoMode
    ? jobseekers
    : jobseekers.filter(j => !j.isDemo)

  const stores = {
    activityLogs:    isDemoMode ? activityLogs    : activityLogs.filter(r => !r.isDemo),
    applications:    isDemoMode ? applications    : applications.filter(r => !r.isDemo),
    interviews:      isDemoMode ? interviews      : interviews.filter(r => !r.isDemo),
    checkIns:        isDemoMode ? checkIns        : checkIns.filter(r => !r.isDemo),
    evidenceRecords: isDemoMode ? evidenceRecords : evidenceRecords.filter(r => !r.isDemo),
    supportFlags:    isDemoMode ? supportFlags    : supportFlags.filter(r => !r.isDemo),
    tasks:           isDemoMode ? tasks           : tasks.filter(r => !r.isDemo),
  }

  // Build insights for all jobseekers
  const insights = activeJobseekers.map(js => computeJobseekerInsights(js, stores, weeklyTarget, week))

  // ── Summarise specific jobseeker ──────────────────────────
  if (actionId === 'summarise_js' || (q.includes('summarise') || q.includes('summarize'))) {
    const js = targetJobseeker || activeJobseekers[0]
    if (!js) return buildAIResponse({
      assistantKey: ASSISTANT_KEYS.AI_2,
      title:        'No Jobseeker Selected',
      summary:      'Please open a jobseeker profile first, then ask me to summarise them.',
      suggestion:   'Go to Jobseekers and click on a jobseeker\'s name to open their profile.',
      reason:       'A jobseeker must be selected to generate a summary.',
      dataUsed:     'None — no jobseeker selected.',
      confidence:   'High',
      nextActions:  ['Go to Jobseekers and select a profile'],
    })
    const d = computeJobseekerInsights(js, stores, weeklyTarget, week)
    const urgency = d.status === 'high_risk' ? 'Critical' : d.status === 'needs_attention' ? 'High' : d.hasOpenFlags ? 'Medium' : 'Low'
    return buildAIResponse({
      assistantKey: ASSISTANT_KEYS.AI_2,
      title:        `Summary: ${js.displayName}`,
      summary:      `${js.displayName} has logged ${d.weekHours}h this week (${d.pct}% of ${d.target}h target). Status: ${d.status.replace(/_/g,' ')}.`,
      suggestion:   [
        d.status === 'high_risk'       ? `⚠️ Urgent: Only ${d.pct}% of target. Contact ${js.displayName} today.` : '',
        d.status === 'needs_attention' ? `Behind target — ${d.remaining}h remaining. Encourage additional activity.` : '',
        d.hasMissedCheckIn             ? '📋 No check-in this week. Request a check-in.' : '',
        d.hasEvidenceGap               ? '📁 Applications logged but no evidence uploaded. Request evidence.' : '',
        d.hasOpenFlags                 ? `🚩 ${d.flags.length} open support flag(s). Review barriers.` : '',
        d.hasUpcomingInterview         ? `📅 ${d.upcoming.length} upcoming interview(s). Check preparation.` : '',
        d.status === 'target_complete' ? '✅ Target complete. Encourage continued activity.' : '',
      ].filter(Boolean).join(' '),
      reason:       `Based on ${d.weekHours}h logged, ${d.weekApps.length} applications, ${d.weekCIs.length} check-ins, ${d.evs.length} evidence records, ${d.flags.length} open flags.`,
      dataUsed:     `Activity logs, applications, check-ins, evidence, support flags for ${js.displayName}.`,
      confidence:   d.weekHours > 0 ? 'High' : 'Medium',
      urgency,
      nextActions:  ['Review full profile', 'Check evidence records', 'Log a coach note'],
    })
  }

  // ── Who needs attention today ─────────────────────────────
  if (actionId === 'attention_today' || q.includes('attention') || q.includes('today')) {
    const needsAttention = insights.filter(d => ['high_risk', 'needs_attention'].includes(d.status) || d.hasMissedCheckIn || d.hasOpenFlags)
    if (needsAttention.length === 0) return buildAIResponse({
      assistantKey: ASSISTANT_KEYS.AI_2,
      title:        'No Urgent Actions Today',
      summary:      'All jobseekers are currently on track based on available data.',
      suggestion:   'Continue monitoring weekly activity. Check back later as the week progresses.',
      reason:       `All ${activeJobseekers.length} jobseekers are meeting targets with no open flags or missed check-ins.`,
      dataUsed:     'Activity logs, check-ins, support flags (this week).',
      confidence:   'Medium',
      urgency:      'Low',
      nextActions:  ['Review evidence uploads', 'Prepare for upcoming interviews'],
    })
    const topItems = needsAttention.slice(0, 5).map(d => {
      const reasons = []
      if (d.status === 'high_risk') reasons.push(`only ${d.pct}% of target`)
      if (d.status === 'needs_attention') reasons.push(`${d.pct}% of target — ${d.remaining}h remaining`)
      if (d.hasMissedCheckIn) reasons.push('no check-in this week')
      if (d.hasOpenFlags) reasons.push(`${d.flags.length} open flag(s)`)
      return `• ${d.js.displayName}: ${reasons.join(', ')}`
    }).join('\n')
    return buildAIResponse({
      assistantKey: ASSISTANT_KEYS.AI_2,
      title:        `${needsAttention.length} Jobseeker(s) Need Attention Today`,
      summary:      `${needsAttention.length} jobseeker(s) require follow-up based on this week's activity data.`,
      suggestion:   topItems,
      reason:       'Identified based on weekly target progress, missed check-ins, and open support flags.',
      dataUsed:     'Activity logs, check-ins, support flags for all jobseekers this week.',
      confidence:   'High',
      urgency:      needsAttention.some(d => d.status === 'high_risk') ? 'Critical' : 'High',
      nextActions:  ['Open each flagged jobseeker\'s profile', 'Log coach notes', 'Consider scheduling a support call'],
    })
  }

  // ── At risk this week ─────────────────────────────────────
  if (actionId === 'at_risk_week' || q.includes('at risk') || q.includes('risk this week')) {
    const atRisk = insights.filter(d => d.status === 'high_risk' || d.status === 'needs_attention')
    if (atRisk.length === 0) return buildAIResponse({
      assistantKey: ASSISTANT_KEYS.AI_2,
      title:        'No At-Risk Jobseekers This Week',
      summary:      'All jobseekers appear to be on track this week.',
      suggestion:   'Continue monitoring. Risk levels update as activity is logged throughout the week.',
      reason:       `${activeJobseekers.length} jobseekers checked — none flagged as at risk.`,
      dataUsed:     'Weekly activity logs for all jobseekers.',
      confidence:   'Medium',
      urgency:      'Low',
      nextActions:  ['Check evidence gaps', 'Review upcoming interviews'],
    })
    const list = atRisk.slice(0, 8).map(d =>
      `• ${d.js.displayName} — ${d.pct}% (${d.weekHours}h / ${d.target}h) — ${d.status.replace(/_/g,' ')}`
    ).join('\n')
    return buildAIResponse({
      assistantKey: ASSISTANT_KEYS.AI_2,
      title:        `${atRisk.length} At-Risk Jobseeker(s) This Week`,
      summary:      `${atRisk.filter(d => d.status === 'high_risk').length} high risk, ${atRisk.filter(d => d.status === 'needs_attention').length} needs attention.`,
      suggestion:   list,
      reason:       'Based on logged hours vs weekly target for the current week.',
      dataUsed:     'Activity logs, weekly targets for all jobseekers.',
      confidence:   'High',
      urgency:      atRisk.some(d => d.status === 'high_risk') ? 'High' : 'Medium',
      nextActions:  ['Open flagged profiles', 'Plan follow-up calls', 'Review support barriers'],
    })
  }

  // ── Evidence gaps ─────────────────────────────────────────
  if (actionId === 'evidence_gaps' || q.includes('evidence gap') || q.includes('no evidence')) {
    const gaps = insights.filter(d => d.hasEvidenceGap)
    if (gaps.length === 0) return buildAIResponse({
      assistantKey: ASSISTANT_KEYS.AI_2,
      title:        'No Evidence Gaps Detected',
      summary:      'All jobseekers with applications have at least one evidence record.',
      suggestion:   'Continue encouraging jobseekers to upload evidence regularly.',
      reason:       'Checked applications vs evidence records for all active jobseekers.',
      dataUsed:     'Applications and evidence records.',
      confidence:   'Medium',
      urgency:      'Low',
      nextActions:  ['Review evidence quality', 'Remind jobseekers to upload screenshots/emails'],
    })
    const list = gaps.slice(0, 6).map(d =>
      `• ${d.js.displayName} — ${d.weekApps.length} app(s) but 0 evidence records`
    ).join('\n')
    return buildAIResponse({
      assistantKey: ASSISTANT_KEYS.AI_2,
      title:        `${gaps.length} Jobseeker(s) Have Evidence Gaps`,
      summary:      `${gaps.length} jobseeker(s) have submitted applications but have not uploaded any supporting evidence.`,
      suggestion:   list + '\n\nRemind these jobseekers to upload confirmation emails, screenshots, or other evidence via their PWA.',
      reason:       'Evidence is needed to support compliance verification and progress reviews.',
      dataUsed:     'Applications and evidence records for all jobseekers.',
      confidence:   'High',
      urgency:      'Medium',
      nextActions:  ['Contact jobseekers with evidence gaps', 'Send reminder to upload evidence'],
    })
  }

  // ── Missed check-ins ──────────────────────────────────────
  if (actionId === 'missed_checkins' || q.includes('check-in') || q.includes('checkin') || q.includes('missed')) {
    const missed = insights.filter(d => d.hasMissedCheckIn)
    if (missed.length === 0) return buildAIResponse({
      assistantKey: ASSISTANT_KEYS.AI_2,
      title:        'No Missed Check-ins This Week',
      summary:      'All jobseekers have completed at least one check-in this week.',
      suggestion:   'Keep encouraging daily check-ins for accurate progress tracking.',
      reason:       'Checked check-in records for all jobseekers this week.',
      dataUsed:     'Check-in records for the current week.',
      confidence:   'High',
      urgency:      'Low',
      nextActions:  ['Review check-in quality and confidence scores'],
    })
    const list = missed.slice(0, 8).map(d => `• ${d.js.displayName}`).join('\n')
    return buildAIResponse({
      assistantKey: ASSISTANT_KEYS.AI_2,
      title:        `${missed.length} Jobseeker(s) — No Check-in This Week`,
      summary:      `${missed.length} jobseeker(s) have not completed a check-in so far this week.`,
      suggestion:   list + '\n\nConsider sending a reminder via their PWA or contacting them directly.',
      reason:       'Regular check-ins provide wellbeing data and barrier flags for timely support.',
      dataUsed:     'Check-in records for the current week.',
      confidence:   'High',
      urgency:      'Medium',
      nextActions:  ['Send a reminder to these jobseekers', 'Consider wellbeing check if repeated pattern'],
    })
  }

  // ── Low activity ──────────────────────────────────────────
  if (actionId === 'low_activity' || q.includes('low activity') || q.includes('not logging')) {
    const low = insights.filter(d => d.weekHours < (d.target * 0.3))
    if (low.length === 0) return buildAIResponse({
      assistantKey: ASSISTANT_KEYS.AI_2,
      title:        'No Low-Activity Jobseekers',
      summary:      'All jobseekers have logged at least 30% of their weekly target.',
      suggestion:   'Continue monitoring. Check again mid-week to catch any who fall behind.',
      reason:       'Checked weekly logged hours vs 30% of target threshold.',
      dataUsed:     'Activity logs for the current week.',
      confidence:   'Medium',
      urgency:      'Low',
      nextActions:  ['Review weekly target completion', 'Check applications and check-ins'],
    })
    const list = low.slice(0, 8).map(d =>
      `• ${d.js.displayName} — ${d.weekHours}h logged (${d.pct}% of ${d.target}h target)`
    ).join('\n')
    return buildAIResponse({
      assistantKey: ASSISTANT_KEYS.AI_2,
      title:        `${low.length} Jobseeker(s) With Low Activity`,
      summary:      `${low.length} jobseeker(s) have logged less than 30% of their weekly target so far.`,
      suggestion:   list + '\n\nReach out to understand barriers. Suggest they open their CareerLink app and log any activity they may have missed.',
      reason:       'Low activity early in the week is an early warning signal for weekly target failure.',
      dataUsed:     'Activity logs for the current week.',
      confidence:   'High',
      urgency:      'Medium',
      nextActions:  ['Contact low-activity jobseekers', 'Check for support barriers'],
    })
  }

  // ── Upcoming interviews ───────────────────────────────────
  if (actionId === 'upcoming_interviews' || q.includes('interview')) {
    const withInterviews = insights.filter(d => d.hasUpcomingInterview)
    if (withInterviews.length === 0) return buildAIResponse({
      assistantKey: ASSISTANT_KEYS.AI_2,
      title:        'No Upcoming Interviews',
      summary:      'No jobseekers have upcoming interviews logged at this time.',
      suggestion:   'Encourage jobseekers to log any interview invitations they receive via their PWA.',
      reason:       'Checked interview records for future dates.',
      dataUsed:     'Interview records.',
      confidence:   'Medium',
      urgency:      'Low',
      nextActions:  ['Remind jobseekers to log interview dates'],
    })
    const list = withInterviews.slice(0, 6).map(d => {
      const next = d.upcoming[0]
      return `• ${d.js.displayName} — ${next.employer || 'Unknown employer'} — ${next.roleTitle || 'Role'} — ${next.dateTime ? new Date(next.dateTime).toLocaleDateString('en-GB') : 'Date TBC'}`
    }).join('\n')
    return buildAIResponse({
      assistantKey: ASSISTANT_KEYS.AI_2,
      title:        `${withInterviews.length} Jobseeker(s) With Upcoming Interviews`,
      summary:      `${withInterviews.length} jobseeker(s) have interviews coming up.`,
      suggestion:   list + '\n\nConsider checking in with these jobseekers to confirm they have prepared.',
      reason:       'Upcoming interview support can improve employment outcomes.',
      dataUsed:     'Interview records with future date/time.',
      confidence:   'High',
      urgency:      'Low',
      nextActions:  ['Check interview preparation status', 'Log coach notes for preparation support'],
    })
  }

  // ── Coach action summary ──────────────────────────────────
  if (actionId === 'action_summary' || q.includes('action summary') || q.includes('what should i do')) {
    const critical   = insights.filter(d => d.status === 'high_risk' || d.js.riskLevel === 'critical')
    const attn       = insights.filter(d => d.status === 'needs_attention' && d.js.riskLevel !== 'critical')
    const flagged    = insights.filter(d => d.hasOpenFlags)
    const noCheckin  = insights.filter(d => d.hasMissedCheckIn)
    const evGap      = insights.filter(d => d.hasEvidenceGap)
    const withIv     = insights.filter(d => d.hasUpcomingInterview)

    const actions = [
      critical.length  > 0 ? `🚨 URGENT: Contact ${critical.length} high-risk/critical jobseeker(s): ${critical.map(d => d.js.displayName).join(', ')}.` : '',
      flagged.length   > 0 ? `🚩 Review ${flagged.length} open support flag(s) and arrange support.` : '',
      noCheckin.length > 0 ? `📋 ${noCheckin.length} jobseeker(s) have no check-in this week — send reminders.` : '',
      attn.length      > 0 ? `⚠️ ${attn.length} jobseeker(s) need attention — follow up before end of week.` : '',
      evGap.length     > 0 ? `📁 ${evGap.length} jobseeker(s) have evidence gaps — request uploads.` : '',
      withIv.length    > 0 ? `📅 ${withIv.length} jobseeker(s) have upcoming interviews — check preparation.` : '',
    ].filter(Boolean)

    if (actions.length === 0) return buildAIResponse({
      assistantKey: ASSISTANT_KEYS.AI_2,
      title:        'All Clear — No Urgent Actions',
      summary:      'Based on available data, all jobseekers appear to be on track this week.',
      suggestion:   'Continue regular monitoring. Encourage check-ins, evidence uploads, and applications.',
      reason:       `Checked ${activeJobseekers.length} jobseekers — no urgent flags.`,
      dataUsed:     'Activity logs, check-ins, evidence, flags, interviews for all jobseekers.',
      confidence:   'Medium',
      urgency:      'Low',
      nextActions:  ['Monitor mid-week activity', 'Review evidence quality'],
    })

    return buildAIResponse({
      assistantKey: ASSISTANT_KEYS.AI_2,
      title:        `Coach Action Summary — ${new Date().toLocaleDateString('en-GB')}`,
      summary:      `${actions.length} action area(s) identified for today.`,
      suggestion:   actions.join('\n'),
      reason:       'Derived from weekly activity, check-ins, support flags, evidence, and interview records.',
      dataUsed:     'All CareerLink data stores for active jobseekers.',
      confidence:   'High',
      urgency:      critical.length > 0 ? 'Critical' : flagged.length > 0 ? 'High' : 'Medium',
      nextActions:  ['Work through each action in order', 'Log coach notes after each follow-up'],
    })
  }

  // ── Explain risk flag ────────────────────────────────────
  if (actionId === 'explain_risk_flag' || q.includes('risk flag') || q.includes('flag')) {
    return buildAIResponse({
      assistantKey: ASSISTANT_KEYS.AI_2,
      title:        'Understanding Risk Flags',
      summary:      'Support flags are raised when jobseekers report barriers during check-ins or when activity data falls below thresholds.',
      suggestion:   'Go to Support Risks in the sidebar to review open flags. Each flag shows the jobseeker, barrier type, severity, and creation date. Click a flag to review and update the status. Always involve your professional judgement — flags are indicators, not decisions.',
      reason:       'Support flags help you prioritise welfare and support interventions.',
      dataUsed:     'Support flag definitions and risk level thresholds.',
      confidence:   'High',
      urgency:      'Medium',
      nextActions:  ['Go to Support Risks', 'Review open flags', 'Log coach notes for follow-up'],
    })
  }

  // Freeform fallback
  return buildAIResponse({
    assistantKey: ASSISTANT_KEYS.AI_2,
    title:        'Coach Data Insight',
    summary:      `I can analyse data for ${activeJobseekers.length} active jobseeker(s). Try one of the quick actions above.`,
    suggestion:   'Ask me about: who needs attention today, at-risk jobseekers, evidence gaps, missed check-ins, low activity, upcoming interviews, or a specific jobseeker summary.',
    reason:       '4P3X Intelligent AI 2 handles data correlation and coach-facing insights.',
    dataUsed:     'All CareerLink activity data.',
    confidence:   'High',
    nextActions:  ['Use a quick action button', 'Open a jobseeker profile and ask me to summarise'],
  })
}

// ============================================================
// AI 3 — Jobseeker PWA Guide
// Handles: PWA usage, screens, how to log/add/complete actions.
// Forbidden: coach insights, risk analysis, deep motivation.
// ============================================================

const AI3_RESPONSES = {
  show_around: () => buildAIResponse({
    assistantKey: ASSISTANT_KEYS.AI_3,
    title:        'Welcome to Your CareerLink App',
    summary:      'This is your CareerLink Jobseeker App. It helps you track your job-search activity and stay on top of your weekly target.',
    suggestion:   'Here is what you can do:\n• Home — See your weekly progress and quick actions\n• Log Activity — Record job-search time\n• Applications — Track jobs you have applied for\n• Interviews — Log interview dates\n• Check-in — Complete your daily check-in\n• Evidence — Upload or record proof of activity\n• Tasks — View your action plan\n• Support — Request help from your coach',
    reason:       'Knowing where everything is helps you use the app confidently.',
    dataUsed:     'PWA screen structure.',
    confidence:   'High',
    nextActions:  ['Tap "Log Activity Now" to record today\'s activity', 'Complete your daily check-in'],
  }),

  log_time: () => buildAIResponse({
    assistantKey: ASSISTANT_KEYS.AI_3,
    title:        'How to Log Job-Search Time',
    summary:      'Logging your job-search time keeps your weekly progress up to date.',
    suggestion:   'Tap "Log Activity Now" on the home screen, or tap the Activity tab. Fill in:\n• Date (today or a past date)\n• Start and end time, or just the duration\n• Activity type (e.g. Job search, Application, Interview preparation)\n• A short description\nTap Save. Your progress bar will update straight away.',
    reason:       'Logging activity is how your coach sees your job-search effort.',
    dataUsed:     'Log Activity screen fields.',
    confidence:   'High',
    nextActions:  ['Tap "Log Activity Now" on the home screen'],
  }),

  add_application: () => buildAIResponse({
    assistantKey: ASSISTANT_KEYS.AI_3,
    title:        'How to Add a Job Application',
    summary:      'You can track every job you apply for in the Applications section.',
    suggestion:   'Tap the Applications tab or use "Add Application" on the home screen. Fill in:\n• Employer/company name\n• Job title\n• Where you found it (job board, website, etc.)\n• Date applied\n• Status (applied, interview invited, offer, etc.)\n• Any notes\nTap Save. Your coach can see this too.',
    reason:       'Tracking applications helps your coach understand your job-search effort.',
    dataUsed:     'Applications screen — add application form.',
    confidence:   'High',
    nextActions:  ['Tap Applications', 'Tap the + button to add a new application'],
  }),

  add_interview: () => buildAIResponse({
    assistantKey: ASSISTANT_KEYS.AI_3,
    title:        'How to Add an Interview',
    summary:      'Log your interviews so your coach can support your preparation.',
    suggestion:   'Tap the Interviews tab. Tap the + button. Fill in:\n• Employer/company name\n• Job title\n• Date and time\n• Location or video link\n• Preparation notes\n• Outcome (after the interview)\nTap Save. Your coach will be able to see this and may offer preparation support.',
    reason:       'Logging interviews helps your coach offer timely preparation advice.',
    dataUsed:     'Interviews screen — add interview form.',
    confidence:   'High',
    nextActions:  ['Tap Interviews', 'Tap + to add an interview'],
  }),

  complete_checkin: () => buildAIResponse({
    assistantKey: ASSISTANT_KEYS.AI_3,
    title:        'How to Complete Your Daily Check-in',
    summary:      'The daily check-in lets you report your activity, confidence, and any barriers you are facing.',
    suggestion:   'Tap the Check-in tab or "New Check-in" on the home screen. You will be asked 10 short questions about today:\n• Did you complete job-search activity?\n• How many hours?\n• Did you apply for jobs?\n• Any barriers stopping you?\n• How confident do you feel?\n• What is your priority for tomorrow?\nAnswer each question and tap Submit.',
    reason:       'Your check-in tells your coach how you are getting on and if you need support.',
    dataUsed:     'Check-in screen — 10-question flow.',
    confidence:   'High',
    nextActions:  ['Tap Check-in', 'Work through the 10 questions'],
  }),

  add_evidence: () => buildAIResponse({
    assistantKey: ASSISTANT_KEYS.AI_3,
    title:        'How to Add Evidence',
    summary:      'Evidence records help prove your job-search activity.',
    suggestion:   'Tap the Evidence tab. Tap + to add a new record. Fill in:\n• Title (e.g. "Application to Tesco — confirmation email")\n• Evidence type (email, screenshot, certificate, etc.)\n• Date\n• Notes\n• Link to a related application or activity if relevant\nYou can describe the evidence or note the file name. Tap Save.',
    reason:       'Evidence supports compliance verification and helps your coach review your progress.',
    dataUsed:     'Evidence screen — add evidence form.',
    confidence:   'High',
    nextActions:  ['Tap Evidence', 'Tap + to add a record'],
  }),

  request_support: () => buildAIResponse({
    assistantKey: ASSISTANT_KEYS.AI_3,
    title:        'How to Request Support',
    summary:      'If you are facing a barrier or need help, you can let your coach know directly from the app.',
    suggestion:   'Tap the Support tab (or look for "Request Support" on the home screen). Select the type of barrier:\n• Confidence\n• Wellbeing\n• Transport\n• Childcare\n• Digital access\n• CV/application help\n• Interview support\n• Housing/financial pressure\n• Other\nAdd a note if you want to explain more. Tap Send. Your coach will be notified.',
    reason:       'Your coach is here to help. Sending a support request is the quickest way to get help.',
    dataUsed:     'Support request screen — barrier types.',
    confidence:   'High',
    nextActions:  ['Tap Support', 'Select your barrier type and send'],
  }),

  see_progress: () => buildAIResponse({
    assistantKey: ASSISTANT_KEYS.AI_3,
    title:        'How to See Your Weekly Progress',
    summary:      'Your weekly progress is shown on the home screen and in the Progress section.',
    suggestion:   'On the home screen you will see a progress ring showing your percentage of the weekly target. Below it you can see hours logged, applications this week, interviews, and check-ins. Tap the Progress tab to see a more detailed breakdown including a history of your activity.',
    reason:       'Tracking progress helps you stay motivated and on target.',
    dataUsed:     'Home screen progress card and Progress screen layout.',
    confidence:   'High',
    nextActions:  ['Look at the progress ring on the home screen', 'Tap Progress for a detailed view'],
  }),

  progress_bar: () => buildAIResponse({
    assistantKey: ASSISTANT_KEYS.AI_3,
    title:        'What Your Progress Bar Means',
    summary:      'The progress ring shows how much of your weekly job-search target you have completed.',
    suggestion:   '100% = you have met your weekly target — great work! 60–99% = on track. 30–59% = a bit behind — try to log more activity. Below 30% = you need to catch up this week. The colour changes: green = on track or complete, amber = needs attention, red = high risk. Your coach can see this too.',
    reason:       'The progress ring helps you understand where you are vs your target at a glance.',
    dataUsed:     'Progress ring definition and status thresholds.',
    confidence:   'High',
    nextActions:  ['Tap "Log Activity Now" to add more hours', 'Complete your daily check-in'],
  }),

  install_app: () => buildAIResponse({
    assistantKey: ASSISTANT_KEYS.AI_3,
    title:        'How to Install the CareerLink App',
    summary:      'You can install the CareerLink app on your home screen so it works like a regular app.',
    suggestion:   'On iPhone: tap the Share icon (square with arrow) at the bottom of your browser, then tap "Add to Home Screen", then tap "Add". On Android: tap the 3-dot menu at the top right, then tap "Add to Home Screen" or "Install app". The app will appear on your home screen and works even with a slow or no internet connection.',
    reason:       'Installing the app makes it easier to log activity on the go.',
    dataUsed:     'PWA install guidance — iOS and Android.',
    confidence:   'High',
    nextActions:  ['Follow the steps above for your device', 'Tap the new app icon on your home screen'],
  }),
}

export function handleAi3Query(actionId, context = {}) {
  // Scope guard — encouragement/motivation → handoff to AI 4
  const supportActions = ['encourage_me', 'feel_stuck', 'need_support', 'what_next', 'plan_today', 'hours_remaining']
  if (supportActions.includes(actionId)) {
    return buildHandoffMessage(
      ASSISTANT_KEYS.AI_3,
      ASSISTANT_KEYS.AI_4,
      'That is a support and encouragement question. 4P3X Intelligent AI 4 — Jobseeker Support & Encouragement handles that.'
    )
  }
  // Scope guard — coach/data questions → AI 2
  if (['at_risk_week', 'attention_today', 'coach_insight'].includes(actionId)) {
    return buildHandoffMessage(
      ASSISTANT_KEYS.AI_3,
      ASSISTANT_KEYS.AI_2,
      'That is a coach dashboard insight task. 4P3X Intelligent AI 2 handles that on the Coach Dashboard.'
    )
  }

  const handler = AI3_RESPONSES[actionId]
  if (handler) return handler(context)

  const q = (context.query || '').toLowerCase()
  if (q.includes('show') && q.includes('around')) return AI3_RESPONSES.show_around()
  if (q.includes('log') || q.includes('time') || q.includes('activity')) return AI3_RESPONSES.log_time()
  if (q.includes('application')) return AI3_RESPONSES.add_application()
  if (q.includes('interview')) return AI3_RESPONSES.add_interview()
  if (q.includes('check') || q.includes('checkin')) return AI3_RESPONSES.complete_checkin()
  if (q.includes('evidence')) return AI3_RESPONSES.add_evidence()
  if (q.includes('support') || q.includes('help')) return AI3_RESPONSES.request_support()
  if (q.includes('progress') || q.includes('target')) return AI3_RESPONSES.see_progress()
  if (q.includes('progress bar') || q.includes('ring') || q.includes('circle')) return AI3_RESPONSES.progress_bar()
  if (q.includes('install')) return AI3_RESPONSES.install_app()

  if (q.includes('stuck') || q.includes('encourage') || q.includes('motivat') || q.includes('feel')) {
    return buildHandoffMessage(ASSISTANT_KEYS.AI_3, ASSISTANT_KEYS.AI_4,
      'That is a support and encouragement question — 4P3X Intelligent AI 4 can help with that.')
  }

  return buildAIResponse({
    assistantKey: ASSISTANT_KEYS.AI_3,
    title:        'CareerLink PWA Help',
    summary:      'I can show you how to use any part of your CareerLink app.',
    suggestion:   'Try one of the quick action buttons above. I can explain: logging activity, adding applications, adding interviews, completing your check-in, adding evidence, requesting support, seeing your progress, or installing the app.',
    reason:       '4P3X Intelligent AI 3 provides usage guidance for the Jobseeker PWA.',
    dataUsed:     'PWA screen layout and help library.',
    confidence:   'High',
    nextActions:  ['Tap a quick action button', 'Ask about a specific screen or button'],
  })
}

// ============================================================
// AI 4 — Jobseeker Support & Encouragement
// Handles: progress explanation, planning, motivation, barriers,
//          interview prep, CV help, evidence reminders.
// Forbidden: coach data, other jobseekers, legal/medical advice.
// ============================================================

function buildEncouragementMessage(pct, weekHours, target, remaining) {
  if (pct >= 100) return `Amazing — you have hit 100% of your ${target}h weekly target! You logged ${weekHours}h this week. Give yourself credit for that. Keep your activity log and evidence up to date.`
  if (pct >= 80) return `You are doing really well — ${weekHours}h logged so far, ${remaining}h to go. You are nearly there. A little more today and you will hit your target.`
  if (pct >= 60) return `You are on track — ${weekHours}h logged, ${remaining}h remaining this week. Stay consistent and you will reach your ${target}h target.`
  if (pct >= 30) return `You are at ${pct}% of your ${target}h weekly target — ${weekHours}h logged so far. You still have ${remaining}h to go. You can do this — even small sessions add up.`
  return `It looks like you are at ${pct}% of your ${target}h weekly target so far (${weekHours}h logged). There is still time this week. Let\'s focus on one small action at a time.`
}

export function handleAi4Query(actionId, context = {}) {
  // Scope guard — PWA usage questions → AI 3
  const pwaActions = ['install_app', 'show_around', 'log_time', 'add_application', 'add_interview', 'complete_checkin', 'add_evidence']
  if (pwaActions.includes(actionId)) {
    return buildHandoffMessage(
      ASSISTANT_KEYS.AI_4,
      ASSISTANT_KEYS.AI_3,
      'That is a PWA usage question. 4P3X Intelligent AI 3 — Jobseeker PWA Guide can walk you through it.'
    )
  }
  // Scope guard — dashboard questions → AI 1
  if (['explain_dashboard', 'coach_guide', 'show_dashboard'].includes(actionId)) {
    return buildHandoffMessage(
      ASSISTANT_KEYS.AI_4,
      ASSISTANT_KEYS.AI_1,
      'That is a coach dashboard question. 4P3X Intelligent AI 1 covers that on the Coach Dashboard.'
    )
  }

  const {
    jobseeker    = null,
    weekHours    = 0,
    target       = 35,
    pct          = 0,
    applications = [],
    interviews   = [],
    checkIns     = [],
    evidenceRecords = [],
    barriers     = [],
    query        = '',
  } = context

  const name      = jobseeker?.displayName?.split(' ')[0] || 'you'
  const remaining = Math.max(0, Math.round((target - weekHours) * 10) / 10)
  const q         = query.toLowerCase()

  // ── Hours remaining ───────────────────────────────────────
  if (actionId === 'hours_remaining' || q.includes('hours') || q.includes('remaining') || q.includes('how many')) {
    return buildAIResponse({
      assistantKey: ASSISTANT_KEYS.AI_4,
      title:        'Your Remaining Hours This Week',
      summary:      `You have logged ${weekHours}h so far this week out of your ${target}h target.`,
      suggestion:   pct >= 100
        ? `You have already hit your ${target}h target — well done! Keep your activity log and evidence up to date.`
        : `You still need ${remaining}h to hit your weekly target. Try spreading it out — even 1–2 hours a day adds up quickly. ${remaining <= 5 ? 'You are nearly there!' : 'Start with a short session today.'}`,
      reason:       `Weekly target: ${target}h. Logged this week: ${weekHours}h.`,
      dataUsed:     'Your logged activity hours and weekly target.',
      confidence:   'High',
      nextActions:  pct >= 100 ? ['Add evidence for your applications', 'Complete your daily check-in'] : ['Tap "Log Activity Now"', 'Even 30 minutes counts — start small'],
    })
  }

  // ── What should I do next ─────────────────────────────────
  if (actionId === 'what_next' || q.includes('what should i do') || q.includes('what next')) {
    const actions = []
    if (checkIns.length === 0)       actions.push('Complete your daily check-in first — it only takes a minute.')
    if (pct < 100)                   actions.push(`Log ${remaining}h more job-search activity to hit your weekly target.`)
    if (applications.length === 0)   actions.push('Try applying for at least 1 job today — even a quick application counts.')
    if (evidenceRecords.length === 0 && applications.length > 0) actions.push('Upload evidence for your application — a screenshot or email confirmation is enough.')
    if (interviews.length > 0)       actions.push('You have an interview coming up — spend time preparing today.')
    if (barriers.length > 0)         actions.push('You have mentioned barriers. Consider sending a support request to your coach.')
    if (actions.length === 0)        actions.push('You are doing great! Keep applying for roles and logging your activity.')

    return buildAIResponse({
      assistantKey: ASSISTANT_KEYS.AI_4,
      title:        `Next Steps for ${name}`,
      summary:      buildEncouragementMessage(pct, weekHours, target, remaining),
      suggestion:   actions.slice(0, 4).map((a, i) => `${i + 1}. ${a}`).join('\n'),
      reason:       'Based on your current weekly progress and activity data.',
      dataUsed:     `${weekHours}h logged, ${applications.length} application(s), ${checkIns.length} check-in(s), ${evidenceRecords.length} evidence record(s).`,
      confidence:   'High',
      nextActions:  actions.slice(0, 3),
    })
  }

  // ── Plan today ────────────────────────────────────────────
  if (actionId === 'plan_today' || q.includes('plan') || q.includes('today')) {
    return buildAIResponse({
      assistantKey: ASSISTANT_KEYS.AI_4,
      title:        `A Simple Plan for Today`,
      summary:      buildEncouragementMessage(pct, weekHours, target, remaining),
      suggestion:   [
        '1. Complete your daily check-in (5 minutes).',
        `2. Search for ${pct >= 80 ? '1–2' : '3–5'} relevant jobs online.`,
        `3. Apply for at least ${pct >= 80 ? '1' : '2'} role(s) — log each one in Applications.`,
        '4. Log your activity time before you finish for the day.',
        interviews.length > 0 ? '5. Spend 20–30 minutes preparing for your upcoming interview.' : '5. Update your CV or cover letter if needed.',
        evidenceRecords.length === 0 && applications.length > 0 ? '6. Upload evidence for your application (email screenshot is fine).' : '',
      ].filter(Boolean).join('\n'),
      reason:       'A simple daily plan helps reduce overwhelm and keeps you making progress.',
      dataUsed:     `Progress: ${pct}%, ${weekHours}h logged. Applications: ${applications.length}. Interviews: ${interviews.length}.`,
      confidence:   'High',
      nextActions:  ['Tap Check-in to start', 'Tap Log Activity when done', 'Use Applications to track new job applications'],
    })
  }

  // ── Break into small steps ────────────────────────────────
  if (actionId === 'small_steps' || q.includes('small step') || q.includes('overwhelm') || q.includes('too much')) {
    return buildAIResponse({
      assistantKey: ASSISTANT_KEYS.AI_4,
      title:        'Breaking It Into Small Steps',
      summary:      'Sometimes the job search can feel overwhelming. That is completely normal. Let\'s break it into tiny steps.',
      suggestion:   `Step 1: Open your phone and tap the CareerLink app — you are already here, well done!\nStep 2: Tap Check-in and answer the first question — just the first one.\nStep 3: Go to one job site and search for "${jobseeker?.programme || 'jobs in your area'}". Just browse — you don't need to apply yet.\nStep 4: If you see one job that looks possible, read the description.\nStep 5: If it feels right, tap Applications → Add Application and log it.\nStep 6: Tap Log Activity and record how long you spent.\nStep 7: That is a real, completed session. Well done.`,
      reason:       'Small actions build confidence and momentum. Every step counts toward your weekly target.',
      dataUsed:     'Your current progress and default job-search guidance.',
      confidence:   'High',
      nextActions:  ['Tap Check-in first', 'Just browse one job site today', 'Log any time you spend — even 20 minutes'],
    })
  }

  // ── Interview preparation ─────────────────────────────────
  if (actionId === 'interview_prep' || q.includes('interview')) {
    const nextInterview = interviews.find(i => new Date(i.dateTime) >= new Date())
    return buildAIResponse({
      assistantKey: ASSISTANT_KEYS.AI_4,
      title:        'Preparing for Your Interview',
      summary:      nextInterview
        ? `You have an interview coming up at ${nextInterview.employer || 'an employer'} for ${nextInterview.roleTitle || 'a role'}. Here is how to prepare.`
        : 'Here is how to prepare for any interview.',
      suggestion:   '1. Research the employer — look at their website, what they do, recent news.\n2. Re-read the job description carefully.\n3. Prepare 3 examples of things you have done (work, volunteering, life experience) that show the skills needed.\n4. Use the STAR format: Situation → Task → Action → Result.\n5. Plan your travel or test your video call link the day before.\n6. Choose what you will wear and have it ready.\n7. Get a good night\'s sleep.\n\nYou have prepared for this. You can do it.',
      reason:       'Good preparation significantly improves interview confidence and outcomes.',
      dataUsed:     nextInterview ? `Upcoming interview: ${nextInterview.employer || 'employer'} — ${nextInterview.dateTime ? new Date(nextInterview.dateTime).toLocaleDateString('en-GB') : 'date TBC'}.` : 'Interview preparation guidance.',
      confidence:   'High',
      nextActions:  ['Research the employer tonight', 'Write your 3 STAR examples', 'Log preparation time in Activity'],
    })
  }

  // ── Improve application ───────────────────────────────────
  if (actionId === 'improve_application' || q.includes('cv') || q.includes('application') || q.includes('cover letter')) {
    return buildAIResponse({
      assistantKey: ASSISTANT_KEYS.AI_4,
      title:        'Making Your Application Stronger',
      summary:      'A strong application helps you get noticed. Here are some quick improvements you can make today.',
      suggestion:   'CV tips:\n• Start with a short personal statement (2–3 sentences) about who you are and what you are looking for.\n• List your most recent experience first.\n• Use simple, clear language — avoid jargon.\n• Quantify achievements if possible (e.g. "served 50+ customers a day").\n• Save as a PDF.\n\nCover letter tips:\n• Mention the specific job and company by name.\n• Say why you are interested in this role.\n• Give 2 examples of relevant skills or experience.\n• Keep it to one page.\n• End positively: "I look forward to hearing from you."\n\nIf you need extra help, send a support request to your coach.',
      reason:       'Tailored applications are more likely to get responses.',
      dataUsed:     'CV and cover letter guidance library.',
      confidence:   'High',
      nextActions:  ['Update your CV with these tips', 'Tailor your cover letter for the next application', 'Ask your coach for a CV review if needed'],
    })
  }

  // ── Evidence advice ───────────────────────────────────────
  if (actionId === 'evidence_advice' || q.includes('evidence') || q.includes('proof') || q.includes('upload')) {
    const hasEvidenceGap = applications.length > 0 && evidenceRecords.length === 0
    return buildAIResponse({
      assistantKey: ASSISTANT_KEYS.AI_4,
      title:        'What Evidence Should You Add?',
      summary:      hasEvidenceGap
        ? `You have ${applications.length} application(s) logged but no evidence yet. Here is what to upload.`
        : 'Here are the best types of evidence to keep for your job search.',
      suggestion:   'Good evidence to keep:\n• Application confirmation emails — take a screenshot or save the email.\n• Interview invitations — screenshot or forward to yourself.\n• Training or course certificates.\n• Screenshots of jobs you applied for (page with the application button).\n• Employer responses (even rejections show you are actively applying).\n• Proof of skills activities (courses, workshops, volunteering).\n\nYou can add evidence records in the Evidence section of your app. A note with the date and what it is counts — you do not need to upload a file.',
      reason:       'Evidence supports your progress record and helps your coach verify your job-search activity.',
      dataUsed:     `Applications: ${applications.length}. Evidence records: ${evidenceRecords.length}.`,
      confidence:   'High',
      nextActions:  ['Tap Evidence to add a record', 'Screenshot today\'s applications as evidence', 'Ask your coach if you are unsure what counts'],
    })
  }

  // ── Feel stuck ────────────────────────────────────────────
  if (actionId === 'feel_stuck' || q.includes('stuck') || q.includes('don\'t know') || q.includes('no idea') || q.includes('cant')) {
    return buildAIResponse({
      assistantKey: ASSISTANT_KEYS.AI_4,
      title:        'It Is OK to Feel Stuck',
      summary:      `Feeling stuck is really common in a job search — you are not alone, ${name}.`,
      suggestion:   'Here is something small to try right now:\n\n1. Close all your other apps.\n2. Take one slow breath.\n3. Open one job site — just to browse, not to apply.\n4. Spend 10 minutes reading job descriptions.\n5. Save one that looks even slightly interesting.\n6. That is enough for now. Log the time in the app.\n\nIf a barrier is making it hard — transport, confidence, childcare, anything — please tap Support and let your coach know. That is exactly what the support request is for. You do not have to figure it out alone.',
      reason:       'Small, pressure-free actions can help restart momentum without adding stress.',
      dataUsed:     'Motivational guidance and barrier support flow.',
      confidence:   'High',
      nextActions:  ['Try the 10-minute browsing session', 'Tap Support if a barrier is getting in the way', 'Complete your check-in to let your coach know how you are doing'],
    })
  }

  // ── Need support ──────────────────────────────────────────
  if (actionId === 'need_support' || q.includes('support') || q.includes('help') || q.includes('barrier')) {
    return buildAIResponse({
      assistantKey: ASSISTANT_KEYS.AI_4,
      title:        'Getting Support',
      summary:      'It is always OK to ask for support. Your coach is there to help you.',
      suggestion:   'Tap the Support tab in your app. Select the type of barrier you are facing:\n• Confidence\n• Mental wellbeing\n• Transport\n• Childcare\n• Digital access issues\n• Help with CV or applications\n• Interview support\n• Housing or financial pressure\n\nAdd a note explaining what is happening if you can. Tap Send. Your coach will receive this and will be in touch.\n\nYou do not have to manage everything on your own.',
      reason:       'Asking for support is a positive step. Coaches can adjust your plan or connect you with further help.',
      dataUsed:     'Support request screen — barrier types.',
      confidence:   'High',
      nextActions:  ['Tap Support', 'Select your barrier type', 'Add a note if you can'],
    })
  }

  // ── Encourage me ──────────────────────────────────────────
  if (actionId === 'encourage_me' || q.includes('encourage') || q.includes('motivat') || q.includes('can i do this')) {
    const msg = buildEncouragementMessage(pct, weekHours, target, remaining)
    return buildAIResponse({
      assistantKey: ASSISTANT_KEYS.AI_4,
      title:        `You Can Do This, ${name}`,
      summary:      msg,
      suggestion:   applications.length > 0
        ? `You have already submitted ${applications.length} application(s) this week — that is real effort. Every application is a step forward. Keep going.`
        : 'Every job search starts with a first step. Your target this week is achievable. Start with 10 minutes of browsing today and build from there.',
      reason:       'Consistent small actions lead to results. Progress is progress, no matter how small.',
      dataUsed:     `Progress: ${pct}%, ${weekHours}h logged, ${applications.length} application(s).`,
      confidence:   'High',
      nextActions:  ['Log today\'s activity', 'Complete your check-in', pct < 100 ? 'Aim for 1 more job application today' : 'Keep your evidence up to date'],
    })
  }

  // Freeform fallback — keyword matching
  if (q.includes('hour') || q.includes('remaining') || q.includes('how many')) return handleAi4Query('hours_remaining', context)
  if (q.includes('plan') || q.includes('today')) return handleAi4Query('plan_today', context)
  if (q.includes('interview')) return handleAi4Query('interview_prep', context)
  if (q.includes('cv') || q.includes('application') || q.includes('cover')) return handleAi4Query('improve_application', context)
  if (q.includes('evidence') || q.includes('proof')) return handleAi4Query('evidence_advice', context)
  if (q.includes('stuck') || q.includes('overwhelm')) return handleAi4Query('feel_stuck', context)
  if (q.includes('support') || q.includes('barrier') || q.includes('help')) return handleAi4Query('need_support', context)
  if (q.includes('install') || q.includes('home screen')) {
    return buildHandoffMessage(ASSISTANT_KEYS.AI_4, ASSISTANT_KEYS.AI_3,
      'That is a PWA usage question. 4P3X Intelligent AI 3 — Jobseeker PWA Guide can walk you through how to install the app.')
  }

  // Default
  return buildAIResponse({
    assistantKey: ASSISTANT_KEYS.AI_4,
    title:        `Here for You, ${name}`,
    summary:      buildEncouragementMessage(pct, weekHours, target, remaining),
    suggestion:   'Use the quick action buttons above or ask me about: what to do next, planning your day, how many hours you need, interview preparation, improving your application, what evidence to add, or how to get support.',
    reason:       '4P3X Intelligent AI 4 is here to support and encourage you through your job search.',
    dataUsed:     `Progress: ${pct}%, ${weekHours}h logged, ${applications.length} application(s).`,
    confidence:   'High',
    nextActions:  ['Tap a quick action button', 'Ask me anything about your job search'],
  })
}

// ─── Master dispatcher ────────────────────────────────────────
export function generateAssistantResponse(assistantKey, actionId, context = {}) {
  switch (assistantKey) {
    case ASSISTANT_KEYS.AI_1: return handleAi1Query(actionId, context)
    case ASSISTANT_KEYS.AI_2: return handleAi2Query(actionId, context)
    case ASSISTANT_KEYS.AI_3: return handleAi3Query(actionId, context)
    case ASSISTANT_KEYS.AI_4: return handleAi4Query(actionId, context)
    default: return buildAIResponse({
      assistantKey,
      title:      'Unknown Assistant',
      summary:    'This assistant is not recognised.',
      suggestion: 'Please use 4P3X Intelligent AI 1, 2, 3, or 4.',
      reason:     'Unknown assistantKey.',
      dataUsed:   'None.',
      confidence: 'Low',
    })
  }
}

export default {
  handleAi1Query,
  handleAi2Query,
  handleAi3Query,
  handleAi4Query,
  generateAssistantResponse,
}
